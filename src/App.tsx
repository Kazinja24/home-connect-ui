import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { PublicLayout } from "@/components/layouts/PublicLayout";
import { DashboardLayout } from "@/components/layouts/DashboardLayout";
import { ProtectedRoute } from "@/components/ProtectedRoute";

import Index from "./pages/Index";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Properties from "./pages/Properties";
import PropertyDetails from "./pages/PropertyDetails";
import NotFound from "./pages/NotFound";

import TenantViewings from "./pages/tenant/TenantViewings";
import LandlordOverview from "./pages/landlord/LandlordOverview";
import LandlordProperties from "./pages/landlord/LandlordProperties";
import LandlordViewings from "./pages/landlord/LandlordViewings";
import LandlordApplications from "./pages/landlord/LandlordApplications";
import LandlordLeases from "./pages/landlord/LandlordLeases";
import AdminOverview from "./pages/admin/AdminOverview";
import AdminUsers from "./pages/admin/AdminUsers";
import AdminProperties from "./pages/admin/AdminProperties";
import AdminAnalytics from "./pages/admin/AdminAnalytics";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            {/* Public */}
            <Route element={<PublicLayout />}>
              <Route path="/" element={<Index />} />
              <Route path="/properties" element={<Properties />} />
              <Route path="/properties/:id" element={<PropertyDetails />} />
            </Route>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* Tenant & Landlord Dashboard */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute allowedRoles={["tenant", "landlord"]}>
                  <DashboardLayout />
                </ProtectedRoute>
              }
            >
              {/* Tenant */}
              <Route path="viewings" element={<TenantViewings />} />
              <Route path="applications" element={<TenantViewings />} />
              <Route path="leases" element={<TenantViewings />} />
              {/* Landlord */}
              <Route path="overview" element={<LandlordOverview />} />
              <Route path="properties" element={<LandlordProperties />} />
              <Route path="properties/new" element={<LandlordProperties />} />
            </Route>

            {/* Landlord-specific reuse of dashboard viewings/applications/leases */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute allowedRoles={["landlord"]}>
                  <DashboardLayout />
                </ProtectedRoute>
              }
            >
              <Route path="landlord-viewings" element={<LandlordViewings />} />
              <Route path="landlord-applications" element={<LandlordApplications />} />
              <Route path="landlord-leases" element={<LandlordLeases />} />
            </Route>

            {/* Admin */}
            <Route
              path="/admin"
              element={
                <ProtectedRoute allowedRoles={["admin"]}>
                  <DashboardLayout />
                </ProtectedRoute>
              }
            >
              <Route path="overview" element={<AdminOverview />} />
              <Route path="users" element={<AdminUsers />} />
              <Route path="properties" element={<AdminProperties />} />
              <Route path="analytics" element={<AdminAnalytics />} />
            </Route>

            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
