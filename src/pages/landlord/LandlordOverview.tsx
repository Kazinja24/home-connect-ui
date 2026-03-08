import { StatCard } from "@/components/StatCard";
import { Building2, Eye, ClipboardList, Plus } from "lucide-react";
import { useLanguage } from "@/i18n/LanguageContext";
import { useQuery } from "@tanstack/react-query";
import { applications as applicationsApi, auth as authApi, viewings as viewingsApi } from "@/lib/api";
import { Skeleton } from "@/components/ui/skeleton";
import { ActiveTenantsList } from "@/components/ActiveTenantsList";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const LandlordOverview = () => {
  const { t } = useLanguage();
  const { data: dashboardData, isLoading: dashboardLoading } = useQuery({
    queryKey: ["landlord-dashboard-overview"],
    queryFn: authApi.dashboard,
  });

  const { data: applicationsData, isLoading: applicationsLoading } = useQuery({
    queryKey: ["landlord-overview-applications"],
    queryFn: () => applicationsApi.list(),
  });

  const { data: viewingsData, isLoading: viewingsLoading } = useQuery({
    queryKey: ["landlord-overview-viewings"],
    queryFn: viewingsApi.list,
  });

  const pendingApplications = (applicationsData || []).filter((a: any) => String(a.status).toLowerCase() === "pending").length;
  const pendingViewings = (viewingsData || []).filter((v: any) => String(v.status).toLowerCase() === "pending").length;

  const isLoading = dashboardLoading || applicationsLoading || viewingsLoading;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-foreground">{t("landlord.overview")}</h1>
        <Button asChild className="rounded bg-primary text-primary-foreground hover:bg-primary/90">
          <Link to="/dashboard/properties/new">
            <Plus className="h-4 w-4 mr-2" strokeWidth={1.5} />
            Ongeza Orodha
          </Link>
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {isLoading ? (
          <>
            <Skeleton className="h-24 w-full rounded-lg" />
            <Skeleton className="h-24 w-full rounded-lg" />
            <Skeleton className="h-24 w-full rounded-lg" />
          </>
        ) : (
          <>
            <StatCard title={t("landlord.totalProperties")} value={dashboardData?.properties_count ?? 0} icon={Building2} />
            <StatCard title={t("landlord.pendingViewings")} value={pendingViewings} icon={Eye} />
            <StatCard title={t("landlord.pendingApplications")} value={pendingApplications} icon={ClipboardList} />
          </>
        )}
      </div>

      {/* Active Tenants */}
      <ActiveTenantsList />
    </div>
  );
};

export default LandlordOverview;
