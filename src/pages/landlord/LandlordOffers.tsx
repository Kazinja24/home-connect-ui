import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { applications as appApi, viewings as viewingsApi, offers as offersApi } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/i18n/LanguageContext";
import { CalendarIcon, Send, XCircle, Clock, CheckCircle2, AlertTriangle, FileText } from "lucide-react";

const LandlordOffers = () => {
  const { t } = useLanguage();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [applicationId, setApplicationId] = useState("");
  const [viewingId, setViewingId] = useState("");
  const [monthlyRent, setMonthlyRent] = useState("");
  const [securityDeposit, setSecurityDeposit] = useState("");
  const [moveInDate, setMoveInDate] = useState<Date | undefined>();
  const [leaseDuration, setLeaseDuration] = useState("");
  const [landlordNote, setLandlordNote] = useState("");
  const [showForm, setShowForm] = useState(false);

  const LEASE_DURATIONS = [
    { value: "6", label: t("offers.months6") },
    { value: "12", label: t("offers.year1") },
    { value: "24", label: t("offers.years2") },
    { value: "open", label: t("offers.openEnded") },
  ];

  const { data: applications = [] } = useQuery({
    queryKey: ["landlord-applications-for-offers"],
    queryFn: () => appApi.list({ status: "approved" }),
  });

  const { data: viewings = [] } = useQuery({
    queryKey: ["landlord-viewings-for-offers"],
    queryFn: viewingsApi.list,
  });

  const { data: offersData = [], isLoading } = useQuery({
    queryKey: ["landlord-offers"],
    queryFn: offersApi.list,
  });

  const completedViewings = viewings.filter((v: any) => {
    if (v.status !== "completed") return false;
    if (!applicationId) return true;
    return String(v.application) === String(applicationId);
  });

  const calculateEndDate = (): string => {
    if (!moveInDate || !leaseDuration || leaseDuration === "open") return "";
    const end = new Date(moveInDate);
    end.setMonth(end.getMonth() + Number(leaseDuration));
    return format(end, "yyyy-MM-dd");
  };

  const createMutation = useMutation({
    mutationFn: () =>
      offersApi.create({
        application: applicationId,
        viewing: viewingId,
        monthly_rent: Number(monthlyRent),
        security_deposit: Number(securityDeposit),
        start_date: moveInDate ? format(moveInDate, "yyyy-MM-dd") : "",
        end_date: calculateEndDate(),
        landlord_note: landlordNote,
        lease_duration: leaseDuration,
      }),
    onSuccess: () => {
      toast({ title: t("offers.offerSent") });
      queryClient.invalidateQueries({ queryKey: ["landlord-offers"] });
      resetForm();
    },
    onError: (err: any) => toast({ title: err.message || t("offers.sendFailed"), variant: "destructive" }),
  });

  const withdrawMutation = useMutation({
    mutationFn: (id: string) => offersApi.withdraw(id),
    onSuccess: () => {
      toast({ title: t("offers.offerWithdrawn") });
      queryClient.invalidateQueries({ queryKey: ["landlord-offers"] });
    },
    onError: (err: any) => toast({ title: err.message || t("offers.withdrawFailed"), variant: "destructive" }),
  });

  const resetForm = () => {
    setApplicationId("");
    setViewingId("");
    setMonthlyRent("");
    setSecurityDeposit("");
    setMoveInDate(undefined);
    setLeaseDuration("");
    setLandlordNote("");
    setShowForm(false);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "accepted": return "default";
      case "rejected": return "destructive";
      case "negotiating": return "outline";
      default: return "secondary";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "sent": return t("offers.statusSent");
      case "accepted": return t("offers.statusAccepted");
      case "rejected": return t("offers.statusRejected");
      case "negotiating": return t("offers.statusNegotiating");
      case "withdrawn": return t("offers.statusWithdrawn");
      default: return status;
    }
  };

  return (
    <div className="space-y-6 animate-slide-up">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">{t("offers.rentalOffers")}</h1>
          <p className="text-sm text-muted-foreground mt-1">{t("offers.sendAfterViewing")}</p>
        </div>
        <Button onClick={() => setShowForm(true)} className="rounded">
          <Send className="h-4 w-4 mr-2" strokeWidth={1.5} />
          {t("offers.newOffer")}
        </Button>
      </div>

      {/* New Offer Dialog */}
      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{t("offers.sendOffer")}</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">{t("offers.approvedApplication")}</Label>
              <Select value={applicationId} onValueChange={setApplicationId}>
                <SelectTrigger className="rounded"><SelectValue placeholder={t("offers.selectApplication")} /></SelectTrigger>
                <SelectContent>
                  {applications.map((a: any) => (
                    <SelectItem key={a.id} value={String(a.id)}>
                      {a.property_title || `#${a.property}`} — {a.tenant_name || `#${a.tenant}`}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">{t("offers.completedViewing")}</Label>
              <Select value={viewingId} onValueChange={setViewingId}>
                <SelectTrigger className="rounded"><SelectValue placeholder={t("offers.selectViewing")} /></SelectTrigger>
                <SelectContent>
                  {completedViewings.map((v: any) => (
                    <SelectItem key={v.id} value={String(v.id)}>
                      {v.property_title || `#${v.property}`} — {v.tenant_name || `#${v.tenant}`}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground">{t("offers.monthlyRent")}</Label>
                <Input type="number" placeholder="800,000" value={monthlyRent} onChange={(e) => setMonthlyRent(e.target.value)} className="rounded" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground">{t("offers.deposit")}</Label>
                <Input type="number" placeholder="800,000" value={securityDeposit} onChange={(e) => setSecurityDeposit(e.target.value)} className="rounded" />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">{t("offers.moveInDate")}</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className={cn("w-full justify-start text-left font-normal rounded", !moveInDate && "text-muted-foreground")}>
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {moveInDate ? format(moveInDate, "dd MMM yyyy") : t("offers.selectDate")}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={moveInDate}
                    onSelect={setMoveInDate}
                    disabled={(date) => date < new Date()}
                    initialFocus
                    className={cn("p-3 pointer-events-auto")}
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">{t("offers.leaseDuration")}</Label>
              <Select value={leaseDuration} onValueChange={setLeaseDuration}>
                <SelectTrigger className="rounded"><SelectValue placeholder={t("offers.selectDuration")} /></SelectTrigger>
                <SelectContent>
                  {LEASE_DURATIONS.map((d) => (
                    <SelectItem key={d.value} value={d.value}>{d.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {monthlyRent && securityDeposit && moveInDate && leaseDuration && (
              <div className="bg-muted/50 rounded-lg p-3 space-y-1 text-sm">
                <p className="font-medium text-foreground">{t("offers.summary")}</p>
                <p className="text-muted-foreground">{t("offers.rent")}: <span className="text-foreground font-semibold">TZS {Number(monthlyRent).toLocaleString()}</span>{t("offers.perMonth")}</p>
                <p className="text-muted-foreground">{t("offers.depositLabel")}: <span className="text-foreground font-semibold">TZS {Number(securityDeposit).toLocaleString()}</span></p>
                <p className="text-muted-foreground">{t("offers.from")}: <span className="text-foreground font-semibold">{format(moveInDate, "dd MMM yyyy")}</span></p>
                <p className="text-muted-foreground">{t("offers.duration")}: <span className="text-foreground font-semibold">{LEASE_DURATIONS.find(d => d.value === leaseDuration)?.label}</span></p>
                {leaseDuration !== "open" && calculateEndDate() && (
                  <p className="text-muted-foreground">{t("offers.until")}: <span className="text-foreground font-semibold">{format(new Date(calculateEndDate()), "dd MMM yyyy")}</span></p>
                )}
              </div>
            )}

            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">{t("offers.noteToTenant")}</Label>
              <Textarea
                placeholder={t("offers.notePlaceholder")}
                value={landlordNote}
                onChange={(e) => setLandlordNote(e.target.value)}
                className="rounded resize-none"
                rows={3}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={resetForm} className="rounded">{t("offers.cancel")}</Button>
            <Button
              onClick={() => createMutation.mutate()}
              disabled={createMutation.isPending || !applicationId || !viewingId || !monthlyRent || !securityDeposit || !moveInDate || !leaseDuration}
              className="rounded"
            >
              {createMutation.isPending ? t("offers.sending") : t("offers.sendBtn")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Sent Offers List */}
      <Card className="glass-strong border-border/30">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <FileText className="h-5 w-5 text-muted-foreground" strokeWidth={1.5} />
            {t("offers.sentOffers")}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {isLoading ? (
            [1, 2, 3].map((i) => <Skeleton key={i} className="h-24 w-full" />)
          ) : offersData.length > 0 ? (
            offersData.map((offer: any) => (
              <div key={offer.id} className="border border-border rounded-lg p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-foreground">{offer.property_title || `#${offer.property}`}</p>
                    <p className="text-xs text-muted-foreground">{t("offers.tenant")}: {offer.tenant_name || offer.tenant}</p>
                  </div>
                  <Badge variant={getStatusColor(offer.status)}>{getStatusLabel(offer.status)}</Badge>
                </div>

                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="flex items-center gap-1.5 text-muted-foreground">
                    <span>{t("offers.rent")}:</span>
                    <span className="text-foreground font-medium">TZS {Number(offer.monthly_rent || 0).toLocaleString()}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-muted-foreground">
                    <span>{t("offers.depositLabel")}:</span>
                    <span className="text-foreground font-medium">TZS {Number(offer.security_deposit || 0).toLocaleString()}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-muted-foreground">
                    <span>{t("offers.from")}:</span>
                    <span className="text-foreground font-medium">{offer.start_date || "—"}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-muted-foreground">
                    <span>{t("offers.until")}:</span>
                    <span className="text-foreground font-medium">{offer.end_date || t("offers.open")}</span>
                  </div>
                </div>

                {offer.tenant_note && (
                  <div className="bg-muted/50 rounded p-2 text-sm">
                    <p className="text-xs text-muted-foreground mb-0.5">{t("offers.tenantReply")}:</p>
                    <p className="text-foreground">{offer.tenant_note}</p>
                  </div>
                )}

                {offer.status === "sent" && (
                  <div className="flex items-center gap-2 pt-1">
                    <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                    <span className="text-xs text-muted-foreground">{t("offers.awaitingReply")}</span>
                    <Button size="sm" variant="ghost" className="ml-auto text-destructive text-xs" onClick={() => withdrawMutation.mutate(String(offer.id))}>
                      <XCircle className="h-3 w-3 mr-1" />
                      {t("offers.withdraw")}
                    </Button>
                  </div>
                )}

                {offer.status === "accepted" && (
                  <div className="flex items-center gap-2 pt-1 text-xs text-primary">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    {t("offers.acceptedLease")}
                  </div>
                )}
              </div>
            ))
          ) : (
            <div className="text-center py-12">
              <Send className="h-8 w-8 text-muted-foreground mx-auto mb-3" strokeWidth={1} />
              <p className="text-sm text-muted-foreground">{t("offers.noOffersSent")}</p>
              <Button variant="outline" size="sm" onClick={() => setShowForm(true)} className="mt-3 rounded">
                {t("offers.sendFirst")}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default LandlordOffers;
