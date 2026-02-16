import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { payments } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { CreditCard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

const invoiceStatusMap: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
  PAID: { label: "Imelipwa", variant: "default" },
  PENDING: { label: "Inasubiri", variant: "secondary" },
  OVERDUE: { label: "Imechelewa", variant: "destructive" },
};

const paymentStatusMap: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
  PAID: { label: "Imekamilika", variant: "default" },
};

const TenantPayments = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: invoices, isLoading: invoicesLoading } = useQuery({
    queryKey: ["tenant-invoices"],
    queryFn: payments.invoices,
  });

  const { data: paymentHistory, isLoading: paymentsLoading } = useQuery({
    queryKey: ["tenant-payments"],
    queryFn: payments.list,
  });

  const payMutation = useMutation({
    mutationFn: (invoiceId: string) => payments.create({ invoice: invoiceId, method: "MOBILE" }),
    onSuccess: () => {
      toast({ title: "Malipo yamefanyika kikamilifu." });
      queryClient.invalidateQueries({ queryKey: ["tenant-invoices"] });
      queryClient.invalidateQueries({ queryKey: ["tenant-payments"] });
    },
    onError: (err: any) => toast({ title: err.message || "Imeshindikana kulipa", variant: "destructive" }),
  });

  const payableInvoices = (invoices || []).filter((invoice: any) => invoice.status !== "PAID");

  return (
    <div className="space-y-6 animate-slide-up">
      <div className="flex items-center gap-3">
        <CreditCard className="h-6 w-6 text-primary" />
        <h1 className="text-2xl font-bold text-foreground">Malipo Yangu</h1>
      </div>

      <Card className="glass-strong border-border/30">
        <CardHeader><CardTitle className="text-lg">Ankara Zinazosubiri Malipo</CardTitle></CardHeader>
        <CardContent>
          {invoicesLoading ? (
            <div className="space-y-3">{[1, 2].map(i => <Skeleton key={i} className="h-12 w-full" />)}</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nyumba</TableHead>
                  <TableHead>Mwezi</TableHead>
                  <TableHead>Kiasi</TableHead>
                  <TableHead>Due Date</TableHead>
                  <TableHead>Hali</TableHead>
                  <TableHead className="text-right">Kitendo</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {payableInvoices.length > 0 ? payableInvoices.map((invoice: any) => (
                  <TableRow key={invoice.id}>
                    <TableCell className="font-medium">{invoice.property_title || `Nyumba #${invoice.lease}`}</TableCell>
                    <TableCell>{invoice.month ? new Date(invoice.month).toLocaleDateString("sw-TZ") : "—"}</TableCell>
                    <TableCell>TZS {Number(invoice.amount).toLocaleString()}</TableCell>
                    <TableCell>{invoice.due_date ? new Date(invoice.due_date).toLocaleDateString("sw-TZ") : "—"}</TableCell>
                    <TableCell>
                      <Badge variant={invoiceStatusMap[invoice.status]?.variant || "outline"}>
                        {invoiceStatusMap[invoice.status]?.label || invoice.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button size="sm" disabled={payMutation.isPending} onClick={() => payMutation.mutate(String(invoice.id))}>
                        Lipa Sasa
                      </Button>
                    </TableCell>
                  </TableRow>
                )) : (
                  <TableRow><TableCell colSpan={6} className="text-center text-muted-foreground py-8">Hakuna ankara inayosubiri malipo</TableCell></TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Card className="glass-strong border-border/30">
        <CardHeader><CardTitle className="text-lg">Historia ya Malipo</CardTitle></CardHeader>
        <CardContent>
          {paymentsLoading ? (
            <div className="space-y-3">{[1, 2, 3].map(i => <Skeleton key={i} className="h-12 w-full" />)}</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nyumba</TableHead>
                  <TableHead>Kiasi</TableHead>
                  <TableHead>Rejea</TableHead>
                  <TableHead>Tarehe</TableHead>
                  <TableHead>Hali</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paymentHistory && paymentHistory.length > 0 ? paymentHistory.map((p: any) => (
                  <TableRow key={p.id} className="hover:bg-muted/50 transition-colors">
                    <TableCell className="font-medium">{p.property_title || `Nyumba #${p.lease}`}</TableCell>
                    <TableCell>TZS {Number(p.amount).toLocaleString()}</TableCell>
                    <TableCell className="text-muted-foreground">{p.reference || "—"}</TableCell>
                    <TableCell>{p.created_at ? new Date(p.created_at).toLocaleDateString("sw-TZ") : "—"}</TableCell>
                    <TableCell>
                      <Badge variant={paymentStatusMap[p.status]?.variant || "outline"}>
                        {paymentStatusMap[p.status]?.label || p.status}
                      </Badge>
                    </TableCell>
                  </TableRow>
                )) : (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                      Bado hakuna malipo yaliyofanywa
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

export default TenantPayments;
