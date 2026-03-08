import { Outlet, Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/i18n/LanguageContext";
import { NavLink } from "@/components/NavLink";
import {
  SidebarProvider, Sidebar, SidebarContent, SidebarHeader, SidebarMenu, SidebarMenuItem,
  SidebarMenuButton, SidebarTrigger, SidebarInset, SidebarGroup, SidebarGroupLabel, SidebarGroupContent,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Home, Building2, Eye, FileText, ClipboardList, Users, BarChart3, Shield, LogOut, Plus, CreditCard, Wallet, Receipt, MessageSquare, Handshake, UserCircle } from "lucide-react";
import type { UserRole } from "@/types";
import nikonektiLogo from "@/assets/nikonekti-logo.png";

export function DashboardLayout() {
  const { user, logout } = useAuth();
  const { t, lang, setLang } = useLanguage();
  const navigate = useNavigate();
  const role = user?.role ?? "tenant";

  const navItems: Record<UserRole, { title: string; url: string; icon: typeof Home }[]> = {
    tenant: [
      { title: t("profile.title"), url: "/dashboard/profile", icon: UserCircle },
      { title: t("tenant.applications"), url: "/dashboard/applications", icon: ClipboardList },
      { title: t("tenant.viewings"), url: "/dashboard/viewings", icon: Eye },
      { title: t("tenant.leases"), url: "/dashboard/leases", icon: FileText },
      { title: "Offers", url: "/dashboard/offers", icon: Handshake },
      { title: t("tenant.invoices"), url: "/dashboard/invoices", icon: Receipt },
      { title: t("tenant.payments"), url: "/dashboard/payments", icon: CreditCard },
      { title: t("tenant.messages"), url: "/dashboard/messages", icon: MessageSquare },
    ],
    landlord: [
      { title: t("profile.title"), url: "/dashboard/profile", icon: UserCircle },
      { title: t("landlord.overview"), url: "/dashboard/overview", icon: Home },
      { title: t("landlord.properties"), url: "/dashboard/properties", icon: Building2 },
      { title: t("landlord.applications"), url: "/dashboard/landlord-applications", icon: ClipboardList },
      { title: t("landlord.viewings"), url: "/dashboard/landlord-viewings", icon: Eye },
      { title: t("landlord.leases"), url: "/dashboard/landlord-leases", icon: FileText },
      { title: "Offers", url: "/dashboard/landlord-offers", icon: Handshake },
      { title: t("landlord.invoices"), url: "/dashboard/landlord-invoices", icon: Receipt },
      { title: t("landlord.payments"), url: "/dashboard/landlord-payments", icon: Wallet },
      { title: t("landlord.messages"), url: "/dashboard/landlord-messages", icon: MessageSquare },
    ],
    admin: [
      { title: t("profile.title"), url: "/admin/profile", icon: UserCircle },
      { title: t("admin.overview"), url: "/admin/overview", icon: BarChart3 },
      { title: t("admin.users"), url: "/admin/users", icon: Users },
      { title: t("admin.properties"), url: "/admin/properties", icon: Building2 },
      { title: t("admin.analytics"), url: "/admin/analytics", icon: BarChart3 },
      { title: "Lifecycle Logs", url: "/admin/lifecycle", icon: Shield },
    ],
  };

  const items = navItems[role];
  const handleLogout = () => { logout(); navigate("/"); };

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <Sidebar>
          <SidebarHeader className="p-5 border-b border-sidebar-border">
            <Link to="/" className="flex items-center gap-2 font-bold text-lg text-sidebar-foreground">
              <Home className="h-5 w-5" strokeWidth={1.5} />
              Nikonekti
            </Link>
            <p className="text-xs text-sidebar-foreground/60 capitalize mt-1">
              {role === "tenant" ? t("role.tenantDashboard") : role === "landlord" ? t("role.landlordDashboard") : t("role.adminPanel")}
            </p>
          </SidebarHeader>
          <SidebarContent>
            <SidebarGroup>
              <SidebarGroupLabel className="tag-label text-sidebar-foreground/50">{t("nav.navigation")}</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {items.map((item) => (
                    <SidebarMenuItem key={item.url}>
                      <SidebarMenuButton asChild>
                        <NavLink to={item.url} end className="flex items-center gap-2 text-sidebar-foreground/80 hover:text-sidebar-foreground" activeClassName="bg-sidebar-accent text-sidebar-accent-foreground font-medium">
                          <item.icon className="h-4 w-4" strokeWidth={1.5} />
                          <span>{item.title}</span>
                        </NavLink>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>

            {role === "landlord" && (
              <SidebarGroup>
                <SidebarGroupContent>
                  <SidebarMenu>
                    <SidebarMenuItem>
                      <SidebarMenuButton asChild>
                        <Link to="/dashboard/properties/new" className="flex items-center gap-2 text-sidebar-primary">
                          <Plus className="h-4 w-4" strokeWidth={1.5} /><span>{t("nav.addProperty")}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  </SidebarMenu>
                </SidebarGroupContent>
              </SidebarGroup>
            )}
          </SidebarContent>

          <div className="mt-auto p-4 border-t border-sidebar-border">
            {/* Language toggle */}
            <div className="flex items-center gap-2 mb-3 text-xs text-sidebar-foreground/60">
              <button onClick={() => setLang("sw")} className={lang === "sw" ? "text-sidebar-foreground" : ""}>SW</button>
              <span>|</span>
              <button onClick={() => setLang("en")} className={lang === "en" ? "text-sidebar-foreground" : ""}>EN</button>
            </div>
            <div className="flex items-center gap-3 mb-3">
              <div className="h-9 w-9 rounded bg-sidebar-accent flex items-center justify-center text-xs font-bold text-sidebar-accent-foreground">
                {user?.fullName?.charAt(0) ?? "U"}
              </div>
              <div className="overflow-hidden">
                <p className="text-sm font-semibold text-sidebar-foreground truncate">{user?.fullName ?? "User"}</p>
                <p className="text-xs text-sidebar-foreground/60 truncate">{user?.email}</p>
              </div>
            </div>
            <Button variant="ghost" size="sm" className="w-full justify-start text-sidebar-foreground/60 hover:text-sidebar-foreground hover:bg-sidebar-accent" onClick={handleLogout}>
              <LogOut className="h-4 w-4 mr-2" strokeWidth={1.5} />{t("nav.logout")}
            </Button>
          </div>
        </Sidebar>

        <SidebarInset>
          <header className="flex h-14 items-center gap-4 border-b border-border px-6 bg-card">
            <SidebarTrigger />
            {role === "admin" && (
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Shield className="h-3.5 w-3.5" strokeWidth={1.5} />{t("role.adminPanel")}
              </div>
            )}
          </header>
          <div className="flex-1 p-6">
            <Outlet />
          </div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
