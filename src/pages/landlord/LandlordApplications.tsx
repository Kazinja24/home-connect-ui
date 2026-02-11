import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { StatusBadge } from "@/components/StatusBadge";
import { Skeleton } from "@/components/ui/skeleton";
import { applications as appApi } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import type { RequestStatus } from "@/types";

const LandlordApplications = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["landlord-applications"],
    queryFn: appApi.list,
  });

  const mutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) => appApi.updateStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["landlord-applications"] });
      toast({ title: "Hali imesasishwa!" });
    },
    onError: (err: any) => toast({ title: err.message || "Imeshindikana", variant: "destructive" }),
  });

  return (
    <div className="space-y-6 animate-slide-up">
      <h1 className="text-2xl font-bold text-foreground">Maombi</h1>
      <div className="grid gap-4 stagger-children">
        {isLoading ? (
          [1,2].map(i => <Skeleton key={i} className="h-40 w-full rounded-xl" />)
        ) : data && data.length > 0 ? data.map((a: any) => (
          <Card key={a.id} className="hover-lift glass-strong border-border/30">
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <p className="font-bold text-foreground">{a.tenant_name || `Mpangaji #${a.tenant || a.tenantId}`}</p>
                  <p className="text-sm text-muted-foreground">{a.property_title || `Nyumba #${a.property || a.propertyId}`}</p>
                </div>
                <StatusBadge status={a.status as RequestStatus} />
              </div>
              <div className="grid grid-cols-3 gap-4 text-sm mb-4">
                <div><p className="text-muted-foreground">Ajira</p><p className="font-semibold text-foreground">{a.employment_status || a.employmentStatus || "—"}</p></div>
                <div><p className="text-muted-foreground">Muda</p><p className="font-semibold text-foreground">{a.length_of_stay || a.lengthOfStay || "—"}</p></div>
                <div><p className="text-muted-foreground">Wakaaji</p><p className="font-semibold text-foreground">{a.occupants || "—"}</p></div>
              </div>
              {a.status === "pending" && (
                <div className="flex gap-2">
                  <Button size="sm" className="font-semibold shadow-sm" disabled={mutation.isPending} onClick={() => mutation.mutate({ id: a.id, status: "approved" })}>Kubali</Button>
                  <Button size="sm" variant="ghost" className="text-destructive" disabled={mutation.isPending} onClick={() => mutation.mutate({ id: a.id, status: "rejected" })}>Kataa</Button>
                </div>
              )}
            </CardContent>
          </Card>
        )) : (
          <p className="text-muted-foreground text-sm py-8 text-center">Hakuna maombi kwa sasa</p>
        )}
      </div>
    </div>
  );
};

export default LandlordApplications;
