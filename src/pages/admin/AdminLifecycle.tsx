import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { audit as auditApi } from "@/lib/api";
import { useLanguage } from "@/i18n/LanguageContext";

const AdminLifecycle = () => {
  const { t } = useLanguage();
  const [filters, setFilters] = useState({
    action_prefix: "",
    entity_type: "",
    entity_id: "",
    created_from: "",
    created_to: "",
  });

  const { data, isLoading, refetch, isFetching } = useQuery({
    queryKey: ["admin-lifecycle-audit", filters],
    queryFn: () => auditApi.lifecycle(filters),
  });

  const rawData = data as any;
  const rows: any[] = Array.isArray(rawData) ? rawData : (rawData?.results || []);

  return (
    <div className="space-y-6 animate-slide-up">
      <h1 className="text-2xl font-bold text-foreground">{t("admin.lifecycleTitle")}</h1>
      <Card className="glass-strong border-border/30">
        <CardHeader>
          <CardTitle className="text-lg">{t("admin.filters")}</CardTitle>
        </CardHeader>
        <CardContent className="grid md:grid-cols-5 gap-3">
          <div className="space-y-1">
            <Label>{t("admin.actionPrefix")}</Label>
            <Input value={filters.action_prefix} onChange={(e) => setFilters((f) => ({ ...f, action_prefix: e.target.value }))} />
          </div>
          <div className="space-y-1">
            <Label>{t("admin.entityType")}</Label>
            <Input value={filters.entity_type} onChange={(e) => setFilters((f) => ({ ...f, entity_type: e.target.value }))} />
          </div>
          <div className="space-y-1">
            <Label>{t("admin.entityId")}</Label>
            <Input value={filters.entity_id} onChange={(e) => setFilters((f) => ({ ...f, entity_id: e.target.value }))} />
          </div>
          <div className="space-y-1">
            <Label>{t("admin.createdFrom")}</Label>
            <Input type="date" value={filters.created_from} onChange={(e) => setFilters((f) => ({ ...f, created_from: e.target.value }))} />
          </div>
          <div className="space-y-1">
            <Label>{t("admin.createdTo")}</Label>
            <Input type="date" value={filters.created_to} onChange={(e) => setFilters((f) => ({ ...f, created_to: e.target.value }))} />
          </div>
          <div className="md:col-span-5">
            <Button onClick={() => refetch()} disabled={isFetching}>
              {isFetching ? t("admin.refreshing") : t("admin.applyFilters")}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card className="glass-strong border-border/30">
        <CardHeader>
          <CardTitle className="text-lg">{t("admin.events")}</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">{[1, 2, 3].map((i) => <Skeleton key={i} className="h-12 w-full" />)}</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t("admin.created")}</TableHead>
                  <TableHead>{t("admin.action")}</TableHead>
                  <TableHead>{t("admin.actor")}</TableHead>
                  <TableHead>{t("admin.target")}</TableHead>
                  <TableHead>{t("admin.objectId")}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.length > 0 ? (
                  rows.map((log: any) => (
                    <TableRow key={log.id}>
                      <TableCell>{log.created_at ? new Date(log.created_at).toLocaleString() : "-"}</TableCell>
                      <TableCell>{log.action}</TableCell>
                      <TableCell>{log.actor_email || "-"}</TableCell>
                      <TableCell>{log.target_type || "-"}</TableCell>
                      <TableCell>{log.target_object_id || "-"}</TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                      {t("admin.noEvents")}
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

export default AdminLifecycle;
