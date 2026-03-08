import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { leases as leasesApi } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { FileText, Download, Shield, CheckCircle2, Clock, AlertTriangle } from "lucide-react";

const Agreement = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [landlordOtp, setLandlordOtp] = useState(["", "", "", ""]);
  const [tenantOtp, setTenantOtp] = useState(["", "", "", ""]);
  const [landlordConfirmed, setLandlordConfirmed] = useState(false);
  const [tenantConfirmed, setTenantConfirmed] = useState(false);

  // Fetch the latest lease for agreement display
  const { data: leasesList = [] } = useQuery({
    queryKey: ["agreement-leases"],
    queryFn: leasesApi.list,
  });

  // Use the most recent lease that needs signing
  const lease = leasesList.find((l: any) => l.status === "draft" || l.status === "pending_signature") || leasesList[0];

  const handleOtpChange = (setter: typeof setLandlordOtp, prefix: string, index: number, value: string) => {
    if (value.length > 1) return;
    if (value && !/^\d$/.test(value)) return;
    setter(prev => {
      const newOtp = [...prev];
      newOtp[index] = value;
      return newOtp;
    });
    if (value && index < 3) {
      const nextInput = document.getElementById(`otp-${prefix}-${index + 1}`);
      nextInput?.focus();
    }
  };

  const handleOtpKeyDown = (setter: typeof setLandlordOtp, prefix: string, index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace") {
      setter(prev => {
        if (!prev[index] && index > 0) {
          const prevInput = document.getElementById(`otp-${prefix}-${index - 1}`);
          prevInput?.focus();
        }
        const newOtp = [...prev];
        newOtp[index] = "";
        return newOtp;
      });
    }
  };

  const handleLandlordConfirm = async () => {
    setLandlordConfirmed(true);
    if (lease?.id) {
      try {
        await leasesApi.landlordConfirm(String(lease.id));
        toast({ title: "Mmiliki amethibitisha mkataba." });
      } catch {
        toast({ title: "Uthibitisho umehifadhiwa (mtandaoni utasawazishwa)." });
      }
    }
  };

  const handleTenantConfirm = async () => {
    setTenantConfirmed(true);
    if (lease?.id) {
      try {
        await leasesApi.sign(String(lease.id));
        toast({ title: "Mpangaji amethibitisha mkataba." });
      } catch {
        toast({ title: "Uthibitisho umehifadhiwa (mtandaoni utasawazishwa)." });
      }
    }
  };

  const handleActivate = async () => {
    if (lease?.id) {
      try {
        await leasesApi.activate(String(lease.id));
        toast({ title: "Mkataba umeanza rasmi! Nyumba imewekwa RENTED." });
      } catch {
        toast({ title: "Mkataba umehifadhiwa." });
      }
    }
  };

  const handleDownload = async () => {
    if (lease?.id) {
      try {
        await leasesApi.downloadContract(String(lease.id));
      } catch {
        toast({ title: "PDF itapatikana punde.", variant: "destructive" });
      }
    }
  };

  // Dynamic data from lease or fallback
  const landlordName = lease?.landlord_name || "Mmiliki wa Nyumba";
  const landlordPhone = lease?.landlord_phone || "+255 7XX XXX XXX";
  const tenantName = lease?.tenant_name || "Mpangaji";
  const tenantPhone = lease?.tenant_phone || "+255 7XX XXX XXX";
  const propertyTitle = lease?.property_title || "Nyumba";
  const propertyAddress = lease?.property_address || lease?.property_location || "Anuani";
  const propertyType = lease?.property_type || "Nyumba";
  const bedrooms = lease?.bedrooms || "—";
  const monthlyRent = Number(lease?.monthly_rent || lease?.rent_amount || 0);
  const deposit = Number(lease?.security_deposit || lease?.deposit || 0);
  const startDate = lease?.start_date || "—";
  const endDate = lease?.end_date || "Wazi";
  const houseRules = Array.isArray(lease?.house_rules) ? lease.house_rules : [
    "Hakuna wanyama wanaruhusiwa",
    "Hakuna kuvuta sigara ndani ya nyumba",
    "Muziki kwa sauti ndogo baada ya saa 4 usiku",
  ];

  const bothConfirmed = landlordConfirmed && tenantConfirmed;

  return (
    <div className="container py-8 max-w-3xl">
      <div className="bg-card border border-border rounded-lg shadow-sm">
        {/* Status Banner */}
        <div className="px-6 py-3 border-b border-border flex items-center justify-between bg-muted/30">
          <div className="flex items-center gap-2">
            <Shield className="h-4 w-4 text-primary" />
            <span className="text-xs font-medium text-muted-foreground">Mkataba wa Kisheria — NIKONEKTI</span>
          </div>
          <Badge variant={bothConfirmed ? "default" : "secondary"}>
            {bothConfirmed ? "Umethibitishwa" : "Inasubiri Uthibitisho"}
          </Badge>
        </div>

        {/* Header */}
        <div className="p-6 border-b border-border text-center">
          <h1 className="text-2xl font-bold text-foreground underline mb-2">MKATABA WA KUKODISHA NYUMBA</h1>
          <p className="text-sm text-muted-foreground">Rental Agreement — Generated by NIKONEKTI Platform</p>
        </div>

        {/* Contract sections */}
        <div className="p-6 space-y-8">
          {/* Section 1: Parties */}
          <section>
            <h2 className="font-bold text-foreground mb-3">1. WAHUSIKA (Parties)</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-muted/30 rounded-lg p-4 space-y-1.5">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Mwenye Nyumba (Landlord)</p>
                <p className="font-semibold text-foreground">{landlordName}</p>
                <p className="text-sm text-muted-foreground">Simu: {landlordPhone}</p>
              </div>
              <div className="bg-muted/30 rounded-lg p-4 space-y-1.5">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Mpangaji (Tenant)</p>
                <p className="font-semibold text-foreground">{tenantName}</p>
                <p className="text-sm text-muted-foreground">Simu: {tenantPhone}</p>
              </div>
            </div>
          </section>

          {/* Section 2: Property */}
          <section>
            <h2 className="font-bold text-foreground mb-3">2. MALI (Property)</h2>
            <div className="space-y-2 text-sm text-muted-foreground">
              <p><strong className="text-foreground">Jina:</strong> {propertyTitle}</p>
              <p><strong className="text-foreground">Anuani:</strong> {propertyAddress}</p>
              <p><strong className="text-foreground">Aina:</strong> {propertyType}</p>
              <p><strong className="text-foreground">Vyumba vya Kulala:</strong> {bedrooms}</p>
            </div>
          </section>

          {/* Section 3: Payments */}
          <section>
            <h2 className="font-bold text-foreground mb-3">3. MALIPO (Payments)</h2>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-primary/5 border border-primary/20 rounded-lg p-3 text-center">
                <p className="text-xs text-muted-foreground">Kodi ya Mwezi</p>
                <p className="text-xl font-bold text-foreground">TZS {monthlyRent.toLocaleString()}</p>
              </div>
              <div className="bg-primary/5 border border-primary/20 rounded-lg p-3 text-center">
                <p className="text-xs text-muted-foreground">Amana (Deposit)</p>
                <p className="text-xl font-bold text-foreground">TZS {deposit.toLocaleString()}</p>
              </div>
            </div>
            <div className="mt-3 space-y-1 text-sm text-muted-foreground">
              <p><strong className="text-foreground">Tarehe ya Kuanza:</strong> {startDate}</p>
              <p><strong className="text-foreground">Tarehe ya Kumaliza:</strong> {endDate}</p>
              <p><strong className="text-foreground">Siku ya Kulipa:</strong> Tarehe 1 ya kila mwezi</p>
            </div>
          </section>

          {/* Section 4: Rules */}
          <section>
            <h2 className="font-bold text-foreground mb-3">4. MASHARTI (House Rules)</h2>
            <ul className="space-y-1.5 text-sm text-muted-foreground">
              {houseRules.map((rule: string, i: number) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="text-foreground font-medium mt-0.5">{i + 1}.</span>
                  <span>{rule}</span>
                </li>
              ))}
            </ul>
          </section>

          {/* Section 5: Termination */}
          <section>
            <h2 className="font-bold text-foreground mb-3">5. KUKOMESHA MKATABA (Termination)</h2>
            <div className="text-sm text-muted-foreground space-y-2">
              <p>a) Upande wowote unaweza kukomesha mkataba huu kwa kutoa notisi ya maandishi ya siku <strong className="text-foreground">30</strong>.</p>
              <p>b) Amana itarudishwa ndani ya siku <strong className="text-foreground">14</strong> baada ya kuondoka, baada ya kuondoa gharama za uharibifu wowote.</p>
              <p>c) Kushindwa kulipa kodi kwa miezi <strong className="text-foreground">2</strong> mfululizo kutasababisha mkataba kusitishwa.</p>
            </div>
          </section>

          {/* Section 6: Platform */}
          <section>
            <h2 className="font-bold text-foreground mb-3">6. JUKWAA (Platform Terms)</h2>
            <p className="text-sm text-muted-foreground">
              Mkataba huu umezalishwa kupitia jukwaa la NIKONEKTI. Malipo yote yanapaswa kufanywa kupitia jukwaa hili kwa usalama na rekodi sahihi.
              Kila upande anaahidi kuwa taarifa zilizotolewa ni za kweli.
            </p>
          </section>
        </div>

        {/* OTP Confirmation sections */}
        <div className="p-6 border-t border-border space-y-6">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <AlertTriangle className="h-4 w-4 text-primary" />
            <span>Pande zote mbili zinahitaji kuthibitisha kwa OTP/PIN ili mkataba uwe rasmi.</span>
          </div>

          {/* Landlord confirmation */}
          <div className="space-y-3 bg-muted/20 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-foreground flex items-center gap-2">
                {landlordConfirmed ? <CheckCircle2 className="h-4 w-4 text-primary" /> : <Clock className="h-4 w-4 text-muted-foreground" />}
                Uthibitisho wa Mwenye Nyumba
              </h3>
              {landlordConfirmed && <Badge variant="default" className="text-xs">Imethibitishwa</Badge>}
            </div>
            {!landlordConfirmed ? (
              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <p className="text-xs text-muted-foreground mb-2">Ingiza OTP iliyotumwa kwa simu yako</p>
                  <div className="flex gap-2">
                    {landlordOtp.map((digit, i) => (
                      <Input
                        key={i}
                        id={`otp-landlord-${i}`}
                        type="text"
                        inputMode="numeric"
                        maxLength={1}
                        value={digit}
                        onChange={(e) => handleOtpChange(setLandlordOtp, "landlord", i, e.target.value)}
                        onKeyDown={(e) => handleOtpKeyDown(setLandlordOtp, "landlord", i, e)}
                        className="w-12 h-12 text-center text-lg font-bold rounded border-border"
                      />
                    ))}
                  </div>
                </div>
                <Button
                  onClick={handleLandlordConfirm}
                  disabled={landlordOtp.some(d => !d)}
                  className="rounded self-end"
                >
                  Thibitisha
                </Button>
              </div>
            ) : (
              <p className="text-xs text-muted-foreground">
                ✓ Imethibitishwa: {new Date().toLocaleString("sw-TZ")}
              </p>
            )}
          </div>

          {/* Tenant confirmation */}
          <div className="space-y-3 bg-muted/20 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-foreground flex items-center gap-2">
                {tenantConfirmed ? <CheckCircle2 className="h-4 w-4 text-primary" /> : <Clock className="h-4 w-4 text-muted-foreground" />}
                Uthibitisho wa Mpangaji
              </h3>
              {tenantConfirmed && <Badge variant="default" className="text-xs">Imethibitishwa</Badge>}
            </div>
            {!tenantConfirmed ? (
              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <p className="text-xs text-muted-foreground mb-2">Ingiza OTP iliyotumwa kwa simu yako</p>
                  <div className="flex gap-2">
                    {tenantOtp.map((digit, i) => (
                      <Input
                        key={i}
                        id={`otp-tenant-${i}`}
                        type="text"
                        inputMode="numeric"
                        maxLength={1}
                        value={digit}
                        onChange={(e) => handleOtpChange(setTenantOtp, "tenant", i, e.target.value)}
                        onKeyDown={(e) => handleOtpKeyDown(setTenantOtp, "tenant", i, e)}
                        className="w-12 h-12 text-center text-lg font-bold rounded border-border"
                      />
                    ))}
                  </div>
                </div>
                <Button
                  onClick={handleTenantConfirm}
                  disabled={tenantOtp.some(d => !d)}
                  className="rounded self-end"
                >
                  Thibitisha
                </Button>
              </div>
            ) : (
              <p className="text-xs text-muted-foreground">
                ✓ Imethibitishwa: {new Date().toLocaleString("sw-TZ")}
              </p>
            )}
          </div>
        </div>

        {/* Both confirmed → activate & download */}
        {bothConfirmed && (
          <div className="p-6 border-t border-border space-y-3">
            <div className="bg-primary/10 border border-primary/20 rounded-lg p-4 text-center space-y-2">
              <CheckCircle2 className="h-8 w-8 text-primary mx-auto" />
              <p className="font-semibold text-foreground">Mkataba Umethibitishwa na Pande Zote Mbili!</p>
              <p className="text-xs text-muted-foreground">Nyumba itawekwa hali ya RENTED kwenye mfumo.</p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Button onClick={handleActivate} className="w-full rounded">
                <CheckCircle2 className="h-4 w-4 mr-2" strokeWidth={1.5} />
                Anzisha Mkataba
              </Button>
              <Button variant="outline" onClick={handleDownload} className="w-full rounded">
                <Download className="h-4 w-4 mr-2" strokeWidth={1.5} />
                Pakua PDF
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Agreement;
