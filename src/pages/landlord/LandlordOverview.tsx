import { StatCard } from "@/components/StatCard";
import { Building2, Eye, ClipboardList } from "lucide-react";

const LandlordOverview = () => {
  return (
    <div className="space-y-6 animate-slide-up">
      <h1 className="text-2xl font-bold text-foreground">Muhtasari</h1>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 stagger-children">
        <StatCard title="Jumla ya Nyumba" value={5} icon={Building2} />
        <StatCard title="Maombi ya Kuona Yanayosubiri" value={3} icon={Eye} />
        <StatCard title="Maombi Yanayosubiri" value={2} icon={ClipboardList} />
      </div>
    </div>
  );
};

export default LandlordOverview;
