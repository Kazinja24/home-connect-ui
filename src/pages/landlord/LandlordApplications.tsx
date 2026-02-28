import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { StatusBadge } from "@/components/StatusBadge";
import { applications as appApi, properties as propertiesApi } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import type { RequestStatus } from "@/types";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

function normalizeStatus(status: string): RequestStatus {
  const normalized = String(status).toLowerCase();
  if (["approved", "accepted", "leased", "active", "closed"].includes(normalized)) return "approved";
  if (normalized === "rejected") return "rejected";
  return "pending";
}

const LandlordApplications = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [propertyFilter, setPropertyFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [profileOpen, setProfileOpen] = useState(false);
  const [selectedAppId, setSelectedAppId] = useState<string | null>(null);

  const params = useMemo(
    () => ({
      property: propertyFilter !== "all" ? propertyFilter : "",
      status: statusFilter !== "all" ? statusFilter : "",
    }),
    [propertyFilter, statusFilter]
  );

  const { data, isLoading } = useQuery({
    queryKey: ["landlord-applications", params.property, params.status],
    queryFn: () => appApi.list(params),
  });

  const { data: landlordProperties = [] } = useQuery({
    queryKey: ["landlord-properties-filter"],
    queryFn: () => propertiesApi.list(),
  });

  const { data: tenantProfile, isLoading: profileLoading } = useQuery({
    queryKey: ["application-tenant-profile", selectedAppId],
    queryFn: () => appApi.getTenantProfile(String(selectedAppId)),
    enabled: Boolean(selectedAppId),
  });

  const mutation = useMutation({
    mutationFn: ({ id, action }: { id: string; action: "approved" | "rejected" | "expired" }) => {
      return appApi.updateStatus(id, action);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["landlord-applications"] });
      toast({ title: "Hali imesasishwa!" });
    },
    onError: (err: any) => toast({ title: err.message || "Imeshindikana", variant: "destructive" }),
  });

  const openProfile = (applicationId: string) => {
    setSelectedAppId(applicationId);
    setProfileOpen(true);
  };

  return (
    <div className="space-y-6 animate-slide-up">
      <h1 className="text-2xl font-bold text-foreground">Waombaji Wanaoingia</h1>

      <Card className="glass-strong border-border/30">
        <CardContent className="p-4 md:p-6 grid md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Filter by property</Label>
            <Select value={propertyFilter} onValueChange={setPropertyFilter}>
              <SelectTrigger><SelectValue placeholder="Property zote" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Property zote</SelectItem>
                {landlordProperties.map((property: any) => (
                  <SelectItem key={property.id} value={String(property.id)}>
                    {property.title || `Property #${property.id}`}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Filter by status</Label>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger><SelectValue placeholder="Status zote" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Status zote</SelectItem>
                <SelectItem value="pending">PENDING</SelectItem>
                <SelectItem value="approved">APPROVED</SelectItem>
                <SelectItem value="rejected">REJECTED</SelectItem>
                <SelectItem value="expired">EXPIRED</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 stagger-children">
        {isLoading ? (
          [1, 2].map((i) => <Skeleton key={i} className="h-44 w-full rounded-xl" />)
        ) : data && data.length > 0 ? (
          data.map((a: any) => (
            <Card key={a.id} className="hover-lift glass-strong border-border/30">
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <p className="font-bold text-foreground">{a.tenant_name || `Mpangaji #${a.tenant}`}</p>
                    <p className="text-sm text-muted-foreground">{a.tenant_email || "No email"}</p>
                    <p className="text-sm text-muted-foreground mt-1">{a.property_title || `Nyumba #${a.property}`}</p>
                  </div>
                  <StatusBadge status={normalizeStatus(a.status)} />
                </div>

                <div className="text-sm text-muted-foreground mb-4">{a.message || "Hakuna ujumbe wa ziada"}</div>

                <div className="flex flex-wrap gap-2">
                  <Button size="sm" variant="outline" onClick={() => openProfile(String(a.id))}>
                    Review Tenant Profile
                  </Button>

                  {String(a.status).toLowerCase() === "pending" && (
                    <>
                      <Button size="sm" className="font-semibold shadow-sm" disabled={mutation.isPending} onClick={() => mutation.mutate({ id: String(a.id), action: "approved" })}>
                        Approve
                      </Button>
                      <Button size="sm" variant="ghost" className="text-destructive" disabled={mutation.isPending} onClick={() => mutation.mutate({ id: String(a.id), action: "rejected" })}>
                        Reject
                      </Button>
                    </>
                  )}

                  {String(a.status).toLowerCase() === "approved" && (
                    <>
                      <Button size="sm" className="font-semibold shadow-sm" disabled={mutation.isPending} onClick={() => mutation.mutate({ id: String(a.id), action: "expired" })}>
                        Expire
                      </Button>
                      <Button size="sm" variant="ghost" className="text-destructive" disabled={mutation.isPending} onClick={() => mutation.mutate({ id: String(a.id), action: "rejected" })}>
                        Reject
                      </Button>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <p className="text-muted-foreground text-sm py-8 text-center">Hakuna maombi kwa sasa</p>
        )}
      </div>

      <Dialog open={profileOpen} onOpenChange={setProfileOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Tenant Profile</DialogTitle>
          </DialogHeader>
          {profileLoading ? (
            <div className="space-y-3">
              <Skeleton className="h-5 w-2/3" />
              <Skeleton className="h-5 w-1/2" />
              <Skeleton className="h-5 w-1/3" />
            </div>
          ) : tenantProfile ? (
            <div className="space-y-2 text-sm">
              <p><strong>Name:</strong> {tenantProfile.full_name}</p>
              <p><strong>Email:</strong> {tenantProfile.email}</p>
              <p><strong>Role:</strong> {tenantProfile.role}</p>
              <p><strong>Joined:</strong> {tenantProfile.created_at ? new Date(tenantProfile.created_at).toLocaleDateString("sw-TZ") : "—"}</p>
            </div>
          ) : (
            <p className="text-muted-foreground">Profile not available.</p>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default LandlordApplications;
