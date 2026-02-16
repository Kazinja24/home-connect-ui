import { useQuery } from "@tanstack/react-query";
import { StatusBadge } from "@/components/StatusBadge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { applications as appApi } from "@/lib/api";
import { useLanguage } from "@/i18n/LanguageContext";
import { Link } from "react-router-dom";
import type { RequestStatus } from "@/types";
import { ClipboardList, Eye } from "lucide-react";

const TenantApplications = () => {
  const { t } = useLanguage();

  const { data, isLoading } = useQuery({
    queryKey: ["tenant-applications"],
    queryFn: appApi.list,
  });

  return (
    <div className="space-y-6 animate-slide-up">
      <div className="flex items-center gap-3">
        <ClipboardList className="h-6 w-6 text-primary" />
        <h1 className="text-2xl font-bold text-foreground">{t("tenant.myApplications")}</h1>
      </div>

      <Card className="glass-strong border-border/30">
        <CardHeader><CardTitle className="text-lg">{t("tenant.myApplications")}</CardTitle></CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">{[1, 2, 3].map(i => <Skeleton key={i} className="h-12 w-full" />)}</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t("common.property")}</TableHead>
                  <TableHead>{t("propertyDetails.employment")}</TableHead>
                  <TableHead>{t("propertyDetails.lengthOfStay")}</TableHead>
                  <TableHead>{t("propertyDetails.occupants")}</TableHead>
                  <TableHead>{t("common.status")}</TableHead>
                  <TableHead className="text-right">{t("common.actions")}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data && data.length > 0 ? data.map((a: any) => (
                  <TableRow key={a.id} className="hover:bg-muted/50 transition-colors">
                    <TableCell className="font-medium">{a.property_title || `${t("common.property")} #${a.property || a.propertyId}`}</TableCell>
                    <TableCell>{a.employment_status || a.employmentStatus || "—"}</TableCell>
                    <TableCell>{a.length_of_stay || a.lengthOfStay || "—"}</TableCell>
                    <TableCell>{a.occupants || "—"}</TableCell>
                    <TableCell><StatusBadge status={a.status as RequestStatus} /></TableCell>
                    <TableCell className="text-right">
                      {a.status === "approved" && (
                        <Button size="sm" variant="outline" asChild>
                          <Link to={`/properties/${a.property || a.propertyId}`}>
                            <Eye className="h-3.5 w-3.5 mr-1" />{t("propertyDetails.requestViewing")}
                          </Link>
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                )) : (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-muted-foreground py-8">{t("tenant.noApplications")}</TableCell>
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

export default TenantApplications;
