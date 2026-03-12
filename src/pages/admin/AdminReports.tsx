import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/i18n/LanguageContext";
import { moderation } from "@/lib/api";
import { Flag, AlertTriangle, CheckCircle, XCircle, Eye, Ban, ShieldAlert, MessageSquare } from "lucide-react";

// Mock reports for prototype
const mockReports = [
  {
    id: "rep1",
    property_id: "p1",
    property_title: "Studio ya Kisasa Masaki",
    reporter_name: "Amina Juma",
    reporter_email: "tenant@demo.com",
    reason: "misleading_photos",
    description: "Picha zinaonyesha nyumba tofauti na halisi. Samani hazipo kama zilivyoonyeshwa.",
    status: "pending",
    created_at: "2026-03-08T10:00:00Z",
    review_notes: "",
  },
  {
    id: "rep2",
    property_id: "p3",
    property_title: "Chumba Sinza",
    reporter_name: "David Kilonzo",
    reporter_email: "david@demo.com",
    reason: "scam",
    description: "Mmiliki aliomba pesa nje ya jukwaa na hakuonyesha nyumba.",
    status: "under_review",
    created_at: "2026-03-05T14:00:00Z",
    review_notes: "Investigating contact details provided.",
  },
  {
    id: "rep3",
    property_id: "p2",
    property_title: "Nyumba 2BR Mikocheni",
    reporter_name: "Sarah Mwita",
    reporter_email: "sarah@demo.com",
    reason: "wrong_price",
    description: "Bei imeongezwa ghafla baada ya kuwasiliana na mmiliki.",
    status: "resolved",
    created_at: "2026-02-28T09:00:00Z",
    review_notes: "Price updated by landlord. Listing corrected.",
  },
];

const mockBlocks = [
  {
    id: "blk1",
    blocked_user_name: "Fake Landlord",
    blocked_user_email: "fake@scam.com",
    reason: "Attempted fraud — collected deposits without property ownership",
    blocked_at: "2026-03-01T12:00:00Z",
    blocked_by: "Admin User",
    status: "active",
  },
];

const REASON_LABELS: Record<string, { sw: string; en: string }> = {
  misleading_photos: { sw: "Picha za kudanganya", en: "Misleading photos" },
  scam: { sw: "Udanganyifu", en: "Scam / Fraud" },
  wrong_price: { sw: "Bei isiyo sahihi", en: "Incorrect price" },
  duplicate: { sw: "Orodha rudufu", en: "Duplicate listing" },
  other: { sw: "Nyingine", en: "Other" },
};

const AdminReports = () => {
  const { lang } = useLanguage();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("reports");
  const [reviewReport, setReviewReport] = useState<any>(null);
  const [reviewNotes, setReviewNotes] = useState("");

  const reports = mockReports;
  const blocks = mockBlocks;

  const pendingReports = reports.filter(r => r.status === "pending" || r.status === "under_review");
  const resolvedReports = reports.filter(r => r.status === "resolved" || r.status === "dismissed");

  const resolveMutation = useMutation({
    mutationFn: async ({ id, action }: { id: string; action: string }) => {
      await new Promise(r => setTimeout(r, 500));
      return { id, status: action };
    },
    onSuccess: (_, vars) => {
      const msg = vars.action === "resolved"
        ? (lang === "sw" ? "Ripoti imesuluhishwa" : "Report resolved")
        : vars.action === "dismissed"
        ? (lang === "sw" ? "Ripoti imeondolewa" : "Report dismissed")
        : (lang === "sw" ? "Inakaguliwa" : "Under review");
      toast({ title: msg });
      setReviewReport(null);
      setReviewNotes("");
    },
  });

  const reportStatusBadge = (status: string) => {
    switch (status) {
      case "pending": return <Badge variant="secondary" className="gap-1"><AlertTriangle className="h-3 w-3" />{lang === "sw" ? "Inasubiri" : "Pending"}</Badge>;
      case "under_review": return <Badge className="gap-1 bg-amber-600"><Eye className="h-3 w-3" />{lang === "sw" ? "Inakaguliwa" : "Under Review"}</Badge>;
      case "resolved": return <Badge variant="default" className="gap-1 bg-emerald-600"><CheckCircle className="h-3 w-3" />{lang === "sw" ? "Imesuluhishwa" : "Resolved"}</Badge>;
      case "dismissed": return <Badge variant="outline" className="gap-1"><XCircle className="h-3 w-3" />{lang === "sw" ? "Imeondolewa" : "Dismissed"}</Badge>;
      default: return <Badge variant="secondary">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6 animate-slide-up">
      <div>
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <ShieldAlert className="h-6 w-6 text-primary" />
          {lang === "sw" ? "Ripoti & Usimamizi" : "Reports & Moderation"}
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          {lang === "sw" ? "Simamia ripoti za nyumba na vizuizi vya watumiaji" : "Manage property reports and user blocks"}
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="reports" className="gap-1">
            <Flag className="h-3.5 w-3.5" />
            {lang === "sw" ? "Ripoti" : "Reports"} ({pendingReports.length})
          </TabsTrigger>
          <TabsTrigger value="resolved" className="gap-1">
            <CheckCircle className="h-3.5 w-3.5" />
            {lang === "sw" ? "Zilizosuluhishwa" : "Resolved"} ({resolvedReports.length})
          </TabsTrigger>
          <TabsTrigger value="blocks" className="gap-1">
            <Ban className="h-3.5 w-3.5" />
            {lang === "sw" ? "Vizuizi" : "Blocks"} ({blocks.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="reports">
          <Card className="border-destructive/20 bg-destructive/5">
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{lang === "sw" ? "Nyumba" : "Property"}</TableHead>
                    <TableHead>{lang === "sw" ? "Aina" : "Reason"}</TableHead>
                    <TableHead>{lang === "sw" ? "Aliripoti" : "Reporter"}</TableHead>
                    <TableHead>{lang === "sw" ? "Tarehe" : "Date"}</TableHead>
                    <TableHead>{lang === "sw" ? "Hali" : "Status"}</TableHead>
                    <TableHead className="text-right">{lang === "sw" ? "Vitendo" : "Actions"}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pendingReports.length > 0 ? pendingReports.map(r => (
                    <TableRow key={r.id} className="hover:bg-muted/50 transition-colors">
                      <TableCell className="font-medium text-sm">{r.property_title}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="text-xs">
                          {REASON_LABELS[r.reason]?.[lang] || r.reason}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm">{r.reporter_name}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">{new Date(r.created_at).toLocaleDateString()}</TableCell>
                      <TableCell>{reportStatusBadge(r.status)}</TableCell>
                      <TableCell className="text-right">
                        <Button size="sm" variant="outline" className="gap-1" onClick={() => { setReviewReport(r); setReviewNotes(r.review_notes || ""); }}>
                          <Eye className="h-3.5 w-3.5" /> {lang === "sw" ? "Kagua" : "Review"}
                        </Button>
                      </TableCell>
                    </TableRow>
                  )) : (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                        {lang === "sw" ? "Hakuna ripoti zinazosubiri." : "No pending reports."}
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="resolved">
          <Card className="glass-strong border-border/30">
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{lang === "sw" ? "Nyumba" : "Property"}</TableHead>
                    <TableHead>{lang === "sw" ? "Aina" : "Reason"}</TableHead>
                    <TableHead>{lang === "sw" ? "Hali" : "Status"}</TableHead>
                    <TableHead>{lang === "sw" ? "Maoni" : "Notes"}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {resolvedReports.length > 0 ? resolvedReports.map(r => (
                    <TableRow key={r.id}>
                      <TableCell className="font-medium text-sm">{r.property_title}</TableCell>
                      <TableCell><Badge variant="outline" className="text-xs">{REASON_LABELS[r.reason]?.[lang] || r.reason}</Badge></TableCell>
                      <TableCell>{reportStatusBadge(r.status)}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">{r.review_notes || "-"}</TableCell>
                    </TableRow>
                  )) : (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center text-muted-foreground py-8">
                        {lang === "sw" ? "Hakuna ripoti zilizosuluhishwa." : "No resolved reports."}
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="blocks">
          <Card className="glass-strong border-border/30">
            <CardHeader><CardTitle className="text-lg flex items-center gap-2"><Ban className="h-5 w-5" />{lang === "sw" ? "Watumiaji Waliozuiwa" : "Blocked Users"}</CardTitle></CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{lang === "sw" ? "Mtumiaji" : "User"}</TableHead>
                    <TableHead>{lang === "sw" ? "Barua pepe" : "Email"}</TableHead>
                    <TableHead>{lang === "sw" ? "Sababu" : "Reason"}</TableHead>
                    <TableHead>{lang === "sw" ? "Tarehe" : "Blocked On"}</TableHead>
                    <TableHead>{lang === "sw" ? "Na" : "By"}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {blocks.length > 0 ? blocks.map(b => (
                    <TableRow key={b.id}>
                      <TableCell className="font-medium text-sm">{b.blocked_user_name}</TableCell>
                      <TableCell className="text-sm">{b.blocked_user_email}</TableCell>
                      <TableCell className="text-sm text-muted-foreground max-w-[200px] truncate">{b.reason}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">{new Date(b.blocked_at).toLocaleDateString()}</TableCell>
                      <TableCell className="text-sm">{b.blocked_by}</TableCell>
                    </TableRow>
                  )) : (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                        {lang === "sw" ? "Hakuna watumiaji waliozuiwa." : "No blocked users."}
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Report Review Dialog */}
      <Dialog open={!!reviewReport} onOpenChange={(o) => { if (!o) { setReviewReport(null); setReviewNotes(""); } }}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Flag className="h-5 w-5 text-destructive" />
              {lang === "sw" ? "Kagua Ripoti" : "Review Report"}
            </DialogTitle>
          </DialogHeader>

          {reviewReport && (
            <div className="space-y-5">
              <div className="bg-muted/50 rounded-lg p-4 space-y-2">
                <h3 className="font-semibold text-foreground">{reviewReport.property_title}</h3>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div><span className="text-muted-foreground">{lang === "sw" ? "Aina:" : "Reason:"}</span> {REASON_LABELS[reviewReport.reason]?.[lang] || reviewReport.reason}</div>
                  <div><span className="text-muted-foreground">{lang === "sw" ? "Aliripoti:" : "Reporter:"}</span> {reviewReport.reporter_name}</div>
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-semibold flex items-center gap-1">
                  <MessageSquare className="h-4 w-4" />
                  {lang === "sw" ? "Maelezo ya Ripoti" : "Report Description"}
                </Label>
                <p className="text-sm bg-muted/30 rounded-lg p-3">{reviewReport.description}</p>
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-semibold">{lang === "sw" ? "Maoni ya Msimamizi" : "Admin Notes"}</Label>
                <Textarea
                  placeholder={lang === "sw" ? "Andika maoni…" : "Write notes…"}
                  value={reviewNotes}
                  onChange={(e) => setReviewNotes(e.target.value)}
                  rows={3}
                />
              </div>

              <div className="flex gap-2">
                {reviewReport.status === "pending" && (
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={() => resolveMutation.mutate({ id: reviewReport.id, action: "under_review" })}
                    disabled={resolveMutation.isPending}
                  >
                    <Eye className="h-4 w-4 mr-1" /> {lang === "sw" ? "Anza Ukaguzi" : "Start Review"}
                  </Button>
                )}
                <Button
                  variant="outline"
                  className="flex-1 text-muted-foreground"
                  onClick={() => resolveMutation.mutate({ id: reviewReport.id, action: "dismissed" })}
                  disabled={resolveMutation.isPending}
                >
                  <XCircle className="h-4 w-4 mr-1" /> {lang === "sw" ? "Ondoa" : "Dismiss"}
                </Button>
                <Button
                  className="flex-1"
                  onClick={() => resolveMutation.mutate({ id: reviewReport.id, action: "resolved" })}
                  disabled={resolveMutation.isPending}
                >
                  <CheckCircle className="h-4 w-4 mr-1" /> {lang === "sw" ? "Suluhisha" : "Resolve"}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminReports;
