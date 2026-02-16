import { StatCard } from "@/components/StatCard";
import { Building2, Eye, ClipboardList } from "lucide-react";
import { useLanguage } from "@/i18n/LanguageContext";

const LandlordOverview = () => {
  const { t } = useLanguage();

  return (
    <div className="space-y-6 animate-slide-up">
      <h1 className="text-2xl font-bold text-foreground">{t("landlord.overview")}</h1>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 stagger-children">
        <StatCard title={t("landlord.totalProperties")} value={5} icon={Building2} />
        <StatCard title={t("landlord.pendingViewings")} value={3} icon={Eye} />
        <StatCard title={t("landlord.pendingApplications")} value={2} icon={ClipboardList} />
      </div>
    </div>
  );
};

export default LandlordOverview;
