import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Home } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import authBg from "@/assets/auth-bg.jpg";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast({ title: "Tafadhali jaza sehemu zote", variant: "destructive" });
      return;
    }
    setLoading(true);
    try {
      await login(email, password);
      // Navigate based on role after login - auth context sets user
      navigate("/dashboard/viewings");
    } catch {
      toast({ title: "Kuingia kumeshindikana", variant: "destructive" });
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
          <h2 className="text-3xl font-bold text-primary-foreground mb-3">Karibu Tena!</h2>
          <p className="text-primary-foreground/70">Ingia kwenye akaunti yako na uendelee kupata nyumba bora.</p>
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
            <CardTitle className="text-2xl">Karibu tena</CardTitle>
            <CardDescription>Ingia kwenye akaunti yako</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Barua pepe</Label>
                <Input id="email" type="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Neno siri</Label>
                <Input id="password" type="password" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} />
              </div>
              <Button type="submit" className="w-full h-11 text-base font-semibold shadow-md" disabled={loading}>
                {loading ? "Inaingia…" : "Ingia"}
              </Button>
            </form>
            <p className="mt-4 text-center text-sm text-muted-foreground">
              Huna akaunti? <Link to="/register" className="text-primary font-medium hover:underline">Jisajili</Link>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Login;
