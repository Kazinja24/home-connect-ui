import { useParams, Link } from "react-router-dom";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { CalendarIcon, MapPin, Bed, ArrowLeft, User, Shield } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const mockProperty = {
  id: "1",
  title: "Studio ya Kisasa Masaki",
  description: "Studio nzuri ya kisasa iliyobuniwa katika eneo kuu la Masaki. Ina eneo la wazi la kuishi na vifaa vya ubora wa juu, mwanga wa asili wa kutosha, na urahisi wa kufikia mikahawa, maduka, na ufukwe.",
  price: 800000,
  location: "Masaki, Dar es Salaam",
  bedrooms: 1,
  propertyType: "studio",
  amenities: ["WiFi", "Parking", "Ulinzi", "Tanki la Maji", "Samani"],
  houseRules: ["Hakuna wanyama", "Hakuna kuvuta ndani", "Masaa ya utulivu baada ya 10 PM"],
  images: ["/placeholder.svg", "/placeholder.svg", "/placeholder.svg"],
  available: true,
  landlordId: "l1",
  landlordName: "James Mwanga",
  landlordPhone: "+255 700 111 222",
};

const PropertyDetails = () => {
  const { id } = useParams();
  const [date, setDate] = useState<Date>();
  const [timeWindow, setTimeWindow] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const { toast } = useToast();

  const handleRequestViewing = () => {
    if (!date || !timeWindow) {
      toast({ title: "Tafadhali chagua tarehe na muda", variant: "destructive" });
      return;
    }
    toast({ title: "Ombi la kuona limewasilishwa!" });
    setDialogOpen(false);
    setDate(undefined);
    setTimeWindow("");
  };

  return (
    <div className="container py-10 max-w-4xl animate-slide-up">
      <Button variant="ghost" size="sm" asChild className="mb-4">
        <Link to="/properties"><ArrowLeft className="h-4 w-4 mr-1" />Rudi kwenye orodha</Link>
      </Button>

      {/* Gallery */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-2 mb-8 rounded-2xl overflow-hidden shadow-lg">
        <div className="md:col-span-2 aspect-[16/10] bg-muted">
          <img src={mockProperty.images[0]} alt={mockProperty.title} className="h-full w-full object-cover" />
        </div>
        <div className="hidden md:grid grid-rows-2 gap-2">
          {mockProperty.images.slice(1, 3).map((img, i) => (
            <div key={i} className="bg-muted">
              <img src={img} alt="" className="h-full w-full object-cover" />
            </div>
          ))}
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-8">
        <div className="md:col-span-2 space-y-8">
          <div>
            <h1 className="text-3xl font-extrabold text-foreground">{mockProperty.title}</h1>
            <div className="flex items-center gap-3 mt-3 text-muted-foreground text-sm">
              <span className="flex items-center gap-1"><MapPin className="h-4 w-4" />{mockProperty.location}</span>
              <span className="flex items-center gap-1"><Bed className="h-4 w-4" />{mockProperty.bedrooms} chumba cha kulala</span>
            </div>
            <p className="text-3xl font-extrabold text-primary mt-4">TZS {mockProperty.price.toLocaleString()}<span className="text-sm font-normal text-muted-foreground">/mwezi</span></p>
          </div>

          <div>
            <h2 className="font-bold text-foreground mb-3 text-lg">Maelezo</h2>
            <p className="text-muted-foreground leading-relaxed">{mockProperty.description}</p>
          </div>

          <div>
            <h2 className="font-bold text-foreground mb-3 text-lg">Vifaa</h2>
            <div className="flex flex-wrap gap-2">
              {mockProperty.amenities.map((a) => (
                <Badge key={a} variant="secondary" className="px-3 py-1">{a}</Badge>
              ))}
            </div>
          </div>

          <div>
            <h2 className="font-bold text-foreground mb-3 text-lg">Sheria za Nyumba</h2>
            <ul className="space-y-2 text-sm text-muted-foreground">
              {mockProperty.houseRules.map((r) => (
                <li key={r} className="flex items-center gap-2"><Shield className="h-3.5 w-3.5 text-primary" />{r}</li>
              ))}
            </ul>
          </div>
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
                  <p className="font-semibold text-sm text-foreground">{mockProperty.landlordName}</p>
                  <p className="text-xs text-muted-foreground">{mockProperty.landlordPhone}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button className="w-full h-12 text-base font-semibold shadow-lg animate-pulse-glow" size="lg">Omba Kuona</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Panga Kuona Nyumba</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 pt-2">
                <div className="space-y-2">
                  <Label>Chagua Tarehe</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className={cn("w-full justify-start text-left font-normal", !date && "text-muted-foreground")}>
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {date ? format(date, "PPP") : "Chagua tarehe"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar mode="single" selected={date} onSelect={setDate} initialFocus className="p-3 pointer-events-auto" disabled={(d) => d < new Date()} />
                    </PopoverContent>
                  </Popover>
                </div>
                <div className="space-y-2">
                  <Label>Muda</Label>
                  <Select value={timeWindow} onValueChange={setTimeWindow}>
                    <SelectTrigger><SelectValue placeholder="Chagua muda" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="morning">Asubuhi (8AM–12PM)</SelectItem>
                      <SelectItem value="afternoon">Mchana (12PM–4PM)</SelectItem>
                      <SelectItem value="evening">Jioni (4PM–7PM)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button className="w-full font-semibold" onClick={handleRequestViewing}>Wasilisha Ombi</Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </div>
  );
};

export default PropertyDetails;
