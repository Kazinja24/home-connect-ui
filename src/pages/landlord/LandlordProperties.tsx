import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const mockProperties = [
  { id: "1", title: "Studio ya Kisasa Masaki", price: 800000, location: "Masaki", bedrooms: 1 },
  { id: "2", title: "Nyumba 2BR Mikocheni", price: 1200000, location: "Mikocheni", bedrooms: 2 },
];

const LandlordProperties = () => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const { toast } = useToast();

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    toast({ title: "Nyumba imehifadhiwa!" });
    setDialogOpen(false);
  };

  return (
    <div className="space-y-6 animate-slide-up">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-foreground">Nyumba Zangu</h1>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button className="shadow-md"><Plus className="h-4 w-4 mr-2" />Ongeza Nyumba</Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto">
            <DialogHeader><DialogTitle>Ongeza Nyumba</DialogTitle></DialogHeader>
            <form onSubmit={handleSave} className="space-y-4">
              <div className="space-y-2"><Label>Kichwa</Label><Input placeholder="Jina la nyumba" /></div>
              <div className="space-y-2"><Label>Maelezo</Label><Textarea placeholder="Eleza nyumba…" /></div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2"><Label>Bei (TZS/mwezi)</Label><Input type="number" placeholder="800000" /></div>
                <div className="space-y-2"><Label>Vyumba vya Kulala</Label><Input type="number" placeholder="2" /></div>
              </div>
              <div className="space-y-2"><Label>Eneo</Label><Input placeholder="Eneo, Jiji" /></div>
              <div className="space-y-2"><Label>Vifaa (tenganisha kwa koma)</Label><Input placeholder="WiFi, Parking, Ulinzi" /></div>
              <div className="space-y-2"><Label>Sheria za Nyumba (tenganisha kwa koma)</Label><Input placeholder="Hakuna wanyama, Hakuna kuvuta" /></div>
              <div className="space-y-2"><Label>Picha</Label><Input type="file" multiple accept="image/*" /></div>
              <Button type="submit" className="w-full font-semibold">Hifadhi Nyumba</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card className="glass-strong border-border/30">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Kichwa</TableHead>
                <TableHead>Eneo</TableHead>
                <TableHead>Bei</TableHead>
                <TableHead>Vyumba</TableHead>
                <TableHead className="text-right">Vitendo</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mockProperties.map((p) => (
                <TableRow key={p.id} className="hover:bg-muted/50 transition-colors">
                  <TableCell className="font-medium">{p.title}</TableCell>
                  <TableCell>{p.location}</TableCell>
                  <TableCell>TZS {p.price.toLocaleString()}</TableCell>
                  <TableCell>{p.bedrooms}</TableCell>
                  <TableCell className="text-right space-x-1">
                    <Button variant="ghost" size="icon"><Pencil className="h-4 w-4" /></Button>
                    <Button variant="ghost" size="icon" className="text-destructive"><Trash2 className="h-4 w-4" /></Button>
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

export default LandlordProperties;
