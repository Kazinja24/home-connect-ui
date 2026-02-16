import { useParams, Link } from "react-router-dom";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { CalendarIcon, MapPin, Bed, ArrowLeft, User, Shield, CheckCircle, Clock, XCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/i18n/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import { properties as propertiesApi, viewings as viewingsApi, applications as appApi } from "@/lib/api";

const PropertyDetails = () => {
  const { id } = useParams();
  const { t } = useLanguage();
  const { user, isAuthenticated } = useAuth();
  const queryClient = useQueryClient();

  // Application form state
  const [applyOpen, setApplyOpen] = useState(false);
  const [employment, setEmployment] = useState("");
  const [lengthOfStay, setLengthOfStay] = useState("");
  const [occupants, setOccupants] = useState("");

  // Viewing form state
  const [viewingOpen, setViewingOpen] = useState(false);
  const [date, setDate] = useState<Date>();
  const [timeWindow, setTimeWindow] = useState("");
  const { toast } = useToast();

  const { data: property, isLoading } = useQuery({
    queryKey: ["property", id],
    queryFn: () => propertiesApi.get(id!),
    enabled: !!id,
  });

  // Check tenant's application status for this property
  const { data: myApplications } = useQuery({
    queryKey: ["my-applications-for-property", id],
    queryFn: () => appApi.checkForProperty(id!),
    enabled: !!id && isAuthenticated && user?.role === "tenant",
  });

  const myApp = myApplications?.find((a: any) => String(a.property) === id || String(a.propertyId) === id);
  const appStatus = myApp?.status; // undefined | "pending" | "approved" | "rejected"

  const applyMutation = useMutation({
    mutationFn: (data: any) => appApi.create(data),
    onSuccess: () => {
      toast({ title: t("propertyDetails.applicationSent") });
      setApplyOpen(false);
      setEmployment("");
      setLengthOfStay("");
      setOccupants("");
      queryClient.invalidateQueries({ queryKey: ["my-applications-for-property", id] });
    },
    onError: (err: any) => toast({ title: err.message, variant: "destructive" }),
  });

  const viewingMutation = useMutation({
    mutationFn: (data: { property: string; date: string; time_window: string }) => viewingsApi.create(data),
    onSuccess: () => {
      toast({ title: t("propertyDetails.viewingSent") });
      setViewingOpen(false);
      setDate(undefined);
      setTimeWindow("");
    },
    onError: (err: any) => toast({ title: err.message, variant: "destructive" }),
  });

  const handleApply = () => {
    if (!employment || !lengthOfStay || !occupants) {
      toast({ title: t("login.fillAll"), variant: "destructive" });
      return;
    }
    applyMutation.mutate({
      property: id,
      employment_status: employment,
      length_of_stay: lengthOfStay,
      occupants: Number(occupants),
    });
  };

  const handleRequestViewing = () => {
    if (!date || !timeWindow) {
      toast({ title: t("login.fillAll"), variant: "destructive" });
      return;
    }
    viewingMutation.mutate({
      property: id!,
      date: format(date, "yyyy-MM-dd"),
      time_window: timeWindow,
    });
  };

  if (isLoading) {
    return (
      <div className="container py-10 max-w-4xl space-y-6">
        <Skeleton className="h-8 w-32" />
        <Skeleton className="h-64 w-full rounded-2xl" />
        <Skeleton className="h-40 w-full" />
      </div>
    );
  }

  if (!property) {
    return (
      <div className="container py-10 text-center">
        <p className="text-muted-foreground">{t("propertyDetails.notFound")}</p>
        <Button variant="link" asChild><Link to="/properties">{t("propertyDetails.back")}</Link></Button>
      </div>
    );
  }

  const images = property.images?.length ? property.images : ["/placeholder.svg"];
  const amenities = property.amenities || [];
  const houseRules = property.house_rules || property.houseRules || [];
  const isTenant = isAuthenticated && user?.role === "tenant";

  return (
    <div className="container py-10 max-w-4xl animate-slide-up">
      <Button variant="ghost" size="sm" asChild className="mb-4">
        <Link to="/properties"><ArrowLeft className="h-4 w-4 mr-1" />{t("propertyDetails.back")}</Link>
      </Button>

      {/* Gallery */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-2 mb-8 rounded-2xl overflow-hidden shadow-lg">
        <div className="md:col-span-2 aspect-[16/10] bg-muted">
          <img src={images[0]} alt={property.title} className="h-full w-full object-cover" />
        </div>
        <div className="hidden md:grid grid-rows-2 gap-2">
          {images.slice(1, 3).map((img: string, i: number) => (
            <div key={i} className="bg-muted">
              <img src={img} alt="" className="h-full w-full object-cover" />
            </div>
          ))}
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-8">
        <div className="md:col-span-2 space-y-8">
          <div>
            <h1 className="text-3xl font-extrabold text-foreground">{property.title}</h1>
            <div className="flex items-center gap-3 mt-3 text-muted-foreground text-sm">
              <span className="flex items-center gap-1"><MapPin className="h-4 w-4" />{property.location}</span>
              <span className="flex items-center gap-1"><Bed className="h-4 w-4" />{property.bedrooms} {t("propertyDetails.bedroomCount")}</span>
            </div>
            <p className="text-3xl font-extrabold text-primary mt-4">TZS {Number(property.price).toLocaleString()}<span className="text-sm font-normal text-muted-foreground">{t("landing.perMonth")}</span></p>
          </div>

          <div>
            <h2 className="font-bold text-foreground mb-3 text-lg">{t("propertyDetails.description")}</h2>
            <p className="text-muted-foreground leading-relaxed">{property.description}</p>
          </div>

          {amenities.length > 0 && (
            <div>
              <h2 className="font-bold text-foreground mb-3 text-lg">{t("propertyDetails.amenities")}</h2>
              <div className="flex flex-wrap gap-2">
                {amenities.map((a: string) => (
                  <Badge key={a} variant="secondary" className="px-3 py-1">{a}</Badge>
                ))}
              </div>
            </div>
          )}

          {houseRules.length > 0 && (
            <div>
              <h2 className="font-bold text-foreground mb-3 text-lg">{t("propertyDetails.houseRules")}</h2>
              <ul className="space-y-2 text-sm text-muted-foreground">
                {houseRules.map((r: string) => (
                  <li key={r} className="flex items-center gap-2"><Shield className="h-3.5 w-3.5 text-primary" />{r}</li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          <Card className="glass-strong">
            <CardContent className="p-5 space-y-3">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-primary/15 to-primary/5 flex items-center justify-center">
                  <User className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="font-semibold text-sm text-foreground">{property.owner_name || t("propertyDetails.owner")}</p>
                  <p className="text-xs text-muted-foreground">{property.owner_phone || ""}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Application status indicator */}
          {isTenant && appStatus === "pending" && (
            <Card className="border-warning/30 bg-warning/5">
              <CardContent className="p-4 flex items-center gap-3">
                <Clock className="h-5 w-5 text-warning" />
                <p className="text-sm font-medium text-warning">{t("propertyDetails.applicationPending")}</p>
              </CardContent>
            </Card>
          )}

          {isTenant && appStatus === "approved" && (
            <Card className="border-success/30 bg-success/5">
              <CardContent className="p-4 flex items-center gap-3">
                <CheckCircle className="h-5 w-5 text-success" />
                <p className="text-sm font-medium text-success">{t("propertyDetails.applicationApproved")}</p>
              </CardContent>
            </Card>
          )}

          {isTenant && appStatus === "rejected" && (
            <Card className="border-destructive/30 bg-destructive/5">
              <CardContent className="p-4 flex items-center gap-3">
                <XCircle className="h-5 w-5 text-destructive" />
                <p className="text-sm font-medium text-destructive">{t("status.rejected")}</p>
              </CardContent>
            </Card>
          )}

          {/* STEP 1: Apply button (only if no application yet) */}
          {isTenant && !appStatus && (
            <Dialog open={applyOpen} onOpenChange={setApplyOpen}>
              <DialogTrigger asChild>
                <Button className="w-full h-12 text-base font-semibold shadow-lg animate-pulse-glow" size="lg">
                  {t("propertyDetails.apply")}
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>{t("propertyDetails.applyTitle")}</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 pt-2">
                  <div className="space-y-2">
                    <Label>{t("propertyDetails.employment")}</Label>
                    <Input placeholder={t("propertyDetails.employmentPlaceholder")} value={employment} onChange={(e) => setEmployment(e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label>{t("propertyDetails.lengthOfStay")}</Label>
                    <Input placeholder={t("propertyDetails.stayPlaceholder")} value={lengthOfStay} onChange={(e) => setLengthOfStay(e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label>{t("propertyDetails.occupants")}</Label>
                    <Input type="number" placeholder={t("propertyDetails.occupantsPlaceholder")} value={occupants} onChange={(e) => setOccupants(e.target.value)} />
                  </div>
                  <Button className="w-full font-semibold" onClick={handleApply} disabled={applyMutation.isPending}>
                    {applyMutation.isPending ? t("propertyDetails.submitting") : t("propertyDetails.submitApplication")}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          )}

          {/* STEP 2: Request viewing (only if application approved) */}
          {isTenant && appStatus === "approved" && (
            <Dialog open={viewingOpen} onOpenChange={setViewingOpen}>
              <DialogTrigger asChild>
                <Button className="w-full h-12 text-base font-semibold shadow-lg" size="lg" variant="outline">
                  {t("propertyDetails.requestViewing")}
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>{t("propertyDetails.requestViewingTitle")}</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 pt-2">
                  <div className="space-y-2">
                    <Label>{t("propertyDetails.selectDate")}</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="outline" className={cn("w-full justify-start text-left font-normal", !date && "text-muted-foreground")}>
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {date ? format(date, "PPP") : t("propertyDetails.selectDate")}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar mode="single" selected={date} onSelect={setDate} initialFocus className="p-3 pointer-events-auto" disabled={(d) => d < new Date()} />
                      </PopoverContent>
                    </Popover>
                  </div>
                  <div className="space-y-2">
                    <Label>{t("propertyDetails.selectTime")}</Label>
                    <Select value={timeWindow} onValueChange={setTimeWindow}>
                      <SelectTrigger><SelectValue placeholder={t("propertyDetails.selectTime")} /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="morning">{t("propertyDetails.morning")}</SelectItem>
                        <SelectItem value="afternoon">{t("propertyDetails.afternoon")}</SelectItem>
                        <SelectItem value="evening">{t("propertyDetails.evening")}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <Button className="w-full font-semibold" onClick={handleRequestViewing} disabled={viewingMutation.isPending}>
                    {viewingMutation.isPending ? t("propertyDetails.submitting") : t("propertyDetails.submitViewing")}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          )}

          {/* Not logged in or landlord */}
          {!isTenant && (
            <Button className="w-full h-12 text-base font-semibold shadow-lg" size="lg" asChild>
              <Link to="/login">{t("nav.login")}</Link>
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default PropertyDetails;
