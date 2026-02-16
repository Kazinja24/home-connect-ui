import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Search } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/i18n/LanguageContext";

const mockUsers = [
  { id: "1", name: "Alice Mbeki", email: "alice@example.com", role: "tenant", status: "active" },
  { id: "2", name: "James Mwanga", email: "james@example.com", role: "landlord", status: "active" },
  { id: "3", name: "Bob Kamara", email: "bob@example.com", role: "tenant", status: "suspended" },
];

const AdminUsers = () => {
  const { t } = useLanguage();
  const [search, setSearch] = useState("");
  const [suspendDialog, setSuspendDialog] = useState<string | null>(null);
  const [reason, setReason] = useState("");
  const { toast } = useToast();

  const filtered = mockUsers.filter((u) => u.name.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="space-y-6 animate-slide-up">
      <h1 className="text-2xl font-bold text-foreground">{t("admin.userManagement")}</h1>
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input placeholder={t("admin.searchUsers")} className="pl-10" value={search} onChange={(e) => setSearch(e.target.value)} />
      </div>
      <Card className="glass-strong border-border/30">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t("admin.name")}</TableHead>
                <TableHead>{t("admin.email")}</TableHead>
                <TableHead>{t("admin.role")}</TableHead>
                <TableHead>{t("common.status")}</TableHead>
                <TableHead className="text-right">{t("common.actions")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((u) => (
                <TableRow key={u.id} className="hover:bg-muted/50 transition-colors">
                  <TableCell className="font-medium">{u.name}</TableCell>
                  <TableCell>{u.email}</TableCell>
                  <TableCell className="capitalize">{t(`role.${u.role}`)}</TableCell>
                  <TableCell><Badge variant={u.status === "active" ? "secondary" : "destructive"}>{t(`status.${u.status}`) || u.status}</Badge></TableCell>
                  <TableCell className="text-right">
                    {u.status === "active" && <Button size="sm" variant="ghost" className="text-destructive" onClick={() => setSuspendDialog(u.id)}>{t("admin.suspend")}</Button>}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      <Dialog open={!!suspendDialog} onOpenChange={() => setSuspendDialog(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>{t("admin.suspendUser")}</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2"><Label>{t("admin.suspendReason")}</Label><Textarea placeholder={t("admin.suspendReasonPlaceholder")} value={reason} onChange={(e) => setReason(e.target.value)} /></div>
            <Button className="w-full" variant="destructive" onClick={() => { toast({ title: t("admin.userSuspended") }); setSuspendDialog(null); setReason(""); }}>{t("admin.confirmSuspend")}</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminUsers;
