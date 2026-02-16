import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/i18n/LanguageContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Home } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { UserRole } from "@/types";
import { cn } from "@/lib/utils";
import authBg from "@/assets/auth-bg.jpg";

const Register = () => {
  const [searchParams] = useSearchParams();
  const [role, setRole] = useState<UserRole>((searchParams.get("role") as UserRole) || "tenant");
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName || !phone || !email || !password || !confirmPassword) { toast({ title: t("register.fillAll"), variant: "destructive" }); return; }
    if (password !== confirmPassword) { toast({ title: t("register.passwordMismatch"), variant: "destructive" }); return; }
    if (password.length < 8) { toast({ title: t("register.passwordShort"), variant: "destructive" }); return; }
    setLoading(true);
    try {
      await register({ fullName, email, phone, password, role });
      navigate(role === "landlord" ? "/dashboard/overview" : "/dashboard/applications");
    } catch {
      toast({ title: t("register.failed"), variant: "destructive" });
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen flex">
      <div className="hidden lg:flex lg:w-1/2 relative">
        <img src={authBg} alt="" className="h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-foreground/80 to-foreground/20" />
        <div className="absolute bottom-12 left-12 right-12">
          <h2 className="text-3xl font-bold text-primary-foreground mb-3">{t("register.welcome")}</h2>
          <p className="text-primary-foreground/70">{t("register.welcomeSub")}</p>
        </div>
      </div>
      <div className="flex-1 flex items-center justify-center p-6 bg-gradient-to-br from-background to-muted/30">
        <Card className="w-full max-w-md glass-strong animate-slide-up border-border/30">
          <CardHeader className="text-center space-y-2">
            <Link to="/" className="inline-flex items-center gap-2 font-extrabold text-xl text-gradient mx-auto mb-2"><Home className="h-5 w-5 text-primary" />NIKONEKTI</Link>
            <CardTitle className="text-2xl">{t("register.title")}</CardTitle>
            <CardDescription>{t("register.subtitle")}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex rounded-xl border p-1 mb-6 bg-muted/50">
              {([{ key: "tenant" as const, label: t("role.tenant") }, { key: "landlord" as const, label: t("role.landlord") }]).map((r) => (
                <button key={r.key} type="button" onClick={() => setRole(r.key)} className={cn("flex-1 rounded-lg py-2.5 text-sm font-semibold transition-all", role === r.key ? "bg-primary text-primary-foreground shadow-md" : "text-muted-foreground hover:text-foreground")}>{r.label}</button>
              ))}
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2"><Label>{t("register.fullName")}</Label><Input placeholder={t("register.fullName")} value={fullName} onChange={(e) => setFullName(e.target.value)} /></div>
              <div className="space-y-2"><Label>{t("register.phone")}</Label><Input type="tel" placeholder="+255 700 000 000" value={phone} onChange={(e) => setPhone(e.target.value)} /></div>
              <div className="space-y-2"><Label>{t("register.email")}</Label><Input type="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} /></div>
              <div className="space-y-2"><Label>{t("register.password")}</Label><Input type="password" placeholder={t("register.passwordHint")} value={password} onChange={(e) => setPassword(e.target.value)} /></div>
              <div className="space-y-2"><Label>{t("register.confirmPassword")}</Label><Input type="password" placeholder="••••••••" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} /></div>
              <Button type="submit" className="w-full h-11 text-base font-semibold shadow-md" disabled={loading}>{loading ? t("register.submitting") : t("register.submit", { role: role === "tenant" ? t("role.tenant") : t("role.landlord") })}</Button>
            </form>
            <p className="mt-4 text-center text-sm text-muted-foreground">{t("register.hasAccount")} <Link to="/login" className="text-primary font-medium hover:underline">{t("register.login")}</Link></p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Register;
