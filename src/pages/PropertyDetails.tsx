import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useParams, Link } from "react-router-dom";
import { format } from "date-fns";
import { ArrowLeft, Bed, CalendarIcon, MapPin, Droplets, Zap, Wifi, Car, Check, X, Shield, Clock, MessageSquare } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { StatusBadge } from "@/components/StatusBadge";

import { cn } from "@/lib/utils";
import { applications as applicationsApi, normalizePropertyImages, properties as propertiesApi, viewings as viewingsApi } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/i18n/LanguageContext";

function InclusionItem({ icon: Icon, label, included }: { icon: typeof Droplets; label: string; included: boolean }) {
  return (
    <div className={cn(
      "flex items-center gap-2.5 px-3 py-2 rounded-lg border",
      included ? "border-primary/20 bg-primary/5" : "border-border bg-muted/30"
    )}>
      <Icon className={cn("h-4 w-4", included ? "text-primary" : "text-muted-foreground/40")} strokeWidth={1.5} />
      <span className={cn("text-sm", included ? "text-foreground" : "text-muted-foreground/60")}>{label}</span>
      {included ? (
        <Check className="h-3.5 w-3.5 text-primary ml-auto" strokeWidth={2} />
      ) : (
        <X className="h-3.5 w-3.5 text-muted-foreground/30 ml-auto" strokeWidth={2} />
      )}
    </div>
  );
}

const PROPERTY_TYPE_LABELS: Record<string, string> = {
  bedsitter: "Bedsitter",
  "1bedroom": "Chumba 1",
  "2bedroom": "Vyumba 2",
  "3bedroom": "Vyumba 3",
  studio: "Studio",
  house: "Nyumba Kamili",
  room: "Chumba Kimoja",
  apartment: "Apartment",
};

const PropertyDetails = () => {
  const { id } = useParams();
  const { t } = useLanguage();
  const [currentImage, setCurrentImage] = useState(0);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [applyDialogOpen, setApplyDialogOpen] = useState(false);
  
  // Application form state
  const [applyMessage, setApplyMessage] = useState("");
  const [applyOccupation, setApplyOccupation] = useState("");
  const [applyMoveIn, setApplyMoveIn] = useState<Date>();

  // Viewing form state
  const [viewDate, setViewDate] = useState<Date>();
  const [timeWindow, setTimeWindow] = useState("");

  const { toast } = useToast();
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: property, isLoading } = useQuery({
    queryKey: ["property", id],
    queryFn: () => propertiesApi.get(id!),
    enabled: !!id,
  });

  const { data: applicationsData } = useQuery({
    queryKey: ["my-applications"],
    queryFn: () => applicationsApi.list(),
    enabled: !!user && user.role === "tenant",
  });

  const applications = applicationsData || [];
  const myApplication = applications.find((app: any) => String(app.property) === String(id));
  const appStatus = String(myApplication?.status || "").toLowerCase();
  const canRequestViewing = appStatus === "approved";
  const hasApplied = !!myApplication;

  const applyMutation = useMutation({
    mutationFn: () => {
      if (!id) throw new Error("Property ID missing");
      return applicationsApi.create({
        property: String(id),
        message: [
          applyMessage,
          applyOccupation ? `Kazi: ${applyOccupation}` : "",
          applyMoveIn ? `Tarehe ya kuhamia: ${format(applyMoveIn, "dd/MM/yyyy")}` : "",
        ].filter(Boolean).join("\n"),
      });
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["my-applications"] });
      toast({ title: "Ombi limewasilishwa! Mmiliki ataarifiwa." });
      setApplyDialogOpen(false);
      setApplyMessage("");
      setApplyOccupation("");
      setApplyMoveIn(undefined);
    },
    onError: (err: any) => {
      const msg = String(err?.message || "Failed");
      if (msg.toLowerCase().includes("already")) {
        queryClient.invalidateQueries({ queryKey: ["my-applications"] });
      }
      toast({ title: msg, variant: "destructive" });
    },
  });

  const viewingMutation = useMutation({
    mutationFn: (data: { application: string; date: string; time_window: string }) => viewingsApi.create(data),
    onSuccess: () => {
      toast({ title: t("propertyDetails.viewingSent") });
      setDialogOpen(false);
      setViewDate(undefined);
      setTimeWindow("");
    },
    onError: (err: any) => toast({ title: err.message || "Failed", variant: "destructive" }),
  });

  const handleRequestViewing = () => {
    if (!viewDate || !timeWindow) {
      toast({ title: "Tafadhali chagua tarehe na muda", variant: "destructive" });
      return;
    }
    viewingMutation.mutate({
      application: String(myApplication.id),
      date: format(viewDate, "yyyy-MM-dd"),
      time_window: timeWindow,
    });
  };

  if (isLoading) {
    return (
      <div className="container py-8 max-w-4xl space-y-6">
        <Skeleton className="h-8 w-32" />
        <Skeleton className="h-80 w-full rounded-lg" />
        <Skeleton className="h-40 w-full" />
      </div>
    );
  }

  if (!property) {
    return (
      <div className="container py-16 text-center">
        <p className="text-muted-foreground mb-4">{t("propertyDetails.notFound")}</p>
        <Button variant="outline" asChild className="rounded">
          <Link to="/properties">{t("propertyDetails.back")}</Link>
        </Button>
      </div>
    );
  }

  const images = normalizePropertyImages(property.images);
  const amenities = Array.isArray(property.features) ? property.features.map((f: any) => f.name) : property.amenities || [];
  const amenitiesLower = amenities.map((a: string) => a.toLowerCase());
  const houseRules = property.house_rules || property.houseRules || [];
  const isVerified = property.verification_status === "verified";
  const propertyTypeLabel = PROPERTY_TYPE_LABELS[property.property_type] || property.property_type;

  const hasWater = amenitiesLower.some((a: string) => a.includes("maji") || a.includes("water"));
  const hasElectric = amenitiesLower.some((a: string) => a.includes("umeme") || a.includes("electric") || a.includes("generator"));
  const hasWifi = amenitiesLower.some((a: string) => a.includes("wifi") || a.includes("internet"));
  const hasParking = amenitiesLower.some((a: string) => a.includes("parking") || a.includes("gari"));

  return (
    <div className="container py-8 max-w-5xl">
      {/* Back link */}
      <Button variant="ghost" size="sm" asChild className="mb-4 -ml-2 text-muted-foreground hover:text-foreground">
        <Link to="/properties">
          <ArrowLeft className="h-4 w-4 mr-1" strokeWidth={1.5} />
          Orodha
        </Link>
      </Button>

      {/* Photo gallery */}
      <div className="relative mb-6">
        <div className="aspect-[16/9] md:aspect-[2/1] bg-muted rounded-lg overflow-hidden">
          <img src={images[currentImage]} alt={property.title} className="h-full w-full object-cover" />
        </div>
        <div className="absolute top-4 right-4 bg-foreground/80 text-background text-xs px-2 py-1 rounded">
          {currentImage + 1}/{images.length}
        </div>
        {isVerified && (
          <div className="absolute top-4 left-4 flex items-center gap-1.5 bg-accent/90 text-accent-foreground text-xs font-semibold px-3 py-1.5 rounded">
            <Shield className="h-3.5 w-3.5" strokeWidth={1.5} />
            Imethibitishwa
          </div>
        )}
        {images.length > 1 && (
          <div className="flex gap-2 mt-2 overflow-x-auto pb-1">
            {images.map((img, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentImage(idx)}
                className={cn(
                  "h-16 w-20 rounded overflow-hidden border-2 shrink-0 transition-all",
                  currentImage === idx ? "border-primary ring-1 ring-primary" : "border-transparent opacity-70 hover:opacity-100"
                )}
              >
                <img src={img} alt="" className="h-full w-full object-cover" />
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="grid md:grid-cols-3 gap-8">
        {/* Main content */}
        <div className="md:col-span-2 space-y-8">
          {/* Title, type, price */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Badge variant="secondary" className="text-xs">{propertyTypeLabel}</Badge>
              {property.available_from && (
                <Badge variant="outline" className="text-xs gap-1">
                  <Clock className="h-3 w-3" />
                  Kuanzia {format(new Date(property.available_from), "dd MMM yyyy")}
                </Badge>
              )}
            </div>
            <h1 className="text-2xl md:text-3xl font-bold text-foreground">{property.title}</h1>
            <p className="flex items-center gap-2 mt-2 text-muted-foreground">
              <MapPin className="h-4 w-4" strokeWidth={1.5} />
              {property.location}
            </p>
            <p className="text-3xl font-bold text-primary mt-4">
              TZS {Number(property.price).toLocaleString()}
              <span className="text-base font-normal text-muted-foreground"> / mwezi</span>
            </p>
          </div>

          {/* What's included */}
          <div>
            <h2 className="font-semibold text-foreground mb-4">Vilivyojumuishwa kwenye Kodi</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <InclusionItem icon={Droplets} label="Maji" included={hasWater} />
              <InclusionItem icon={Zap} label="Umeme" included={hasElectric} />
              <InclusionItem icon={Wifi} label="WiFi" included={hasWifi} />
              <InclusionItem icon={Car} label="Parking" included={hasParking} />
            </div>
          </div>

          {/* Description */}
          <div>
            <h2 className="font-semibold text-foreground mb-3">{t("propertyDetails.description")}</h2>
            <p className="text-muted-foreground leading-relaxed">{property.description}</p>
          </div>

          {/* Location map placeholder */}
          <div>
            <h2 className="font-semibold text-foreground mb-3">Eneo</h2>
            <div className="aspect-[2/1] bg-muted/50 border border-border rounded-lg flex items-center justify-center">
              <div className="text-center">
                <MapPin className="h-8 w-8 text-primary mx-auto mb-2" strokeWidth={1.5} />
                <p className="text-sm font-medium text-foreground">{property.location}</p>
                <p className="text-xs text-muted-foreground mt-1">Ramani itapatikana hivi karibuni</p>
              </div>
            </div>
          </div>

          {/* House Rules */}
          {houseRules.length > 0 && (
            <div>
              <h2 className="font-semibold text-foreground mb-3">{t("propertyDetails.houseRules")}</h2>
              <ul className="space-y-2 text-sm text-muted-foreground">
                {houseRules.map((r: string, idx: number) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="text-primary mt-0.5">•</span>
                    {r}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Landlord card */}
          <div className="bg-card border border-border rounded-lg p-4 space-y-4">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded bg-primary/10 flex items-center justify-center text-primary font-semibold">
                {(property.owner_name || "M").split(" ").map((n: string) => n[0]).join("").slice(0, 2).toUpperCase()}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <p className="font-semibold text-foreground">{property.owner_name || "Mmiliki"}</p>
                  {isVerified && <Shield className="h-4 w-4 text-accent" strokeWidth={1.5} />}
                </div>
                <p className="text-xs text-muted-foreground flex items-center gap-1">
                  <MessageSquare className="h-3 w-3" />
                  Jibu: 94% ya maombi
                </p>
                <p className="text-xs text-muted-foreground flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  Wastani: ndani ya saa 2
                </p>
              </div>
            </div>
            {property.contact_preference && (
              <p className="text-xs text-muted-foreground bg-muted/50 rounded px-2 py-1.5 text-center">
                Mawasiliano: {property.contact_preference === "call" ? "Simu" : property.contact_preference === "chat" ? "Ujumbe" : "Simu na Ujumbe"}
              </p>
            )}
          </div>

          {/* Apply button — opens dialog with details */}
          {user?.role === "tenant" && !hasApplied && (
            <Dialog open={applyDialogOpen} onOpenChange={setApplyDialogOpen}>
              <DialogTrigger asChild>
                <Button className="w-full h-12 rounded bg-primary text-primary-foreground hover:bg-primary/90 font-semibold">
                  Omba Kukodisha
                </Button>
              </DialogTrigger>
              <DialogContent className="rounded-lg">
                <DialogHeader>
                  <DialogTitle>Omba Kukodisha</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 pt-2">
                  <div className="space-y-2">
                    <Label>Jina lako</Label>
                    <Input value={user?.fullName || ""} disabled className="rounded bg-muted" />
                  </div>
                  <div className="space-y-2">
                    <Label>Kazi / Shughuli *</Label>
                    <Input
                      placeholder="Mfano: Mhandisi, Mfanyabiashara, Mwanafunzi"
                      value={applyOccupation}
                      onChange={(e) => setApplyOccupation(e.target.value)}
                      className="rounded"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Tarehe ya Kuhamia</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="outline" className={cn("w-full justify-start text-left font-normal rounded", !applyMoveIn && "text-muted-foreground")}>
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {applyMoveIn ? format(applyMoveIn, "dd MMM yyyy") : "Chagua tarehe…"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={applyMoveIn}
                          onSelect={setApplyMoveIn}
                          disabled={(d) => d < new Date()}
                          initialFocus
                          className={cn("p-3 pointer-events-auto")}
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                  <div className="space-y-2">
                    <Label>Ujumbe kwa Mmiliki</Label>
                    <Textarea
                      placeholder="Jiandikishe kwa ufupi — kwa nini nyumba hii inakufaa?"
                      value={applyMessage}
                      onChange={(e) => setApplyMessage(e.target.value)}
                      rows={3}
                      className="rounded"
                    />
                  </div>
                  <Button
                    className="w-full h-12 rounded font-semibold"
                    onClick={() => {
                      if (!applyOccupation.trim()) {
                        toast({ title: "Tafadhali andika kazi/shughuli yako", variant: "destructive" });
                        return;
                      }
                      applyMutation.mutate();
                    }}
                    disabled={applyMutation.isPending}
                  >
                    {applyMutation.isPending ? "Inawasilisha..." : "Wasilisha Ombi"}
                  </Button>
                  <p className="text-xs text-muted-foreground text-center">
                    Mmiliki ataarifiwa kwa SMS na kwenye jukwaa.
                  </p>
                </div>
              </DialogContent>
            </Dialog>
          )}

          {/* Application status */}
          {user?.role === "tenant" && hasApplied && (
            <div className="bg-card border border-border rounded-lg p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Hali ya Ombi:</span>
                <StatusBadge status={appStatus} />
              </div>
              {appStatus === "pending" && (
                <p className="text-xs text-muted-foreground">Linasubiri kukaguliwa na mmiliki.</p>
              )}
              {appStatus === "approved" && (
                <p className="text-xs text-muted-foreground">Limekubaliwa! Sasa unaweza kuomba kuona nyumba.</p>
              )}
            </div>
          )}

          {/* Request viewing */}
          {user?.role === "tenant" && canRequestViewing && (
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button className="w-full h-12 rounded bg-accent text-accent-foreground hover:bg-accent/90 font-semibold">
                  Omba Kuona Nyumba
                </Button>
              </DialogTrigger>
              <DialogContent className="rounded-lg">
                <DialogHeader>
                  <DialogTitle>Panga Kuona Nyumba</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 pt-2">
                  <div className="space-y-2">
                    <Label>Tarehe</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="outline" className={cn("w-full justify-start text-left font-normal rounded", !viewDate && "text-muted-foreground")}>
                          <CalendarIcon className="mr-2 h-4 w-4" strokeWidth={1.5} />
                          {viewDate ? format(viewDate, "PPP") : "Chagua tarehe"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar mode="single" selected={viewDate} onSelect={setViewDate} initialFocus disabled={(d) => d < new Date()} className={cn("p-3 pointer-events-auto")} />
                      </PopoverContent>
                    </Popover>
                  </div>
                  <div className="space-y-2">
                    <Label>Muda</Label>
                    <Select value={timeWindow} onValueChange={setTimeWindow}>
                      <SelectTrigger className="rounded"><SelectValue placeholder="Chagua muda" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="morning">Asubuhi (8AM-12PM)</SelectItem>
                        <SelectItem value="afternoon">Mchana (12PM-4PM)</SelectItem>
                        <SelectItem value="evening">Jioni (4PM-7PM)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <Button className="w-full rounded font-semibold" onClick={handleRequestViewing} disabled={viewingMutation.isPending}>
                    {viewingMutation.isPending ? "Inawasilisha..." : "Wasilisha Ombi"}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          )}

          {/* Login prompt */}
          {!user && (
            <Button className="w-full h-12 rounded bg-primary text-primary-foreground hover:bg-primary/90 font-semibold" asChild>
              <Link to="/login">Ingia ili Kuomba</Link>
            </Button>
          )}
        </div>
      </div>

      {/* Sticky bottom bar on mobile */}
      {user?.role === "tenant" && (
        <div className="fixed bottom-0 left-0 right-0 md:hidden bg-card border-t border-border p-4 flex items-center gap-4 z-50">
          <div>
            <p className="text-lg font-bold text-primary">TZS {Number(property.price).toLocaleString()}</p>
            <p className="text-xs text-muted-foreground">/ mwezi</p>
          </div>
          <Button
            className="flex-1 h-12 rounded bg-primary text-primary-foreground font-semibold"
            onClick={() => canRequestViewing ? setDialogOpen(true) : !hasApplied ? setApplyDialogOpen(true) : undefined}
            disabled={hasApplied && !canRequestViewing}
          >
            {hasApplied ? (canRequestViewing ? "Omba Kuona" : "Inasubiri") : "Omba Kukodisha"}
          </Button>
        </div>
      )}
    </div>
  );
};

export default PropertyDetails;
