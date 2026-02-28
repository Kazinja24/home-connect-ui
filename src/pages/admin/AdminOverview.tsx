import { StatCard } from "@/components/StatCard";
import { Users, Building2, UserCheck, Home } from "lucide-react";
import { useLanguage } from "@/i18n/LanguageContext";
import { useQuery } from "@tanstack/react-query";
import { auth as authApi } from "@/lib/api";

const AdminOverview = () => {
  const { t } = useLanguage();
  const { data } = useQuery({
    queryKey: ["admin-overview-dashboard"],
    queryFn: authApi.dashboard,
  });

  return (
    <div className="space-y-6 animate-slide-up">
      <h1 className="text-2xl font-bold text-foreground">{t("admin.platformOverview")}</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 stagger-children">
        <StatCard title={t("admin.totalUsers")} value={data?.users_count ?? "-"} icon={Users} />
        <StatCard title={t("admin.totalApplications")} value={data?.applications_count ?? "-"} icon={Home} />
        <StatCard title={t("admin.leasesSigned")} value={data?.leases_count ?? "-"} icon={UserCheck} />
        <StatCard title={t("admin.activeProperties")} value={data?.properties_count ?? "-"} icon={Building2} />
      </div>
    </div>
  );
};

export default AdminOverview;
