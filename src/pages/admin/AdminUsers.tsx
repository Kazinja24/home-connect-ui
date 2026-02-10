import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Search } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const mockUsers = [
  { id: "1", name: "Alice Mbeki", email: "alice@example.com", role: "mpangaji", status: "hai" },
  { id: "2", name: "James Mwanga", email: "james@example.com", role: "mmiliki", status: "hai" },
  { id: "3", name: "Bob Kamara", email: "bob@example.com", role: "mpangaji", status: "amesimamishwa" },
];

const AdminUsers = () => {
  const [search, setSearch] = useState("");
  const [suspendDialog, setSuspendDialog] = useState<string | null>(null);
  const [reason, setReason] = useState("");
  const { toast } = useToast();

  const filtered = mockUsers.filter((u) =>
    u.name.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase())
  );

  const handleSuspend = () => {
    toast({ title: "Mtumiaji amesimamishwa" });
    setSuspendDialog(null);
    setReason("");
  };

  return (
    <div className="space-y-6 animate-slide-up">
      <h1 className="text-2xl font-bold text-foreground">Usimamizi wa Watumiaji</h1>
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input placeholder="Tafuta watumiaji…" className="pl-10" value={search} onChange={(e) => setSearch(e.target.value)} />
      </div>
      <Card className="glass-strong border-border/30">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Jina</TableHead>
                <TableHead>Barua pepe</TableHead>
                <TableHead>Jukumu</TableHead>
                <TableHead>Hali</TableHead>
                <TableHead className="text-right">Vitendo</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((u) => (
                <TableRow key={u.id} className="hover:bg-muted/50 transition-colors">
                  <TableCell className="font-medium">{u.name}</TableCell>
                  <TableCell>{u.email}</TableCell>
                  <TableCell className="capitalize">{u.role}</TableCell>
                  <TableCell>
                    <Badge variant={u.status === "hai" ? "secondary" : "destructive"}>{u.status}</Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    {u.status === "hai" && (
                      <Button size="sm" variant="ghost" className="text-destructive" onClick={() => setSuspendDialog(u.id)}>
                        Simamisha
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={!!suspendDialog} onOpenChange={() => setSuspendDialog(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Simamisha Mtumiaji</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Sababu ya kusimamishwa</Label>
              <Textarea placeholder="Andika sababu…" value={reason} onChange={(e) => setReason(e.target.value)} />
            </div>
            <Button className="w-full" variant="destructive" onClick={handleSuspend}>Thibitisha Kusimamisha</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminUsers;
