import { StatCard } from "@/components/StatCard";
import { Users, Building2, UserCheck, Home } from "lucide-react";
import { useLanguage } from "@/i18n/LanguageContext";

const AdminOverview = () => {
  const { t } = useLanguage();
  return (
    <div className="space-y-6 animate-slide-up">
      <h1 className="text-2xl font-bold text-foreground">{t("admin.platformOverview")}</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 stagger-children">
        <StatCard title={t("admin.totalUsers")} value={1250} icon={Users} />
        <StatCard title={t("admin.landlords")} value={180} icon={Home} />
        <StatCard title={t("admin.tenants")} value={1070} icon={UserCheck} />
        <StatCard title={t("admin.activeProperties")} value={342} icon={Building2} />
      </div>
    </div>
  );
};

export default AdminOverview;
