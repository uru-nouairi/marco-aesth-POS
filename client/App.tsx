import { Suspense } from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster as ShadToaster } from "@/components/ui/toaster";
import { Toaster as SonnerToaster } from "@/components/ui/sonner";
import { AuthProvider } from "@/context/AuthContext";
import { ProtectedRoute } from "@/components/routing/ProtectedRoute";
import { PublicRoute } from "@/components/routing/PublicRoute";
import { LoadingScreen } from "@/components/common/LoadingScreen";
import MainLayout from "@/layout/MainLayout";
import LoginPage from "@/pages/auth/Login";
import ChangeOwnerPassword from "@/pages/auth/ChangeOwnerPassword";
import OwnerDashboard from "@/pages/dashboard/OwnerDashboard";
import POSCheckout from "@/pages/pos/POSCheckout";
import InventoryPage from "@/pages/inventory/InventoryPage";
import ReportsPage from "@/pages/reports/ReportsPage";
import UsersPage from "@/pages/users/UsersPage";
import SettingsPage from "@/pages/settings/SettingsPage";
import NotFound from "@/pages/NotFound";

const queryClient = new QueryClient();

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider delayDuration={150} skipDelayDuration={0}>
        <AuthProvider>
          <BrowserRouter>
            <ShadToaster />
            <SonnerToaster />
            <Suspense fallback={<LoadingScreen title="Loading Marco Aesthetics" /> }>
              <Routes>
                <Route
                  path="/auth/login"
                  element={
                    <PublicRoute>
                      <LoginPage />
                    </PublicRoute>
                  }
                />
                <Route
                  path="/auth/change-password"
                  element={
                    <ProtectedRoute allowedRoles={["owner"]}>
                      <ChangeOwnerPassword />
                    </ProtectedRoute>
                  }
                />

                <Route
                  path="/"
                  element={
                    <ProtectedRoute allowedRoles={["owner", "cashier"]}>
                      <MainLayout />
                    </ProtectedRoute>
                  }
                >
                  <Route
                    index
                    element={
                      <ProtectedRoute allowedRoles={["owner"]}>
                        <OwnerDashboard />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="pos"
                    element={
                      <ProtectedRoute allowedRoles={["owner", "cashier"]}>
                        <POSCheckout />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="inventory"
                    element={
                      <ProtectedRoute allowedRoles={["owner"]}>
                        <InventoryPage />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="reports"
                    element={
                      <ProtectedRoute allowedRoles={["owner"]}>
                        <ReportsPage />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="users"
                    element={
                      <ProtectedRoute allowedRoles={["owner"]}>
                        <UsersPage />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="settings"
                    element={
                      <ProtectedRoute allowedRoles={["owner"]}>
                        <SettingsPage />
                      </ProtectedRoute>
                    }
                  />
                </Route>

                <Route path="*" element={<NotFound />} />
              </Routes>
            </Suspense>
          </BrowserRouter>
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
