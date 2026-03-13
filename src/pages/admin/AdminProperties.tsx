import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/i18n/LanguageContext";
import { properties as propertiesApi, normalizePropertyImages } from "@/lib/api";
import { CheckCircle, XCircle, Eye, AlertTriangle, Shield } from "lucide-react";

const REVIEW_CHECKLIST = [
  { id: "photos_real", sw: "Picha ni halisi na zinaonyesha nyumba vizuri", en: "Photos are real and show the property clearly" },
  { id: "location_plausible", sw: "Eneo linaonekana sahihi na lipo", en: "Location appears plausible and exists" },
  { id: "pricing_fair", sw: "Bei inafanana na eneo na aina ya nyumba", en: "Pricing is consistent with area and property type" },
  { id: "description_accurate", sw: "Maelezo yanafanana na picha", en: "Description matches the photos" },
  { id: "no_suspicious", sw: "Hakuna ishara za udanganyifu", en: "No signs of fraud or suspicious content" },
];

const AdminProperties = () => {
  const { t, lang } = useLanguage();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [reviewProperty, setReviewProperty] = useState<any>(null);
  const [checklist, setChecklist] = useState<Record<string, boolean>>({});
  const [feedbackNote, setFeedbackNote] = useState("");

  const { data, isLoading } = useQuery({
    queryKey: ["admin-properties"],
    queryFn: () => propertiesApi.list(),
  });

  const { data: pendingReview = [] } = useQuery({
    queryKey: ["admin-properties-pending-review"],
    queryFn: propertiesApi.pendingReviews,
  });

  const invalidateAll = () => {
    queryClient.invalidateQueries({ queryKey: ["admin-properties"] });
    queryClient.invalidateQueries({ queryKey: ["admin-properties-pending-review"] });
  };

  const approveListing = useMutation({
    mutationFn: (id: string) => propertiesApi.adminApproveListing(id, feedbackNote),
    onSuccess: () => {
      toast({ title: t("admin.listingApproved") });
      invalidateAll();
      closeReview();
    },
    onError: (err: any) => toast({ title: err.message || t("common.loading"), variant: "destructive" }),
  });

  const rejectListing = useMutation({
    mutationFn: (id: string) => propertiesApi.adminRejectListing(id, feedbackNote),
    onSuccess: () => {
      toast({ title: t("admin.listingRejected") });
      invalidateAll();
      closeReview();
    },
    onError: (err: any) => toast({ title: err.message || t("common.loading"), variant: "destructive" }),
  });

  const approveVerification = useMutation({
    mutationFn: (id: string) => propertiesApi.approveVerification(id),
    onSuccess: () => { toast({ title: t("admin.verificationApproved") }); invalidateAll(); },
  });

  const rejectVerification = useMutation({
    mutationFn: (id: string) => propertiesApi.rejectVerification(id),
    onSuccess: () => { toast({ title: t("admin.verificationRejected") }); invalidateAll(); },
  });

  const openReview = (p: any) => {
    setReviewProperty(p);
    setChecklist({});
    setFeedbackNote("");
  };

  const closeReview = () => {
    setReviewProperty(null);
    setChecklist({});
    setFeedbackNote("");
  };

  const allChecked = REVIEW_CHECKLIST.every(item => checklist[item.id]);
  const pendingReviewIds = new Set((pendingReview || []).map((p: any) => String(p.id)));

  const pendingItems = (data || []).filter((p: any) => pendingReviewIds.has(String(p.id)));
  const otherItems = (data || []).filter((p: any) => !pendingReviewIds.has(String(p.id)));

  return (
    <div className="space-y-6 animate-slide-up">
      <h1 className="text-2xl font-bold text-foreground">{t("admin.propertyManagement")}</h1>

      {/* Pending Review Section */}
      {pendingItems.length > 0 && (
        <Card className="border-accent/30 bg-accent/5">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Shield className="h-5 w-5 text-accent" />
              {t("admin.pendingReview")} ({pendingItems.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t("admin.property")}</TableHead>
                  <TableHead>{t("admin.ownerCol")}</TableHead>
                  <TableHead>{t("admin.locationCol")}</TableHead>
                  <TableHead>{t("admin.rentCol")}</TableHead>
                  <TableHead>{t("admin.photosCol")}</TableHead>
                  <TableHead className="text-right">{t("admin.reviewCol")}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pendingItems.map((p: any) => (
                  <TableRow key={p.id} className="hover:bg-accent/5 transition-colors">
                    <TableCell>
                      <div>
                        <p className="font-medium">{p.title}</p>
                        <p className="text-xs text-muted-foreground">{p.property_type}</p>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm">{p.owner_name || `#${p.owner}`}</TableCell>
                    <TableCell className="text-sm">{p.location}</TableCell>
                    <TableCell className="font-medium text-sm">TZS {Number(p.price).toLocaleString()}</TableCell>
                    <TableCell>
                      {p.images?.length > 0 ? (
                        <img src={normalizePropertyImages(p.images)[0]} alt="" className="h-10 w-16 object-cover rounded" />
                      ) : <span className="text-xs text-muted-foreground">—</span>}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button size="sm" onClick={() => openReview(p)} className="gap-1">
                        <Eye className="h-3.5 w-3.5" /> {t("admin.reviewCol")}
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* All Properties */}
      <Card className="glass-strong border-border/30">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">{t("admin.allProperties")}</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-6 space-y-3">{[1, 2, 3].map(i => <Skeleton key={i} className="h-12 w-full" />)}</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t("admin.property")}</TableHead>
                  <TableHead>{t("admin.ownerCol")}</TableHead>
                  <TableHead>{t("admin.verification")}</TableHead>
                  <TableHead>{t("admin.listing")}</TableHead>
                  <TableHead className="text-right">{t("common.actions")}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data && data.length > 0 ? data.map((p: any) => (
                  <TableRow key={p.id} className="hover:bg-muted/50 transition-colors">
                    <TableCell>
                      <div>
                        <p className="font-medium">{p.title}</p>
                        <p className="text-xs text-muted-foreground">{p.location}</p>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm">{p.owner_name || `#${p.owner}`}</TableCell>
                    <TableCell>
                      <Badge variant={p.verification_status === "verified" ? "default" : p.verification_status === "rejected" ? "destructive" : "secondary"}>
                        {p.verification_status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={p.listing_status === "published" ? "default" : p.listing_status === "rejected" ? "destructive" : "secondary"}>
                        {p.listing_status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right space-x-1">
                      {p.verification_status !== "verified" && (
                        <>
                          <Button size="sm" variant="outline" onClick={() => approveVerification.mutate(String(p.id))}>{t("admin.verify")}</Button>
                          <Button size="sm" variant="ghost" className="text-destructive" onClick={() => rejectVerification.mutate(String(p.id))}>{t("common.reject")}</Button>
                        </>
                      )}
                      {pendingReviewIds.has(String(p.id)) && (
                        <Button size="sm" onClick={() => openReview(p)} className="gap-1">
                          <Eye className="h-3.5 w-3.5" /> {t("admin.reviewCol")}
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                )) : (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center text-muted-foreground py-8">{t("admin.noProperties")}</TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Review Dialog */}
      <Dialog open={!!reviewProperty} onOpenChange={(o) => { if (!o) closeReview(); }}>
        <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-primary" />
              {t("admin.reviewListing")}
            </DialogTitle>
          </DialogHeader>

          {reviewProperty && (
            <div className="space-y-5">
              <div className="bg-muted/50 rounded-lg p-4 space-y-2">
                <h3 className="font-semibold text-foreground">{reviewProperty.title}</h3>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div><span className="text-muted-foreground">{t("admin.typeLabel")}:</span> {reviewProperty.property_type}</div>
                  <div><span className="text-muted-foreground">{t("admin.rentLabel")}:</span> TZS {Number(reviewProperty.price).toLocaleString()}/{lang === "sw" ? "mwezi" : "month"}</div>
                  <div className="col-span-2"><span className="text-muted-foreground">{t("admin.locationLabel")}:</span> {reviewProperty.location}</div>
                  <div className="col-span-2"><span className="text-muted-foreground">{t("admin.ownerLabel")}:</span> {reviewProperty.owner_name || `#${reviewProperty.owner}`}</div>
                </div>
                {reviewProperty.description && (
                  <p className="text-sm text-muted-foreground mt-2">{reviewProperty.description}</p>
                )}
                {reviewProperty.images?.length > 0 && (
                  <div className="grid grid-cols-3 gap-2 mt-3">
                    {normalizePropertyImages(reviewProperty.images).map((src, i) => (
                      <img key={i} src={src} alt="" className="w-full aspect-video object-cover rounded border border-border" />
                    ))}
                  </div>
                )}
              </div>

              <div className="space-y-3">
                <Label className="text-sm font-semibold">{t("admin.reviewChecklist")}</Label>
                {REVIEW_CHECKLIST.map(item => (
                  <label key={item.id} className="flex items-start gap-3 cursor-pointer p-2 rounded hover:bg-muted/50 transition-colors">
                    <Checkbox
                      checked={!!checklist[item.id]}
                      onCheckedChange={(checked) => setChecklist(c => ({ ...c, [item.id]: !!checked }))}
                      className="mt-0.5"
                    />
                    <span className="text-sm">{lang === "sw" ? item.sw : item.en}</span>
                  </label>
                ))}
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-semibold">{t("admin.feedbackToOwner")}</Label>
                <Textarea
                  placeholder={t("admin.feedbackPlaceholder")}
                  value={feedbackNote}
                  onChange={(e) => setFeedbackNote(e.target.value)}
                  rows={3}
                />
              </div>

              {!allChecked && (
                <div className="flex items-center gap-2 text-sm text-warning bg-warning/10 rounded-lg p-3">
                  <AlertTriangle className="h-4 w-4 shrink-0" />
                  {t("admin.completeChecklist")}
                </div>
              )}

              <div className="flex gap-3">
                <Button
                  variant="outline"
                  className="flex-1 gap-2 text-destructive border-destructive/30 hover:bg-destructive/10"
                  onClick={() => {
                    if (!feedbackNote.trim()) {
                      toast({ title: t("admin.rejectReason"), variant: "destructive" });
                      return;
                    }
                    rejectListing.mutate(String(reviewProperty.id));
                  }}
                  disabled={rejectListing.isPending}
                >
                  <XCircle className="h-4 w-4" />
                  {rejectListing.isPending ? t("admin.rejecting") : t("admin.rejectBtn")}
                </Button>
                <Button
                  className="flex-1 gap-2"
                  onClick={() => approveListing.mutate(String(reviewProperty.id))}
                  disabled={!allChecked || approveListing.isPending}
                >
                  <CheckCircle className="h-4 w-4" />
                  {approveListing.isPending ? t("admin.approving") : t("admin.approvePublish")}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminProperties;
