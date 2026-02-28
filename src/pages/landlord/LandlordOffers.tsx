import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { applications as appApi, viewings as viewingsApi, offers as offersApi } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

const LandlordOffers = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [applicationId, setApplicationId] = useState("");
  const [viewingId, setViewingId] = useState("");
  const [monthlyRent, setMonthlyRent] = useState("");
  const [securityDeposit, setSecurityDeposit] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const { data: applications = [] } = useQuery({
    queryKey: ["landlord-applications-for-offers"],
    queryFn: () => appApi.list({ status: "approved" }),
  });

  const { data: viewings = [] } = useQuery({
    queryKey: ["landlord-viewings-for-offers"],
    queryFn: viewingsApi.list,
  });

  const { data: offersData = [], isLoading } = useQuery({
    queryKey: ["landlord-offers"],
    queryFn: offersApi.list,
  });

  const completedViewings = viewings.filter((v: any) => {
    if (v.status !== "completed") return false;
    if (!applicationId) return true;
    return String(v.application) === String(applicationId);
  });

  const createMutation = useMutation({
    mutationFn: () =>
      offersApi.create({
        application: applicationId,
        viewing: viewingId,
        monthly_rent: Number(monthlyRent),
        security_deposit: Number(securityDeposit),
        start_date: startDate,
        end_date: endDate,
      }),
    onSuccess: () => {
      toast({ title: "Offer sent." });
      queryClient.invalidateQueries({ queryKey: ["landlord-offers"] });
      setApplicationId("");
      setViewingId("");
      setMonthlyRent("");
      setSecurityDeposit("");
      setStartDate("");
      setEndDate("");
    },
    onError: (err: any) => toast({ title: err.message || "Failed to send offer", variant: "destructive" }),
  });

  const withdrawMutation = useMutation({
    mutationFn: (id: string) => offersApi.withdraw(id),
    onSuccess: () => {
      toast({ title: "Offer withdrawn." });
      queryClient.invalidateQueries({ queryKey: ["landlord-offers"] });
    },
    onError: (err: any) => toast({ title: err.message || "Failed to withdraw offer", variant: "destructive" }),
  });

  return (
    <div className="space-y-6 animate-slide-up">
      <h1 className="text-2xl font-bold text-foreground">Rental Offers</h1>

      <Card className="glass-strong border-border/30">
        <CardHeader>
          <CardTitle className="text-lg">Send Offer After Completed Viewing</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Approved application</Label>
            <Select value={applicationId} onValueChange={setApplicationId}>
              <SelectTrigger>
                <SelectValue placeholder="Select approved application" />
              </SelectTrigger>
              <SelectContent>
                {applications.map((a: any) => (
                  <SelectItem key={a.id} value={String(a.id)}>
                    {a.property_title || `Property #${a.property}`} - {a.tenant_name || `Tenant #${a.tenant}`}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Completed viewing</Label>
            <Select value={viewingId} onValueChange={setViewingId}>
              <SelectTrigger>
                <SelectValue placeholder="Select completed viewing" />
              </SelectTrigger>
              <SelectContent>
                {completedViewings.map((v: any) => (
                  <SelectItem key={v.id} value={String(v.id)}>
                    {v.property_title || `Property #${v.property}`} - {v.tenant_name || `Tenant #${v.tenant}`}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
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

          <Button
            onClick={() => createMutation.mutate()}
            disabled={
              createMutation.isPending || !applicationId || !viewingId || !monthlyRent || !securityDeposit || !startDate || !endDate
            }
          >
            {createMutation.isPending ? "Sending..." : "Send offer"}
          </Button>
        </CardContent>
      </Card>

      <Card className="glass-strong border-border/30">
        <CardHeader>
          <CardTitle className="text-lg">Sent Offers</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {isLoading ? (
            [1, 2, 3].map((i) => <Skeleton key={i} className="h-20 w-full" />)
          ) : offersData.length > 0 ? (
            offersData.map((offer: any) => (
              <div key={offer.id} className="border rounded-lg p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <p className="font-semibold">{offer.property_title || `Property #${offer.property}`}</p>
                  <Badge variant={offer.status === "accepted" ? "default" : offer.status === "rejected" ? "destructive" : "secondary"}>
                    {offer.status}
                  </Badge>
                </div>
                <div className="text-sm text-muted-foreground">
                  <p>
                    Tenant: {offer.tenant_name || offer.tenant} | Rent: TZS {Number(offer.monthly_rent || 0).toLocaleString()}
                  </p>
                </div>
                {offer.status === "sent" ? (
                  <Button size="sm" variant="ghost" className="text-destructive" onClick={() => withdrawMutation.mutate(String(offer.id))}>
                    Withdraw
                  </Button>
                ) : null}
              </div>
            ))
          ) : (
            <p className="text-sm text-muted-foreground text-center py-8">No offers sent.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default LandlordOffers;
