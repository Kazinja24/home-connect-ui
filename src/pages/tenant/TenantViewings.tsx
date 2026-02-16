import { useQuery } from "@tanstack/react-query";
import { StatusBadge } from "@/components/StatusBadge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { viewings as viewingsApi, leases as leasesApi } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import type { RequestStatus } from "@/types";

const TenantDashboard = () => {
  const { toast } = useToast();

  const { data: viewingsData, isLoading: viewingsLoading } = useQuery({
    queryKey: ["tenant-viewings"],
    queryFn: viewingsApi.list,
  });

  const { data: leasesData, isLoading: leasesLoading } = useQuery({
    queryKey: ["tenant-leases"],
    queryFn: leasesApi.list,
  });

  const handleSignLease = async (id: string) => {
    try {
      await leasesApi.sign(id);
      toast({ title: "Mkataba umesainiwa!" });
    } catch (err: any) {
      toast({ title: err.message || "Imeshindikana kusaini", variant: "destructive" });
    }
  };

  return (
    <div className="space-y-6 animate-slide-up">
      <h1 className="text-2xl font-bold text-foreground">Dashibodi Yangu</h1>

      <Tabs defaultValue="viewings">
        <TabsList className="bg-muted/60">
          <TabsTrigger value="viewings">Maombi ya Kuona</TabsTrigger>
          <TabsTrigger value="applications">Maombi Yangu</TabsTrigger>
          <TabsTrigger value="leases">Mikataba</TabsTrigger>
        </TabsList>

        <TabsContent value="viewings" className="mt-4">
          <Card className="glass-strong border-border/30">
            <CardHeader><CardTitle className="text-lg">Maombi ya Kuona Nyumba</CardTitle></CardHeader>
            <CardContent>
              {viewingsLoading ? (
                <div className="space-y-3">{[1,2,3].map(i => <Skeleton key={i} className="h-12 w-full" />)}</div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nyumba</TableHead>
                      <TableHead>Tarehe</TableHead>
                      <TableHead>Muda</TableHead>
                      <TableHead>Hali</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {viewingsData && viewingsData.length > 0 ? viewingsData.map((v: any) => (
                      <TableRow key={v.id} className="hover:bg-muted/50 transition-colors">
                        <TableCell className="font-medium">Nyumba #{v.property || v.propertyId}</TableCell>
                        <TableCell>{v.date}</TableCell>
                        <TableCell className="capitalize">{v.time_window === "morning" ? "Asubuhi" : v.time_window === "afternoon" ? "Mchana" : "Jioni"}</TableCell>
                        <TableCell><StatusBadge status={v.status as RequestStatus} /></TableCell>
                      </TableRow>
                    )) : (
                      <TableRow><TableCell colSpan={4} className="text-center text-muted-foreground py-8">Bado hakuna maombi ya kuona</TableCell></TableRow>
                    )}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="applications" className="mt-4">
          <Card className="glass-strong border-border/30">
            <CardHeader><CardTitle className="text-lg">Maombi Yangu</CardTitle></CardHeader>
            <CardContent>
              <p className="text-muted-foreground text-sm py-8 text-center">Kipengele hiki kinakuja hivi karibuni.</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="leases" className="mt-4">
          <Card className="glass-strong border-border/30">
            <CardHeader><CardTitle className="text-lg">Mikataba ya Kukodisha</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              {leasesLoading ? (
                <div className="space-y-3">{[1,2].map(i => <Skeleton key={i} className="h-20 w-full" />)}</div>
              ) : leasesData && leasesData.length > 0 ? leasesData.map((l: any) => (
                <div key={l.id} className="border rounded-xl p-5 space-y-3 hover:bg-muted/30 transition-colors">
                  <div className="flex items-center justify-between">
                    <p className="font-semibold text-foreground">Nyumba #{l.property || l.propertyId}</p>
                    <StatusBadge status={["LEASED", "ACTIVE", "CLOSED"].includes(String(l.status).toUpperCase()) ? "approved" : "pending"} />
                  </div>
                  <div className="text-sm text-muted-foreground">
                    <p><strong>Hali:</strong> {l.status}</p>
                    {l.signed_at && <p><strong>Ilisainiwa:</strong> {new Date(l.signed_at).toLocaleDateString("sw-TZ")}</p>}
                  </div>
                  {!l.is_signed && ["LEASED", "ACTIVE"].includes(String(l.status).toUpperCase()) && (
                    <Button size="sm" className="font-semibold shadow-sm" onClick={() => handleSignLease(l.id)}>
                      Saini Mkataba
                    </Button>
                  )}
                </div>
              )) : (
                <p className="text-muted-foreground text-sm py-8 text-center">Bado hakuna mikataba</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default TenantDashboard;
