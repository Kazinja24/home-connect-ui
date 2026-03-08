import { useQuery } from "@tanstack/react-query";
import { payments } from "@/lib/api";
import { PaymentRow } from "@/components/PaymentRow";
import { Skeleton } from "@/components/ui/skeleton";
import { CreditCard } from "lucide-react";
import { useLanguage } from "@/i18n/LanguageContext";

const TenantPayments = () => {
  const { t } = useLanguage();
  const { data: paymentHistory, isLoading } = useQuery({
    queryKey: ["tenant-payments"],
    queryFn: payments.list,
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <CreditCard className="h-6 w-6 text-primary" strokeWidth={1.5} />
        <h1 className="text-2xl font-bold text-foreground">{t("tenant.myPayments")}</h1>
      </div>

      <div className="bg-card border border-border rounded-lg">
        <div className="p-4 border-b border-border">
          <h2 className="font-semibold text-foreground">{t("tenant.paymentHistory")}</h2>
        </div>
        <div className="p-4">
          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => <Skeleton key={i} className="h-16 w-full" />)}
            </div>
          ) : paymentHistory && paymentHistory.length > 0 ? (
            paymentHistory.map((p: any) => (
              <PaymentRow 
                key={p.id}
                date={p.created_at ? new Date(p.created_at).toLocaleDateString("sw-TZ") : "-"}
                amount={Number(p.amount)}
                method={p.method || "MOBILE"}
                status={p.status || "pending"}
                reference={p.reference}
              />
            ))
          ) : (
            <p className="py-8 text-center text-muted-foreground">{t("tenant.noPayments")}</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default TenantPayments;
