import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useParams, Link } from "react-router-dom";
import { format } from "date-fns";
import { ArrowLeft, Bed, CalendarIcon, MapPin, Shield, User } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";

import { cn } from "@/lib/utils";
import { applications as applicationsApi, normalizePropertyImages, properties as propertiesApi, viewings as viewingsApi } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/i18n/LanguageContext";

const PropertyDetails = () => {
  const { id } = useParams();
  const { t } = useLanguage();
  const [date, setDate] = useState<Date>();
  const [timeWindow, setTimeWindow] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: property, isLoading } = useQuery({
    queryKey: ["property", id],
    queryFn: () => propertiesApi.get(id!),
    enabled: !!id,
  });

  const { data: applications = [] } = useQuery({
    queryKey: ["my-applications"],
    queryFn: applicationsApi.list,
    enabled: !!user && user.role === "tenant",
  });

  const myApplication = applications.find((app) => String(app.property) === String(id));
  const canRequestViewing = myApplication?.status === "APPROVED";

  const applyMutation = useMutation({
    mutationFn: () => {
      if (!id) throw new Error("Property ID missing");
      return applicationsApi.create({ property: String(id), message: "" });
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["my-applications"] });
      toast({ title: t("propertyDetails.applicationSent") || "Ombi la nyumba limewasilishwa." });
    },
    onError: async (err: any) => {
      const msg = String(err?.message || "Imeshindikana");
      if (msg.toLowerCase().includes("already") || msg.toLowerCase().includes("active application")) {
        await queryClient.invalidateQueries({ queryKey: ["my-applications"] });
        toast({ title: t("propertyDetails.applicationPending") || "Umeshatuma ombi la nyumba hii tayari.", variant: "destructive" });
        return;
      }
      toast({ title: msg, variant: "destructive" });
    },
  });

  const viewingMutation = useMutation({
    mutationFn: (data: { property: string; date: string; time_window: string }) => viewingsApi.create(data),
    onSuccess: () => {
      toast({ title: t("propertyDetails.viewingSent") || "Ombi la kuona limewasilishwa!" });
      setDialogOpen(false);
      setDate(undefined);
      setTimeWindow("");
    },
    onError: (err: any) => toast({ title: err.message || "Imeshindikana", variant: "destructive" }),
  });

  const handleRequestViewing = () => {
    if (!date || !timeWindow) {
      toast({ title: t("login.fillAll") || "Tafadhali chagua tarehe na muda", variant: "destructive" });
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
        <p className="text-muted-foreground">{t("propertyDetails.notFound") || "Nyumba haipatikani"}</p>
        <Button variant="link" asChild><Link to="/properties">{t("propertyDetails.back") || "Rudi kwenye orodha"}</Link></Button>
      </div>
    );
  }

  const images = normalizePropertyImages(property.images);
  const amenities = property.amenities || [];
  const houseRules = property.house_rules || property.houseRules || [];

  return (
    <div className="container py-10 max-w-4xl animate-slide-up">
      <Button variant="ghost" size="sm" asChild className="mb-4">
        <Link to="/properties"><ArrowLeft className="h-4 w-4 mr-1" />{t("propertyDetails.back") || "Rudi kwenye orodha"}</Link>
      </Button>

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
              <span className="flex items-center gap-1"><Bed className="h-4 w-4" />{property.bedrooms || 0} {t("propertyDetails.bedroomCount") || "chumba cha kulala"}</span>
            </div>
            <p className="text-3xl font-extrabold text-primary mt-4">TZS {Number(property.price).toLocaleString()}<span className="text-sm font-normal text-muted-foreground">{t("landing.perMonth") || "/mwezi"}</span></p>
          </div>

          <div>
            <h2 className="font-bold text-foreground mb-3 text-lg">{t("propertyDetails.description") || "Maelezo"}</h2>
            <p className="text-muted-foreground leading-relaxed">{property.description}</p>
          </div>

          {amenities.length > 0 && (
            <div>
              <h2 className="font-bold text-foreground mb-3 text-lg">{t("propertyDetails.amenities") || "Vifaa"}</h2>
              <div className="flex flex-wrap gap-2">
                {amenities.map((a: string) => (
                  <Badge key={a} variant="secondary" className="px-3 py-1">{a}</Badge>
                ))}
              </div>
            </div>
          )}

          {houseRules.length > 0 && (
            <div>
              <h2 className="font-bold text-foreground mb-3 text-lg">{t("propertyDetails.houseRules") || "Sheria za Nyumba"}</h2>
              <ul className="space-y-2 text-sm text-muted-foreground">
                {houseRules.map((r: string) => (
                  <li key={r} className="flex items-center gap-2"><Shield className="h-3.5 w-3.5 text-primary" />{r}</li>
                ))}
              </ul>
            </div>
          )}
        </div>

        <div className="space-y-4">
          <Card className="glass-strong">
            <CardContent className="p-5 space-y-3">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-primary/15 to-primary/5 flex items-center justify-center">
                  <User className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="font-semibold text-sm text-foreground">{property.owner_name || t("propertyDetails.owner") || "Mmiliki"}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {user?.role === "tenant" && !myApplication && (
            <Button className="w-full h-12 text-base font-semibold" size="lg" onClick={() => applyMutation.mutate()} disabled={applyMutation.isPending}>
              {applyMutation.isPending ? (t("propertyDetails.submitting") || "Inawasilisha...") : (t("propertyDetails.apply") || "Omba Nyumba")}
            </Button>
          )}

          {user?.role === "tenant" && myApplication && (
            <Card>
              <CardContent className="p-4 text-sm">
                <p className="font-semibold">Hali ya ombi: {myApplication.status}</p>
                {myApplication.status === "PENDING" && <p className="text-muted-foreground mt-1">{t("propertyDetails.applicationPending") || "Subiri landlord akubali au akatae ombi."}</p>}
                {myApplication.status === "REJECTED" && <p className="text-muted-foreground mt-1">{t("status.rejected") || "Ombi lako lilikataliwa."}</p>}
              </CardContent>
            </Card>
          )}

          {user?.role === "tenant" && canRequestViewing && (
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button className="w-full h-12 text-base font-semibold shadow-lg" size="lg">{t("propertyDetails.requestViewing") || "Omba Kuona"}</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>{t("propertyDetails.requestViewingTitle") || "Panga Kuona Nyumba"}</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 pt-2">
                  <div className="space-y-2">
                    <Label>{t("propertyDetails.selectDate") || "Chagua Tarehe"}</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="outline" className={cn("w-full justify-start text-left font-normal", !date && "text-muted-foreground")}>
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {date ? format(date, "PPP") : (t("propertyDetails.selectDate") || "Chagua tarehe")}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar mode="single" selected={date} onSelect={setDate} initialFocus className="p-3 pointer-events-auto" disabled={(d) => d < new Date()} />
                      </PopoverContent>
                    </Popover>
                  </div>
                  <div className="space-y-2">
                    <Label>{t("propertyDetails.selectTime") || "Muda"}</Label>
                    <Select value={timeWindow} onValueChange={setTimeWindow}>
                      <SelectTrigger><SelectValue placeholder={t("propertyDetails.selectTime") || "Chagua muda"} /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="morning">{t("propertyDetails.morning") || "Asubuhi (8AM-12PM)"}</SelectItem>
                        <SelectItem value="afternoon">{t("propertyDetails.afternoon") || "Mchana (12PM-4PM)"}</SelectItem>
                        <SelectItem value="evening">{t("propertyDetails.evening") || "Jioni (4PM-7PM)"}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <Button className="w-full font-semibold" onClick={handleRequestViewing} disabled={viewingMutation.isPending}>
                    {viewingMutation.isPending ? (t("propertyDetails.submitting") || "Inawasilisha...") : (t("propertyDetails.submitViewing") || "Wasilisha Ombi")}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          )}
        </div>
      </div>
    </div>
  );
};

export default PropertyDetails;
