import { useUser, SignedIn, SignedOut, RedirectToSignIn } from "@clerk/clerk-react";
import { Navigate } from "react-router-dom";

interface ProtectedAdminRouteProps {
  children: React.ReactNode;
}

const ProtectedAdminRoute = ({ children }: ProtectedAdminRouteProps) => {
  const { user, isLoaded } = useUser();


  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Check if user has admin role in their public metadata
  const isAdmin = user?.publicMetadata?.role === "admin";

  return (
    <>
      <SignedOut>
        <RedirectToSignIn />
      </SignedOut>
      <SignedIn>
        {isAdmin ? (
          children
        ) : (
          <Navigate to="/" replace />
        )}
      </SignedIn>
    </>
  );
};

export default ProtectedAdminRoute;

