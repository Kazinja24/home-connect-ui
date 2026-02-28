import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { offers as offersApi, leases as leasesApi } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

const LandlordLeases = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedOfferId, setSelectedOfferId] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [monthlyRent, setMonthlyRent] = useState("");
  const [securityDeposit, setSecurityDeposit] = useState("");

  const { data: offers = [] } = useQuery({
    queryKey: ["landlord-offers-for-lease"],
    queryFn: offersApi.list,
  });

  const acceptedOffers = offers.filter((o: any) => o.status === "accepted");

  const createMutation = useMutation({
    mutationFn: (data: any) => leasesApi.create(data),
    onSuccess: () => {
      toast({ title: "Lease draft created." });
      queryClient.invalidateQueries({ queryKey: ["landlord-leases-list"] });
      setSelectedOfferId("");
      setStartDate("");
      setEndDate("");
      setMonthlyRent("");
      setSecurityDeposit("");
    },
    onError: (err: any) => toast({ title: err.message || "Failed to create lease", variant: "destructive" }),
  });

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    const selectedOffer = acceptedOffers.find((o: any) => String(o.id) === selectedOfferId);

    if (!selectedOffer) {
      toast({ title: "Select an accepted offer", variant: "destructive" });
      return;
    }

    const payload = {
      property: selectedOffer.property,
      tenant: selectedOffer.tenant,
      start_date: startDate || selectedOffer.start_date,
      end_date: endDate || selectedOffer.end_date,
      monthly_rent: Number(monthlyRent || selectedOffer.monthly_rent),
      security_deposit: Number(securityDeposit || selectedOffer.security_deposit),
    };
    createMutation.mutate(payload);
  };

  return (
    <div className="space-y-6 animate-slide-up">
      <h1 className="text-2xl font-bold text-foreground">Leases</h1>
      <Card className="glass-strong border-border/30">
        <CardHeader><CardTitle className="text-lg">Create Lease from Accepted Offer</CardTitle></CardHeader>
        <CardContent>
          <form onSubmit={handleCreate} className="space-y-4">
            <div className="space-y-2">
              <Label>Accepted offer</Label>
              <Select value={selectedOfferId} onValueChange={setSelectedOfferId}>
                <SelectTrigger><SelectValue placeholder="Select accepted offer" /></SelectTrigger>
                <SelectContent>
                  {acceptedOffers.map((o: any) => (
                    <SelectItem key={o.id} value={String(o.id)}>
                      {`${o.property_title || `Property #${o.property}`} - ${o.tenant_name || `Tenant #${o.tenant}`}`}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Start date</Label>
                <Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>End date</Label>
                <Input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Monthly rent</Label>
                <Input type="number" value={monthlyRent} onChange={(e) => setMonthlyRent(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Security deposit</Label>
                <Input type="number" value={securityDeposit} onChange={(e) => setSecurityDeposit(e.target.value)} />
              </div>
            </div>

            <Button type="submit" className="font-semibold shadow-md" disabled={createMutation.isPending}>
              {createMutation.isPending ? "Creating..." : "Create Lease"}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card className="glass-strong border-border/30">
        <CardHeader><CardTitle className="text-lg">My Leases</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <LeasesList />
        </CardContent>
      </Card>
    </div>
  );
};

export default LandlordLeases;

const LeasesList = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { data, isLoading } = useQuery({ queryKey: ["landlord-leases-list"], queryFn: leasesApi.list });

  const uploadMutation = useMutation({
    mutationFn: ({ id, fd }: any) => leasesApi.uploadContract(id, fd),
    onSuccess: () => {
      toast({ title: "Contract uploaded" });
      queryClient.invalidateQueries({ queryKey: ["landlord-leases-list"] });
    },
    onError: (err: any) => toast({ title: err.message || "Upload failed", variant: "destructive" }),
  });
  const generateMutation = useMutation({
    mutationFn: (id: string) => leasesApi.generateContract(id),
    onSuccess: () => {
      toast({ title: "Contract generated" });
      queryClient.invalidateQueries({ queryKey: ["landlord-leases-list"] });
    },
    onError: (err: any) => toast({ title: err.message || "Generation failed", variant: "destructive" }),
  });
  const confirmMutation = useMutation({
    mutationFn: (id: string) => leasesApi.landlordConfirm(id),
    onSuccess: () => {
      toast({ title: "Landlord confirmation recorded." });
      queryClient.invalidateQueries({ queryKey: ["landlord-leases-list"] });
    },
    onError: (err: any) => toast({ title: err.message || "Confirmation failed", variant: "destructive" }),
  });
  const activateMutation = useMutation({
    mutationFn: (id: string) => leasesApi.activate(id),
    onSuccess: () => {
      toast({ title: "Lease activated." });
      queryClient.invalidateQueries({ queryKey: ["landlord-leases-list"] });
      queryClient.invalidateQueries({ queryKey: ["landlord-applications"] });
      queryClient.invalidateQueries({ queryKey: ["landlord-viewings"] });
    },
    onError: (err: any) => toast({ title: err.message || "Activation failed", variant: "destructive" }),
  });

  const handleUpload = (leaseId: string, file?: File) => {
    if (!file) return toast({ title: "No file selected", variant: "destructive" });
    const fd = new FormData();
    fd.append("contract_file", file);
    uploadMutation.mutate({ id: leaseId, fd });
  };

  return (
    <div className="space-y-3">
      {isLoading ? (
        [1, 2].map((i) => <Skeleton key={i} className="h-20 w-full" />)
      ) : data && data.length > 0 ? (
        data.map((l: any) => (
          <div key={l.id} className="p-4 border rounded flex items-center justify-between gap-3">
            <div>
              <div className="font-semibold">{l.property_title || `Property #${l.property}`}</div>
              <div className="text-sm text-muted-foreground">{l.tenant_name || `Tenant #${l.tenant}`}</div>
              <div className="text-xs text-muted-foreground mt-1">
                <Badge variant={l.status === "active" ? "default" : l.status === "terminated" ? "destructive" : "secondary"}>
                  {l.status}
                </Badge>
              </div>
            </div>
            <div className="flex items-center gap-2 flex-wrap justify-end">
              {l.contract_file ? (
                <Button size="sm" variant="outline" onClick={() => leasesApi.downloadContract(l.id)}>
                  Download
                </Button>
              ) : (
                <>
                  <label className="inline-flex">
                    <input type="file" accept="application/pdf" className="hidden" onChange={(e) => handleUpload(l.id, e.target.files?.[0])} />
                    <Button size="sm" variant="outline" type="button">Upload Contract</Button>
                  </label>
                  <Button size="sm" variant="secondary" onClick={() => generateMutation.mutate(String(l.id))}>
                    Generate
                  </Button>
                </>
              )}

              {l.status === "pending" && !l.landlord_confirmed_at ? (
                <Button size="sm" onClick={() => confirmMutation.mutate(String(l.id))}>
                  Landlord Confirm
                </Button>
              ) : null}

              {l.status === "pending" && l.landlord_confirmed_at && l.tenant_confirmed_at ? (
                <Button size="sm" onClick={() => activateMutation.mutate(String(l.id))}>
                  Activate
                </Button>
              ) : null}
            </div>
          </div>
        ))
      ) : (
        <div className="text-sm text-muted-foreground">No leases found.</div>
      )}
    </div>
  );
};

