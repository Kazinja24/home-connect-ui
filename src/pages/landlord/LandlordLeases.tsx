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
    toast({ title: "Mkataba umechapishwa!" });
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
                  <SelectItem value="1">Studio ya Kisasa Masaki</SelectItem>
                  <SelectItem value="2">Nyumba 2BR Mikocheni</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Sheria za Nyumba</Label>
              <Textarea placeholder="Orodhesha sheria za nyumba…" />
            </div>
            <div className="space-y-2">
              <Label>Masharti Maalum</Label>
              <Textarea placeholder="Masharti maalum yoyote…" />
            </div>
            <Button type="submit" className="font-semibold shadow-md">Chapisha Mkataba</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default LandlordLeases;
