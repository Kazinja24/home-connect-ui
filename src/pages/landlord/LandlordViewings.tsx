import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { StatusBadge } from "@/components/StatusBadge";
import { viewings as viewingsApi } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import type { RequestStatus } from "@/types";

const LandlordViewings = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["landlord-viewings"],
    queryFn: viewingsApi.list,
  });

  const mutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: "approved" | "rejected" }) => viewingsApi.updateStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["landlord-viewings"] });
      toast({ title: "Hali imesasishwa!" });
    },
    onError: (err: any) => toast({ title: err.message || "Imeshindikana", variant: "destructive" }),
  });

  const completeMutation = useMutation({
    mutationFn: ({ id, outcome }: { id: string; outcome: "ACCEPTED" | "REJECTED" }) => viewingsApi.complete(id, outcome),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["landlord-viewings"] });
      queryClient.invalidateQueries({ queryKey: ["landlord-applications"] });
      toast({ title: "Matokeo ya viewing yamehifadhiwa." });
    },
    onError: (err: any) => toast({ title: err.message || "Imeshindikana", variant: "destructive" }),
  });

  return (
    <div className="space-y-6 animate-slide-up">
      <h1 className="text-2xl font-bold text-foreground">Maombi ya Kuona</h1>
      <Card className="glass-strong border-border/30">
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-6 space-y-3">{[1,2,3].map(i => <Skeleton key={i} className="h-12 w-full" />)}</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Mpangaji</TableHead>
                  <TableHead>Nyumba</TableHead>
                  <TableHead>Tarehe</TableHead>
                  <TableHead>Muda</TableHead>
                  <TableHead>Hali</TableHead>
                  <TableHead className="text-right">Vitendo</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data && data.length > 0 ? data.map((v: any) => (
                  <TableRow key={v.id} className="hover:bg-muted/50 transition-colors">
                    <TableCell className="font-medium">{v.tenant_name || `Mpangaji #${v.tenant}`}</TableCell>
                    <TableCell>{v.property_title || `Nyumba #${v.property}`}</TableCell>
                    <TableCell>{v.date || (v.scheduled_date ? new Date(v.scheduled_date).toLocaleDateString("sw-TZ") : "-")}</TableCell>
                    <TableCell>{v.time_window === "morning" ? "Asubuhi" : v.time_window === "afternoon" ? "Mchana" : "Jioni"}</TableCell>
                    <TableCell><StatusBadge status={v.status as RequestStatus} /></TableCell>
                    <TableCell className="text-right space-x-1">
                      {v.status === "pending" && (
                        <>
                          <Button size="sm" variant="outline" disabled={mutation.isPending} onClick={() => mutation.mutate({ id: String(v.id), status: "approved" })}>Kubali</Button>
                          <Button size="sm" variant="ghost" className="text-destructive" disabled={mutation.isPending} onClick={() => mutation.mutate({ id: String(v.id), status: "rejected" })}>Kataa</Button>
                        </>
                      )}
                      {v.status === "approved" && (
                        <>
                          <Button
                            size="sm"
                            variant="outline"
                            disabled={completeMutation.isPending}
                            onClick={() => completeMutation.mutate({ id: String(v.id), outcome: "ACCEPTED" })}
                          >
                            Viewing Accepted
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="text-destructive"
                            disabled={completeMutation.isPending}
                            onClick={() => completeMutation.mutate({ id: String(v.id), outcome: "REJECTED" })}
                          >
                            Viewing Rejected
                          </Button>
                        </>
                      )}
                    </TableCell>
                  </TableRow>
                )) : (
                  <TableRow><TableCell colSpan={6} className="text-center text-muted-foreground py-8">Hakuna maombi ya kuona</TableCell></TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default LandlordViewings;
