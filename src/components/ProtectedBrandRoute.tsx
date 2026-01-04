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

  useEffect(() => {
    const fetchUser = async () => {
      if (!isLoaded) return;
      
      try {
        const token = await getToken();
        if (token) {
          const userData = await getUserMe(token);
          setUser(userData);
        }
      } catch (error) {
        console.error("Failed to fetch user:", error);
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
        {user && user.roles.includes("BRAND") ? (
          children
        ) : (
          <Navigate to="/" replace />
        )}
      </SignedIn>
    </>
  );
};

export default ProtectedBrandRoute;

