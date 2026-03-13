import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { offers as offersApi } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/i18n/LanguageContext";
import { CheckCircle2, XCircle, MessageSquare, FileText, Home, Banknote, Shield, Calendar } from "lucide-react";

const TenantOffers = () => {
  const { t } = useLanguage();
  const { toast } = useToast();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [selectedOffer, setSelectedOffer] = useState<any>(null);
  const [action, setAction] = useState<"accept" | "negotiate" | "decline" | null>(null);
  const [tenantNote, setTenantNote] = useState("");

  const { data, isLoading } = useQuery({
    queryKey: ["tenant-offers"],
    queryFn: offersApi.list,
  });

  const acceptMutation = useMutation({
    mutationFn: (id: string) => offersApi.accept(id, tenantNote),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tenant-offers"] });
      queryClient.invalidateQueries({ queryKey: ["tenant-leases"] });
      toast({ title: t("offers.offerAccepted") });
      closeDialog();
    },
    onError: (err: any) => toast({ title: err.message || t("offers.acceptFailed"), variant: "destructive" }),
  });

  const rejectMutation = useMutation({
    mutationFn: ({ id, note }: { id: string; note: string }) => offersApi.reject(id, note),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tenant-offers"] });
      toast({ title: t("offers.offerDeclined") });
      closeDialog();
    },
    onError: (err: any) => toast({ title: err.message || t("offers.declineFailed"), variant: "destructive" }),
  });

  const closeDialog = () => {
    setSelectedOffer(null);
    setAction(null);
    setTenantNote("");
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "sent": return t("offers.statusNew");
      case "accepted": return t("offers.statusAccepted");
      case "rejected": return t("offers.statusRejected");
      case "withdrawn": return t("offers.statusRemoved");
      default: return status;
    }
  };

  const getStatusVariant = (status: string) => {
    switch (status) {
      case "accepted": return "default";
      case "rejected": return "destructive";
      default: return "secondary";
    }
  };

  const pendingOffers = (data || []).filter((o: any) => o.status === "sent");
  const otherOffers = (data || []).filter((o: any) => o.status !== "sent");

  return (
    <div className="space-y-6 animate-slide-up">
      <div>
        <h1 className="text-2xl font-bold text-foreground">{t("offers.rentalOffers")}</h1>
        <p className="text-sm text-muted-foreground mt-1">{t("offers.reviewOffers")}</p>
      </div>

      {/* Pending Offers */}
      {pendingOffers.length > 0 && (
        <Card className="border-primary/20 bg-primary/5">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Banknote className="h-5 w-5 text-primary" strokeWidth={1.5} />
              {t("offers.newOffers")} ({pendingOffers.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {pendingOffers.map((offer: any) => (
              <div key={offer.id} className="bg-card border border-border rounded-lg p-5 space-y-4">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-semibold text-foreground text-lg">{offer.property_title || `#${offer.property}`}</h3>
                    <p className="text-sm text-muted-foreground flex items-center gap-1 mt-0.5">
                      <Home className="h-3.5 w-3.5" />
                      {t("offers.landlord")}: {offer.landlord_name || t("offers.landlord")}
                    </p>
                  </div>
                  <Badge variant="secondary" className="text-primary border-primary/30">{t("offers.statusNew")}</Badge>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-muted/50 rounded-lg p-3">
                    <p className="text-xs text-muted-foreground">{t("offers.monthlyRentLabel")}</p>
                    <p className="text-lg font-bold text-foreground">TZS {Number(offer.monthly_rent || 0).toLocaleString()}</p>
                  </div>
                  <div className="bg-muted/50 rounded-lg p-3">
                    <p className="text-xs text-muted-foreground">{t("offers.depositLabelShort")}</p>
                    <p className="text-lg font-bold text-foreground">TZS {Number(offer.security_deposit || 0).toLocaleString()}</p>
                  </div>
                  <div className="bg-muted/50 rounded-lg p-3">
                    <p className="text-xs text-muted-foreground flex items-center gap-1"><Calendar className="h-3 w-3" /> {t("offers.moveIn")}</p>
                    <p className="font-semibold text-foreground">{offer.start_date || "—"}</p>
                  </div>
                  <div className="bg-muted/50 rounded-lg p-3">
                    <p className="text-xs text-muted-foreground">{t("offers.leasePeriod")}</p>
                    <p className="font-semibold text-foreground">{offer.end_date ? `${t("offers.until")} ${offer.end_date}` : t("offers.open")}</p>
                  </div>
                </div>

                {offer.landlord_note && (
                  <div className="bg-muted/30 rounded-lg p-3 text-sm">
                    <p className="text-xs text-muted-foreground mb-1">{t("offers.landlordMessage")}:</p>
                    <p className="text-foreground">{offer.landlord_note}</p>
                  </div>
                )}

                <div className="flex gap-2 pt-1">
                  <Button
                    className="flex-1 rounded"
                    onClick={() => { setSelectedOffer(offer); setAction("accept"); }}
                  >
                    <CheckCircle2 className="h-4 w-4 mr-1.5" />
                    {t("offers.acceptOffer")}
                  </Button>
                  <Button
                    variant="outline"
                    className="flex-1 rounded"
                    onClick={() => { setSelectedOffer(offer); setAction("negotiate"); }}
                  >
                    <MessageSquare className="h-4 w-4 mr-1.5" />
                    {t("offers.negotiate")}
                  </Button>
                  <Button
                    variant="ghost"
                    className="rounded text-destructive hover:text-destructive"
                    onClick={() => { setSelectedOffer(offer); setAction("decline"); }}
                  >
                    <XCircle className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Past Offers */}
      <Card className="glass-strong border-border/30">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <FileText className="h-5 w-5 text-muted-foreground" strokeWidth={1.5} />
            {t("offers.offerHistory")}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {isLoading ? (
            [1, 2, 3].map((i) => <Skeleton key={i} className="h-20 w-full" />)
          ) : otherOffers.length > 0 ? (
            otherOffers.map((offer: any) => (
              <div key={offer.id} className="border border-border rounded-lg p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-foreground">{offer.property_title || `#${offer.property}`}</p>
                    <p className="text-xs text-muted-foreground">
                      TZS {Number(offer.monthly_rent || 0).toLocaleString()}{t("offers.perMonth")} • {offer.start_date || "—"}
                    </p>
                  </div>
                  <Badge variant={getStatusVariant(offer.status)}>{getStatusLabel(offer.status)}</Badge>
                </div>
                {offer.status === "accepted" && (
                  <Button
                    size="sm"
                    variant="outline"
                    className="rounded text-xs"
                    onClick={() => navigate("/agreement")}
                  >
                    <FileText className="h-3 w-3 mr-1" />
                    {t("offers.viewAgreement")}
                  </Button>
                )}
              </div>
            ))
          ) : (
            <p className="text-sm text-muted-foreground text-center py-8">{t("offers.noHistory")}</p>
          )}
        </CardContent>
      </Card>

      {/* Accept Dialog */}
      <Dialog open={action === "accept" && !!selectedOffer} onOpenChange={closeDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-primary" />
              {t("offers.acceptTitle")}
            </DialogTitle>
            <DialogDescription>
              {t("offers.acceptDesc")}
            </DialogDescription>
          </DialogHeader>

          <div className="bg-muted/50 rounded-lg p-4 space-y-2 text-sm">
            <p><span className="text-muted-foreground">{t("offers.property")}:</span> <strong>{selectedOffer?.property_title}</strong></p>
            <p><span className="text-muted-foreground">{t("offers.rent")}:</span> <strong>TZS {Number(selectedOffer?.monthly_rent || 0).toLocaleString()}</strong>{t("offers.perMonth")}</p>
            <p><span className="text-muted-foreground">{t("offers.depositLabel")}:</span> <strong>TZS {Number(selectedOffer?.security_deposit || 0).toLocaleString()}</strong></p>
            <p><span className="text-muted-foreground">{t("offers.from")}:</span> <strong>{selectedOffer?.start_date}</strong></p>
          </div>

          <div className="flex items-start gap-2 text-xs text-muted-foreground bg-primary/5 rounded-lg p-3">
            <Shield className="h-4 w-4 mt-0.5 text-primary shrink-0" />
            <span>{t("offers.acceptSecurity")}</span>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">{t("offers.noteToLandlord")}</Label>
            <Textarea
              placeholder={t("offers.acceptPlaceholder")}
              value={tenantNote}
              onChange={(e) => setTenantNote(e.target.value)}
              className="rounded resize-none"
              rows={2}
            />
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={closeDialog} className="rounded">{t("offers.cancel")}</Button>
            <Button onClick={() => acceptMutation.mutate(String(selectedOffer?.id))} disabled={acceptMutation.isPending} className="rounded">
              {acceptMutation.isPending ? t("offers.accepting") : t("offers.acceptBtn")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Negotiate Dialog */}
      <Dialog open={action === "negotiate" && !!selectedOffer} onOpenChange={closeDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5 text-primary" />
              {t("offers.negotiateTitle")}
            </DialogTitle>
            <DialogDescription>
              {t("offers.negotiateDesc")}
            </DialogDescription>
          </DialogHeader>

          <div className="bg-muted/50 rounded-lg p-3 text-sm space-y-1">
            <p className="text-muted-foreground">{t("offers.currentOffer")}: <strong className="text-foreground">TZS {Number(selectedOffer?.monthly_rent || 0).toLocaleString()}</strong>{t("offers.perMonth")}</p>
            <p className="text-muted-foreground">{t("offers.depositLabel")}: <strong className="text-foreground">TZS {Number(selectedOffer?.security_deposit || 0).toLocaleString()}</strong></p>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">{t("offers.yourSuggestions")}</Label>
            <Textarea
              placeholder={t("offers.negotiatePlaceholder")}
              value={tenantNote}
              onChange={(e) => setTenantNote(e.target.value)}
              className="rounded resize-none"
              rows={4}
            />
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={closeDialog} className="rounded">{t("offers.cancel")}</Button>
            <Button
              onClick={() => rejectMutation.mutate({ id: String(selectedOffer?.id), note: `[NEGOTIATE] ${tenantNote}` })}
              disabled={rejectMutation.isPending || !tenantNote.trim()}
              variant="outline"
              className="rounded"
            >
              {rejectMutation.isPending ? t("offers.sendingSuggestions") : t("offers.sendSuggestions")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Decline Dialog */}
      <Dialog open={action === "decline" && !!selectedOffer} onOpenChange={closeDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-destructive">
              <XCircle className="h-5 w-5" />
              {t("offers.declineTitle")}
            </DialogTitle>
            <DialogDescription>
              {t("offers.declineDesc")}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">{t("offers.declineReason")}</Label>
            <Textarea
              placeholder={t("offers.declinePlaceholder")}
              value={tenantNote}
              onChange={(e) => setTenantNote(e.target.value)}
              className="rounded resize-none"
              rows={3}
            />
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={closeDialog} className="rounded">{t("offers.cancel")}</Button>
            <Button
              variant="destructive"
              onClick={() => rejectMutation.mutate({ id: String(selectedOffer?.id), note: tenantNote })}
              disabled={rejectMutation.isPending || !tenantNote.trim()}
              className="rounded"
            >
              {rejectMutation.isPending ? t("offers.declining") : t("offers.declineBtn")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Empty state */}
      {!isLoading && (!data || data.length === 0) && (
        <div className="text-center py-16">
          <Banknote className="h-10 w-10 text-muted-foreground mx-auto mb-3" strokeWidth={1} />
          <p className="text-muted-foreground">{t("offers.noOffersReceived")}</p>
          <p className="text-xs text-muted-foreground mt-1">{t("offers.willAppear")}</p>
        </div>
      )}
    </div>
  );
};

export default TenantOffers;
