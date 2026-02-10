import { Outlet, Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { NavLink } from "@/components/NavLink";
import {
  SidebarProvider, Sidebar, SidebarContent, SidebarHeader, SidebarMenu, SidebarMenuItem,
  SidebarMenuButton, SidebarTrigger, SidebarInset, SidebarGroup, SidebarGroupLabel, SidebarGroupContent,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Home, Building2, Eye, FileText, ClipboardList, Users, BarChart3, Shield, LogOut, Plus } from "lucide-react";
import type { UserRole } from "@/types";

const navItems: Record<UserRole, { title: string; url: string; icon: typeof Home }[]> = {
  tenant: [
    { title: "Maombi ya Kuona", url: "/dashboard/viewings", icon: Eye },
    { title: "Maombi Yangu", url: "/dashboard/applications", icon: ClipboardList },
    { title: "Mikataba", url: "/dashboard/leases", icon: FileText },
  ],
  landlord: [
    { title: "Muhtasari", url: "/dashboard/overview", icon: Home },
    { title: "Nyumba", url: "/dashboard/properties", icon: Building2 },
    { title: "Maombi ya Kuona", url: "/dashboard/viewings", icon: Eye },
    { title: "Maombi", url: "/dashboard/applications", icon: ClipboardList },
    { title: "Mkataba", url: "/dashboard/leases", icon: FileText },
  ],
  admin: [
    { title: "Muhtasari", url: "/admin/overview", icon: BarChart3 },
    { title: "Watumiaji", url: "/admin/users", icon: Users },
    { title: "Nyumba", url: "/admin/properties", icon: Building2 },
    { title: "Takwimu", url: "/admin/analytics", icon: BarChart3 },
  ],
};

export function DashboardLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const role = user?.role ?? "tenant";
  const items = navItems[role];

  const handleLogout = () => { logout(); navigate("/"); };

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <Sidebar>
          <SidebarHeader className="p-5">
            <Link to="/" className="flex items-center gap-2 font-extrabold text-lg text-sidebar-primary-foreground">
              <Home className="h-5 w-5" />
              NIKONEKTI
            </Link>
            <p className="text-xs text-sidebar-foreground/60 capitalize mt-1">
              {role === "tenant" ? "Dashibodi ya Mpangaji" : role === "landlord" ? "Dashibodi ya Mmiliki" : "Paneli ya Msimamizi"}
            </p>
          </SidebarHeader>
          <SidebarContent>
            <SidebarGroup>
              <SidebarGroupLabel>Urambazaji</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {items.map((item) => (
                    <SidebarMenuItem key={item.url}>
                      <SidebarMenuButton asChild>
                        <NavLink to={item.url} end className="flex items-center gap-2" activeClassName="bg-sidebar-accent text-sidebar-accent-foreground font-medium">
                          <item.icon className="h-4 w-4" />
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
                          <Plus className="h-4 w-4" /><span>Ongeza Nyumba</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  </SidebarMenu>
                </SidebarGroupContent>
              </SidebarGroup>
            )}
          </SidebarContent>

          <div className="mt-auto p-4 border-t border-sidebar-border">
            <div className="flex items-center gap-3 mb-3">
              <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-sidebar-primary to-sidebar-accent flex items-center justify-center text-xs font-bold text-sidebar-primary-foreground">
                {user?.fullName?.charAt(0) ?? "U"}
              </div>
              <div className="overflow-hidden">
                <p className="text-sm font-semibold text-sidebar-foreground truncate">{user?.fullName ?? "Mtumiaji"}</p>
                <p className="text-xs text-sidebar-foreground/60 truncate">{user?.email}</p>
              </div>
            </div>
            <Button variant="ghost" size="sm" className="w-full justify-start text-sidebar-foreground/60 hover:text-sidebar-foreground" onClick={handleLogout}>
              <LogOut className="h-4 w-4 mr-2" />Ondoka
            </Button>
          </div>
        </Sidebar>

        <SidebarInset>
          <header className="flex h-14 items-center gap-4 border-b px-6 glass">
            <SidebarTrigger />
            {role === "admin" && (
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Shield className="h-3.5 w-3.5" />Paneli ya Msimamizi
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
