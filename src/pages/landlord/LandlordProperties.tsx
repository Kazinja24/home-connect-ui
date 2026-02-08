import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const mockProperties = [
  { id: "1", title: "Modern Studio in Masaki", price: 800000, location: "Masaki", bedrooms: 1 },
  { id: "2", title: "Spacious 2BR in Mikocheni", price: 1200000, location: "Mikocheni", bedrooms: 2 },
];

const LandlordProperties = () => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const { toast } = useToast();

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    // API placeholder
    toast({ title: "Property saved!" });
    setDialogOpen(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-foreground">My Properties</h1>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button><Plus className="h-4 w-4 mr-2" />Add Property</Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto">
            <DialogHeader><DialogTitle>Add Property</DialogTitle></DialogHeader>
            <form onSubmit={handleSave} className="space-y-4">
              <div className="space-y-2"><Label>Title</Label><Input placeholder="Property title" /></div>
              <div className="space-y-2"><Label>Description</Label><Textarea placeholder="Describe the property…" /></div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2"><Label>Price (TZS/mo)</Label><Input type="number" placeholder="800000" /></div>
                <div className="space-y-2"><Label>Bedrooms</Label><Input type="number" placeholder="2" /></div>
              </div>
              <div className="space-y-2"><Label>Location</Label><Input placeholder="Area, City" /></div>
              <div className="space-y-2"><Label>Amenities (comma separated)</Label><Input placeholder="WiFi, Parking, Security" /></div>
              <div className="space-y-2"><Label>House Rules (comma separated)</Label><Input placeholder="No pets, No smoking" /></div>
              <div className="space-y-2"><Label>Images</Label><Input type="file" multiple accept="image/*" /></div>
              <Button type="submit" className="w-full">Save Property</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Beds</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mockProperties.map((p) => (
                <TableRow key={p.id}>
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
