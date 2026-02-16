import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Receipt, Plus } from "lucide-react";
import { invoices as invoicesApi, leases as leasesApi } from "@/lib/api";
import { useLanguage } from "@/i18n/LanguageContext";
import { useToast } from "@/hooks/use-toast";

const LandlordInvoices = () => {
  const { t } = useLanguage();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState({ lease: "", amount: "", dueDate: "", description: "" });

  const { data, isLoading } = useQuery({
    queryKey: ["landlord-invoices"],
    queryFn: invoicesApi.list,
  });

  const { data: leasesData } = useQuery({
    queryKey: ["landlord-leases-for-invoices"],
    queryFn: leasesApi.list,
  });

  const createMutation = useMutation({
    mutationFn: (data: any) => invoicesApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["landlord-invoices"] });
      toast({ title: t("landlord.invoiceCreated") });
      setForm({ lease: "", amount: "", dueDate: "", description: "" });
      setDialogOpen(false);
    },
    onError: (err: any) => toast({ title: err.message, variant: "destructive" }),
  });

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.lease || !form.amount || !form.dueDate) return;
    createMutation.mutate({
      lease: form.lease,
      amount: Number(form.amount),
      due_date: form.dueDate,
      description: form.description,
    });
  };

  const statusVariant = (status: string) => {
    if (status === "paid") return "default" as const;
    if (status === "overdue") return "destructive" as const;
    return "secondary" as const;
  };

  const activeLeases = leasesData?.filter((l: any) => l.status === "signed" || l.status === "active") || [];

  return (
    <div className="space-y-6 animate-slide-up">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Receipt className="h-6 w-6 text-primary" />
          <h1 className="text-2xl font-bold text-foreground">{t("landlord.invoicesTitle")}</h1>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button className="shadow-md"><Plus className="h-4 w-4 mr-2" />{t("landlord.createInvoice")}</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>{t("landlord.createInvoice")}</DialogTitle></DialogHeader>
            <form onSubmit={handleCreate} className="space-y-4">
              <div className="space-y-2">
                <Label>{t("messages.lease")}</Label>
                <Select value={form.lease} onValueChange={(v) => setForm(f => ({ ...f, lease: v }))}>
                  <SelectTrigger><SelectValue placeholder={t("landlord.selectLease")} /></SelectTrigger>
                  <SelectContent>
                    {activeLeases.map((l: any) => (
                      <SelectItem key={l.id} value={String(l.id)}>
                        {l.property_title || `${t("common.property")} #${l.property}`} — {l.tenant_name || `${t("common.tenant")} #${l.tenant}`}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>{t("landlord.invoiceAmount")}</Label>
                <Input type="number" placeholder="500000" value={form.amount} onChange={(e) => setForm(f => ({ ...f, amount: e.target.value }))} />
              </div>
              <div className="space-y-2">
                <Label>{t("landlord.invoiceDueDate")}</Label>
                <Input type="date" value={form.dueDate} onChange={(e) => setForm(f => ({ ...f, dueDate: e.target.value }))} />
              </div>
              <div className="space-y-2">
                <Label>{t("landlord.invoiceDescription")}</Label>
                <Input placeholder={t("landlord.invoiceDescription")} value={form.description} onChange={(e) => setForm(f => ({ ...f, description: e.target.value }))} />
              </div>
              <Button type="submit" className="w-full font-semibold" disabled={createMutation.isPending}>
                {createMutation.isPending ? t("common.loading") : t("landlord.createInvoice")}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card className="glass-strong border-border/30">
        <CardHeader><CardTitle className="text-lg">{t("landlord.invoicesTitle")}</CardTitle></CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">{[1, 2, 3].map(i => <Skeleton key={i} className="h-12 w-full" />)}</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t("common.tenant")}</TableHead>
                  <TableHead>{t("common.property")}</TableHead>
                  <TableHead>{t("common.amount")}</TableHead>
                  <TableHead>{t("tenant.dueDate")}</TableHead>
                  <TableHead>{t("common.status")}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data && data.length > 0 ? data.map((inv: any) => (
                  <TableRow key={inv.id} className="hover:bg-muted/50 transition-colors">
                    <TableCell className="font-medium">{inv.tenant_name || `${t("common.tenant")} #${inv.tenant}`}</TableCell>
                    <TableCell>{inv.property_title || `${t("common.property")} #${inv.property}`}</TableCell>
                    <TableCell>TZS {Number(inv.amount).toLocaleString()}</TableCell>
                    <TableCell>{inv.due_date ? new Date(inv.due_date).toLocaleDateString() : "—"}</TableCell>
                    <TableCell><Badge variant={statusVariant(inv.status)}>{t(`status.${inv.status}`) || inv.status}</Badge></TableCell>
                  </TableRow>
                )) : (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center text-muted-foreground py-8">{t("landlord.noInvoices")}</TableCell>
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

export default LandlordInvoices;
