import { useLanguage } from "@/i18n/LanguageContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Users } from "lucide-react";

// Mock active tenants for landlord dashboard
const mockActiveTenants = [
  {
    id: "t1",
    name: "Amina Juma",
    email: "tenant@demo.com",
    phone: "+255 712 345 678",
    property: "Studio ya Kisasa Masaki",
    leaseStart: "2026-02-01",
    leaseEnd: "2027-01-31",
    rentStatus: "paid",
    lastPayment: "2026-02-28",
    status: "active",
  },
  {
    id: "t2",
    name: "John Kimaro",
    email: "john@demo.com",
    phone: "+255 715 678 901",
    property: "Nyumba 2BR Mikocheni",
    leaseStart: "2025-06-01",
    leaseEnd: "2026-05-31",
    rentStatus: "overdue",
    lastPayment: "2026-01-15",
    status: "active",
  },
  {
    id: "t3",
    name: "Fatma Said",
    email: "fatma@demo.com",
    phone: "+255 718 234 567",
    property: "Nyumba ya Familia Mbezi",
    leaseStart: "2025-09-01",
    leaseEnd: "2026-08-31",
    rentStatus: "paid",
    lastPayment: "2026-03-01",
    status: "active",
  },
];

const rentStatusStyles: Record<string, string> = {
  paid: "bg-success/15 text-success border-success/30",
  overdue: "bg-destructive/15 text-destructive border-destructive/30",
  pending: "bg-warning/15 text-warning border-warning/30",
};

export function ActiveTenantsList() {
  const { t } = useLanguage();

  return (
    <Card className="glass-strong border-border/30">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Users className="h-5 w-5 text-primary" />
          {t("landlord.activeTenants")}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t("landlord.tenantName")}</TableHead>
              <TableHead>{t("common.property")}</TableHead>
              <TableHead>{t("landlord.leaseperiod")}</TableHead>
              <TableHead>{t("landlord.rentStatus")}</TableHead>
              <TableHead>{t("landlord.lastPayment")}</TableHead>
              <TableHead>{t("common.status")}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {mockActiveTenants.map((tenant) => (
              <TableRow key={tenant.id}>
                <TableCell>
                  <div>
                    <p className="font-medium text-foreground">{tenant.name}</p>
                    <p className="text-xs text-muted-foreground">{tenant.email}</p>
                    <p className="text-xs text-muted-foreground">{tenant.phone}</p>
                  </div>
                </TableCell>
                <TableCell className="text-sm">{tenant.property}</TableCell>
                <TableCell>
                  <div className="text-xs">
                    <p>{new Date(tenant.leaseStart).toLocaleDateString()}</p>
                    <p className="text-muted-foreground">→ {new Date(tenant.leaseEnd).toLocaleDateString()}</p>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant="outline" className={rentStatusStyles[tenant.rentStatus] ?? ""}>
                    {t(`status.${tenant.rentStatus}`)}
                  </Badge>
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {new Date(tenant.lastPayment).toLocaleDateString()}
                </TableCell>
                <TableCell>
                  <Badge variant="outline" className="bg-success/15 text-success border-success/30">
                    {t("status.active")}
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
