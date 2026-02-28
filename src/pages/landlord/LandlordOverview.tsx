import { StatCard } from "@/components/StatCard";
import { Building2, Eye, ClipboardList } from "lucide-react";
import { useLanguage } from "@/i18n/LanguageContext";
import { useQuery } from "@tanstack/react-query";
import { applications as applicationsApi, auth as authApi, viewings as viewingsApi } from "@/lib/api";
import { Skeleton } from "@/components/ui/skeleton";

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
    <div className="space-y-6 animate-slide-up">
      <h1 className="text-2xl font-bold text-foreground">{t("landlord.overview")}</h1>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 stagger-children">
        {isLoading ? (
          <>
            <Skeleton className="h-28 w-full rounded-xl" />
            <Skeleton className="h-28 w-full rounded-xl" />
            <Skeleton className="h-28 w-full rounded-xl" />
          </>
        ) : (
          <>
            <StatCard title={t("landlord.totalProperties")} value={dashboardData?.properties_count ?? 0} icon={Building2} />
            <StatCard title={t("landlord.pendingViewings")} value={pendingViewings} icon={Eye} />
            <StatCard title={t("landlord.pendingApplications")} value={pendingApplications} icon={ClipboardList} />
          </>
        )}
      </div>
    </div>
  );
};

export default LandlordOverview;
