import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/i18n/LanguageContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Home, Building2, User, Upload } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { UserRole } from "@/types";
import { cn } from "@/lib/utils";

const Register = () => {
  const [searchParams] = useSearchParams();
  const [step, setStep] = useState(1); // 1: role, 2: details, 3: NIDA (landlord)
  const [role, setRole] = useState<UserRole>((searchParams.get("role") as UserRole) || "tenant");
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [nidaFile, setNidaFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (step === 1) {
      setStep(2);
      return;
    }

    if (step === 2) {
      if (!fullName || !phone || !email || !password) { 
        toast({ title: t("register.fillAll"), variant: "destructive" }); 
        return; 
      }
      if (password.length < 8) { 
        toast({ title: t("register.passwordShort"), variant: "destructive" }); 
        return; 
      }
      
      if (role === "landlord") {
        setStep(3);
        return;
      }
      
      // Register tenant
      await doRegister();
      return;
    }

    // Step 3: NIDA upload for landlord
    if (!nidaFile) {
      toast({ title: "Tafadhali pakia kitambulisho cha NIDA", variant: "destructive" });
      return;
    }
    await doRegister();
  };

  const doRegister = async () => {
    setLoading(true);
    try {
      await register({ fullName, email, phone, password, role });
      navigate(role === "landlord" ? "/dashboard/overview" : "/dashboard/applications");
    } catch {
      toast({ title: t("register.failed"), variant: "destructive" });
    } finally { 
      setLoading(false); 
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-sm space-y-8">
        {/* Logo */}
        <div className="text-center">
          <Link to="/" className="inline-flex items-center gap-2 mb-8">
            <Home className="h-6 w-6 text-primary" strokeWidth={1.5} />
            <span className="font-bold text-2xl text-primary">Nikonekti</span>
          </Link>
        </div>

        {/* Tab switcher */}
        <div className="flex border-b border-border">
          <Link to="/login" className="flex-1 pb-3 text-sm font-medium text-muted-foreground text-center hover:text-foreground">
            Ingia
          </Link>
          <button className="flex-1 pb-3 text-sm font-semibold text-primary border-b-2 border-primary">
            Jisajili
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Step 1: Role selection */}
          {step === 1 && (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground text-center mb-4">Chagua aina ya akaunti</p>
              <div className="grid grid-cols-2 gap-4">
                {/* Tenant card */}
                <button
                  type="button"
                  onClick={() => setRole("tenant")}
                  className={cn(
                    "p-6 rounded-lg border-2 text-center transition-all",
                    role === "tenant" 
                      ? "border-primary bg-primary/5" 
                      : "border-border hover:border-primary/50"
                  )}
                >
                  <User className={cn("h-8 w-8 mx-auto mb-3", role === "tenant" ? "text-primary" : "text-muted-foreground")} strokeWidth={1.5} />
                  <p className="font-semibold text-foreground">Mpangaji</p>
                  <p className="text-xs text-muted-foreground mt-1">Tafuta nyumba</p>
                </button>

                {/* Landlord card */}
                <button
                  type="button"
                  onClick={() => setRole("landlord")}
                  className={cn(
                    "p-6 rounded-lg border-2 text-center transition-all",
                    role === "landlord" 
                      ? "border-primary bg-primary/5" 
                      : "border-border hover:border-primary/50"
                  )}
                >
                  <Building2 className={cn("h-8 w-8 mx-auto mb-3", role === "landlord" ? "text-primary" : "text-muted-foreground")} strokeWidth={1.5} />
                  <p className="font-semibold text-foreground">Mwenye Nyumba</p>
                  <p className="text-xs text-muted-foreground mt-1">Orodhesha mali</p>
                </button>
              </div>
              <Button type="submit" className="w-full h-12 rounded bg-primary text-primary-foreground hover:bg-primary/90 font-semibold">
                Endelea
              </Button>
            </div>
          )}

          {/* Step 2: Details */}
          {step === 2 && (
            <div className="space-y-5">
              <div className="space-y-2">
                <Label className="text-sm">{t("register.fullName")}</Label>
                <Input 
                  placeholder="Jina Kamili" 
                  value={fullName} 
                  onChange={(e) => setFullName(e.target.value)}
                  className="rounded border-border"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-sm">Nambari ya Simu</Label>
                <div className="flex">
                  <span className="inline-flex items-center px-3 bg-muted border border-r-0 border-border rounded-l text-sm text-muted-foreground">
                    +255
                  </span>
                  <Input 
                    type="tel" 
                    placeholder="7XX XXX XXX" 
                    value={phone} 
                    onChange={(e) => setPhone(e.target.value)}
                    className="rounded-l-none rounded-r border-border"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-sm">{t("register.email")}</Label>
                <Input 
                  type="email" 
                  placeholder="barua@mfano.com" 
                  value={email} 
                  onChange={(e) => setEmail(e.target.value)}
                  className="rounded border-border"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-sm">{t("register.password")}</Label>
                <Input 
                  type="password" 
                  placeholder="Angalau herufi 8" 
                  value={password} 
                  onChange={(e) => setPassword(e.target.value)}
                  className="rounded border-border"
                />
              </div>

              <div className="flex gap-3">
                <Button type="button" variant="outline" onClick={() => setStep(1)} className="flex-1 rounded">
                  Rudi
                </Button>
                <Button type="submit" className="flex-1 h-12 rounded bg-primary text-primary-foreground hover:bg-primary/90 font-semibold" disabled={loading}>
                  {role === "landlord" ? "Endelea" : (loading ? t("register.submitting") : "Jisajili")}
                </Button>
              </div>
            </div>
          )}

          {/* Step 3: NIDA upload (landlord only) */}
          {step === 3 && (
            <div className="space-y-5">
              <div className="text-center mb-4">
                <p className="font-semibold text-foreground">Thibitisha Kitambulisho</p>
                <p className="text-sm text-muted-foreground mt-1">Pakia picha ya Kitambulisho cha NIDA</p>
              </div>

              <label className="block border-2 border-dashed border-border rounded-lg p-8 text-center cursor-pointer hover:border-primary/50 transition-colors">
                <input 
                  type="file" 
                  accept="image/*,.pdf" 
                  className="hidden"
                  onChange={(e) => setNidaFile(e.target.files?.[0] || null)}
                />
                <Upload className="h-10 w-10 mx-auto text-muted-foreground mb-3" strokeWidth={1.5} />
                {nidaFile ? (
                  <p className="text-sm font-medium text-primary">{nidaFile.name}</p>
                ) : (
                  <>
                    <p className="text-sm font-medium text-foreground">Pakia Kitambulisho cha NIDA</p>
                    <p className="text-xs text-muted-foreground mt-1">JPEG, PNG au PDF (max 5MB)</p>
                  </>
                )}
              </label>

              <div className="flex gap-3">
                <Button type="button" variant="outline" onClick={() => setStep(2)} className="flex-1 rounded">
                  Rudi
                </Button>
                <Button type="submit" className="flex-1 h-12 rounded bg-primary text-primary-foreground hover:bg-primary/90 font-semibold" disabled={loading}>
                  {loading ? t("register.submitting") : "Maliza Usajili"}
                </Button>
              </div>
            </div>
          )}
        </form>

        <p className="text-center text-sm text-muted-foreground">
          {t("register.hasAccount")}{" "}
          <Link to="/login" className="text-primary font-medium hover:underline">
            {t("register.login")}
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
