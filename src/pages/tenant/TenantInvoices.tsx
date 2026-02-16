import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Receipt } from "lucide-react";
import { invoices as invoicesApi } from "@/lib/api";
import { useLanguage } from "@/i18n/LanguageContext";
import { useToast } from "@/hooks/use-toast";

const TenantInvoices = () => {
  const { t } = useLanguage();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["tenant-invoices"],
    queryFn: invoicesApi.list,
  });

  const payMutation = useMutation({
    mutationFn: (id: string) => invoicesApi.pay(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tenant-invoices"] });
      queryClient.invalidateQueries({ queryKey: ["tenant-payments"] });
      toast({ title: t("status.paid") });
    },
    onError: (err: any) => toast({ title: err.message, variant: "destructive" }),
  });

  const statusVariant = (status: string) => {
    if (status === "paid") return "default" as const;
    if (status === "overdue") return "destructive" as const;
    return "secondary" as const;
  };

  return (
    <div className="space-y-6 animate-slide-up">
      <div className="flex items-center gap-3">
        <Receipt className="h-6 w-6 text-primary" />
        <h1 className="text-2xl font-bold text-foreground">{t("tenant.myInvoices")}</h1>
      </div>

      <Card className="glass-strong border-border/30">
        <CardHeader><CardTitle className="text-lg">{t("tenant.invoiceList")}</CardTitle></CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">{[1, 2, 3].map(i => <Skeleton key={i} className="h-12 w-full" />)}</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t("common.property")}</TableHead>
                  <TableHead>{t("common.amount")}</TableHead>
                  <TableHead>{t("tenant.dueDate")}</TableHead>
                  <TableHead>{t("landlord.invoiceDescription")}</TableHead>
                  <TableHead>{t("common.status")}</TableHead>
                  <TableHead className="text-right">{t("common.actions")}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data && data.length > 0 ? data.map((inv: any) => (
                  <TableRow key={inv.id} className="hover:bg-muted/50 transition-colors">
                    <TableCell className="font-medium">{inv.property_title || `${t("common.property")} #${inv.property || inv.lease}`}</TableCell>
                    <TableCell>TZS {Number(inv.amount).toLocaleString()}</TableCell>
                    <TableCell>{inv.due_date ? new Date(inv.due_date).toLocaleDateString() : "—"}</TableCell>
                    <TableCell className="text-muted-foreground">{inv.description || "—"}</TableCell>
                    <TableCell>
                      <Badge variant={statusVariant(inv.status)}>{t(`status.${inv.status}`) || inv.status}</Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      {inv.status !== "paid" && (
                        <Button size="sm" disabled={payMutation.isPending} onClick={() => payMutation.mutate(inv.id)}>
                          {t("tenant.payInvoice")}
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                )) : (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-muted-foreground py-8">{t("tenant.noInvoices")}</TableCell>
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

export default TenantInvoices;
