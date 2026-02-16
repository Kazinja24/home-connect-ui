import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { applications as appApi, leases as leasesApi } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

const LandlordLeases = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedViewingId, setSelectedViewingId] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [monthlyRent, setMonthlyRent] = useState("");
  const [securityDeposit, setSecurityDeposit] = useState("");

  const { data: applications } = useQuery({
    queryKey: ["landlord-applications-for-lease"],
    queryFn: appApi.list,
  });

  const acceptedApplications = (applications || []).filter((a: any) => a.status === "ACCEPTED" && a.viewing);

  const createMutation = useMutation({
    mutationFn: (data: any) => leasesApi.create(data),
    onSuccess: () => {
      toast({ title: "Mkataba umetengenezwa!" });
      queryClient.invalidateQueries({ queryKey: ["landlord-leases"] });
      setSelectedViewingId("");
      setStartDate("");
      setEndDate("");
      setMonthlyRent("");
      setSecurityDeposit("");
    },
    onError: (err: any) => toast({ title: err.message || "Imeshindikana", variant: "destructive" }),
  });

  const handlePublish = (e: React.FormEvent) => {
    e.preventDefault();
    const selectedApplication = acceptedApplications.find((a: any) => String(a.viewing) === selectedViewingId);

    if (!selectedApplication) {
      toast({ title: "Tafadhali chagua application iliyokubaliwa baada ya viewing", variant: "destructive" });
      return;
    }

    if (!startDate || !endDate || !monthlyRent || !securityDeposit) {
      toast({ title: "Jaza taarifa zote za mkataba", variant: "destructive" });
      return;
    }

    createMutation.mutate({
      property: selectedApplication.property,
      tenant: selectedApplication.tenant,
      viewing: selectedApplication.viewing,
      start_date: startDate,
      end_date: endDate,
      monthly_rent: Number(monthlyRent),
      security_deposit: Number(securityDeposit),
    });
  };

  return (
    <div className="space-y-6 animate-slide-up">
      <h1 className="text-2xl font-bold text-foreground">Tengeneza Mkataba</h1>
      <Card className="glass-strong border-border/30">
        <CardHeader><CardTitle className="text-lg">Mkataba Baada ya Viewing</CardTitle></CardHeader>
        <CardContent>
          <form onSubmit={handlePublish} className="space-y-4">
            <div className="space-y-2">
              <Label>Viewing Iliyokubaliwa</Label>
              <Select value={selectedViewingId} onValueChange={setSelectedViewingId}>
                <SelectTrigger><SelectValue placeholder="Chagua viewing" /></SelectTrigger>
                <SelectContent>
                  {acceptedApplications.map((a: any) => (
                    <SelectItem key={a.id} value={String(a.viewing)}>
                      {`${a.property_title || `Nyumba #${a.property}`} - ${a.tenant_name || `Tenant #${a.tenant}`}`}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Tarehe ya Kuanza</Label>
                <Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Tarehe ya Mwisho</Label>
                <Input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Kodi ya Mwezi</Label>
                <Input type="number" value={monthlyRent} onChange={(e) => setMonthlyRent(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Deposit</Label>
                <Input type="number" value={securityDeposit} onChange={(e) => setSecurityDeposit(e.target.value)} />
              </div>
            </div>

            <Button type="submit" className="font-semibold shadow-md" disabled={createMutation.isPending}>
              {createMutation.isPending ? "Inatengeneza..." : "Tengeneza Mkataba"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default LandlordLeases;
