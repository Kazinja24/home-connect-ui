import { useQuery } from "@tanstack/react-query";
import { payments } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { CreditCard } from "lucide-react";
import { useLanguage } from "@/i18n/LanguageContext";

const TenantPayments = () => {
  const { t } = useLanguage();

  const { data, isLoading } = useQuery({
    queryKey: ["tenant-payments"],
    queryFn: payments.list,
  });

  const statusVariant = (status: string) => {
    if (status === "completed") return "default" as const;
    if (status === "failed") return "destructive" as const;
    return "secondary" as const;
  };

  return (
    <div className="space-y-6 animate-slide-up">
      <div className="flex items-center gap-3">
        <CreditCard className="h-6 w-6 text-primary" />
        <h1 className="text-2xl font-bold text-foreground">{t("tenant.myPayments")}</h1>
      </div>

      <Card className="glass-strong border-border/30">
        <CardHeader><CardTitle className="text-lg">{t("tenant.paymentHistory")}</CardTitle></CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">{[1, 2, 3].map(i => <Skeleton key={i} className="h-12 w-full" />)}</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t("common.property")}</TableHead>
                  <TableHead>{t("common.amount")}</TableHead>
                  <TableHead>{t("common.reference")}</TableHead>
                  <TableHead>{t("common.date")}</TableHead>
                  <TableHead>{t("common.status")}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data && data.length > 0 ? data.map((p: any) => (
                  <TableRow key={p.id} className="hover:bg-muted/50 transition-colors">
                    <TableCell className="font-medium">{p.property_title || `${t("common.property")} #${p.property || p.propertyId}`}</TableCell>
                    <TableCell>TZS {Number(p.amount).toLocaleString()}</TableCell>
                    <TableCell className="text-muted-foreground">{p.reference || "—"}</TableCell>
                    <TableCell>{p.created_at ? new Date(p.created_at).toLocaleDateString() : "—"}</TableCell>
                    <TableCell>
                      <Badge variant={statusVariant(p.status)}>{t(`status.${p.status}`) || p.status}</Badge>
                    </TableCell>
                  </TableRow>
                )) : (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center text-muted-foreground py-8">{t("tenant.noPayments")}</TableCell>
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
