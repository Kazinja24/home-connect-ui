import { useState, useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Checkbox } from "@/components/ui/checkbox";
import { Plus, Pencil, Trash2, AlertTriangle, CalendarIcon, ImagePlus } from "lucide-react";
import { cn } from "@/lib/utils";

import { properties as propertiesApi, features as featuresApi, normalizePropertyImages } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/i18n/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";

// Tanzania location data
const REGIONS = [
  "Dar es Salaam", "Mwanza", "Arusha", "Dodoma", "Mbeya", "Morogoro", "Tanga", "Zanzibar", "Kilimanjaro", "Iringa"
];

const DISTRICTS: Record<string, string[]> = {
  "Dar es Salaam": ["Kinondoni", "Ilala", "Temeke", "Ubungo", "Kigamboni"],
  "Mwanza": ["Nyamagana", "Ilemela", "Sengerema", "Kwimba"],
  "Arusha": ["Arusha City", "Arusha DC", "Meru", "Karatu"],
  "Dodoma": ["Dodoma City", "Chamwino", "Kondoa"],
  "Mbeya": ["Mbeya City", "Mbeya DC", "Rungwe"],
  "Morogoro": ["Morogoro Municipal", "Morogoro DC", "Kilosa"],
  "Tanga": ["Tanga City", "Muheza", "Pangani"],
  "Zanzibar": ["Mjini Magharibi", "Kaskazini", "Kusini"],
  "Kilimanjaro": ["Moshi Municipal", "Moshi DC", "Hai", "Rombo"],
  "Iringa": ["Iringa Municipal", "Iringa DC", "Kilolo"],
};

const PROPERTY_TYPES = [
  { value: "bedsitter", label: "Bedsitter" },
  { value: "1bedroom", label: "Chumba 1 (1 Bedroom)" },
  { value: "2bedroom", label: "Vyumba 2 (2 Bedroom)" },
  { value: "3bedroom", label: "Vyumba 3 (3 Bedroom)" },
  { value: "studio", label: "Studio" },
  { value: "house", label: "Nyumba Kamili (Full House)" },
  { value: "room", label: "Chumba Kimoja (Single Room)" },
];

const INCLUDED_UTILITIES = [
  { id: "maji", label: "Maji (Water)" },
  { id: "umeme", label: "Umeme (Electricity)" },
  { id: "wifi", label: "WiFi / Internet" },
  { id: "parking", label: "Parking" },
  { id: "ulinzi", label: "Ulinzi (Security)" },
  { id: "takataka", label: "Takataka (Garbage)" },
  { id: "generator", label: "Generator / Backup Power" },
  { id: "ac", label: "AC (Air Conditioning)" },
];

const CONTACT_PREFERENCES = [
  { value: "call", label: "Simu (Call Only)" },
  { value: "chat", label: "Ujumbe (Chat Only)" },
  { value: "both", label: "Simu na Ujumbe (Both)" },
];

interface ListingForm {
  title: string;
  description: string;
  price: string;
  propertyType: string;
  region: string;
  district: string;
  mtaa: string;
  includedUtilities: string[];
  contactPreference: string;
  availableFrom: Date | undefined;
}

const emptyForm: ListingForm = {
  title: "",
  description: "",
  price: "",
  propertyType: "",
  region: "",
  district: "",
  mtaa: "",
  includedUtilities: [],
  contactPreference: "both",
  availableFrom: undefined,
};

const LandlordProperties = () => {
  const { t } = useLanguage();
  const { user } = useAuth();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState<ListingForm>(emptyForm);
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["landlord-properties"],
    queryFn: () => propertiesApi.list(),
  });

  const createMutation = useMutation({
    mutationFn: (data: any) => propertiesApi.create(data),
    onSuccess: async () => {
      queryClient.invalidateQueries({ queryKey: ["landlord-properties"] });
      toast({ title: t("landlord.propertyAdded") });
      if (imageFiles.length > 0) {
        const latest = await propertiesApi.list({});
        const created = latest?.[0];
        if (created) {
          const fd = new FormData();
          imageFiles.forEach((f) => fd.append("images", f));
          try { await propertiesApi.uploadImages(String(created.id), fd); } catch {}
          queryClient.invalidateQueries({ queryKey: ["landlord-properties"] });
        }
      }
      resetForm();
    },
    onError: (err: any) => toast({ title: err.message, variant: "destructive" }),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => propertiesApi.update(id, data),
    onSuccess: async () => {
      queryClient.invalidateQueries({ queryKey: ["landlord-properties"] });
      toast({ title: t("landlord.propertyUpdated") });
      if (editId && imageFiles.length > 0) {
        const fd = new FormData();
        imageFiles.forEach((f) => fd.append("images", f));
        try { await propertiesApi.uploadImages(editId, fd); } catch {}
        queryClient.invalidateQueries({ queryKey: ["landlord-properties"] });
      }
      resetForm();
    },
    onError: (err: any) => toast({ title: err.message, variant: "destructive" }),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => { await propertiesApi.delete(id); },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["landlord-properties"] });
      toast({ title: t("landlord.propertyDeleted") });
    },
  });

  const submitForReviewMutation = useMutation({
    mutationFn: (id: string) => propertiesApi.submitForReview(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["landlord-properties"] });
      toast({ title: t("landlord.submittedForReview") });
    },
  });

  const ownershipMutation = useMutation({
    mutationFn: ({ id, file }: { id: string; file: File }) => {
      const fd = new FormData();
      fd.append("ownership_document", file);
      return propertiesApi.submitOwnershipDocument(id, fd);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["landlord-properties"] });
      toast({ title: "Hati ya umiliki imewasilishwa." });
    },
  });

  const resetForm = () => {
    setForm(emptyForm);
    setEditId(null);
    setImageFiles([]);
    setImagePreviews([]);
    setDialogOpen(false);
  };

  const openEdit = (p: any) => {
    setEditId(String(p.id));
    // Parse location back
    const locParts = (p.location || "").split(", ");
    setForm({
      title: p.title || "",
      description: p.description || "",
      price: String(p.price || ""),
      propertyType: p.property_type || "",
      region: locParts.length >= 2 ? locParts[locParts.length - 1] : "",
      district: locParts.length >= 2 ? locParts[locParts.length - 2] : "",
      mtaa: locParts.length >= 3 ? locParts[0] : "",
      includedUtilities: Array.isArray(p.amenities) ? p.amenities : [],
      contactPreference: p.contact_preference || "both",
      availableFrom: p.available_from ? new Date(p.available_from) : undefined,
    });
    setDialogOpen(true);
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const total = imageFiles.length + files.length;
    if (total > 6) {
      toast({ title: "Picha nyingi mno — upeo ni 6", variant: "destructive" });
      return;
    }
    // Check size (max 5MB each)
    const oversized = files.find(f => f.size > 5 * 1024 * 1024);
    if (oversized) {
      toast({ title: `"${oversized.name}" ni kubwa mno (max 5MB)`, variant: "destructive" });
      return;
    }
    const newFiles = [...imageFiles, ...files];
    setImageFiles(newFiles);
    // Generate previews
    const newPreviews = newFiles.map(f => URL.createObjectURL(f));
    setImagePreviews(newPreviews);
  };

  const removeImage = (index: number) => {
    const newFiles = imageFiles.filter((_, i) => i !== index);
    setImageFiles(newFiles);
    setImagePreviews(newFiles.map(f => URL.createObjectURL(f)));
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.title.trim() || !form.propertyType || !form.region || !form.district || !form.price) {
      toast({ title: "Tafadhali jaza sehemu zote zinazohitajika", variant: "destructive" });
      return;
    }

    const location = [form.mtaa, form.district, form.region].filter(Boolean).join(", ");
    const payload: any = {
      title: form.title.trim(),
      description: form.description.trim(),
      price: Number(form.price),
      location,
      property_type: form.propertyType,
      amenities: form.includedUtilities,
      contact_preference: form.contactPreference,
      available_from: form.availableFrom ? format(form.availableFrom, "yyyy-MM-dd") : undefined,
    };

    if (editId) {
      updateMutation.mutate({ id: editId, data: payload });
    } else {
      createMutation.mutate(payload);
    }
  };

  const isSaving = createMutation.isPending || updateMutation.isPending;

  const getListingStatusBadge = (p: any) => {
    const ls = String(p.listing_status || "draft").toLowerCase();
    if (ls === "published") return <Badge variant="default">Imechapishwa</Badge>;
    if (ls === "pending_review") return <Badge variant="secondary">Inasubiri Ukaguzi</Badge>;
    if (ls === "rejected") return <Badge variant="destructive">Imekataliwa</Badge>;
    return <Badge variant="outline">Rasimu</Badge>;
  };

  const availableDistricts = form.region ? (DISTRICTS[form.region] || []) : [];

  return (
    <div className="space-y-6 animate-slide-up">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-foreground">{t("landlord.myProperties")}</h1>
        <Dialog open={dialogOpen} onOpenChange={(o) => { if (!o) resetForm(); else setDialogOpen(true); }}>
          <DialogTrigger asChild>
            <Button className="shadow-md" onClick={() => { setEditId(null); setDialogOpen(true); }}>
              <Plus className="h-4 w-4 mr-2" />{t("landlord.addProperty")}
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editId ? t("landlord.editProperty") : t("landlord.addProperty")}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSave} className="space-y-5">
              {/* Property Type */}
              <div className="space-y-2">
                <Label>Aina ya Nyumba *</Label>
                <Select value={form.propertyType} onValueChange={(v) => setForm(f => ({ ...f, propertyType: v }))}>
                  <SelectTrigger><SelectValue placeholder="Chagua aina…" /></SelectTrigger>
                  <SelectContent>
                    {PROPERTY_TYPES.map(pt => (
                      <SelectItem key={pt.value} value={pt.value}>{pt.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Title */}
              <div className="space-y-2">
                <Label>{t("landlord.title")} *</Label>
                <Input placeholder="Mfano: Chumba Kizuri Sinza" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} />
              </div>

              {/* Location: Region > District > Mtaa */}
              <div className="space-y-2">
                <Label>Eneo *</Label>
                <div className="grid grid-cols-3 gap-2">
                  <Select value={form.region} onValueChange={(v) => setForm(f => ({ ...f, region: v, district: "", mtaa: "" }))}>
                    <SelectTrigger className="text-xs"><SelectValue placeholder="Mkoa" /></SelectTrigger>
                    <SelectContent>
                      {REGIONS.map(r => <SelectItem key={r} value={r}>{r}</SelectItem>)}
                    </SelectContent>
                  </Select>
                  <Select value={form.district} onValueChange={(v) => setForm(f => ({ ...f, district: v }))} disabled={!form.region}>
                    <SelectTrigger className="text-xs"><SelectValue placeholder="Wilaya" /></SelectTrigger>
                    <SelectContent>
                      {availableDistricts.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}
                    </SelectContent>
                  </Select>
                  <Input placeholder="Mtaa / Kata" value={form.mtaa} onChange={e => setForm(f => ({ ...f, mtaa: e.target.value }))} className="text-xs" />
                </div>
              </div>

              {/* Rent */}
              <div className="space-y-2">
                <Label>Kodi kwa Mwezi (TZS) *</Label>
                <Input type="number" placeholder="800000" value={form.price} onChange={e => setForm(f => ({ ...f, price: e.target.value }))} />
              </div>

              {/* Description */}
              <div className="space-y-2">
                <Label>Maelezo</Label>
                <Textarea placeholder="Eleza nyumba yako kwa ufupi…" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} rows={3} />
              </div>

              {/* What's included */}
              <div className="space-y-2">
                <Label>Vilivyojumuishwa kwenye Kodi</Label>
                <div className="grid grid-cols-2 gap-2 p-3 border rounded-lg border-border">
                  {INCLUDED_UTILITIES.map(u => (
                    <label key={u.id} className="flex items-center gap-2 cursor-pointer">
                      <Checkbox
                        checked={form.includedUtilities.includes(u.id)}
                        onCheckedChange={(checked) => {
                          setForm(f => ({
                            ...f,
                            includedUtilities: checked
                              ? [...f.includedUtilities, u.id]
                              : f.includedUtilities.filter(id => id !== u.id),
                          }));
                        }}
                      />
                      <span className="text-sm">{u.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Photos (max 6) */}
              <div className="space-y-2">
                <Label>Picha (upeo 6)</Label>
                <div className="grid grid-cols-3 gap-2">
                  {imagePreviews.map((src, i) => (
                    <div key={i} className="relative aspect-video rounded-lg overflow-hidden border border-border">
                      <img src={src} alt={`Picha ${i + 1}`} className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => removeImage(i)}
                        className="absolute top-1 right-1 bg-destructive text-destructive-foreground rounded-full w-5 h-5 flex items-center justify-center text-xs"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                  {imageFiles.length < 6 && (
                    <label className="aspect-video rounded-lg border-2 border-dashed border-border flex flex-col items-center justify-center cursor-pointer hover:border-primary/50 transition-colors">
                      <ImagePlus className="h-6 w-6 text-muted-foreground mb-1" strokeWidth={1.5} />
                      <span className="text-xs text-muted-foreground">Ongeza</span>
                      <input type="file" accept="image/*" multiple className="hidden" onChange={handleImageSelect} />
                    </label>
                  )}
                </div>
                <p className="text-xs text-muted-foreground">JPEG, PNG — max 5MB kila moja</p>
              </div>

              {/* Available from */}
              <div className="space-y-2">
                <Label>Inapatikana Kuanzia</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className={cn("w-full justify-start text-left font-normal", !form.availableFrom && "text-muted-foreground")}>
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {form.availableFrom ? format(form.availableFrom, "PPP") : "Chagua tarehe…"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={form.availableFrom}
                      onSelect={(d) => setForm(f => ({ ...f, availableFrom: d }))}
                      disabled={(date) => date < new Date()}
                      initialFocus
                      className={cn("p-3 pointer-events-auto")}
                    />
                  </PopoverContent>
                </Popover>
              </div>

              {/* Contact preference */}
              <div className="space-y-2">
                <Label>Njia ya Mawasiliano</Label>
                <Select value={form.contactPreference} onValueChange={(v) => setForm(f => ({ ...f, contactPreference: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {CONTACT_PREFERENCES.map(cp => (
                      <SelectItem key={cp.value} value={cp.value}>{cp.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <Button type="submit" className="w-full font-semibold" disabled={isSaving}>
                {isSaving ? t("landlord.saving") : editId ? t("landlord.updateProperty") : t("landlord.saveProperty")}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Info banner */}
      <Card className="border-warning/30 bg-warning/5">
        <CardContent className="p-4 flex items-start gap-3">
          <AlertTriangle className="h-5 w-5 text-warning mt-0.5 shrink-0" />
          <div className="text-sm text-muted-foreground">
            <p className="font-semibold text-foreground mb-1">{t("landlord.publishFlow")}</p>
            <p>{t("landlord.publishFlowDesc")}</p>
          </div>
        </CardContent>
      </Card>

      {/* Properties Table */}
      <Card className="glass-strong border-border/30">
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-6 space-y-3">{[1, 2, 3].map(i => <Skeleton key={i} className="h-12 w-full" />)}</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t("landlord.title")}</TableHead>
                  <TableHead>Eneo</TableHead>
                  <TableHead>Kodi</TableHead>
                  <TableHead>Picha</TableHead>
                  <TableHead>{t("common.status")}</TableHead>
                  <TableHead className="text-right">{t("common.actions")}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data && data.length > 0 ? data.map((p: any) => (
                  <TableRow key={p.id} className="hover:bg-muted/50 transition-colors">
                    <TableCell>
                      <div>
                        <p className="font-medium">{p.title}</p>
                        <p className="text-xs text-muted-foreground">{p.property_type}</p>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm">{p.location}</TableCell>
                    <TableCell className="font-medium">TZS {Number(p.price).toLocaleString()}</TableCell>
                    <TableCell>
                      {p.images && p.images.length > 0 ? (
                        <img src={normalizePropertyImages(p.images)[0]} alt="cover" className="h-10 w-16 object-cover rounded" />
                      ) : (
                        <span className="text-xs text-muted-foreground">—</span>
                      )}
                    </TableCell>
                    <TableCell>{getListingStatusBadge(p)}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1 flex-wrap">
                        {(p.listing_status === "draft" || p.listing_status === "rejected") && (
                          <Button variant="outline" size="sm" onClick={() => submitForReviewMutation.mutate(String(p.id))}>
                            Wasilisha
                          </Button>
                        )}
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
                      </div>
                    </TableCell>
                  </TableRow>
                )) : (
                  <TableRow><TableCell colSpan={6} className="text-center text-muted-foreground py-8">{t("landlord.noProperties")}</TableCell></TableRow>
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
