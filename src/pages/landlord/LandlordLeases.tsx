import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { leases as leasesApi, properties as propertiesApi } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

const LandlordLeases = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [property, setProperty] = useState("");
  const [houseRules, setHouseRules] = useState("");
  const [specialConditions, setSpecialConditions] = useState("");

  const { data: propertyList } = useQuery({
    queryKey: ["landlord-properties-list"],
    queryFn: () => propertiesApi.list(),
  });

  const createMutation = useMutation({
    mutationFn: (data: any) => leasesApi.create(data),
    onSuccess: () => {
      toast({ title: "Mkataba umechapishwa!" });
      queryClient.invalidateQueries({ queryKey: ["landlord-leases"] });
      setProperty("");
      setHouseRules("");
      setSpecialConditions("");
    },
    onError: (err: any) => toast({ title: err.message || "Imeshindikana", variant: "destructive" }),
  });

  const handlePublish = (e: React.FormEvent) => {
    e.preventDefault();
    if (!property) {
      toast({ title: "Tafadhali chagua nyumba", variant: "destructive" });
      return;
    }
    createMutation.mutate({
      property,
      house_rules: houseRules.split(",").map(r => r.trim()).filter(Boolean),
      special_conditions: specialConditions,
    });
  };

  return (
    <div className="space-y-6 animate-slide-up">
      <h1 className="text-2xl font-bold text-foreground">Tengeneza Mkataba</h1>
      <Card className="glass-strong border-border/30">
        <CardHeader><CardTitle className="text-lg">Tengeneza Mkataba wa Kukodisha</CardTitle></CardHeader>
        <CardContent>
          <form onSubmit={handlePublish} className="space-y-4">
            <div className="space-y-2">
              <Label>Nyumba</Label>
              <Select value={property} onValueChange={setProperty}>
                <SelectTrigger><SelectValue placeholder="Chagua nyumba" /></SelectTrigger>
                <SelectContent>
                  {propertyList && propertyList.map((p: any) => (
                    <SelectItem key={p.id} value={String(p.id)}>{p.title}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Sheria za Nyumba</Label>
              <Textarea placeholder="Orodhesha sheria za nyumba…" value={houseRules} onChange={e => setHouseRules(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Masharti Maalum</Label>
              <Textarea placeholder="Masharti maalum yoyote…" value={specialConditions} onChange={e => setSpecialConditions(e.target.value)} />
            </div>
            <Button type="submit" className="font-semibold shadow-md" disabled={createMutation.isPending}>
              {createMutation.isPending ? "Inachapisha…" : "Chapisha Mkataba"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default LandlordLeases;
