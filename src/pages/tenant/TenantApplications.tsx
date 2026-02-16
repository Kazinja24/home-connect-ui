import { useQuery } from "@tanstack/react-query";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { StatusBadge } from "@/components/StatusBadge";
import { applications as appApi } from "@/lib/api";
import type { RequestStatus } from "@/types";

function normalizeStatus(status: string): RequestStatus {
  const normalized = status.toLowerCase();
  if (["approved", "accepted", "leased", "active", "closed", "viewing_scheduled"].includes(normalized)) return "approved";
  if (normalized === "rejected") return "rejected";
  return "pending";
}

const TenantApplications = () => {
  const { data, isLoading } = useQuery({
    queryKey: ["tenant-applications"],
    queryFn: appApi.list,
  });

  return (
    <div className="space-y-6 animate-slide-up">
      <h1 className="text-2xl font-bold text-foreground">Maombi Yangu</h1>

      <Card className="glass-strong border-border/30">
        <CardHeader>
          <CardTitle className="text-lg">Maombi ya Nyumba</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {isLoading ? (
            [1, 2, 3].map((i) => <Skeleton key={i} className="h-16 w-full" />)
          ) : data && data.length > 0 ? (
            data.map((a: any) => (
              <div key={a.id} className="border rounded-lg p-4 flex items-center justify-between">
                <div>
                  <p className="font-semibold text-foreground">{a.property_title || `Nyumba #${a.property}`}</p>
                  <p className="text-xs text-muted-foreground">{a.created_at ? new Date(a.created_at).toLocaleString("sw-TZ") : ""}</p>
                </div>
                <StatusBadge status={normalizeStatus(a.status)} />
              </div>
            ))
          ) : (
            <p className="text-muted-foreground text-sm py-8 text-center">Bado hujatuma ombi lolote</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default TenantApplications;
