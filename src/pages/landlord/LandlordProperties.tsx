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
import { useLanguage } from "@/i18n/LanguageContext";

const LandlordProperties = () => {
  const { t } = useLanguage();
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
      toast({ title: t("landlord.propertyAdded") });
      resetForm();
    },
    onError: (err: any) => toast({ title: err.message, variant: "destructive" }),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => propertiesApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["landlord-properties"] });
      toast({ title: t("landlord.propertyUpdated") });
      resetForm();
    },
    onError: (err: any) => toast({ title: err.message, variant: "destructive" }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => propertiesApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["landlord-properties"] });
      toast({ title: t("landlord.propertyDeleted") });
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
        <h1 className="text-2xl font-bold text-foreground">{t("landlord.myProperties")}</h1>
        <Dialog open={dialogOpen} onOpenChange={(o) => { if (!o) resetForm(); else setDialogOpen(true); }}>
          <DialogTrigger asChild>
            <Button className="shadow-md" onClick={() => { setEditId(null); setDialogOpen(true); }}><Plus className="h-4 w-4 mr-2" />{t("landlord.addProperty")}</Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto">
            <DialogHeader><DialogTitle>{editId ? t("landlord.editProperty") : t("landlord.addProperty")}</DialogTitle></DialogHeader>
            <form onSubmit={handleSave} className="space-y-4">
              <div className="space-y-2"><Label>{t("landlord.title")}</Label><Input placeholder={t("landlord.propertyName")} value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} /></div>
              <div className="space-y-2"><Label>{t("propertyDetails.description")}</Label><Textarea placeholder={t("landlord.describe")} value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} /></div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2"><Label>{t("landlord.priceLabel")}</Label><Input type="number" placeholder="800000" value={form.price} onChange={e => setForm(f => ({ ...f, price: e.target.value }))} /></div>
                <div className="space-y-2"><Label>{t("landlord.bedroomsLabel")}</Label><Input type="number" placeholder="2" value={form.bedrooms} onChange={e => setForm(f => ({ ...f, bedrooms: e.target.value }))} /></div>
              </div>
              <div className="space-y-2"><Label>{t("landlord.locationLabel")}</Label><Input placeholder={t("landlord.locationLabel")} value={form.location} onChange={e => setForm(f => ({ ...f, location: e.target.value }))} /></div>
              <div className="space-y-2"><Label>{t("landlord.amenitiesLabel")}</Label><Input placeholder="WiFi, Parking" value={form.amenities} onChange={e => setForm(f => ({ ...f, amenities: e.target.value }))} /></div>
              <div className="space-y-2"><Label>{t("landlord.rulesLabel")}</Label><Input placeholder={t("landlord.rulesLabel")} value={form.houseRules} onChange={e => setForm(f => ({ ...f, houseRules: e.target.value }))} /></div>
              {!editId && <div className="space-y-2"><Label>{t("landlord.images")}</Label><Input type="file" multiple accept="image/*" /></div>}
              <Button type="submit" className="w-full font-semibold" disabled={isSaving}>
                {isSaving ? t("landlord.saving") : editId ? t("landlord.updateProperty") : t("landlord.saveProperty")}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card className="glass-strong border-border/30">
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-6 space-y-3">{[1, 2, 3].map(i => <Skeleton key={i} className="h-12 w-full" />)}</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t("landlord.title")}</TableHead>
                  <TableHead>{t("landlord.location")}</TableHead>
                  <TableHead>{t("landlord.price")}</TableHead>
                  <TableHead>{t("landlord.bedroomsCol")}</TableHead>
                  <TableHead className="text-right">{t("common.actions")}</TableHead>
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
                            <AlertDialogTitle>{t("landlord.deleteProperty")}</AlertDialogTitle>
                            <AlertDialogDescription>{t("landlord.deleteWarning", { title: p.title })}</AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>{t("common.cancel")}</AlertDialogCancel>
                            <AlertDialogAction onClick={() => deleteMutation.mutate(String(p.id))} className="bg-destructive text-destructive-foreground">{t("common.delete")}</AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </TableCell>
                  </TableRow>
                )) : (
                  <TableRow><TableCell colSpan={5} className="text-center text-muted-foreground py-8">{t("landlord.noProperties")}</TableCell></TableRow>
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
