import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { StatusBadge } from "@/components/StatusBadge";
import { useToast } from "@/hooks/use-toast";

const mockViewings = [
  { id: "v1", tenantName: "Alice Mbeki", property: "Studio ya Kisasa Masaki", date: "2026-02-15", time: "Asubuhi", status: "pending" as const },
  { id: "v2", tenantName: "Bob Kamara", property: "Nyumba 2BR Mikocheni", date: "2026-02-18", time: "Mchana", status: "pending" as const },
];

const LandlordViewings = () => {
  const { toast } = useToast();

  const handleAction = (id: string, action: "approved" | "rejected") => {
    toast({ title: `Ombi la kuona ${action === "approved" ? "limekubaliwa" : "limekataliwa"}` });
  };

  return (
    <div className="space-y-6 animate-slide-up">
      <h1 className="text-2xl font-bold text-foreground">Maombi ya Kuona</h1>
      <Card className="glass-strong border-border/30">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Mpangaji</TableHead>
                <TableHead>Nyumba</TableHead>
                <TableHead>Tarehe</TableHead>
                <TableHead>Muda</TableHead>
                <TableHead>Hali</TableHead>
                <TableHead className="text-right">Vitendo</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mockViewings.map((v) => (
                <TableRow key={v.id} className="hover:bg-muted/50 transition-colors">
                  <TableCell className="font-medium">{v.tenantName}</TableCell>
                  <TableCell>{v.property}</TableCell>
                  <TableCell>{v.date}</TableCell>
                  <TableCell>{v.time}</TableCell>
                  <TableCell><StatusBadge status={v.status} /></TableCell>
                  <TableCell className="text-right space-x-1">
                    <Button size="sm" variant="outline" onClick={() => handleAction(v.id, "approved")}>Kubali</Button>
                    <Button size="sm" variant="ghost" className="text-destructive" onClick={() => handleAction(v.id, "rejected")}>Kataa</Button>
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

export default LandlordViewings;
