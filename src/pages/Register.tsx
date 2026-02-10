import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
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
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName || !phone || !email || !password || !confirmPassword) {
      toast({ title: "Tafadhali jaza sehemu zote", variant: "destructive" });
      return;
    }
    if (password !== confirmPassword) {
      toast({ title: "Maneno siri hayalingani", variant: "destructive" });
      return;
    }
    if (password.length < 8) {
      toast({ title: "Neno siri lazima liwe na herufi 8 au zaidi", variant: "destructive" });
      return;
    }
    setLoading(true);
    try {
      await register({ fullName, email, phone, password, role });
      const redirect = role === "landlord" ? "/dashboard/overview" : "/dashboard/viewings";
      navigate(redirect);
    } catch {
      toast({ title: "Usajili umeshindikana", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left image panel */}
      <div className="hidden lg:flex lg:w-1/2 relative">
        <img src={authBg} alt="" className="h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-foreground/80 to-foreground/20" />
        <div className="absolute bottom-12 left-12 right-12">
          <h2 className="text-3xl font-bold text-primary-foreground mb-3">Jiunge Nasi Leo!</h2>
          <p className="text-primary-foreground/70">Tengeneza akaunti yako na uanze safari ya kupata nyumba bora.</p>
        </div>
      </div>

      {/* Right form panel */}
      <div className="flex-1 flex items-center justify-center p-6 bg-gradient-to-br from-background to-muted/30">
        <Card className="w-full max-w-md glass-strong animate-slide-up border-border/30">
          <CardHeader className="text-center space-y-2">
            <Link to="/" className="inline-flex items-center gap-2 font-extrabold text-xl text-gradient mx-auto mb-2">
              <Home className="h-5 w-5 text-primary" />
              NIKONEKTI
            </Link>
            <CardTitle className="text-2xl">Fungua akaunti yako</CardTitle>
            <CardDescription>Jiunge kama mpangaji au mmiliki</CardDescription>
          </CardHeader>
          <CardContent>
            {/* Role selector */}
            <div className="flex rounded-xl border p-1 mb-6 bg-muted/50">
              {([
                { key: "tenant" as const, label: "Mpangaji" },
                { key: "landlord" as const, label: "Mmiliki" },
              ]).map((r) => (
                <button
                  key={r.key}
                  type="button"
                  onClick={() => setRole(r.key)}
                  className={cn(
                    "flex-1 rounded-lg py-2.5 text-sm font-semibold transition-all",
                    role === r.key ? "bg-primary text-primary-foreground shadow-md" : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  {r.label}
                </button>
              ))}
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="fullName">Jina Kamili</Label>
                <Input id="fullName" placeholder="Jina lako kamili" value={fullName} onChange={(e) => setFullName(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Namba ya Simu</Label>
                <Input id="phone" type="tel" placeholder="+255 700 000 000" value={phone} onChange={(e) => setPhone(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="reg-email">Barua pepe</Label>
                <Input id="reg-email" type="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="reg-password">Neno siri</Label>
                <Input id="reg-password" type="password" placeholder="Angalau herufi 8" value={password} onChange={(e) => setPassword(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirm-password">Thibitisha Neno siri</Label>
                <Input id="confirm-password" type="password" placeholder="••••••••" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
              </div>
              <Button type="submit" className="w-full h-11 text-base font-semibold shadow-md" disabled={loading}>
                {loading ? "Inatengeneza akaunti…" : `Jisajili kama ${role === "tenant" ? "Mpangaji" : "Mmiliki"}`}
              </Button>
            </form>
            <p className="mt-4 text-center text-sm text-muted-foreground">
              Tayari una akaunti? <Link to="/login" className="text-primary font-medium hover:underline">Ingia</Link>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Register;
