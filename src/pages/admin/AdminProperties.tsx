import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";

const mockProperties = [
  { id: "1", title: "Modern Studio in Masaki", landlord: "James Mwanga", status: "active", flagged: false },
  { id: "2", title: "Spacious 2BR in Mikocheni", landlord: "James Mwanga", status: "active", flagged: true },
  { id: "3", title: "Suspicious Listing", landlord: "Unknown", status: "disabled", flagged: true },
];

const AdminProperties = () => {
  const { toast } = useToast();

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-foreground">Property Oversight</h1>
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Property</TableHead>
                <TableHead>Landlord</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mockProperties.map((p) => (
                <TableRow key={p.id}>
                  <TableCell className="font-medium">
                    {p.title}
                    {p.flagged && <Badge variant="destructive" className="ml-2 text-[10px]">Flagged</Badge>}
                  </TableCell>
                  <TableCell>{p.landlord}</TableCell>
                  <TableCell>
                    <Badge variant={p.status === "active" ? "secondary" : "destructive"}>{p.status}</Badge>
                  </TableCell>
                  <TableCell className="text-right space-x-1">
                    {!p.flagged && (
                      <Button size="sm" variant="ghost" onClick={() => toast({ title: "Listing flagged" })}>Flag</Button>
                    )}
                    {p.status === "active" && (
                      <Button size="sm" variant="ghost" className="text-destructive" onClick={() => toast({ title: "Listing disabled" })}>Disable</Button>
                    )}
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
