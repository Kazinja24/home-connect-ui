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
import { CalendarIcon, MapPin, Bed, ArrowLeft, User } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

// Placeholder — will be fetched from API
const mockProperty = {
  id: "1",
  title: "Modern Studio in Masaki",
  description: "A beautifully designed modern studio apartment in the heart of Masaki. Features open-plan living with high-quality finishes, plenty of natural light, and easy access to restaurants, shops, and the waterfront.",
  price: 800000,
  location: "Masaki, Dar es Salaam",
  bedrooms: 1,
  propertyType: "studio",
  amenities: ["WiFi", "Parking", "Security", "Water Tank", "Furnished"],
  houseRules: ["No pets", "No smoking indoors", "Quiet hours after 10 PM"],
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
      toast({ title: "Please select a date and time", variant: "destructive" });
      return;
    }
    // API placeholder
    toast({ title: "Viewing request submitted!" });
    setDialogOpen(false);
    setDate(undefined);
    setTimeWindow("");
  };

  return (
    <div className="container py-8 max-w-4xl">
      <Button variant="ghost" size="sm" asChild className="mb-4">
        <Link to="/properties"><ArrowLeft className="h-4 w-4 mr-1" />Back to listings</Link>
      </Button>

      {/* Gallery */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-2 mb-8 rounded-lg overflow-hidden">
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
            <h1 className="text-2xl font-bold text-foreground">{mockProperty.title}</h1>
            <div className="flex items-center gap-3 mt-2 text-muted-foreground text-sm">
              <span className="flex items-center gap-1"><MapPin className="h-4 w-4" />{mockProperty.location}</span>
              <span className="flex items-center gap-1"><Bed className="h-4 w-4" />{mockProperty.bedrooms} bedroom</span>
            </div>
            <p className="text-2xl font-bold text-primary mt-3">TZS {mockProperty.price.toLocaleString()}<span className="text-sm font-normal text-muted-foreground">/mo</span></p>
          </div>

          <div>
            <h2 className="font-semibold text-foreground mb-2">Description</h2>
            <p className="text-muted-foreground text-sm leading-relaxed">{mockProperty.description}</p>
          </div>

          <div>
            <h2 className="font-semibold text-foreground mb-3">Amenities</h2>
            <div className="flex flex-wrap gap-2">
              {mockProperty.amenities.map((a) => (
                <Badge key={a} variant="secondary">{a}</Badge>
              ))}
            </div>
          </div>

          <div>
            <h2 className="font-semibold text-foreground mb-3">House Rules</h2>
            <ul className="space-y-1 text-sm text-muted-foreground">
              {mockProperty.houseRules.map((r) => (
                <li key={r}>• {r}</li>
              ))}
            </ul>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          <Card>
            <CardContent className="p-4 space-y-3">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
                  <User className="h-5 w-5 text-muted-foreground" />
                </div>
                <div>
                  <p className="font-medium text-sm text-foreground">{mockProperty.landlordName}</p>
                  <p className="text-xs text-muted-foreground">{mockProperty.landlordPhone}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button className="w-full" size="lg">Request Viewing</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Schedule a Viewing</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 pt-2">
                <div className="space-y-2">
                  <Label>Select Date</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className={cn("w-full justify-start text-left font-normal", !date && "text-muted-foreground")}>
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {date ? format(date, "PPP") : "Pick a date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar mode="single" selected={date} onSelect={setDate} initialFocus className="p-3 pointer-events-auto" disabled={(d) => d < new Date()} />
                    </PopoverContent>
                  </Popover>
                </div>
                <div className="space-y-2">
                  <Label>Time Window</Label>
                  <Select value={timeWindow} onValueChange={setTimeWindow}>
                    <SelectTrigger><SelectValue placeholder="Select time" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="morning">Morning (8AM–12PM)</SelectItem>
                      <SelectItem value="afternoon">Afternoon (12PM–4PM)</SelectItem>
                      <SelectItem value="evening">Evening (4PM–7PM)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button className="w-full" onClick={handleRequestViewing}>Submit Request</Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </div>
  );
};

export default PropertyDetails;
