import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { StatusBadge } from "@/components/StatusBadge";
import { useToast } from "@/hooks/use-toast";

const mockApplications = [
  { id: "a1", tenantName: "Alice Mbeki", property: "Studio ya Kisasa Masaki", employment: "Ameajiriwa", duration: "Miezi 12", occupants: 1, status: "pending" as const },
  { id: "a2", tenantName: "Carol Njau", property: "Nyumba 2BR Mikocheni", employment: "Biashara binafsi", duration: "Miezi 6", occupants: 2, status: "pending" as const },
];

const LandlordApplications = () => {
  const { toast } = useToast();

  const handleAction = (id: string, action: "approved" | "rejected") => {
    toast({ title: `Ombi ${action === "approved" ? "limekubaliwa" : "limekataliwa"}` });
  };

  return (
    <div className="space-y-6 animate-slide-up">
      <h1 className="text-2xl font-bold text-foreground">Maombi</h1>
      <div className="grid gap-4 stagger-children">
        {mockApplications.map((a) => (
          <Card key={a.id} className="hover-lift glass-strong border-border/30">
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <p className="font-bold text-foreground">{a.tenantName}</p>
                  <p className="text-sm text-muted-foreground">{a.property}</p>
                </div>
                <StatusBadge status={a.status} />
              </div>
              <div className="grid grid-cols-3 gap-4 text-sm mb-4">
                <div><p className="text-muted-foreground">Ajira</p><p className="font-semibold text-foreground">{a.employment}</p></div>
                <div><p className="text-muted-foreground">Muda</p><p className="font-semibold text-foreground">{a.duration}</p></div>
                <div><p className="text-muted-foreground">Wakaaji</p><p className="font-semibold text-foreground">{a.occupants}</p></div>
              </div>
              <div className="flex gap-2">
                <Button size="sm" className="font-semibold shadow-sm" onClick={() => handleAction(a.id, "approved")}>Kubali</Button>
                <Button size="sm" variant="ghost" className="text-destructive" onClick={() => handleAction(a.id, "rejected")}>Kataa</Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default LandlordApplications;
