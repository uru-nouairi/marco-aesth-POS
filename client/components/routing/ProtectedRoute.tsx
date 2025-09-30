import { Navigate, useLocation } from "react-router-dom";
import { ReactNode } from "react";
import { useAuth } from "@/context/AuthContext";
import { LoadingScreen } from "@/components/common/LoadingScreen";
import type { UserRole } from "@/services/firebase";

interface ProtectedRouteProps {
  children: ReactNode;
  allowedRoles?: UserRole[];
  redirectTo?: string;
}

export const ProtectedRoute = ({
  children,
  allowedRoles,
  redirectTo = "/auth/login",
}: ProtectedRouteProps) => {
  const location = useLocation();
  const { user, role, loading } = useAuth();

  if (loading) {
    return <LoadingScreen message="Verifying secure access..." />;
  }

  if (!user) {
    return <Navigate to={redirectTo} replace state={{ from: location }} />;
  }

  if (allowedRoles && role && !allowedRoles.includes(role)) {
    const fallback = role === "cashier" ? "/pos" : "/";
    return <Navigate to={fallback} replace />;
  }

  return <>{children}</>;
};
