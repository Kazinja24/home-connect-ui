import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/i18n/LanguageContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Home } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const Login = () => {
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const { toast } = useToast();

  // For prototype, also support email login
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone || !password) { 
      toast({ title: t("login.fillAll"), variant: "destructive" }); 
      return; 
    }
    setLoading(true);
    try {
      // Convert phone to email format for mock API if needed
      const loginId = phone.includes("@") ? phone : `${phone}@demo.com`;
      await login(loginId, password);
      navigate("/dashboard/applications");
    } catch {
      toast({ title: t("login.failed"), variant: "destructive" });
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
            <span className="font-bold text-2xl text-primary">Kodi</span>
          </Link>
        </div>

        {/* Tab switcher */}
        <div className="flex border-b border-border">
          <button className="flex-1 pb-3 text-sm font-semibold text-primary border-b-2 border-primary">
            Ingia
          </button>
          <Link to="/register" className="flex-1 pb-3 text-sm font-medium text-muted-foreground text-center hover:text-foreground">
            Jisajili
          </Link>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <Label className="text-sm text-foreground">Nambari ya Simu</Label>
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
            <Label className="text-sm text-foreground">{t("login.password")}</Label>
            <Input 
              type="password" 
              placeholder="••••••••" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)}
              className="rounded border-border"
            />
          </div>

          <Button 
            type="submit" 
            className="w-full h-12 rounded bg-primary text-primary-foreground hover:bg-primary/90 font-semibold" 
            disabled={loading}
          >
            {loading ? t("login.submitting") : t("login.submit")}
          </Button>
        </form>

        {/* Demo credentials hint */}
        <div className="text-center text-xs text-muted-foreground space-y-1">
          <p>Demo: tenant@demo.com | landlord@demo.com | admin@demo.com</p>
          <p>Password: password123</p>
        </div>

        <p className="text-center text-sm text-muted-foreground">
          {t("login.noAccount")}{" "}
          <Link to="/register" className="text-primary font-medium hover:underline">
            {t("login.register")}
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
