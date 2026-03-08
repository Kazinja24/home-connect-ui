import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/i18n/LanguageContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import nikonektiLogo from "@/assets/nikonekti-logo.png";
import { useToast } from "@/hooks/use-toast";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";

const Login = () => {
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [step, setStep] = useState<"phone" | "otp">("phone");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSendOtp = async () => {
    if (!phone || phone.length < 9) {
      toast({ title: t("login.fillAll"), variant: "destructive" });
      return;
    }
    setLoading(true);
    await new Promise((r) => setTimeout(r, 800));
    setLoading(false);
    toast({ title: "Nambari ya uthibitisho imetumwa kwa +255 " + phone });
    setStep("otp");
  };

  const handleVerifyOtp = async () => {
    if (otp.length < 6) {
      toast({ title: "Tafadhali weka nambari kamili", variant: "destructive" });
      return;
    }
    setLoading(true);
    try {
      // For demo: map phone to email for mock API
      let loginId = `${phone}@demo.com`;
      if (phone.includes("landlord") || phone === "222222222") loginId = "landlord@demo.com";
      else if (phone.includes("admin") || phone === "333333333") loginId = "admin@demo.com";
      else loginId = "tenant@demo.com";
      
      await login(loginId, "password123");
      navigate("/dashboard/applications");
    } catch {
      toast({ title: t("login.failed"), variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (step === "phone") {
      await handleSendOtp();
    } else {
      await handleVerifyOtp();
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-sm space-y-8">
        {/* Logo */}
        <div className="text-center">
          <Link to="/" className="inline-flex items-center gap-2 mb-8">
            <img src={nikonektiLogo} alt="NIKONEKTI" className="h-8 w-auto" />
            <span className="font-bold text-2xl text-primary">NIKONEKTI</span>
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
          {step === "phone" && (
            <>
              <div className="text-center mb-2">
                <p className="font-semibold text-foreground">Karibu Tena!</p>
                <p className="text-sm text-muted-foreground mt-1">Weka nambari yako ya simu kuingia</p>
              </div>
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
                    autoFocus
                  />
                </div>
              </div>
              <Button
                type="submit"
                className="w-full h-12 rounded bg-primary text-primary-foreground hover:bg-primary/90 font-semibold"
                disabled={loading}
              >
                {loading ? "Inatuma…" : "Tuma OTP"}
              </Button>
            </>
          )}

          {step === "otp" && (
            <>
              <div className="text-center mb-2">
                <p className="font-semibold text-foreground">Thibitisha Nambari</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Weka nambari iliyotumwa kwa<br />
                  <span className="font-medium text-foreground">+255 {phone}</span>
                </p>
              </div>
              <div className="flex justify-center">
                <InputOTP maxLength={6} value={otp} onChange={setOtp}>
                  <InputOTPGroup>
                    <InputOTPSlot index={0} />
                    <InputOTPSlot index={1} />
                    <InputOTPSlot index={2} />
                    <InputOTPSlot index={3} />
                    <InputOTPSlot index={4} />
                    <InputOTPSlot index={5} />
                  </InputOTPGroup>
                </InputOTP>
              </div>
              <button
                type="button"
                onClick={handleSendOtp}
                className="text-sm text-primary hover:underline mx-auto block"
                disabled={loading}
              >
                Hukupata? Tuma tena
              </button>
              <div className="flex gap-3">
                <Button type="button" variant="outline" onClick={() => { setStep("phone"); setOtp(""); }} className="flex-1 rounded">
                  Rudi
                </Button>
                <Button type="submit" className="flex-1 h-12 rounded bg-primary text-primary-foreground hover:bg-primary/90 font-semibold" disabled={loading || otp.length < 6}>
                  {loading ? "Inaingia…" : "Ingia"}
                </Button>
              </div>
            </>
          )}
        </form>

        {/* Demo hint */}
        <div className="text-center text-xs text-muted-foreground space-y-1">
          <p>Demo: 111111111 (tenant) | 222222222 (landlord) | 333333333 (admin)</p>
          <p>OTP: weka nambari yoyote 6</p>
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
