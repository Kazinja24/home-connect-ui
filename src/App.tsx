import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { LanguageProvider } from "@/i18n/LanguageContext";
import { PublicLayout } from "@/components/layouts/PublicLayout";
import { DashboardLayout } from "@/components/layouts/DashboardLayout";
import { ProtectedRoute } from "@/components/ProtectedRoute";

import Index from "./pages/Index";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Properties from "./pages/Properties";
import PropertyDetails from "./pages/PropertyDetails";
import NotFound from "./pages/NotFound";

import TenantApplications from "./pages/tenant/TenantApplications";
import TenantViewings from "./pages/tenant/TenantViewings";
import TenantLeases from "./pages/tenant/TenantLeases";
import TenantOffers from "./pages/tenant/TenantOffers";
import TenantPayments from "./pages/tenant/TenantPayments";
import TenantInvoices from "./pages/tenant/TenantInvoices";
import TenantMessages from "./pages/tenant/TenantMessages";

import LandlordOverview from "./pages/landlord/LandlordOverview";
import LandlordProperties from "./pages/landlord/LandlordProperties";
import LandlordViewings from "./pages/landlord/LandlordViewings";
import LandlordApplications from "./pages/landlord/LandlordApplications";
import LandlordLeases from "./pages/landlord/LandlordLeases";
import LandlordOffers from "./pages/landlord/LandlordOffers";
import LandlordPayments from "./pages/landlord/LandlordPayments";
import LandlordInvoices from "./pages/landlord/LandlordInvoices";
import LandlordMessages from "./pages/landlord/LandlordMessages";
import LandlordVerification from "./pages/landlord/LandlordVerification";

import AdminOverview from "./pages/admin/AdminOverview";
import AdminUsers from "./pages/admin/AdminUsers";
import AdminProperties from "./pages/admin/AdminProperties";
import AdminAnalytics from "./pages/admin/AdminAnalytics";
import AdminLifecycle from "./pages/admin/AdminLifecycle";

const queryClient = new QueryClient();

function AppRoutes() {
  return (
    <Routes>
      <Route element={<PublicLayout />}>
        <Route path="/" element={<Index />} />
        <Route path="/properties" element={<Properties />} />
        <Route path="/properties/:id" element={<PropertyDetails />} />
      </Route>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      <Route
        path="/dashboard"
        element={
          <ProtectedRoute allowedRoles={["tenant", "landlord"]}>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route path="applications" element={<TenantApplications />} />
        <Route path="viewings" element={<TenantViewings />} />
        <Route path="leases" element={<TenantLeases />} />
        <Route path="offers" element={<TenantOffers />} />
        <Route path="payments" element={<TenantPayments />} />
        <Route path="invoices" element={<TenantInvoices />} />
        <Route path="messages" element={<TenantMessages />} />

        <Route path="overview" element={<LandlordOverview />} />
        <Route path="properties" element={<LandlordProperties />} />
        <Route path="properties/new" element={<LandlordProperties />} />
        <Route path="landlord-viewings" element={<LandlordViewings />} />
        <Route path="landlord-applications" element={<LandlordApplications />} />
        <Route path="verification" element={<LandlordVerification />} />
        <Route path="landlord-leases" element={<LandlordLeases />} />
        <Route path="landlord-offers" element={<LandlordOffers />} />
        <Route path="landlord-payments" element={<LandlordPayments />} />
        <Route path="landlord-invoices" element={<LandlordInvoices />} />
        <Route path="landlord-messages" element={<LandlordMessages />} />
      </Route>

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
        <Route path="lifecycle" element={<AdminLifecycle />} />
      </Route>

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <LanguageProvider>
      <BrowserRouter>
        <AuthProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <AppRoutes />
          </TooltipProvider>
        </AuthProvider>
      </BrowserRouter>
    </LanguageProvider>
  </QueryClientProvider>
);

export default App;
