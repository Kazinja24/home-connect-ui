import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/i18n/LanguageContext";

const mockProperties = [
  { id: "1", title: "Studio ya Kisasa Masaki", landlord: "James Mwanga", status: "active", flagged: false },
  { id: "2", title: "Nyumba 2BR Mikocheni", landlord: "James Mwanga", status: "active", flagged: true },
  { id: "3", title: "Suspicious Listing", landlord: "Unknown", status: "disabled", flagged: true },
];

const AdminProperties = () => {
  const { t } = useLanguage();
  const { toast } = useToast();

  return (
    <div className="space-y-6 animate-slide-up">
      <h1 className="text-2xl font-bold text-foreground">{t("admin.propertyManagement")}</h1>
      <Card className="glass-strong border-border/30">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t("common.property")}</TableHead>
                <TableHead>{t("admin.owner")}</TableHead>
                <TableHead>{t("common.status")}</TableHead>
                <TableHead className="text-right">{t("common.actions")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mockProperties.map((p) => (
                <TableRow key={p.id} className="hover:bg-muted/50 transition-colors">
                  <TableCell className="font-medium">{p.title}{p.flagged && <Badge variant="destructive" className="ml-2 text-[10px]">{t("admin.flagged")}</Badge>}</TableCell>
                  <TableCell>{p.landlord}</TableCell>
                  <TableCell><Badge variant={p.status === "active" ? "secondary" : "destructive"}>{t(`status.${p.status}`) || p.status}</Badge></TableCell>
                  <TableCell className="text-right space-x-1">
                    {!p.flagged && <Button size="sm" variant="ghost" onClick={() => toast({ title: t("admin.reported") })}>{t("admin.report")}</Button>}
                    {p.status === "active" && <Button size="sm" variant="ghost" className="text-destructive" onClick={() => toast({ title: t("admin.disabled") })}>{t("admin.disable")}</Button>}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminProperties;
