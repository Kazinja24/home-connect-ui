import { StatusBadge } from "@/components/StatusBadge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import type { ViewingRequest, Application, LeaseAgreement } from "@/types";

// Placeholder data — API-ready
const mockViewings: ViewingRequest[] = [
  { id: "v1", propertyId: "1", tenantId: "t1", date: "2026-02-15", timeWindow: "morning", status: "pending" },
  { id: "v2", propertyId: "2", tenantId: "t1", date: "2026-02-10", timeWindow: "afternoon", status: "approved" },
  { id: "v3", propertyId: "3", tenantId: "t1", date: "2026-02-05", timeWindow: "evening", status: "rejected" },
];

const mockApplications: Application[] = [
  { id: "a1", propertyId: "1", tenantId: "t1", employmentStatus: "Employed", lengthOfStay: "12 months", occupants: 1, status: "pending" },
  { id: "a2", propertyId: "2", tenantId: "t1", employmentStatus: "Self-employed", lengthOfStay: "6 months", occupants: 2, status: "approved" },
];

const mockLeases: LeaseAgreement[] = [
  { id: "le1", propertyId: "2", tenantId: "t1", landlordId: "l2", houseRules: ["No pets"], specialConditions: "Rent due by 5th of each month.", acknowledged: false },
];

const TenantDashboard = () => {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-foreground">My Dashboard</h1>

      <Tabs defaultValue="viewings">
        <TabsList>
          <TabsTrigger value="viewings">My Viewings</TabsTrigger>
          <TabsTrigger value="applications">My Applications</TabsTrigger>
          <TabsTrigger value="leases">Lease Agreements</TabsTrigger>
        </TabsList>

        <TabsContent value="viewings" className="mt-4">
          <Card>
            <CardHeader><CardTitle className="text-lg">Viewing Requests</CardTitle></CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Property</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Time</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mockViewings.map((v) => (
                    <TableRow key={v.id}>
                      <TableCell className="font-medium">Property #{v.propertyId}</TableCell>
                      <TableCell>{v.date}</TableCell>
                      <TableCell className="capitalize">{v.timeWindow}</TableCell>
                      <TableCell><StatusBadge status={v.status} /></TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="applications" className="mt-4">
          <Card>
            <CardHeader><CardTitle className="text-lg">My Applications</CardTitle></CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Property</TableHead>
                    <TableHead>Employment</TableHead>
                    <TableHead>Duration</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mockApplications.map((a) => (
                    <TableRow key={a.id}>
                      <TableCell className="font-medium">Property #{a.propertyId}</TableCell>
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
          <Card>
            <CardHeader><CardTitle className="text-lg">Lease Agreements</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              {mockLeases.map((l) => (
                <div key={l.id} className="border rounded-lg p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <p className="font-medium text-foreground">Property #{l.propertyId}</p>
                    <StatusBadge status={l.acknowledged ? "approved" : "pending"} />
                  </div>
                  <div className="text-sm text-muted-foreground">
                    <p><strong>Rules:</strong> {l.houseRules.join(", ")}</p>
                    <p><strong>Conditions:</strong> {l.specialConditions}</p>
                  </div>
                  {!l.acknowledged && (
                    <Button size="sm" onClick={() => { /* API call */ }}>
                      Acknowledge Agreement
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
