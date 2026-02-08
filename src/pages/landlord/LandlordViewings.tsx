import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { StatusBadge } from "@/components/StatusBadge";
import { useToast } from "@/hooks/use-toast";

const mockViewings = [
  { id: "v1", tenantName: "Alice Mbeki", property: "Modern Studio in Masaki", date: "2026-02-15", time: "Morning", status: "pending" as const },
  { id: "v2", tenantName: "Bob Kamara", property: "Spacious 2BR in Mikocheni", date: "2026-02-18", time: "Afternoon", status: "pending" as const },
];

const LandlordViewings = () => {
  const { toast } = useToast();

  const handleAction = (id: string, action: "approved" | "rejected") => {
    // API placeholder
    toast({ title: `Viewing ${action}` });
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-foreground">Viewing Requests</h1>
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Tenant</TableHead>
                <TableHead>Property</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Time</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mockViewings.map((v) => (
                <TableRow key={v.id}>
                  <TableCell className="font-medium">{v.tenantName}</TableCell>
                  <TableCell>{v.property}</TableCell>
                  <TableCell>{v.date}</TableCell>
                  <TableCell>{v.time}</TableCell>
                  <TableCell><StatusBadge status={v.status} /></TableCell>
                  <TableCell className="text-right space-x-1">
                    <Button size="sm" variant="outline" onClick={() => handleAction(v.id, "approved")}>Approve</Button>
                    <Button size="sm" variant="ghost" className="text-destructive" onClick={() => handleAction(v.id, "rejected")}>Reject</Button>
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
