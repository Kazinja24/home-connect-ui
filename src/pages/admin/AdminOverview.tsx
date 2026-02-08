import { StatCard } from "@/components/StatCard";
import { Users, Building2, UserCheck, Home } from "lucide-react";

const AdminOverview = () => {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-foreground">Platform Overview</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Users" value={1250} icon={Users} />
        <StatCard title="Landlords" value={180} icon={Home} />
        <StatCard title="Tenants" value={1070} icon={UserCheck} />
        <StatCard title="Active Properties" value={342} icon={Building2} />
      </div>
    </div>
  );
};

export default AdminOverview;
