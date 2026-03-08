import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useParams, Link } from "react-router-dom";
import { format } from "date-fns";
import { ArrowLeft, Bed, CalendarIcon, MapPin, Droplets, Zap, Wifi, Car, Check, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { VerificationBanner } from "@/components/VerificationBanner";
import { LandlordCard } from "@/components/LandlordCard";
import { StatusBadge } from "@/components/StatusBadge";

import { cn } from "@/lib/utils";
import { applications as applicationsApi, normalizePropertyImages, properties as propertiesApi, viewings as viewingsApi } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/i18n/LanguageContext";

// Inclusion icon component
function InclusionItem({ icon: Icon, label, included }: { icon: typeof Droplets; label: string; included: boolean }) {
  return (
    <div className="flex items-center gap-2">
      <div className={cn(
        "h-8 w-8 rounded flex items-center justify-center",
        included ? "bg-primary/10" : "bg-muted"
      )}>
        <Icon className={cn("h-4 w-4", included ? "text-primary" : "text-muted-foreground/40")} strokeWidth={1.5} />
      </div>
      <div>
        <p className="text-sm text-foreground">{label}</p>
        {included ? (
          <Check className="h-3 w-3 text-primary" strokeWidth={2} />
        ) : (
          <X className="h-3 w-3 text-muted-foreground/40" strokeWidth={2} />
        )}
      </div>
    </div>
  );
}

const PropertyDetails = () => {
  const { id } = useParams();
  const { t } = useLanguage();
  const [date, setDate] = useState<Date>();
  const [timeWindow, setTimeWindow] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [currentImage, setCurrentImage] = useState(0);
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
      return applicationsApi.create({ property: String(id), message: "" });
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["my-applications"] });
      toast({ title: t("propertyDetails.applicationSent") });
    },
    onError: async (err: any) => {
      const msg = String(err?.message || "Failed");
      if (msg.toLowerCase().includes("already")) {
        await queryClient.invalidateQueries({ queryKey: ["my-applications"] });
      }
      toast({ title: msg, variant: "destructive" });
    },
  });

  const viewingMutation = useMutation({
    mutationFn: (data: { application: string; date: string; time_window: string }) => viewingsApi.create(data),
    onSuccess: () => {
      toast({ title: t("propertyDetails.viewingSent") });
      setDialogOpen(false);
      setDate(undefined);
      setTimeWindow("");
    },
    onError: (err: any) => toast({ title: err.message || "Failed", variant: "destructive" }),
  });

  const handleRequestViewing = () => {
    if (!date || !timeWindow) {
      toast({ title: "Tafadhali chagua tarehe na muda", variant: "destructive" });
      return;
    }
    viewingMutation.mutate({
      application: String(myApplication.id),
      date: format(date, "yyyy-MM-dd"),
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
        {/* Image counter */}
        <div className="absolute top-4 right-4 bg-foreground/80 text-background text-xs px-2 py-1 rounded">
          {currentImage + 1}/{images.length}
        </div>
        {/* Thumbnail nav */}
        {images.length > 1 && (
          <div className="flex gap-2 mt-2 overflow-x-auto">
            {images.slice(0, 6).map((img, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentImage(idx)}
                className={cn(
                  "h-16 w-20 rounded overflow-hidden border-2 shrink-0",
                  currentImage === idx ? "border-primary" : "border-transparent"
                )}
              >
                <img src={img} alt="" className="h-full w-full object-cover" />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Verified banner */}
      {isVerified && (
        <div className="mb-6">
          <VerificationBanner />
        </div>
      )}

      <div className="grid md:grid-cols-3 gap-8">
        {/* Main content */}
        <div className="md:col-span-2 space-y-8">
          {/* Title & Price */}
          <div>
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

          {/* Inclusions grid */}
          <div>
            <h2 className="font-semibold text-foreground mb-4">Vifaa Vilivyojumuishwa</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
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

          {/* House Rules */}
          {houseRules.length > 0 && (
            <div>
              <h2 className="font-semibold text-foreground mb-3">{t("propertyDetails.houseRules")}</h2>
              <ul className="space-y-2 text-sm text-muted-foreground">
                {houseRules.map((r: string, idx: number) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="text-primary">•</span>
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
          <LandlordCard 
            name={property.owner_name || "Mmiliki"} 
            responseRate={94}
            memberSince="2024"
          />

          {/* Apply button */}
          {user?.role === "tenant" && !hasApplied && (
            <Button 
              className="w-full h-12 rounded bg-primary text-primary-foreground hover:bg-primary/90 font-semibold" 
              onClick={() => applyMutation.mutate()} 
              disabled={applyMutation.isPending}
            >
              {applyMutation.isPending ? "Inawasilisha..." : "Omba Kukodisha"}
            </Button>
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
                <p className="text-xs text-muted-foreground">Limekubaliwa! Sasa unaweza kuomba kuona.</p>
              )}
            </div>
          )}

          {/* Request viewing */}
          {user?.role === "tenant" && canRequestViewing && (
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button className="w-full h-12 rounded bg-primary text-primary-foreground hover:bg-primary/90 font-semibold">
                  Omba Kuona
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
                        <Button variant="outline" className={cn("w-full justify-start text-left font-normal rounded", !date && "text-muted-foreground")}>
                          <CalendarIcon className="mr-2 h-4 w-4" strokeWidth={1.5} />
                          {date ? format(date, "PPP") : "Chagua tarehe"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar mode="single" selected={date} onSelect={setDate} initialFocus disabled={(d) => d < new Date()} />
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
            onClick={() => canRequestViewing ? setDialogOpen(true) : applyMutation.mutate()}
            disabled={applyMutation.isPending}
          >
            {hasApplied ? (canRequestViewing ? "Omba Kuona" : "Inasubiri") : "Omba Kukodisha"}
          </Button>
        </div>
      )}
    </div>
  );
};

export default PropertyDetails;
