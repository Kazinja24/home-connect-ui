import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

const LandlordLeases = () => {
  const { toast } = useToast();
  const [property, setProperty] = useState("");

  const handlePublish = (e: React.FormEvent) => {
    e.preventDefault();
    toast({ title: "Lease published!" });
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-foreground">Lease Creator</h1>
      <Card>
        <CardHeader><CardTitle className="text-lg">Generate Lease Agreement</CardTitle></CardHeader>
        <CardContent>
          <form onSubmit={handlePublish} className="space-y-4">
            <div className="space-y-2">
              <Label>Property</Label>
              <Select value={property} onValueChange={setProperty}>
                <SelectTrigger><SelectValue placeholder="Select property" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">Modern Studio in Masaki</SelectItem>
                  <SelectItem value="2">Spacious 2BR in Mikocheni</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>House Rules</Label>
              <Textarea placeholder="List house rules…" />
            </div>
            <div className="space-y-2">
              <Label>Special Conditions</Label>
              <Textarea placeholder="Any special conditions or clauses…" />
            </div>
            <Button type="submit">Publish Lease</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default LandlordLeases;
