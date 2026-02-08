import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge } from "@/components/StatusBadge";
import { useToast } from "@/hooks/use-toast";

const mockApplications = [
  { id: "a1", tenantName: "Alice Mbeki", property: "Modern Studio in Masaki", employment: "Employed", duration: "12 months", occupants: 1, status: "pending" as const },
  { id: "a2", tenantName: "Carol Njau", property: "Spacious 2BR in Mikocheni", employment: "Self-employed", duration: "6 months", occupants: 2, status: "pending" as const },
];

const LandlordApplications = () => {
  const { toast } = useToast();

  const handleAction = (id: string, action: "approved" | "rejected") => {
    toast({ title: `Application ${action}` });
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-foreground">Applications</h1>
      <div className="grid gap-4">
        {mockApplications.map((a) => (
          <Card key={a.id}>
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <p className="font-semibold text-foreground">{a.tenantName}</p>
                  <p className="text-sm text-muted-foreground">{a.property}</p>
                </div>
                <StatusBadge status={a.status} />
              </div>
              <div className="grid grid-cols-3 gap-4 text-sm mb-4">
                <div><p className="text-muted-foreground">Employment</p><p className="font-medium text-foreground">{a.employment}</p></div>
                <div><p className="text-muted-foreground">Duration</p><p className="font-medium text-foreground">{a.duration}</p></div>
                <div><p className="text-muted-foreground">Occupants</p><p className="font-medium text-foreground">{a.occupants}</p></div>
              </div>
              <div className="flex gap-2">
                <Button size="sm" onClick={() => handleAction(a.id, "approved")}>Approve</Button>
                <Button size="sm" variant="ghost" className="text-destructive" onClick={() => handleAction(a.id, "rejected")}>Reject</Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default LandlordApplications;
