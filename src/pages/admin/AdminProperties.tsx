import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/i18n/LanguageContext";
import { properties as propertiesApi } from "@/lib/api";

const AdminProperties = () => {
  const { t } = useLanguage();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["admin-properties"],
    queryFn: () => propertiesApi.list(),
  });

  const { data: pendingReview = [] } = useQuery({
    queryKey: ["admin-properties-pending-review"],
    queryFn: propertiesApi.pendingReviews,
  });

  const approveListing = useMutation({
    mutationFn: (id: string) => propertiesApi.adminApproveListing(id),
    onSuccess: () => {
      toast({ title: "Listing approved and published." });
      queryClient.invalidateQueries({ queryKey: ["admin-properties"] });
      queryClient.invalidateQueries({ queryKey: ["admin-properties-pending-review"] });
    },
    onError: (err: any) => toast({ title: err.message || "Approval failed", variant: "destructive" }),
  });

  const rejectListing = useMutation({
    mutationFn: (id: string) => propertiesApi.adminRejectListing(id),
    onSuccess: () => {
      toast({ title: "Listing rejected." });
      queryClient.invalidateQueries({ queryKey: ["admin-properties"] });
      queryClient.invalidateQueries({ queryKey: ["admin-properties-pending-review"] });
    },
    onError: (err: any) => toast({ title: err.message || "Rejection failed", variant: "destructive" }),
  });

  const approveVerification = useMutation({
    mutationFn: (id: string) => propertiesApi.approveVerification(id),
    onSuccess: () => {
      toast({ title: "Ownership verification approved." });
      queryClient.invalidateQueries({ queryKey: ["admin-properties"] });
    },
    onError: (err: any) => toast({ title: err.message || "Verification approval failed", variant: "destructive" }),
  });

  const rejectVerification = useMutation({
    mutationFn: (id: string) => propertiesApi.rejectVerification(id),
    onSuccess: () => {
      toast({ title: "Ownership verification rejected." });
      queryClient.invalidateQueries({ queryKey: ["admin-properties"] });
    },
    onError: (err: any) => toast({ title: err.message || "Verification rejection failed", variant: "destructive" }),
  });

  const pendingReviewIds = new Set((pendingReview || []).map((p: any) => String(p.id)));

  return (
    <div className="space-y-6 animate-slide-up">
      <h1 className="text-2xl font-bold text-foreground">{t("admin.propertyManagement")}</h1>
      <Card className="glass-strong border-border/30">
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-6 space-y-3">{[1, 2, 3].map((i) => <Skeleton key={i} className="h-12 w-full" />)}</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t("common.property")}</TableHead>
                  <TableHead>{t("admin.owner")}</TableHead>
                  <TableHead>Verification</TableHead>
                  <TableHead>Listing</TableHead>
                  <TableHead className="text-right">{t("common.actions")}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data && data.length > 0 ? (
                  data.map((p: any) => (
                    <TableRow key={p.id} className="hover:bg-muted/50 transition-colors">
                      <TableCell className="font-medium">
                        {p.title}
                        {pendingReviewIds.has(String(p.id)) ? (
                          <Badge variant="secondary" className="ml-2 text-[10px]">pending review</Badge>
                        ) : null}
                      </TableCell>
                      <TableCell>{p.owner_name || p.owner_email || `Landlord #${p.owner}`}</TableCell>
                      <TableCell>
                        <Badge variant={p.verification_status === "approved" ? "default" : p.verification_status === "rejected" ? "destructive" : "secondary"}>
                          {p.verification_status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={p.listing_status === "published" ? "default" : p.listing_status === "rejected" ? "destructive" : "secondary"}>
                          {p.listing_status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right space-x-1">
                        {p.verification_status !== "approved" ? (
                          <Button size="sm" variant="outline" onClick={() => approveVerification.mutate(String(p.id))}>
                            Verify
                          </Button>
                        ) : null}
                        {p.verification_status !== "rejected" ? (
                          <Button size="sm" variant="ghost" className="text-destructive" onClick={() => rejectVerification.mutate(String(p.id))}>
                            Reject Verify
                          </Button>
                        ) : null}

                        {pendingReviewIds.has(String(p.id)) ? (
                          <>
                            <Button size="sm" onClick={() => approveListing.mutate(String(p.id))}>
                              Approve Listing
                            </Button>
                            <Button size="sm" variant="ghost" className="text-destructive" onClick={() => rejectListing.mutate(String(p.id))}>
                              Reject Listing
                            </Button>
                          </>
                        ) : null}
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                      No properties found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminProperties;

