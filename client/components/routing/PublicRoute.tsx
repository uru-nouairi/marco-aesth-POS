import { Navigate } from "react-router-dom";
import { ReactNode } from "react";
import { useAuth } from "@/context/AuthContext";

interface PublicRouteProps {
  children: ReactNode;
  redirectWhenAuthenticated?: string;
}

export const PublicRoute = ({
  children,
  redirectWhenAuthenticated = "/",
}: PublicRouteProps) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <>{children}</>;
  }

  if (user) {
    return <Navigate to={redirectWhenAuthenticated} replace />;
  }

  return <>{children}</>;
};
