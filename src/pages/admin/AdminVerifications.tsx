import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/i18n/LanguageContext";
import { ShieldCheck, ShieldX, Eye, Clock, CheckCircle2, XCircle, UserCheck, FileText } from "lucide-react";

// Mock verification requests for prototype
const mockVerificationRequests = [
  {
    id: "vr1",
    landlord_id: "l1",
    landlord_name: "Hassan Mwangi",
    landlord_email: "landlord@demo.com",
    landlord_phone: "+255 713 456 789",
    nida_id: "19850612-12345-00001-01",
    selfie_url: "/placeholder.svg",
    nida_document_url: "/placeholder.svg",
    business_license_url: null,
    status: "pending",
    submitted_at: "2026-03-01T10:00:00Z",
    reviewed_at: null,
    reviewer_notes: "",
  },
  {
    id: "vr2",
    landlord_id: "l2",
    landlord_name: "Grace Kimaro",
    landlord_email: "grace@demo.com",
    landlord_phone: "+255 715 678 901",
    nida_id: "19900315-54321-00002-02",
    selfie_url: "/placeholder.svg",
    nida_document_url: "/placeholder.svg",
    business_license_url: "/placeholder.svg",
    status: "pending",
    submitted_at: "2026-03-05T14:00:00Z",
    reviewed_at: null,
    reviewer_notes: "",
  },
  {
    id: "vr3",
    landlord_id: "l3",
    landlord_name: "John Mushi",
    landlord_email: "john@demo.com",
    landlord_phone: "+255 716 789 012",
    nida_id: "19880720-67890-00003-03",
    selfie_url: "/placeholder.svg",
    nida_document_url: "/placeholder.svg",
    business_license_url: null,
    status: "approved",
    submitted_at: "2026-02-20T09:00:00Z",
    reviewed_at: "2026-02-21T11:00:00Z",
    reviewer_notes: "Documents verified. All clear.",
  },
  {
    id: "vr4",
    landlord_id: "l4",
    landlord_name: "Fatuma Said",
    landlord_email: "fatuma@demo.com",
    landlord_phone: "+255 717 890 123",
    nida_id: "19950101-11111-00004-04",
    selfie_url: "/placeholder.svg",
    nida_document_url: "/placeholder.svg",
    business_license_url: null,
    status: "rejected",
    submitted_at: "2026-02-25T16:00:00Z",
    reviewed_at: "2026-02-26T10:00:00Z",
    reviewer_notes: "NIDA document is blurry and unreadable. Please resubmit.",
  },
];

const AdminVerifications = () => {
  const { t, lang } = useLanguage();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("pending");
  const [reviewItem, setReviewItem] = useState<any>(null);
  const [notes, setNotes] = useState("");

  const { data: requests = mockVerificationRequests, isLoading } = useQuery({
    queryKey: ["admin-verifications"],
    queryFn: async () => mockVerificationRequests,
  });

  const approveMutation = useMutation({
    mutationFn: async (id: string) => {
      await new Promise(r => setTimeout(r, 500));
      return { id, status: "approved" };
    },
    onSuccess: () => {
      toast({ title: lang === "sw" ? "Uthibitisho umekubaliwa" : "Verification approved" });
      setReviewItem(null);
      setNotes("");
    },
  });

  const rejectMutation = useMutation({
    mutationFn: async (id: string) => {
      await new Promise(r => setTimeout(r, 500));
      return { id, status: "rejected" };
    },
    onSuccess: () => {
      toast({ title: lang === "sw" ? "Uthibitisho umekataliwa" : "Verification rejected" });
      setReviewItem(null);
      setNotes("");
    },
  });

  const pending = requests.filter(r => r.status === "pending");
  const approved = requests.filter(r => r.status === "approved");
  const rejected = requests.filter(r => r.status === "rejected");

  const statusBadge = (status: string) => {
    switch (status) {
      case "pending": return <Badge variant="secondary" className="gap-1"><Clock className="h-3 w-3" />{lang === "sw" ? "Inasubiri" : "Pending"}</Badge>;
      case "approved": return <Badge variant="default" className="gap-1 bg-emerald-600"><CheckCircle2 className="h-3 w-3" />{lang === "sw" ? "Imekubaliwa" : "Approved"}</Badge>;
      case "rejected": return <Badge variant="destructive" className="gap-1"><XCircle className="h-3 w-3" />{lang === "sw" ? "Imekataliwa" : "Rejected"}</Badge>;
      default: return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const renderTable = (items: typeof requests) => (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>{lang === "sw" ? "Mmiliki" : "Landlord"}</TableHead>
          <TableHead>{lang === "sw" ? "Barua pepe" : "Email"}</TableHead>
          <TableHead>NIDA ID</TableHead>
          <TableHead>{lang === "sw" ? "Tarehe" : "Submitted"}</TableHead>
          <TableHead>{t("common.status")}</TableHead>
          <TableHead className="text-right">{t("common.actions")}</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {items.length > 0 ? items.map(req => (
          <TableRow key={req.id} className="hover:bg-muted/50 transition-colors">
            <TableCell>
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary">
                  {req.landlord_name.charAt(0)}
                </div>
                <div>
                  <p className="font-medium text-sm">{req.landlord_name}</p>
                  <p className="text-xs text-muted-foreground">{req.landlord_phone}</p>
                </div>
              </div>
            </TableCell>
            <TableCell className="text-sm">{req.landlord_email}</TableCell>
            <TableCell className="text-sm font-mono">{req.nida_id}</TableCell>
            <TableCell className="text-sm text-muted-foreground">{new Date(req.submitted_at).toLocaleDateString()}</TableCell>
            <TableCell>{statusBadge(req.status)}</TableCell>
            <TableCell className="text-right">
              <Button size="sm" variant="outline" className="gap-1" onClick={() => { setReviewItem(req); setNotes(req.reviewer_notes || ""); }}>
                <Eye className="h-3.5 w-3.5" />
                {lang === "sw" ? "Kagua" : "Review"}
              </Button>
            </TableCell>
          </TableRow>
        )) : (
          <TableRow>
            <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
              {lang === "sw" ? "Hakuna maombi." : "No verification requests."}
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  );

  return (
    <div className="space-y-6 animate-slide-up">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <ShieldCheck className="h-6 w-6 text-primary" />
            {lang === "sw" ? "Uthibitisho wa Wamiliki" : "Landlord Verifications"}
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {lang === "sw" ? "Kagua na uthibitishe nyaraka za wamiliki ndani ya masaa 24" : "Review and verify landlord documents within 24 hours"}
          </p>
        </div>
        {pending.length > 0 && (
          <Badge variant="secondary" className="text-base px-4 py-2 bg-accent/20 text-accent-foreground">
            {pending.length} {lang === "sw" ? "zinasubiri" : "pending"}
          </Badge>
        )}
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="pending" className="gap-1">
            <Clock className="h-3.5 w-3.5" />
            {lang === "sw" ? "Zinasubiri" : "Pending"} ({pending.length})
          </TabsTrigger>
          <TabsTrigger value="approved" className="gap-1">
            <CheckCircle2 className="h-3.5 w-3.5" />
            {lang === "sw" ? "Zilizokubaliwa" : "Approved"} ({approved.length})
          </TabsTrigger>
          <TabsTrigger value="rejected" className="gap-1">
            <XCircle className="h-3.5 w-3.5" />
            {lang === "sw" ? "Zilizokataliwa" : "Rejected"} ({rejected.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pending">
          <Card className="border-accent/20 bg-accent/5">
            <CardContent className="p-0">
              {isLoading ? <div className="p-6 space-y-3">{[1,2,3].map(i => <Skeleton key={i} className="h-12 w-full" />)}</div> : renderTable(pending)}
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="approved">
          <Card className="glass-strong border-border/30">
            <CardContent className="p-0">{renderTable(approved)}</CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="rejected">
          <Card className="glass-strong border-border/30">
            <CardContent className="p-0">{renderTable(rejected)}</CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Review Dialog */}
      <Dialog open={!!reviewItem} onOpenChange={(o) => { if (!o) { setReviewItem(null); setNotes(""); } }}>
        <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <UserCheck className="h-5 w-5 text-primary" />
              {lang === "sw" ? "Kagua Uthibitisho" : "Review Verification"}
            </DialogTitle>
          </DialogHeader>

          {reviewItem && (
            <div className="space-y-5">
              {/* Landlord Info */}
              <div className="bg-muted/50 rounded-lg p-4 space-y-2">
                <h3 className="font-semibold text-foreground">{reviewItem.landlord_name}</h3>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div><span className="text-muted-foreground">{lang === "sw" ? "Barua pepe:" : "Email:"}</span> {reviewItem.landlord_email}</div>
                  <div><span className="text-muted-foreground">{lang === "sw" ? "Simu:" : "Phone:"}</span> {reviewItem.landlord_phone}</div>
                  <div className="col-span-2"><span className="text-muted-foreground">NIDA ID:</span> <span className="font-mono">{reviewItem.nida_id}</span></div>
                  <div className="col-span-2"><span className="text-muted-foreground">{lang === "sw" ? "Imewasilishwa:" : "Submitted:"}</span> {new Date(reviewItem.submitted_at).toLocaleString()}</div>
                </div>
              </div>

              {/* Documents */}
              <div className="space-y-3">
                <Label className="text-sm font-semibold flex items-center gap-1">
                  <FileText className="h-4 w-4" />
                  {lang === "sw" ? "Nyaraka Zilizowasilishwa" : "Submitted Documents"}
                </Label>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground">{lang === "sw" ? "Kitambulisho cha NIDA" : "NIDA Document"}</p>
                    <div className="border border-border rounded-lg overflow-hidden aspect-[4/3] bg-muted flex items-center justify-center">
                      <img src={reviewItem.nida_document_url} alt="NIDA" className="w-full h-full object-cover" />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground">{lang === "sw" ? "Picha ya Uso (Selfie)" : "Selfie Photo"}</p>
                    <div className="border border-border rounded-lg overflow-hidden aspect-[4/3] bg-muted flex items-center justify-center">
                      <img src={reviewItem.selfie_url} alt="Selfie" className="w-full h-full object-cover" />
                    </div>
                  </div>
                  {reviewItem.business_license_url && (
                    <div className="col-span-2 space-y-1">
                      <p className="text-xs text-muted-foreground">{lang === "sw" ? "Leseni ya Biashara" : "Business License"}</p>
                      <div className="border border-border rounded-lg overflow-hidden aspect-video bg-muted flex items-center justify-center">
                        <img src={reviewItem.business_license_url} alt="License" className="w-full h-full object-cover" />
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Admin Notes */}
              <div className="space-y-2">
                <Label className="text-sm font-semibold">{lang === "sw" ? "Maoni ya Msimamizi" : "Admin Notes"}</Label>
                <Textarea
                  placeholder={lang === "sw" ? "Andika maoni au sababu ya kukataa…" : "Write notes or rejection reason…"}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={3}
                  disabled={reviewItem.status !== "pending"}
                />
              </div>

              {/* Status display for reviewed items */}
              {reviewItem.status !== "pending" && (
                <div className="flex items-center gap-2 text-sm bg-muted/50 rounded-lg p-3">
                  {statusBadge(reviewItem.status)}
                  <span className="text-muted-foreground">
                    {lang === "sw" ? "Imekaguliwa" : "Reviewed"}: {reviewItem.reviewed_at ? new Date(reviewItem.reviewed_at).toLocaleString() : "-"}
                  </span>
                </div>
              )}

              {/* Action Buttons (only for pending) */}
              {reviewItem.status === "pending" && (
                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    className="flex-1 gap-2 text-destructive border-destructive/30 hover:bg-destructive/10"
                    onClick={() => {
                      if (!notes.trim()) {
                        toast({ title: lang === "sw" ? "Tafadhali andika sababu ya kukataa" : "Please provide a reason for rejection", variant: "destructive" });
                        return;
                      }
                      rejectMutation.mutate(reviewItem.id);
                    }}
                    disabled={rejectMutation.isPending}
                  >
                    <ShieldX className="h-4 w-4" />
                    {rejectMutation.isPending ? "..." : lang === "sw" ? "Kataa" : "Reject"}
                  </Button>
                  <Button
                    className="flex-1 gap-2"
                    onClick={() => approveMutation.mutate(reviewItem.id)}
                    disabled={approveMutation.isPending}
                  >
                    <ShieldCheck className="h-4 w-4" />
                    {approveMutation.isPending ? "..." : lang === "sw" ? "Kubali" : "Approve"}
                  </Button>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminVerifications;
