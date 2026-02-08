import { StatCard } from "@/components/StatCard";
import { Building2, Eye, ClipboardList } from "lucide-react";

const LandlordOverview = () => {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-foreground">Overview</h1>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard title="Total Properties" value={5} icon={Building2} />
        <StatCard title="Pending Viewings" value={3} icon={Eye} />
        <StatCard title="Pending Applications" value={2} icon={ClipboardList} />
      </div>
    </div>
  );
};

export default LandlordOverview;
