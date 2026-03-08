import { useState, useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

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
import { Plus, Pencil, Trash2, AlertTriangle } from "lucide-react";

import { properties as propertiesApi, features as featuresApi, normalizePropertyImages } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/i18n/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";

const LandlordProperties = () => {
  const { t } = useLanguage();
  const { user } = useAuth();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState({ title: "", description: "", price: "", location: "" });
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [availableFeatures, setAvailableFeatures] = useState<any[]>([]);
  const [selectedFeatures, setSelectedFeatures] = useState<number[]>([]);
  const [maxImageSizeMb, setMaxImageSizeMb] = useState(5);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Check landlord verification status
  const isVerified = true; // This will be checked from user profile / API

  const { data, isLoading } = useQuery({
    queryKey: ["landlord-properties"],
    queryFn: () => propertiesApi.list(),
  });

  const { data: featuresData } = useQuery({
    queryKey: ["features"],
    queryFn: () => featuresApi.list(),
  });

  useEffect(() => {
    if (featuresData) setAvailableFeatures(featuresData);
  }, [featuresData]);

  const { data: configData } = useQuery({
    queryKey: ["properties-config"],
    queryFn: () => propertiesApi.getConfig(),
  });

  useEffect(() => {
    if (configData) setMaxImageSizeMb(configData.image_max_size_mb || 5);
  }, [configData]);

  const createMutation = useMutation({
    mutationFn: (data: { title: string; description: string; price: number; location: string }) => propertiesApi.create(data),
    onSuccess: async () => {
      queryClient.invalidateQueries({ queryKey: ["landlord-properties"] });
      toast({ title: t("landlord.propertyAdded") });
      const latest = await propertiesApi.list({});
      const created = latest && latest.length ? latest[0] : null;
      if (created && imageFiles && imageFiles.length > 0) {
        const fd = new FormData();
        imageFiles.forEach((f) => fd.append("images", f));
        try {
          await propertiesApi.uploadImages(String(created.id), fd);
          queryClient.invalidateQueries({ queryKey: ["landlord-properties"] });
        } catch (err: any) {
          toast({ title: String(err?.message || "Image upload failed"), variant: "destructive" });
        }
      }
      resetForm();
    },
    onError: (err: any) => toast({ title: err.message, variant: "destructive" }),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<{ title: string; description: string; price: number; location: string }> }) => propertiesApi.update(id, data),
    onSuccess: async () => {
      queryClient.invalidateQueries({ queryKey: ["landlord-properties"] });
      toast({ title: t("landlord.propertyUpdated") });
      if (editId && imageFiles && imageFiles.length > 0) {
        const fd = new FormData();
        imageFiles.forEach((f) => fd.append("images", f));
        try {
          await propertiesApi.uploadImages(editId, fd);
          queryClient.invalidateQueries({ queryKey: ["landlord-properties"] });
        } catch (err: any) {
          toast({ title: String(err?.message || "Image upload failed"), variant: "destructive" });
        }
      }
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

  const submitForReviewMutation = useMutation({
    mutationFn: (id: string) => propertiesApi.submitForReview(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["landlord-properties"] });
      toast({ title: t("landlord.submittedForReview") || "Property submitted for admin review." });
    },
    onError: (err: any) => toast({ title: err.message || "Submit for review failed", variant: "destructive" }),
  });

  const ownershipMutation = useMutation({
    mutationFn: ({ id, file }: { id: string; file: File }) => {
      const fd = new FormData();
      fd.append("ownership_document", file);
      return propertiesApi.submitOwnershipDocument(id, fd);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["landlord-properties"] });
      toast({ title: "Ownership document submitted." });
    },
    onError: (err: any) => toast({ title: err.message || "Ownership submission failed", variant: "destructive" }),
  });

  const resetForm = () => {
    setForm({ title: "", description: "", price: "", location: "" });
    setEditId(null);
    setSelectedFeatures([]);
    setImageFiles([]);
    setDialogOpen(false);
  };

  const openEdit = (p: any) => {
    setEditId(String(p.id));
    setForm({
      title: p.title || "",
      description: p.description || "",
      price: String(p.price || ""),
      location: p.location || "",
    });
    if (Array.isArray(p.features)) {
      setSelectedFeatures(p.features.map((f: any) => Number(f.id)));
    } else {
      setSelectedFeatures([]);
    }
    setDialogOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();

    if (editId) {
      let payload: any = {};
      if (form.title.trim()) payload.title = form.title.trim();
      if (form.description.trim()) payload.description = form.description.trim();
      if (form.location.trim()) payload.location = form.location.trim();
      if (form.price !== "") payload.price = Number(form.price);
      if (!Object.keys(payload).length) {
        toast({ title: "Fill at least one field to update.", variant: "destructive" });
        return;
      }
      payload.feature_ids = selectedFeatures;
      updateMutation.mutate({ id: editId, data: payload });
      return;
    }

    const createPayload = {
      title: form.title.trim(),
      description: form.description.trim(),
      location: form.location.trim(),
      price: Number(form.price),
      feature_ids: selectedFeatures,
    };

    if (!createPayload.title || !createPayload.description || !createPayload.location || Number.isNaN(createPayload.price)) {
      toast({ title: "Fill all required fields.", variant: "destructive" });
      return;
    }
    createMutation.mutate(createPayload as any);
  };

  const isSaving = createMutation.isPending || updateMutation.isPending;

  const getListingStatusBadge = (p: any) => {
    const ls = String(p.listing_status || "draft").toLowerCase();
    if (ls === "published") return <Badge variant="default">Published</Badge>;
    if (ls === "pending_review") return <Badge variant="secondary">Pending Review</Badge>;
    if (ls === "rejected") return <Badge variant="destructive">Rejected</Badge>;
    return <Badge variant="outline">Draft</Badge>;
  };

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
                <div className="space-y-2"><Label>{t("landlord.locationLabel")}</Label><Input placeholder={t("landlord.locationLabel")} value={form.location} onChange={e => setForm(f => ({ ...f, location: e.target.value }))} /></div>
              </div>
              <div className="space-y-2">
                <Label>Features / Amenities</Label>
                <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto p-2 border rounded">
                  {availableFeatures && availableFeatures.length > 0 ? availableFeatures.map((f) => (
                    <label key={f.id} className="flex items-center space-x-2">
                      <input type="checkbox" checked={selectedFeatures.includes(Number(f.id))} onChange={(e) => {
                        if (e.target.checked) setSelectedFeatures(s => Array.from(new Set([...s, Number(f.id)])));
                        else setSelectedFeatures(s => s.filter(id => id !== Number(f.id)));
                      }} />
                      <span className="text-sm">{f.name}</span>
                    </label>
                  )) : (<div className="text-sm text-muted-foreground">No features available.</div>)}
                </div>
              </div>
              <div className="space-y-2">
                <Label>Property Images</Label>
                <input type="file" accept="image/*" multiple onChange={(e) => setImageFiles(Array.from(e.target.files || []))} />
                <div className="text-sm text-muted-foreground">You may upload multiple images (max {maxImageSizeMb} MB each).</div>
              </div>
              <Button type="submit" className="w-full font-semibold" disabled={isSaving}>
                {isSaving ? (t("landlord.saving") || "Saving...") : editId ? t("landlord.updateProperty") : t("landlord.saveProperty")}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Info: Properties must be submitted for review → admin approves → then published */}
      <Card className="border-warning/30 bg-warning/5">
        <CardContent className="p-4 flex items-start gap-3">
          <AlertTriangle className="h-5 w-5 text-warning mt-0.5 shrink-0" />
          <div className="text-sm text-muted-foreground">
            <p className="font-semibold text-foreground mb-1">{t("landlord.publishFlow") || "Property Publishing Flow"}</p>
            <p>{t("landlord.publishFlowDesc") || "Properties start as Draft. Submit for review → Admin approves → Property goes live. You cannot self-publish."}</p>
          </div>
        </CardContent>
      </Card>

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
                  <TableHead>Cover</TableHead>
                  <TableHead>{t("common.status")}</TableHead>
                  <TableHead className="text-right">{t("common.actions")}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data && data.length > 0 ? data.map((p: any) => (
                  <TableRow key={p.id} className="hover:bg-muted/50 transition-colors">
                    <TableCell className="font-medium">{p.title}</TableCell>
                    <TableCell>{p.location}</TableCell>
                    <TableCell>TZS {Number(p.price).toLocaleString()}</TableCell>
                    <TableCell>
                      {p.images && p.images.length > 0 ? (
                        <img src={normalizePropertyImages(p.images)[0]} alt="cover" className="h-12 w-20 object-cover rounded" />
                      ) : (
                        <div className="text-sm text-muted-foreground">No image</div>
                      )}
                    </TableCell>
                    <TableCell>{getListingStatusBadge(p)}</TableCell>
                    <TableCell className="text-right space-x-1">
                      <label className="inline-flex">
                        <input type="file" accept="image/*,application/pdf" className="hidden" onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) ownershipMutation.mutate({ id: String(p.id), file });
                        }} />
                        <Button variant="ghost" size="sm" type="button">Ownership Doc</Button>
                      </label>

                      {/* Submit for review: only if draft or rejected */}
                      {(p.listing_status === "draft" || p.listing_status === "rejected") && (
                        <Button variant="outline" size="sm" type="button" onClick={() => submitForReviewMutation.mutate(String(p.id))}>
                          Submit for Review
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
