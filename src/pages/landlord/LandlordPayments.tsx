import { useQuery } from "@tanstack/react-query";
import { payments } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Wallet } from "lucide-react";

const statusMap: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
  completed: { label: "Imekamilika", variant: "default" },
  pending: { label: "Inasubiri", variant: "secondary" },
  failed: { label: "Imeshindikana", variant: "destructive" },
};

const LandlordPayments = () => {
  const { data, isLoading } = useQuery({
    queryKey: ["landlord-payments"],
    queryFn: payments.list,
  });

  return (
    <div className="space-y-6 animate-slide-up">
      <div className="flex items-center gap-3">
        <Wallet className="h-6 w-6 text-primary" />
        <h1 className="text-2xl font-bold text-foreground">Malipo Yaliyopokelewa</h1>
      </div>

      <Card className="glass-strong border-border/30">
        <CardHeader><CardTitle className="text-lg">Orodha ya Malipo</CardTitle></CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map(i => <Skeleton key={i} className="h-12 w-full" />)}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Mpangaji</TableHead>
                  <TableHead>Nyumba</TableHead>
                  <TableHead>Kiasi</TableHead>
                  <TableHead>Rejea</TableHead>
                  <TableHead>Tarehe</TableHead>
                  <TableHead>Hali</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data && data.length > 0 ? data.map((p: any) => (
                  <TableRow key={p.id} className="hover:bg-muted/50 transition-colors">
                    <TableCell className="font-medium">{p.tenant_name || `Mpangaji #${p.tenant || p.tenantId}`}</TableCell>
                    <TableCell>Nyumba #{p.property || p.propertyId}</TableCell>
                    <TableCell>TZS {Number(p.amount).toLocaleString()}</TableCell>
                    <TableCell className="text-muted-foreground">{p.reference || "—"}</TableCell>
                    <TableCell>{p.created_at ? new Date(p.created_at).toLocaleDateString("sw-TZ") : "—"}</TableCell>
                    <TableCell>
                      <Badge variant={statusMap[p.status]?.variant || "outline"}>
                        {statusMap[p.status]?.label || p.status}
                      </Badge>
                    </TableCell>
                  </TableRow>
                )) : (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                      Bado hakuna malipo yaliyopokelewa
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default LandlordPayments;
