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
import { CalendarIcon, Send, XCircle, Clock, CheckCircle2, AlertTriangle, FileText } from "lucide-react";

const LEASE_DURATIONS = [
  { value: "6", label: "Miezi 6" },
  { value: "12", label: "Mwaka 1" },
  { value: "24", label: "Miaka 2" },
  { value: "open", label: "Wazi (Open-ended)" },
];

const LandlordOffers = () => {
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
      toast({ title: "Ofa imetumwa kwa mpangaji." });
      queryClient.invalidateQueries({ queryKey: ["landlord-offers"] });
      resetForm();
    },
    onError: (err: any) => toast({ title: err.message || "Imeshindikana kutuma ofa", variant: "destructive" }),
  });

  const withdrawMutation = useMutation({
    mutationFn: (id: string) => offersApi.withdraw(id),
    onSuccess: () => {
      toast({ title: "Ofa imefutwa." });
      queryClient.invalidateQueries({ queryKey: ["landlord-offers"] });
    },
    onError: (err: any) => toast({ title: err.message || "Imeshindikana kufuta ofa", variant: "destructive" }),
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
      case "sent": return "Imetumwa";
      case "accepted": return "Imekubaliwa";
      case "rejected": return "Imekataliwa";
      case "negotiating": return "Mazungumzo";
      case "withdrawn": return "Imefutwa";
      default: return status;
    }
  };

  return (
    <div className="space-y-6 animate-slide-up">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Ofa za Kukodisha</h1>
          <p className="text-sm text-muted-foreground mt-1">Tuma ofa kwa wapangaji baada ya kutazama nyumba</p>
        </div>
        <Button onClick={() => setShowForm(true)} className="rounded">
          <Send className="h-4 w-4 mr-2" strokeWidth={1.5} />
          Ofa Mpya
        </Button>
      </div>

      {/* New Offer Dialog */}
      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Tuma Ofa ya Kukodisha</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            {/* Application select */}
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">Ombi Lililokubaliwa</Label>
              <Select value={applicationId} onValueChange={setApplicationId}>
                <SelectTrigger className="rounded"><SelectValue placeholder="Chagua ombi" /></SelectTrigger>
                <SelectContent>
                  {applications.map((a: any) => (
                    <SelectItem key={a.id} value={String(a.id)}>
                      {a.property_title || `Nyumba #${a.property}`} — {a.tenant_name || `Mpangaji #${a.tenant}`}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Viewing select */}
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">Kutazama Kulikokamilika</Label>
              <Select value={viewingId} onValueChange={setViewingId}>
                <SelectTrigger className="rounded"><SelectValue placeholder="Chagua kutazama" /></SelectTrigger>
                <SelectContent>
                  {completedViewings.map((v: any) => (
                    <SelectItem key={v.id} value={String(v.id)}>
                      {v.property_title || `Nyumba #${v.property}`} — {v.tenant_name || `Mpangaji #${v.tenant}`}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Rent & Deposit */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground">Kodi ya Mwezi (TZS)</Label>
                <Input type="number" placeholder="800,000" value={monthlyRent} onChange={(e) => setMonthlyRent(e.target.value)} className="rounded" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground">Amana / Deposit (TZS)</Label>
                <Input type="number" placeholder="800,000" value={securityDeposit} onChange={(e) => setSecurityDeposit(e.target.value)} className="rounded" />
              </div>
            </div>

            {/* Move-in Date */}
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">Tarehe ya Kuingia</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className={cn("w-full justify-start text-left font-normal rounded", !moveInDate && "text-muted-foreground")}>
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {moveInDate ? format(moveInDate, "dd MMM yyyy") : "Chagua tarehe"}
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

            {/* Lease Duration */}
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">Muda wa Mkataba</Label>
              <Select value={leaseDuration} onValueChange={setLeaseDuration}>
                <SelectTrigger className="rounded"><SelectValue placeholder="Chagua muda" /></SelectTrigger>
                <SelectContent>
                  {LEASE_DURATIONS.map((d) => (
                    <SelectItem key={d.value} value={d.value}>{d.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Summary preview */}
            {monthlyRent && securityDeposit && moveInDate && leaseDuration && (
              <div className="bg-muted/50 rounded-lg p-3 space-y-1 text-sm">
                <p className="font-medium text-foreground">Muhtasari wa Ofa</p>
                <p className="text-muted-foreground">Kodi: <span className="text-foreground font-semibold">TZS {Number(monthlyRent).toLocaleString()}</span>/mwezi</p>
                <p className="text-muted-foreground">Amana: <span className="text-foreground font-semibold">TZS {Number(securityDeposit).toLocaleString()}</span></p>
                <p className="text-muted-foreground">Kuanzia: <span className="text-foreground font-semibold">{format(moveInDate, "dd MMM yyyy")}</span></p>
                <p className="text-muted-foreground">Muda: <span className="text-foreground font-semibold">{LEASE_DURATIONS.find(d => d.value === leaseDuration)?.label}</span></p>
                {leaseDuration !== "open" && calculateEndDate() && (
                  <p className="text-muted-foreground">Hadi: <span className="text-foreground font-semibold">{format(new Date(calculateEndDate()), "dd MMM yyyy")}</span></p>
                )}
              </div>
            )}

            {/* Note */}
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">Ujumbe kwa Mpangaji (Hiari)</Label>
              <Textarea
                placeholder="Masharti ya ziada, maelezo..."
                value={landlordNote}
                onChange={(e) => setLandlordNote(e.target.value)}
                className="rounded resize-none"
                rows={3}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={resetForm} className="rounded">Ghairi</Button>
            <Button
              onClick={() => createMutation.mutate()}
              disabled={createMutation.isPending || !applicationId || !viewingId || !monthlyRent || !securityDeposit || !moveInDate || !leaseDuration}
              className="rounded"
            >
              {createMutation.isPending ? "Inatuma..." : "Tuma Ofa"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Sent Offers List */}
      <Card className="glass-strong border-border/30">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <FileText className="h-5 w-5 text-muted-foreground" strokeWidth={1.5} />
            Ofa Zilizotumwa
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
                    <p className="font-semibold text-foreground">{offer.property_title || `Nyumba #${offer.property}`}</p>
                    <p className="text-xs text-muted-foreground">Mpangaji: {offer.tenant_name || offer.tenant}</p>
                  </div>
                  <Badge variant={getStatusColor(offer.status)}>{getStatusLabel(offer.status)}</Badge>
                </div>

                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="flex items-center gap-1.5 text-muted-foreground">
                    <span>Kodi:</span>
                    <span className="text-foreground font-medium">TZS {Number(offer.monthly_rent || 0).toLocaleString()}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-muted-foreground">
                    <span>Amana:</span>
                    <span className="text-foreground font-medium">TZS {Number(offer.security_deposit || 0).toLocaleString()}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-muted-foreground">
                    <span>Kuanzia:</span>
                    <span className="text-foreground font-medium">{offer.start_date || "—"}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-muted-foreground">
                    <span>Hadi:</span>
                    <span className="text-foreground font-medium">{offer.end_date || "Wazi"}</span>
                  </div>
                </div>

                {offer.tenant_note && (
                  <div className="bg-muted/50 rounded p-2 text-sm">
                    <p className="text-xs text-muted-foreground mb-0.5">Jibu la Mpangaji:</p>
                    <p className="text-foreground">{offer.tenant_note}</p>
                  </div>
                )}

                {offer.status === "sent" && (
                  <div className="flex items-center gap-2 pt-1">
                    <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                    <span className="text-xs text-muted-foreground">Inasubiri jibu la mpangaji</span>
                    <Button size="sm" variant="ghost" className="ml-auto text-destructive text-xs" onClick={() => withdrawMutation.mutate(String(offer.id))}>
                      <XCircle className="h-3 w-3 mr-1" />
                      Ondoa
                    </Button>
                  </div>
                )}

                {offer.status === "accepted" && (
                  <div className="flex items-center gap-2 pt-1 text-xs text-primary">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    Imekubaliwa — Mkataba unaandaliwa
                  </div>
                )}
              </div>
            ))
          ) : (
            <div className="text-center py-12">
              <Send className="h-8 w-8 text-muted-foreground mx-auto mb-3" strokeWidth={1} />
              <p className="text-sm text-muted-foreground">Bado hujatuma ofa yoyote.</p>
              <Button variant="outline" size="sm" onClick={() => setShowForm(true)} className="mt-3 rounded">
                Tuma Ofa ya Kwanza
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default LandlordOffers;
