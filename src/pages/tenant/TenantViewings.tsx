import { StatusBadge } from "@/components/StatusBadge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import type { ViewingRequest, Application, LeaseAgreement } from "@/types";

const mockViewings: ViewingRequest[] = [
  { id: "v1", propertyId: "1", tenantId: "t1", date: "2026-02-15", timeWindow: "morning", status: "pending" },
  { id: "v2", propertyId: "2", tenantId: "t1", date: "2026-02-10", timeWindow: "afternoon", status: "approved" },
  { id: "v3", propertyId: "3", tenantId: "t1", date: "2026-02-05", timeWindow: "evening", status: "rejected" },
];

const mockApplications: Application[] = [
  { id: "a1", propertyId: "1", tenantId: "t1", employmentStatus: "Ameajiriwa", lengthOfStay: "Miezi 12", occupants: 1, status: "pending" },
  { id: "a2", propertyId: "2", tenantId: "t1", employmentStatus: "Biashara binafsi", lengthOfStay: "Miezi 6", occupants: 2, status: "approved" },
];

const mockLeases: LeaseAgreement[] = [
  { id: "le1", propertyId: "2", tenantId: "t1", landlordId: "l2", houseRules: ["Hakuna wanyama"], specialConditions: "Kodi hulipwa kabla ya tarehe 5 kila mwezi.", acknowledged: false },
];

const TenantDashboard = () => {
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
                  {mockViewings.map((v) => (
                    <TableRow key={v.id} className="hover:bg-muted/50 transition-colors">
                      <TableCell className="font-medium">Nyumba #{v.propertyId}</TableCell>
                      <TableCell>{v.date}</TableCell>
                      <TableCell className="capitalize">{v.timeWindow === "morning" ? "Asubuhi" : v.timeWindow === "afternoon" ? "Mchana" : "Jioni"}</TableCell>
                      <TableCell><StatusBadge status={v.status} /></TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="applications" className="mt-4">
          <Card className="glass-strong border-border/30">
            <CardHeader><CardTitle className="text-lg">Maombi Yangu</CardTitle></CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nyumba</TableHead>
                    <TableHead>Ajira</TableHead>
                    <TableHead>Muda</TableHead>
                    <TableHead>Hali</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mockApplications.map((a) => (
                    <TableRow key={a.id} className="hover:bg-muted/50 transition-colors">
                      <TableCell className="font-medium">Nyumba #{a.propertyId}</TableCell>
                      <TableCell>{a.employmentStatus}</TableCell>
                      <TableCell>{a.lengthOfStay}</TableCell>
                      <TableCell><StatusBadge status={a.status} /></TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="leases" className="mt-4">
          <Card className="glass-strong border-border/30">
            <CardHeader><CardTitle className="text-lg">Mikataba ya Kukodisha</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              {mockLeases.map((l) => (
                <div key={l.id} className="border rounded-xl p-5 space-y-3 hover:bg-muted/30 transition-colors">
                  <div className="flex items-center justify-between">
                    <p className="font-semibold text-foreground">Nyumba #{l.propertyId}</p>
                    <StatusBadge status={l.acknowledged ? "approved" : "pending"} />
                  </div>
                  <div className="text-sm text-muted-foreground">
                    <p><strong>Sheria:</strong> {l.houseRules.join(", ")}</p>
                    <p><strong>Masharti:</strong> {l.specialConditions}</p>
                  </div>
                  {!l.acknowledged && (
                    <Button size="sm" className="font-semibold shadow-sm" onClick={() => {}}>
                      Kubali Mkataba
                    </Button>
                  )}
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default TenantDashboard;
