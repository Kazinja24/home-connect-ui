import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { properties as propertiesApi } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

const LandlordProperties = () => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState({ title: "", description: "", price: "", bedrooms: "", location: "", amenities: "", houseRules: "" });
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["landlord-properties"],
    queryFn: () => propertiesApi.list(),
  });

  const createMutation = useMutation({
    mutationFn: (data: any) => propertiesApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["landlord-properties"] });
      toast({ title: "Nyumba imeongezwa!" });
      resetForm();
    },
    onError: (err: any) => toast({ title: err.message, variant: "destructive" }),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => propertiesApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["landlord-properties"] });
      toast({ title: "Nyumba imesasishwa!" });
      resetForm();
    },
    onError: (err: any) => toast({ title: err.message, variant: "destructive" }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => propertiesApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["landlord-properties"] });
      toast({ title: "Nyumba imefutwa!" });
    },
    onError: (err: any) => toast({ title: err.message, variant: "destructive" }),
  });

  const resetForm = () => {
    setForm({ title: "", description: "", price: "", bedrooms: "", location: "", amenities: "", houseRules: "" });
    setEditId(null);
    setDialogOpen(false);
  };

  const openEdit = (p: any) => {
    setEditId(String(p.id));
    setForm({
      title: p.title || "",
      description: p.description || "",
      price: String(p.price || ""),
      bedrooms: String(p.bedrooms || ""),
      location: p.location || "",
      amenities: (p.amenities || []).join(", "),
      houseRules: (p.house_rules || p.houseRules || []).join(", "),
    });
    setDialogOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      title: form.title,
      description: form.description,
      price: Number(form.price),
      bedrooms: Number(form.bedrooms),
      location: form.location,
      amenities: form.amenities.split(",").map(s => s.trim()).filter(Boolean),
      house_rules: form.houseRules.split(",").map(s => s.trim()).filter(Boolean),
    };
    if (editId) {
      updateMutation.mutate({ id: editId, data: payload });
    } else {
      createMutation.mutate(payload);
    }
  };

  const isSaving = createMutation.isPending || updateMutation.isPending;

  return (
    <div className="space-y-6 animate-slide-up">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-foreground">Nyumba Zangu</h1>
        <Dialog open={dialogOpen} onOpenChange={(o) => { if (!o) resetForm(); else setDialogOpen(true); }}>
          <DialogTrigger asChild>
            <Button className="shadow-md" onClick={() => { setEditId(null); setDialogOpen(true); }}><Plus className="h-4 w-4 mr-2" />Ongeza Nyumba</Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto">
            <DialogHeader><DialogTitle>{editId ? "Hariri Nyumba" : "Ongeza Nyumba"}</DialogTitle></DialogHeader>
            <form onSubmit={handleSave} className="space-y-4">
              <div className="space-y-2"><Label>Kichwa</Label><Input placeholder="Jina la nyumba" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} /></div>
              <div className="space-y-2"><Label>Maelezo</Label><Textarea placeholder="Eleza nyumba…" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} /></div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2"><Label>Bei (TZS/mwezi)</Label><Input type="number" placeholder="800000" value={form.price} onChange={e => setForm(f => ({ ...f, price: e.target.value }))} /></div>
                <div className="space-y-2"><Label>Vyumba vya Kulala</Label><Input type="number" placeholder="2" value={form.bedrooms} onChange={e => setForm(f => ({ ...f, bedrooms: e.target.value }))} /></div>
              </div>
              <div className="space-y-2"><Label>Eneo</Label><Input placeholder="Eneo, Jiji" value={form.location} onChange={e => setForm(f => ({ ...f, location: e.target.value }))} /></div>
              <div className="space-y-2"><Label>Vifaa (tenganisha kwa koma)</Label><Input placeholder="WiFi, Parking, Ulinzi" value={form.amenities} onChange={e => setForm(f => ({ ...f, amenities: e.target.value }))} /></div>
              <div className="space-y-2"><Label>Sheria za Nyumba (tenganisha kwa koma)</Label><Input placeholder="Hakuna wanyama, Hakuna kuvuta" value={form.houseRules} onChange={e => setForm(f => ({ ...f, houseRules: e.target.value }))} /></div>
              {!editId && <div className="space-y-2"><Label>Picha</Label><Input type="file" multiple accept="image/*" /></div>}
              <Button type="submit" className="w-full font-semibold" disabled={isSaving}>
                {isSaving ? "Inahifadhi…" : editId ? "Sasisha Nyumba" : "Hifadhi Nyumba"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card className="glass-strong border-border/30">
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-6 space-y-3">{[1,2,3].map(i => <Skeleton key={i} className="h-12 w-full" />)}</div>
          ) : (
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
                {data && data.length > 0 ? data.map((p: any) => (
                  <TableRow key={p.id} className="hover:bg-muted/50 transition-colors">
                    <TableCell className="font-medium">{p.title}</TableCell>
                    <TableCell>{p.location}</TableCell>
                    <TableCell>TZS {Number(p.price).toLocaleString()}</TableCell>
                    <TableCell>{p.bedrooms}</TableCell>
                    <TableCell className="text-right space-x-1">
                      <Button variant="ghost" size="icon" onClick={() => openEdit(p)}><Pencil className="h-4 w-4" /></Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="ghost" size="icon" className="text-destructive"><Trash2 className="h-4 w-4" /></Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Futa Nyumba?</AlertDialogTitle>
                            <AlertDialogDescription>Hatua hii haiwezi kutenduliwa. Nyumba "{p.title}" itafutwa kabisa.</AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Ghairi</AlertDialogCancel>
                            <AlertDialogAction onClick={() => deleteMutation.mutate(String(p.id))} className="bg-destructive text-destructive-foreground">Futa</AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </TableCell>
                  </TableRow>
                )) : (
                  <TableRow><TableCell colSpan={5} className="text-center text-muted-foreground py-8">Bado huna nyumba zilizoorodheshwa</TableCell></TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default LandlordProperties;
