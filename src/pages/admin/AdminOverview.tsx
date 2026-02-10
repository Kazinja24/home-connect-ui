import { StatCard } from "@/components/StatCard";
import { Users, Building2, UserCheck, Home } from "lucide-react";

const AdminOverview = () => {
  return (
    <div className="space-y-6 animate-slide-up">
      <h1 className="text-2xl font-bold text-foreground">Muhtasari wa Jukwaa</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 stagger-children">
        <StatCard title="Watumiaji Wote" value={1250} icon={Users} />
        <StatCard title="Wamiliki" value={180} icon={Home} />
        <StatCard title="Wapangaji" value={1070} icon={UserCheck} />
        <StatCard title="Nyumba Hai" value={342} icon={Building2} />
      </div>
    </div>
  );
};

export default AdminOverview;
