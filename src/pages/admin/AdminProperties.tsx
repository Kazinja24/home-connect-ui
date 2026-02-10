import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";

const mockProperties = [
  { id: "1", title: "Studio ya Kisasa Masaki", landlord: "James Mwanga", status: "hai", flagged: false },
  { id: "2", title: "Nyumba 2BR Mikocheni", landlord: "James Mwanga", status: "hai", flagged: true },
  { id: "3", title: "Orodha ya Shaka", landlord: "Haijulikani", status: "imezimwa", flagged: true },
];

const AdminProperties = () => {
  const { toast } = useToast();

  return (
    <div className="space-y-6 animate-slide-up">
      <h1 className="text-2xl font-bold text-foreground">Usimamizi wa Nyumba</h1>
      <Card className="glass-strong border-border/30">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nyumba</TableHead>
                <TableHead>Mmiliki</TableHead>
                <TableHead>Hali</TableHead>
                <TableHead className="text-right">Vitendo</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mockProperties.map((p) => (
                <TableRow key={p.id} className="hover:bg-muted/50 transition-colors">
                  <TableCell className="font-medium">
                    {p.title}
                    {p.flagged && <Badge variant="destructive" className="ml-2 text-[10px]">Imeripotiwa</Badge>}
                  </TableCell>
                  <TableCell>{p.landlord}</TableCell>
                  <TableCell>
                    <Badge variant={p.status === "hai" ? "secondary" : "destructive"}>{p.status}</Badge>
                  </TableCell>
                  <TableCell className="text-right space-x-1">
                    {!p.flagged && (
                      <Button size="sm" variant="ghost" onClick={() => toast({ title: "Orodha imeripotiwa" })}>Ripoti</Button>
                    )}
                    {p.status === "hai" && (
                      <Button size="sm" variant="ghost" className="text-destructive" onClick={() => toast({ title: "Orodha imezimwa" })}>Zima</Button>
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
