import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/i18n/LanguageContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Building2, User, Upload, Camera } from "lucide-react";
import nikonektiLogo from "@/assets/nikonekti-logo.png";
import { useToast } from "@/hooks/use-toast";
import type { UserRole } from "@/types";
import { cn } from "@/lib/utils";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";

const Register = () => {
  const [searchParams] = useSearchParams();
  // Steps: 1=role, 2=phone, 3=OTP, 4=profile, 5=NIDA+selfie (landlord)
  const [step, setStep] = useState(1);
  const [role, setRole] = useState<UserRole>((searchParams.get("role") as UserRole) || "tenant");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [nidaFile, setNidaFile] = useState<File | null>(null);
  const [selfieFile, setSelfieFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSendOtp = async () => {
    if (!phone || phone.length < 9) {
      toast({ title: "Tafadhali weka nambari sahihi ya simu", variant: "destructive" });
      return;
    }
    setLoading(true);
    // Mock OTP send
    await new Promise((r) => setTimeout(r, 800));
    setOtpSent(true);
    setLoading(false);
    toast({ title: "Nambari ya uthibitisho imetumwa kwa +255 " + phone });
    setStep(3);
  };

  const handleVerifyOtp = async () => {
    if (otp.length < 6) {
      toast({ title: "Tafadhali weka nambari kamili ya uthibitisho", variant: "destructive" });
      return;
    }
    setLoading(true);
    // Mock OTP verification (accept any 6-digit code)
    await new Promise((r) => setTimeout(r, 600));
    setLoading(false);
    toast({ title: "Nambari imethibitishwa!" });
    setStep(4);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (step === 1) {
      setStep(2);
      return;
    }

    if (step === 2) {
      await handleSendOtp();
      return;
    }

    if (step === 3) {
      await handleVerifyOtp();
      return;
    }

    if (step === 4) {
      if (!fullName) {
        toast({ title: t("register.fillAll"), variant: "destructive" });
        return;
      }
      if (role === "landlord") {
        setStep(5);
        return;
      }
      await doRegister();
      return;
    }

    // Step 5: NIDA + selfie for landlord
    if (!nidaFile || !selfieFile) {
      toast({ title: "Tafadhali pakia kitambulisho cha NIDA na picha ya uso", variant: "destructive" });
      return;
    }
    await doRegister();
  };

  const doRegister = async () => {
    setLoading(true);
    try {
      await register({ fullName, email: email || `${phone}@nikonekti.co.tz`, phone, password: "otp-verified", role });
      navigate(role === "landlord" ? "/dashboard/overview" : "/dashboard/applications");
    } catch {
      toast({ title: t("register.failed"), variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const stepIndicator = (
    <div className="flex items-center justify-center gap-2 mb-6">
      {Array.from({ length: role === "landlord" ? 5 : 4 }).map((_, i) => (
        <div
          key={i}
          className={cn(
            "h-2 rounded-full transition-all",
            i + 1 === step ? "w-8 bg-primary" : i + 1 < step ? "w-2 bg-primary/60" : "w-2 bg-border"
          )}
        />
      ))}
    </div>
  );

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
          <Link to="/login" className="flex-1 pb-3 text-sm font-medium text-muted-foreground text-center hover:text-foreground">
            Ingia
          </Link>
          <button className="flex-1 pb-3 text-sm font-semibold text-primary border-b-2 border-primary">
            Jisajili
          </button>
        </div>

        {stepIndicator}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Step 1: Role selection */}
          {step === 1 && (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground text-center mb-4">Chagua aina ya akaunti</p>
              <div className="grid grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => setRole("tenant")}
                  className={cn(
                    "p-6 rounded-lg border-2 text-center transition-all",
                    role === "tenant" ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"
                  )}
                >
                  <User className={cn("h-8 w-8 mx-auto mb-3", role === "tenant" ? "text-primary" : "text-muted-foreground")} strokeWidth={1.5} />
                  <p className="font-semibold text-foreground">Mpangaji</p>
                  <p className="text-xs text-muted-foreground mt-1">Tafuta nyumba</p>
                </button>
                <button
                  type="button"
                  onClick={() => setRole("landlord")}
                  className={cn(
                    "p-6 rounded-lg border-2 text-center transition-all",
                    role === "landlord" ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"
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

          {/* Step 2: Phone number */}
          {step === 2 && (
            <div className="space-y-5">
              <div className="text-center mb-2">
                <p className="font-semibold text-foreground">Weka Nambari ya Simu</p>
                <p className="text-sm text-muted-foreground mt-1">Tutatuma nambari ya uthibitisho (OTP)</p>
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
                    autoFocus
                  />
                </div>
              </div>
              <div className="flex gap-3">
                <Button type="button" variant="outline" onClick={() => setStep(1)} className="flex-1 rounded">
                  Rudi
                </Button>
                <Button type="submit" className="flex-1 h-12 rounded bg-primary text-primary-foreground hover:bg-primary/90 font-semibold" disabled={loading}>
                  {loading ? "Inatuma…" : "Tuma OTP"}
                </Button>
              </div>
            </div>
          )}

          {/* Step 3: OTP verification */}
          {step === 3 && (
            <div className="space-y-5">
              <div className="text-center mb-2">
                <p className="font-semibold text-foreground">Thibitisha Nambari</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Weka nambari ya uthibitisho iliyotumwa kwa<br />
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
                <Button type="button" variant="outline" onClick={() => { setStep(2); setOtp(""); }} className="flex-1 rounded">
                  Rudi
                </Button>
                <Button type="submit" className="flex-1 h-12 rounded bg-primary text-primary-foreground hover:bg-primary/90 font-semibold" disabled={loading || otp.length < 6}>
                  {loading ? "Inathiditisha…" : "Thibitisha"}
                </Button>
              </div>
            </div>
          )}

          {/* Step 4: Basic profile */}
          {step === 4 && (
            <div className="space-y-5">
              <div className="text-center mb-2">
                <p className="font-semibold text-foreground">Taarifa za Msingi</p>
                <p className="text-sm text-muted-foreground mt-1">Jaza taarifa zako ili kukamilisha usajili</p>
              </div>
              <div className="space-y-2">
                <Label className="text-sm">{t("register.fullName")}</Label>
                <Input
                  placeholder="Jina Kamili"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="rounded border-border"
                  autoFocus
                />
              </div>
              <div className="space-y-2">
                <Label className="text-sm">{t("register.email")} (hiari)</Label>
                <Input
                  type="email"
                  placeholder="barua@mfano.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="rounded border-border"
                />
              </div>
              <div className="flex gap-3">
                <Button type="button" variant="outline" onClick={() => setStep(3)} className="flex-1 rounded">
                  Rudi
                </Button>
                <Button type="submit" className="flex-1 h-12 rounded bg-primary text-primary-foreground hover:bg-primary/90 font-semibold" disabled={loading}>
                  {role === "landlord" ? "Endelea" : (loading ? t("register.submitting") : "Jisajili")}
                </Button>
              </div>
            </div>
          )}

          {/* Step 5: NIDA + Selfie upload (landlord only) */}
          {step === 5 && (
            <div className="space-y-5">
              <div className="text-center mb-4">
                <p className="font-semibold text-foreground">Thibitisha Kitambulisho</p>
                <p className="text-sm text-muted-foreground mt-1">Pakia NIDA na picha ya uso wako kwa uthibitisho</p>
              </div>

              {/* NIDA upload */}
              <label className="block border-2 border-dashed border-border rounded-lg p-6 text-center cursor-pointer hover:border-primary/50 transition-colors">
                <input
                  type="file"
                  accept="image/*,.pdf"
                  className="hidden"
                  onChange={(e) => setNidaFile(e.target.files?.[0] || null)}
                />
                <Upload className="h-8 w-8 mx-auto text-muted-foreground mb-2" strokeWidth={1.5} />
                {nidaFile ? (
                  <p className="text-sm font-medium text-primary">{nidaFile.name}</p>
                ) : (
                  <>
                    <p className="text-sm font-medium text-foreground">Pakia Kitambulisho cha NIDA</p>
                    <p className="text-xs text-muted-foreground mt-1">JPEG, PNG au PDF (max 5MB)</p>
                  </>
                )}
              </label>

              {/* Selfie upload */}
              <label className="block border-2 border-dashed border-border rounded-lg p-6 text-center cursor-pointer hover:border-primary/50 transition-colors">
                <input
                  type="file"
                  accept="image/*"
                  capture="user"
                  className="hidden"
                  onChange={(e) => setSelfieFile(e.target.files?.[0] || null)}
                />
                <Camera className="h-8 w-8 mx-auto text-muted-foreground mb-2" strokeWidth={1.5} />
                {selfieFile ? (
                  <p className="text-sm font-medium text-primary">{selfieFile.name}</p>
                ) : (
                  <>
                    <p className="text-sm font-medium text-foreground">Piga Picha ya Uso (Selfie)</p>
                    <p className="text-xs text-muted-foreground mt-1">Picha wazi ya uso wako</p>
                  </>
                )}
              </label>

              <div className="flex gap-3">
                <Button type="button" variant="outline" onClick={() => setStep(4)} className="flex-1 rounded">
                  Rudi
                </Button>
                <Button type="submit" className="flex-1 h-12 rounded bg-primary text-primary-foreground hover:bg-primary/90 font-semibold" disabled={loading}>
                  {loading ? t("register.submitting") : "Maliza Usajili"}
                </Button>
              </div>

              <p className="text-xs text-muted-foreground text-center">
                Msimamizi atakagua hati zako ndani ya masaa 24. Utapata taarifa kwa SMS.
              </p>
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
