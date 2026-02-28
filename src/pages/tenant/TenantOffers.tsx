import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { offers as offersApi } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

const TenantOffers = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["tenant-offers"],
    queryFn: offersApi.list,
  });

  const acceptMutation = useMutation({
    mutationFn: (id: string) => offersApi.accept(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tenant-offers"] });
      queryClient.invalidateQueries({ queryKey: ["tenant-leases"] });
      toast({ title: "Offer accepted." });
    },
    onError: (err: any) => toast({ title: err.message || "Failed to accept offer", variant: "destructive" }),
  });

  const rejectMutation = useMutation({
    mutationFn: (id: string) => offersApi.reject(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tenant-offers"] });
      toast({ title: "Offer rejected." });
    },
    onError: (err: any) => toast({ title: err.message || "Failed to reject offer", variant: "destructive" }),
  });

  return (
    <div className="space-y-6 animate-slide-up">
      <h1 className="text-2xl font-bold text-foreground">Rental Offers</h1>
      <Card className="glass-strong border-border/30">
        <CardHeader>
          <CardTitle className="text-lg">Offers sent by landlords</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {isLoading ? (
            [1, 2, 3].map((i) => <Skeleton key={i} className="h-20 w-full" />)
          ) : data && data.length > 0 ? (
            data.map((offer: any) => (
              <div key={offer.id} className="border rounded-lg p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold">{offer.property_title || `Property #${offer.property}`}</p>
                    <p className="text-xs text-muted-foreground">
                      {offer.start_date} to {offer.end_date}
                    </p>
                  </div>
                  <Badge variant={offer.status === "accepted" ? "default" : offer.status === "rejected" ? "destructive" : "secondary"}>
                    {offer.status}
                  </Badge>
                </div>
                <div className="text-sm text-muted-foreground">
                  <p>Monthly rent: TZS {Number(offer.monthly_rent || 0).toLocaleString()}</p>
                  <p>Deposit: TZS {Number(offer.security_deposit || 0).toLocaleString()}</p>
                  {offer.landlord_note ? <p>Note: {offer.landlord_note}</p> : null}
                </div>
                {offer.status === "sent" ? (
                  <div className="flex gap-2">
                    <Button size="sm" disabled={acceptMutation.isPending} onClick={() => acceptMutation.mutate(String(offer.id))}>
                      Accept
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="text-destructive"
                      disabled={rejectMutation.isPending}
                      onClick={() => rejectMutation.mutate(String(offer.id))}
                    >
                      Reject
                    </Button>
                  </div>
                ) : null}
              </div>
            ))
          ) : (
            <p className="text-sm text-muted-foreground text-center py-8">No offers available.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default TenantOffers;

