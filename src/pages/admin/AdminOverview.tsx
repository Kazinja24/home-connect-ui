import { StatCard } from "@/components/StatCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Users, Building2, UserCheck, Home, ShieldCheck, Flag, AlertTriangle, CreditCard, Activity, TrendingUp, Clock, CheckCircle2 } from "lucide-react";
import { useLanguage } from "@/i18n/LanguageContext";
import { useQuery } from "@tanstack/react-query";
import { auth as authApi } from "@/lib/api";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

const AdminOverview = () => {
  const { t, lang } = useLanguage();
  const { data } = useQuery({
    queryKey: ["admin-overview-dashboard"],
    queryFn: authApi.dashboard,
  });

  // Mock platform health data
  const platformHealth = {
    uptime: 99.8,
    avgResponseTime: 120,
    activeSessionsToday: 47,
    newSignupsThisWeek: 12,
  };

  const pendingActions = [
    {
      icon: ShieldCheck,
      label: lang === "sw" ? "Uthibitisho wa wamiliki unasubiri" : "Landlord verifications pending",
      count: 2,
      link: "/admin/verifications",
      color: "text-amber-600",
    },
    {
      icon: Building2,
      label: lang === "sw" ? "Nyumba zinasubiri ukaguzi" : "Listings pending review",
      count: data?.pending_reviews ?? 1,
      link: "/admin/properties",
      color: "text-primary",
    },
    {
      icon: Flag,
      label: lang === "sw" ? "Ripoti za nyumba zinasubiri" : "Property reports pending",
      count: 2,
      link: "/admin/reports",
      color: "text-destructive",
    },
  ];

  const recentActivity = [
    { action: lang === "sw" ? "Mmiliki mpya amejiandikisha" : "New landlord registered", actor: "Grace Kimaro", time: "2 hrs ago", icon: Users },
    { action: lang === "sw" ? "Nyumba imewasilishwa kwa ukaguzi" : "Property submitted for review", actor: "Hassan Mwangi", time: "3 hrs ago", icon: Building2 },
    { action: lang === "sw" ? "Uthibitisho umewasilishwa" : "Verification submitted", actor: "Grace Kimaro", time: "5 hrs ago", icon: ShieldCheck },
    { action: lang === "sw" ? "Mkataba umesainiwa" : "Lease signed", actor: "Amina Juma", time: "1 day ago", icon: CheckCircle2 },
    { action: lang === "sw" ? "Malipo yamekamilika" : "Payment completed", actor: "Amina Juma", time: "1 day ago", icon: CreditCard },
    { action: lang === "sw" ? "Ripoti mpya ya nyumba" : "New property report filed", actor: "David Kilonzo", time: "2 days ago", icon: Flag },
  ];

  return (
    <div className="space-y-6 animate-slide-up">
      <div>
        <h1 className="text-2xl font-bold text-foreground">{t("admin.platformOverview")}</h1>
        <p className="text-sm text-muted-foreground mt-1">
          {lang === "sw" ? "Muhtasari wa hali ya jukwaa na vitendo vinavyosubiri" : "Platform status and pending actions at a glance"}
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 stagger-children">
        <StatCard title={t("admin.totalUsers")} value={data?.total_users ?? 3} icon={Users} />
        <StatCard title={t("admin.activeProperties")} value={data?.total_properties ?? 6} icon={Building2} />
        <StatCard title={t("admin.totalApplications")} value={data?.total_payments ?? 1} icon={CreditCard} />
        <StatCard title={t("admin.leasesSigned")} value={data?.active_disputes ?? 0} icon={UserCheck} />
      </div>

      {/* Pending Actions + Platform Health */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Pending Actions */}
        <Card className="border-accent/20 bg-accent/5">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-amber-500" />
              {lang === "sw" ? "Vitendo Vinavyosubiri" : "Pending Actions"}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {pendingActions.map((action, i) => (
              <Link key={i} to={action.link} className="flex items-center justify-between p-3 rounded-lg bg-background/80 hover:bg-background border border-border/50 transition-colors group">
                <div className="flex items-center gap-3">
                  <action.icon className={`h-5 w-5 ${action.color}`} strokeWidth={1.5} />
                  <span className="text-sm text-foreground">{action.label}</span>
                </div>
                <Badge variant="secondary" className="text-sm font-bold group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                  {action.count}
                </Badge>
              </Link>
            ))}
          </CardContent>
        </Card>

        {/* Platform Health */}
        <Card className="glass-strong border-border/30">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Activity className="h-5 w-5 text-emerald-500" />
              {lang === "sw" ? "Afya ya Jukwaa" : "Platform Health"}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">{lang === "sw" ? "Muda wa Kufanya Kazi" : "Uptime"}</span>
                <span className="font-bold text-emerald-600">{platformHealth.uptime}%</span>
              </div>
              <Progress value={platformHealth.uptime} className="h-2" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 rounded-lg bg-muted/50 text-center">
                <p className="text-xs text-muted-foreground">{lang === "sw" ? "Muda wa Majibu" : "Avg Response"}</p>
                <p className="text-lg font-bold text-foreground">{platformHealth.avgResponseTime}ms</p>
              </div>
              <div className="p-3 rounded-lg bg-muted/50 text-center">
                <p className="text-xs text-muted-foreground">{lang === "sw" ? "Vikao Hai Leo" : "Active Sessions"}</p>
                <p className="text-lg font-bold text-foreground">{platformHealth.activeSessionsToday}</p>
              </div>
              <div className="p-3 rounded-lg bg-muted/50 text-center col-span-2">
                <p className="text-xs text-muted-foreground flex items-center justify-center gap-1">
                  <TrendingUp className="h-3 w-3" />
                  {lang === "sw" ? "Usajili Mpya Wiki Hii" : "New Signups This Week"}
                </p>
                <p className="text-lg font-bold text-foreground">{platformHealth.newSignupsThisWeek}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card className="glass-strong border-border/30">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <Clock className="h-5 w-5 text-muted-foreground" />
            {lang === "sw" ? "Shughuli za Hivi Karibuni" : "Recent Activity"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-1">
            {recentActivity.map((item, i) => (
              <div key={i} className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors">
                <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center shrink-0">
                  <item.icon className="h-4 w-4 text-muted-foreground" strokeWidth={1.5} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-foreground">{item.action}</p>
                  <p className="text-xs text-muted-foreground">{item.actor}</p>
                </div>
                <span className="text-xs text-muted-foreground whitespace-nowrap">{item.time}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Quick Links */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Link to="/admin/verifications">
          <Button variant="outline" className="w-full h-auto py-4 flex-col gap-2">
            <ShieldCheck className="h-5 w-5 text-primary" />
            <span className="text-xs">{lang === "sw" ? "Uthibitisho" : "Verifications"}</span>
          </Button>
        </Link>
        <Link to="/admin/properties">
          <Button variant="outline" className="w-full h-auto py-4 flex-col gap-2">
            <Building2 className="h-5 w-5 text-primary" />
            <span className="text-xs">{lang === "sw" ? "Nyumba" : "Properties"}</span>
          </Button>
        </Link>
        <Link to="/admin/reports">
          <Button variant="outline" className="w-full h-auto py-4 flex-col gap-2">
            <Flag className="h-5 w-5 text-primary" />
            <span className="text-xs">{lang === "sw" ? "Ripoti" : "Reports"}</span>
          </Button>
        </Link>
        <Link to="/admin/analytics">
          <Button variant="outline" className="w-full h-auto py-4 flex-col gap-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            <span className="text-xs">{lang === "sw" ? "Takwimu" : "Analytics"}</span>
          </Button>
        </Link>
      </div>
    </div>
  );
};

export default AdminOverview;
