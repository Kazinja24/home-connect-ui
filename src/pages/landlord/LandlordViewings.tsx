import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { StatusBadge } from "@/components/StatusBadge";
import { Skeleton } from "@/components/ui/skeleton";
import { viewings as viewingsApi } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/i18n/LanguageContext";
import type { RequestStatus } from "@/types";

const LandlordViewings = () => {
  const { t } = useLanguage();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["landlord-viewings"],
    queryFn: viewingsApi.list,
  });

  const mutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) => viewingsApi.updateStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["landlord-viewings"] });
      toast({ title: t("landlord.statusUpdated") });
    },
    onError: (err: any) => toast({ title: err.message || t("landlord.updateFailed"), variant: "destructive" }),
  });

  return (
    <div className="space-y-6 animate-slide-up">
      <h1 className="text-2xl font-bold text-foreground">{t("landlord.viewingRequests")}</h1>
      <Card className="glass-strong border-border/30">
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-6 space-y-3">{[1, 2, 3].map(i => <Skeleton key={i} className="h-12 w-full" />)}</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t("common.tenant")}</TableHead>
                  <TableHead>{t("common.property")}</TableHead>
                  <TableHead>{t("common.date")}</TableHead>
                  <TableHead>{t("common.time")}</TableHead>
                  <TableHead>{t("common.status")}</TableHead>
                  <TableHead className="text-right">{t("common.actions")}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data && data.length > 0 ? data.map((v: any) => (
                  <TableRow key={v.id} className="hover:bg-muted/50 transition-colors">
                    <TableCell className="font-medium">{v.tenant_name || `${t("common.tenant")} #${v.tenant || v.tenantId}`}</TableCell>
                    <TableCell>{v.property_title || `${t("common.property")} #${v.property || v.propertyId}`}</TableCell>
                    <TableCell>{v.date}</TableCell>
                    <TableCell>{v.time_window === "morning" ? t("tenant.morning") : v.time_window === "afternoon" ? t("tenant.afternoon") : t("tenant.evening")}</TableCell>
                    <TableCell><StatusBadge status={v.status as RequestStatus} /></TableCell>
                    <TableCell className="text-right space-x-1">
                      {v.status === "pending" && (
                        <>
                          <Button size="sm" variant="outline" disabled={mutation.isPending} onClick={() => mutation.mutate({ id: v.id, status: "approved" })}>{t("common.approve")}</Button>
                          <Button size="sm" variant="ghost" className="text-destructive" disabled={mutation.isPending} onClick={() => mutation.mutate({ id: v.id, status: "rejected" })}>{t("common.reject")}</Button>
                        </>
                      )}
                    </TableCell>
                  </TableRow>
                )) : (
                  <TableRow><TableCell colSpan={6} className="text-center text-muted-foreground py-8">{t("landlord.noViewingRequests")}</TableCell></TableRow>
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
