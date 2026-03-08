import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { StatusBadge } from "@/components/StatusBadge";
import { applications as appApi, properties as propertiesApi, messages as messagesApi } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import type { RequestStatus } from "@/types";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { MessageSquare, Check, X, User, Briefcase, CalendarDays, Eye } from "lucide-react";

function normalizeStatus(status: string): RequestStatus {
  const normalized = String(status).toLowerCase();
  if (["approved", "accepted", "leased", "active", "closed"].includes(normalized)) return "approved";
  if (normalized === "rejected") return "rejected";
  return "pending";
}

const LandlordApplications = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const [propertyFilter, setPropertyFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [profileOpen, setProfileOpen] = useState(false);
  const [selectedAppId, setSelectedAppId] = useState<string | null>(null);
  const [declineOpen, setDeclineOpen] = useState(false);
  const [declineAppId, setDeclineAppId] = useState<string | null>(null);
  const [declineReason, setDeclineReason] = useState("");

  const params = useMemo(
    () => ({
      property: propertyFilter !== "all" ? propertyFilter : "",
      status: statusFilter !== "all" ? statusFilter : "",
    }),
    [propertyFilter, statusFilter]
  );

  const { data, isLoading } = useQuery({
    queryKey: ["landlord-applications", params.property, params.status],
    queryFn: () => appApi.list(params),
  });

  const { data: landlordProperties = [] } = useQuery({
    queryKey: ["landlord-properties-filter"],
    queryFn: () => propertiesApi.list(),
  });

  const { data: tenantProfile, isLoading: profileLoading } = useQuery({
    queryKey: ["application-tenant-profile", selectedAppId],
    queryFn: () => appApi.getTenantProfile(String(selectedAppId)),
    enabled: Boolean(selectedAppId),
  });

  const mutation = useMutation({
    mutationFn: ({ id, action }: { id: string; action: "approved" | "rejected" | "expired" }) => appApi.updateStatus(id, action),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["landlord-applications"] });
      if (variables.action === "approved") {
        toast({ title: "Ombi limekubaliwa! Mazungumzo yamefunguliwa." });
      } else if (variables.action === "rejected") {
        toast({ title: "Ombi limekataliwa. Mpangaji ataarifiwa." });
        setDeclineOpen(false);
        setDeclineReason("");
      } else {
        toast({ title: "Hali imesasishwa!" });
      }
    },
    onError: (err: any) => toast({ title: err.message || "Imeshindikana", variant: "destructive" }),
  });

  const openChatMutation = useMutation({
    mutationFn: (applicationId: string) => messagesApi.openConversation(applicationId),
    onSuccess: () => {
      navigate("/dashboard/landlord-messages");
    },
    onError: (err: any) => toast({ title: err.message || "Imeshindikana kufungua mazungumzo", variant: "destructive" }),
  });

  const openProfile = (applicationId: string) => {
    setSelectedAppId(applicationId);
    setProfileOpen(true);
  };

  const openDecline = (applicationId: string) => {
    setDeclineAppId(applicationId);
    setDeclineReason("");
    setDeclineOpen(true);
  };

  // Parse application message to extract structured data
  const parseMessage = (msg: string) => {
    const lines = (msg || "").split("\n");
    const occupation = lines.find(l => l.startsWith("Kazi:"))?.replace("Kazi:", "").trim();
    const moveIn = lines.find(l => l.startsWith("Tarehe ya kuhamia:"))?.replace("Tarehe ya kuhamia:", "").trim();
    const personalMsg = lines.find(l => !l.startsWith("Kazi:") && !l.startsWith("Tarehe ya kuhamia:"))?.trim();
    return { occupation, moveIn, personalMsg };
  };

  return (
    <div className="space-y-6 animate-slide-up">
      <h1 className="text-2xl font-bold text-foreground">Maombi Yanayoingia</h1>

      {/* Filters */}
      <Card className="glass-strong border-border/30">
        <CardContent className="p-4 md:p-6 grid md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label className="text-xs text-muted-foreground">Chuja kwa nyumba</Label>
            <Select value={propertyFilter} onValueChange={setPropertyFilter}>
              <SelectTrigger><SelectValue placeholder="Nyumba zote" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Nyumba zote</SelectItem>
                {landlordProperties.map((p: any) => (
                  <SelectItem key={p.id} value={String(p.id)}>{p.title || `#${p.id}`}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label className="text-xs text-muted-foreground">Chuja kwa hali</Label>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger><SelectValue placeholder="Hali zote" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Hali zote</SelectItem>
                <SelectItem value="pending">Inasubiri</SelectItem>
                <SelectItem value="approved">Imekubaliwa</SelectItem>
                <SelectItem value="rejected">Imekataliwa</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Applications list */}
      <div className="grid gap-4">
        {isLoading ? (
          [1, 2].map((i) => <Skeleton key={i} className="h-48 w-full rounded-xl" />)
        ) : data && data.length > 0 ? (
          data.map((a: any) => {
            const status = String(a.status).toLowerCase();
            const { occupation, moveIn, personalMsg } = parseMessage(a.message);

            return (
              <Card key={a.id} className="glass-strong border-border/30 overflow-hidden">
                {/* Status bar */}
                {status === "pending" && (
                  <div className="bg-accent/10 px-6 py-2 text-xs font-semibold text-accent flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full bg-accent animate-pulse" />
                    Ombi jipya — linasubiri jibu lako
                  </div>
                )}
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-bold text-foreground text-lg">{a.tenant_name || `Mpangaji #${a.tenant}`}</p>
                        <StatusBadge status={normalizeStatus(status)} />
                      </div>
                      <p className="text-sm text-muted-foreground">{a.property_title || `Nyumba #${a.property}`}</p>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {a.created_at ? new Date(a.created_at).toLocaleDateString("sw-TZ") : ""}
                    </p>
                  </div>

                  {/* Structured tenant info */}
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-4">
                    {occupation && (
                      <div className="flex items-center gap-2 text-sm bg-muted/50 rounded-lg px-3 py-2">
                        <Briefcase className="h-4 w-4 text-primary shrink-0" strokeWidth={1.5} />
                        <div>
                          <p className="text-xs text-muted-foreground">Kazi</p>
                          <p className="font-medium text-foreground">{occupation}</p>
                        </div>
                      </div>
                    )}
                    {moveIn && (
                      <div className="flex items-center gap-2 text-sm bg-muted/50 rounded-lg px-3 py-2">
                        <CalendarDays className="h-4 w-4 text-primary shrink-0" strokeWidth={1.5} />
                        <div>
                          <p className="text-xs text-muted-foreground">Kuhamia</p>
                          <p className="font-medium text-foreground">{moveIn}</p>
                        </div>
                      </div>
                    )}
                    <div className="flex items-center gap-2 text-sm bg-muted/50 rounded-lg px-3 py-2">
                      <User className="h-4 w-4 text-primary shrink-0" strokeWidth={1.5} />
                      <div>
                        <p className="text-xs text-muted-foreground">Barua pepe</p>
                        <p className="font-medium text-foreground text-xs">{a.tenant_email || "—"}</p>
                      </div>
                    </div>
                  </div>

                  {/* Personal message */}
                  {personalMsg && (
                    <div className="bg-muted/30 border border-border rounded-lg p-3 mb-4">
                      <p className="text-xs text-muted-foreground mb-1">Ujumbe:</p>
                      <p className="text-sm text-foreground">{personalMsg}</p>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex flex-wrap gap-2">
                    <Button size="sm" variant="outline" onClick={() => openProfile(String(a.id))} className="gap-1.5">
                      <Eye className="h-3.5 w-3.5" />
                      Wasifu
                    </Button>

                    {status === "pending" && (
                      <>
                        <Button
                          size="sm"
                          className="font-semibold gap-1.5"
                          disabled={mutation.isPending}
                          onClick={() => mutation.mutate({ id: String(a.id), action: "approved" })}
                        >
                          <Check className="h-3.5 w-3.5" />
                          Kubali & Fungua Chat
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-destructive gap-1.5"
                          onClick={() => openDecline(String(a.id))}
                        >
                          <X className="h-3.5 w-3.5" />
                          Kataa
                        </Button>
                      </>
                    )}

                    {status === "approved" && (
                      <Button
                        size="sm"
                        variant="outline"
                        className="gap-1.5"
                        disabled={openChatMutation.isPending}
                        onClick={() => openChatMutation.mutate(String(a.id))}
                      >
                        <MessageSquare className="h-3.5 w-3.5" />
                        {openChatMutation.isPending ? "Inafungua…" : "Fungua Mazungumzo"}
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })
        ) : (
          <p className="text-muted-foreground text-sm py-8 text-center">Hakuna maombi kwa sasa</p>
        )}
      </div>

      {/* Decline dialog */}
      <Dialog open={declineOpen} onOpenChange={setDeclineOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Kataa Ombi</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Mpangaji ataarifiwa kwa upole kuhusu uamuzi wako. Tafadhali andika sababu fupi.
            </p>
            <div className="space-y-2">
              <Label>Sababu (hiari lakini inashauriwa)</Label>
              <Textarea
                placeholder="Mfano: Nyumba imeshachukuliwa, au mahitaji hayakufikia vigezo."
                value={declineReason}
                onChange={(e) => setDeclineReason(e.target.value)}
                rows={3}
              />
            </div>
            <div className="flex gap-3">
              <Button variant="outline" className="flex-1" onClick={() => setDeclineOpen(false)}>
                Ghairi
              </Button>
              <Button
                variant="destructive"
                className="flex-1"
                disabled={mutation.isPending}
                onClick={() => {
                  if (declineAppId) {
                    mutation.mutate({ id: declineAppId, action: "rejected" });
                  }
                }}
              >
                {mutation.isPending ? "Inakataa…" : "Kataa Ombi"}
              </Button>
            </div>
            <p className="text-xs text-muted-foreground text-center">
              Mpangaji atapata arifa kwa SMS na kwenye jukwaa.
            </p>
          </div>
        </DialogContent>
      </Dialog>

      {/* Tenant profile dialog */}
      <Dialog open={profileOpen} onOpenChange={setProfileOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Wasifu wa Mpangaji</DialogTitle>
          </DialogHeader>
          {profileLoading ? (
            <div className="space-y-3">
              <Skeleton className="h-5 w-2/3" />
              <Skeleton className="h-5 w-1/2" />
            </div>
          ) : tenantProfile ? (
            <div className="space-y-3">
              <div className="flex items-center gap-3 mb-4">
                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold">
                  {(tenantProfile.full_name || "?").split(" ").map((n: string) => n[0]).join("").slice(0, 2).toUpperCase()}
                </div>
                <div>
                  <p className="font-semibold text-foreground">{tenantProfile.full_name}</p>
                  <p className="text-sm text-muted-foreground">{tenantProfile.email}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="bg-muted/50 rounded-lg p-3">
                  <p className="text-xs text-muted-foreground">Jukumu</p>
                  <p className="font-medium">{tenantProfile.role}</p>
                </div>
                <div className="bg-muted/50 rounded-lg p-3">
                  <p className="text-xs text-muted-foreground">Alijiunga</p>
                  <p className="font-medium">{tenantProfile.created_at ? new Date(tenantProfile.created_at).toLocaleDateString("sw-TZ") : "—"}</p>
                </div>
              </div>
            </div>
          ) : (
            <p className="text-muted-foreground">Wasifu haupatikani.</p>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default LandlordApplications;
