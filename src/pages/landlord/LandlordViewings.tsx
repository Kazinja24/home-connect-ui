import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { StatusBadge } from "@/components/StatusBadge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { viewings as viewingsApi } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import type { RequestStatus } from "@/types";
import { cn } from "@/lib/utils";
import { CalendarIcon, Clock, User, MapPin, CheckCircle, XCircle, ArrowRight, Bell } from "lucide-react";

function normalizeStatus(status: string): RequestStatus {
  const normalized = String(status).toLowerCase();
  if (["approved", "completed"].includes(normalized)) return "approved";
  if (normalized === "rejected") return "rejected";
  return "pending";
}

const VIEWING_OUTCOMES = [
  { value: "interested", label: "Mpangaji anapendezwa", icon: CheckCircle, color: "text-green-600" },
  { value: "not_fit", label: "Haikufaa — haiendani", icon: XCircle, color: "text-muted-foreground" },
  { value: "move_to_offer", label: "Endelea na ofa ya kukodisha", icon: ArrowRight, color: "text-primary" },
];

const LandlordViewings = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const [outcomeOpen, setOutcomeOpen] = useState(false);
  const [selectedViewing, setSelectedViewing] = useState<any>(null);
  const [selectedOutcome, setSelectedOutcome] = useState("");
  const [outcomeNotes, setOutcomeNotes] = useState("");

  // Propose viewing dialog
  const [proposeOpen, setProposeOpen] = useState(false);
  const [proposeDate, setProposeDate] = useState<Date>();
  const [proposeTime, setProposeTime] = useState("");

  const { data, isLoading } = useQuery({
    queryKey: ["landlord-viewings"],
    queryFn: viewingsApi.list,
  });

  const mutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: "approved" | "rejected" }) => viewingsApi.updateStatus(id, status),
    onSuccess: (_d, vars) => {
      queryClient.invalidateQueries({ queryKey: ["landlord-viewings"] });
      toast({
        title: vars.status === "approved"
          ? "Kuona kumekubaliwa! Pande zote mbili zitapata ukumbusho kwa SMS."
          : "Ombi la kuona limekataliwa.",
      });
    },
    onError: (err: any) => toast({ title: err.message || "Imeshindikana", variant: "destructive" }),
  });

  const completeMutation = useMutation({
    mutationFn: (id: string) => viewingsApi.complete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["landlord-viewings"] });
      toast({ title: "Matokeo ya kuona yamehifadhiwa." });
      setOutcomeOpen(false);
      setSelectedViewing(null);
      setSelectedOutcome("");
      setOutcomeNotes("");
    },
    onError: (err: any) => toast({ title: err.message || "Imeshindikana", variant: "destructive" }),
  });

  const openOutcome = (viewing: any) => {
    setSelectedViewing(viewing);
    setSelectedOutcome("");
    setOutcomeNotes("");
    setOutcomeOpen(true);
  };

  const handleOutcomeSubmit = () => {
    if (!selectedOutcome) {
      toast({ title: "Tafadhali chagua matokeo", variant: "destructive" });
      return;
    }
    if (selectedViewing) {
      completeMutation.mutate(String(selectedViewing.id));
    }
  };

  const getTimeLabel = (tw: string) => {
    if (tw === "morning") return "Asubuhi (8AM-12PM)";
    if (tw === "afternoon") return "Mchana (12PM-4PM)";
    return "Jioni (4PM-7PM)";
  };

  const pendingViewings = (data || []).filter((v: any) => v.status === "pending");
  const approvedViewings = (data || []).filter((v: any) => v.status === "approved");
  const completedViewings = (data || []).filter((v: any) => v.status === "completed");
  const rejectedViewings = (data || []).filter((v: any) => v.status === "rejected");

  const renderViewingCard = (v: any) => {
    const status = String(v.status).toLowerCase();
    const viewingDate = v.scheduled_date ? new Date(v.scheduled_date) : null;
    const isPast = viewingDate && viewingDate < new Date();

    return (
      <Card key={v.id} className="glass-strong border-border/30 overflow-hidden">
        {status === "approved" && !isPast && (
          <div className="bg-primary/10 px-4 py-2 text-xs font-semibold text-primary flex items-center gap-1.5">
            <Bell className="h-3 w-3" />
            Ukumbusho wa SMS utatumwa siku 1 kabla
          </div>
        )}
        <CardContent className="p-5">
          <div className="flex items-start justify-between mb-3">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <User className="h-4 w-4 text-muted-foreground" strokeWidth={1.5} />
                <p className="font-semibold text-foreground">{v.tenant_name || `Mpangaji #${v.tenant}`}</p>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="h-3.5 w-3.5 text-muted-foreground" strokeWidth={1.5} />
                <p className="text-sm text-muted-foreground">{v.property_title || `Nyumba #${v.property}`}</p>
              </div>
            </div>
            <StatusBadge status={normalizeStatus(status)} />
          </div>

          {/* Date & time */}
          <div className="flex items-center gap-4 bg-muted/50 rounded-lg px-4 py-3 mb-4">
            <div className="flex items-center gap-2">
              <CalendarIcon className="h-4 w-4 text-primary" strokeWidth={1.5} />
              <span className="text-sm font-medium">
                {viewingDate ? format(viewingDate, "EEEE, dd MMM yyyy") : "—"}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-primary" strokeWidth={1.5} />
              <span className="text-sm">{getTimeLabel(v.time_window)}</span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-wrap gap-2">
            {status === "pending" && (
              <>
                <Button
                  size="sm"
                  className="font-semibold gap-1.5"
                  disabled={mutation.isPending}
                  onClick={() => mutation.mutate({ id: String(v.id), status: "approved" })}
                >
                  <CheckCircle className="h-3.5 w-3.5" />
                  Kubali
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  className="text-destructive gap-1.5"
                  disabled={mutation.isPending}
                  onClick={() => mutation.mutate({ id: String(v.id), status: "rejected" })}
                >
                  <XCircle className="h-3.5 w-3.5" />
                  Kataa
                </Button>
              </>
            )}

            {status === "approved" && isPast && (
              <Button
                size="sm"
                className="font-semibold gap-1.5"
                onClick={() => openOutcome(v)}
              >
                <CheckCircle className="h-3.5 w-3.5" />
                Weka Matokeo
              </Button>
            )}

            {status === "approved" && !isPast && (
              <Badge variant="secondary" className="text-xs gap-1">
                <Clock className="h-3 w-3" />
                Inasubiri tarehe ya kuona
              </Badge>
            )}

            {status === "completed" && (
              <Badge variant="default" className="text-xs gap-1">
                <CheckCircle className="h-3 w-3" />
                Imekamilika
              </Badge>
            )}
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-6 animate-slide-up">
      <h1 className="text-2xl font-bold text-foreground">Maombi ya Kuona Nyumba</h1>

      {isLoading ? (
        <div className="space-y-4">{[1, 2, 3].map(i => <Skeleton key={i} className="h-40 w-full rounded-xl" />)}</div>
      ) : (
        <>
          {/* Pending */}
          {pendingViewings.length > 0 && (
            <div className="space-y-3">
              <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                Inasubiri Jibu ({pendingViewings.length})
              </h2>
              {pendingViewings.map(renderViewingCard)}
            </div>
          )}

          {/* Approved / Upcoming */}
          {approvedViewings.length > 0 && (
            <div className="space-y-3">
              <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                Zimekubaliwa ({approvedViewings.length})
              </h2>
              {approvedViewings.map(renderViewingCard)}
            </div>
          )}

          {/* Completed */}
          {completedViewings.length > 0 && (
            <div className="space-y-3">
              <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                Zimekamilika ({completedViewings.length})
              </h2>
              {completedViewings.map(renderViewingCard)}
            </div>
          )}

          {/* Rejected */}
          {rejectedViewings.length > 0 && (
            <div className="space-y-3">
              <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                Zimekataliwa ({rejectedViewings.length})
              </h2>
              {rejectedViewings.map(renderViewingCard)}
            </div>
          )}

          {/* Empty */}
          {(!data || data.length === 0) && (
            <p className="text-muted-foreground text-sm py-8 text-center">Hakuna maombi ya kuona kwa sasa</p>
          )}
        </>
      )}

      {/* Post-Viewing Outcome Dialog */}
      <Dialog open={outcomeOpen} onOpenChange={setOutcomeOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Matokeo ya Kuona Nyumba</DialogTitle>
          </DialogHeader>
          {selectedViewing && (
            <div className="space-y-5">
              {/* Summary */}
              <div className="bg-muted/50 rounded-lg p-3 text-sm">
                <p className="font-medium">{selectedViewing.property_title}</p>
                <p className="text-muted-foreground">
                  Mpangaji: {selectedViewing.tenant_name} • {selectedViewing.scheduled_date ? format(new Date(selectedViewing.scheduled_date), "dd MMM yyyy") : ""}
                </p>
              </div>

              {/* Outcome selection */}
              <div className="space-y-2">
                <Label className="text-sm font-semibold">Matokeo ya Kuona</Label>
                <div className="grid gap-2">
                  {VIEWING_OUTCOMES.map(outcome => (
                    <button
                      key={outcome.value}
                      type="button"
                      onClick={() => setSelectedOutcome(outcome.value)}
                      className={cn(
                        "flex items-center gap-3 p-3 rounded-lg border-2 text-left transition-all",
                        selectedOutcome === outcome.value
                          ? "border-primary bg-primary/5"
                          : "border-border hover:border-primary/30"
                      )}
                    >
                      <outcome.icon className={cn("h-5 w-5 shrink-0", outcome.color)} strokeWidth={1.5} />
                      <span className="text-sm font-medium">{outcome.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Notes */}
              <div className="space-y-2">
                <Label className="text-sm">Maelezo ya ziada (hiari)</Label>
                <Textarea
                  placeholder="Maoni au hatua inayofuata…"
                  value={outcomeNotes}
                  onChange={(e) => setOutcomeNotes(e.target.value)}
                  rows={3}
                />
              </div>

              {/* Actions */}
              <div className="flex gap-3">
                <Button variant="outline" className="flex-1" onClick={() => setOutcomeOpen(false)}>
                  Ghairi
                </Button>
                <Button
                  className="flex-1 font-semibold"
                  disabled={!selectedOutcome || completeMutation.isPending}
                  onClick={handleOutcomeSubmit}
                >
                  {completeMutation.isPending ? "Inahifadhi…" : "Hifadhi Matokeo"}
                </Button>
              </div>

              {selectedOutcome === "move_to_offer" && (
                <p className="text-xs text-primary text-center">
                  Baada ya kuhifadhi, utaelekezwa kutengeneza ofa ya kukodisha.
                </p>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default LandlordViewings;
