import { useQuery } from "@tanstack/react-query";
import { StatusBadge } from "@/components/StatusBadge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { viewings as viewingsApi } from "@/lib/api";
import { useLanguage } from "@/i18n/LanguageContext";
import type { RequestStatus } from "@/types";
import { Eye } from "lucide-react";

const TenantViewings = () => {
  const { t } = useLanguage();

  const { data, isLoading } = useQuery({
    queryKey: ["tenant-viewings"],
    queryFn: viewingsApi.list,
  });

  return (
    <div className="space-y-6 animate-slide-up">
      <div className="flex items-center gap-3">
        <Eye className="h-6 w-6 text-primary" />
        <h1 className="text-2xl font-bold text-foreground">{t("tenant.viewingRequests")}</h1>
      </div>

      <Card className="glass-strong border-border/30">
        <CardHeader><CardTitle className="text-lg">{t("tenant.viewingRequests")}</CardTitle></CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">{[1, 2, 3].map(i => <Skeleton key={i} className="h-12 w-full" />)}</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t("common.property")}</TableHead>
                  <TableHead>{t("common.date")}</TableHead>
                  <TableHead>{t("common.time")}</TableHead>
                  <TableHead>{t("common.status")}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data && data.length > 0 ? data.map((v: any) => (
                  <TableRow key={v.id} className="hover:bg-muted/50 transition-colors">
                    <TableCell className="font-medium">{v.property_title || `${t("common.property")} #${v.property || v.propertyId}`}</TableCell>
                    <TableCell>{v.date}</TableCell>
                    <TableCell className="capitalize">{v.time_window === "morning" ? t("tenant.morning") : v.time_window === "afternoon" ? t("tenant.afternoon") : t("tenant.evening")}</TableCell>
                    <TableCell><StatusBadge status={v.status as RequestStatus} /></TableCell>
                  </TableRow>
                )) : (
                  <TableRow><TableCell colSpan={4} className="text-center text-muted-foreground py-8">{t("tenant.noViewings")}</TableCell></TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default TenantViewings;
