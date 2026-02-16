import { useQuery } from "@tanstack/react-query";
import { StatusBadge } from "@/components/StatusBadge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { leases as leasesApi } from "@/lib/api";
import { useLanguage } from "@/i18n/LanguageContext";
import { useToast } from "@/hooks/use-toast";
import { FileText } from "lucide-react";

const TenantLeases = () => {
  const { t } = useLanguage();
  const { toast } = useToast();

  const { data, isLoading, refetch } = useQuery({
    queryKey: ["tenant-leases"],
    queryFn: leasesApi.list,
  });

  const handleSign = async (id: string) => {
    try {
      await leasesApi.sign(id);
      toast({ title: t("tenant.leaseSigned") });
      refetch();
    } catch (err: any) {
      toast({ title: err.message || t("tenant.signFailed"), variant: "destructive" });
    }
  };

  return (
    <div className="space-y-6 animate-slide-up">
      <div className="flex items-center gap-3">
        <FileText className="h-6 w-6 text-primary" />
        <h1 className="text-2xl font-bold text-foreground">{t("tenant.leasesTitle")}</h1>
      </div>

      <Card className="glass-strong border-border/30">
        <CardHeader><CardTitle className="text-lg">{t("tenant.leasesTitle")}</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          {isLoading ? (
            <div className="space-y-3">{[1, 2].map(i => <Skeleton key={i} className="h-20 w-full" />)}</div>
          ) : data && data.length > 0 ? data.map((l: any) => (
            <div key={l.id} className="border rounded-xl p-5 space-y-3 hover:bg-muted/30 transition-colors">
              <div className="flex items-center justify-between">
                <p className="font-semibold text-foreground">{l.property_title || `${t("common.property")} #${l.property || l.propertyId}`}</p>
                <StatusBadge status={l.status === "signed" || l.status === "active" ? "approved" : "pending"} />
              </div>
              <div className="text-sm text-muted-foreground">
                <p><strong>{t("common.status")}:</strong> {l.status}</p>
                {l.signed_at && <p><strong>{t("tenant.leaseSigned")}:</strong> {new Date(l.signed_at).toLocaleDateString()}</p>}
              </div>
              {l.status !== "signed" && l.status !== "active" && (
                <Button size="sm" className="font-semibold shadow-sm" onClick={() => handleSign(l.id)}>
                  {t("tenant.signLease")}
                </Button>
              )}
            </div>
          )) : (
            <p className="text-muted-foreground text-sm py-8 text-center">{t("tenant.noLeases")}</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default TenantLeases;
