import { useAuth } from "@clerk/clerk-react";
import { RedirectToSignIn, SignedIn, SignedOut } from "@clerk/clerk-react";
import { Navigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { getUserMe, UserResponse } from "@/services/api";

interface ProtectedBrandRouteProps {
  children: React.ReactNode;
}

const ProtectedBrandRoute = ({ children }: ProtectedBrandRouteProps) => {
  const { getToken, isLoaded } = useAuth();
  const [user, setUser] = useState<UserResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUser = async () => {
      if (!isLoaded) return;
      
      try {
        const token = await getToken();
        if (token) {
          const userData = await getUserMe(token);
          console.log("User data fetched:", userData);
          console.log("User roles:", userData.roles);
          setUser(userData);
          setError(null);
        } else {
          console.warn("No token available");
          setError("No authentication token");
        }
      } catch (error) {
        console.error("Failed to fetch user:", error);
        setError(error instanceof Error ? error.message : "Failed to fetch user data");
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [isLoaded, getToken]);

  if (!isLoaded || loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <>
      <SignedOut>
        <RedirectToSignIn />
      </SignedOut>
      <SignedIn>
        {error ? (
          <div className="min-h-screen bg-background flex items-center justify-center p-4">
            <div className="text-center max-w-md">
              <p className="text-destructive mb-2">Error loading user data</p>
              <p className="text-sm text-muted-foreground mb-4">{error}</p>
              <p className="text-xs text-muted-foreground">
                Please check the browser console for details. If you just signed up, your profile may still be creating.
              </p>
              <p className="text-xs text-muted-foreground mt-2">
                Make sure the backend is running on port 8080.
              </p>
            </div>
          </div>
        ) : user && user.roles && user.roles.includes("BRAND") ? (
          children
        ) : (
          <div className="min-h-screen bg-background flex items-center justify-center p-4">
            <div className="text-center max-w-md">
              <p className="text-foreground mb-2">Access Denied</p>
              <p className="text-sm text-muted-foreground mb-4">
                You don't have the BRAND role. Your current roles: {user?.roles?.join(", ") || "None"}
              </p>
              <p className="text-xs text-muted-foreground">
                If you just signed up, please wait a moment for your profile to be created, then refresh the page.
              </p>
              <button
                onClick={() => window.location.reload()}
                className="mt-4 px-4 py-2 bg-primary text-primary-foreground rounded hover:bg-primary/90"
              >
                Refresh Page
              </button>
              <Navigate to="/" replace />
            </div>
          </div>
        )}
      </SignedIn>
    </>
  );
};

export default ProtectedBrandRoute;

