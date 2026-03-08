import { useState } from "react";
import { useLanguage } from "@/i18n/LanguageContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FileText, Download } from "lucide-react";

const Agreement = () => {
  const { t } = useLanguage();
  const [landlordOtp, setLandlordOtp] = useState(["", "", "", ""]);
  const [tenantOtp, setTenantOtp] = useState(["", "", "", ""]);
  const [landlordConfirmed, setLandlordConfirmed] = useState(false);
  const [tenantConfirmed, setTenantConfirmed] = useState(false);

  const handleOtpChange = (setter: typeof setLandlordOtp, index: number, value: string) => {
    if (value.length > 1) return;
    setter(prev => {
      const newOtp = [...prev];
      newOtp[index] = value;
      return newOtp;
    });
    // Auto-focus next input
    if (value && index < 3) {
      const nextInput = document.getElementById(`otp-${setter === setLandlordOtp ? 'landlord' : 'tenant'}-${index + 1}`);
      nextInput?.focus();
    }
  };

  return (
    <div className="container py-8 max-w-3xl">
      <div className="bg-card border border-border rounded-lg">
        {/* Header */}
        <div className="p-6 border-b border-border text-center">
          <h1 className="text-2xl font-bold text-foreground underline mb-2">MKATABA WA KUKODISHA NYUMBA</h1>
          <p className="text-sm text-muted-foreground">Rental Agreement</p>
        </div>

        {/* Contract sections */}
        <div className="p-6 space-y-8">
          {/* Section 1: Parties */}
          <section>
            <h2 className="font-bold text-foreground mb-3">1. WAHUSIKA (Parties)</h2>
            <div className="space-y-2 text-sm text-muted-foreground">
              <p><strong>Mwenye Nyumba (Landlord):</strong> Hassan Mwangi</p>
              <p><strong>Simu:</strong> +255 713 456 789</p>
              <p className="pt-2"><strong>Mpangaji (Tenant):</strong> Amina Juma</p>
              <p><strong>Simu:</strong> +255 712 345 678</p>
            </div>
          </section>

          {/* Section 2: Property */}
          <section>
            <h2 className="font-bold text-foreground mb-3">2. MALI (Property)</h2>
            <div className="space-y-2 text-sm text-muted-foreground">
              <p><strong>Anuani:</strong> Studio ya Kisasa, Masaki, Dar es Salaam</p>
              <p><strong>Aina:</strong> Studio / Bedsitter</p>
              <p><strong>Vyumba vya kulala:</strong> 1</p>
            </div>
          </section>

          {/* Section 3: Payments */}
          <section>
            <h2 className="font-bold text-foreground mb-3">3. MALIPO (Payments)</h2>
            <div className="space-y-2 text-sm text-muted-foreground">
              <p><strong>Kodi ya Mwezi:</strong> TZS 800,000</p>
              <p><strong>Amana:</strong> TZS 800,000</p>
              <p><strong>Tarehe ya Kuanza:</strong> 1 Februari 2026</p>
              <p><strong>Tarehe ya Kumaliza:</strong> 31 Januari 2027</p>
              <p><strong>Siku ya Kulipa:</strong> Tarehe 1 ya kila mwezi</p>
            </div>
          </section>

          {/* Section 4: Terms */}
          <section>
            <h2 className="font-bold text-foreground mb-3">4. MASHARTI (Terms)</h2>
            <ul className="space-y-1 text-sm text-muted-foreground list-disc list-inside">
              <li>Hakuna wanyama wanaruhusiwa</li>
              <li>Hakuna kuvuta sigara ndani ya nyumba</li>
              <li>Muda wa kuondoka: Notisi ya siku 30</li>
            </ul>
          </section>

          {/* Section 5: Termination */}
          <section>
            <h2 className="font-bold text-foreground mb-3">5. KUKOMESHA (Termination)</h2>
            <p className="text-sm text-muted-foreground">
              Upande wowote unaweza kukomesha mkataba huu kwa kutoa notisi ya maandishi ya siku 30.
              Amana itarudishwa ndani ya siku 14 baada ya kuondoka, baada ya kuondoa gharama za uharibifu.
            </p>
          </section>
        </div>

        {/* Confirmation sections */}
        <div className="p-6 border-t border-border space-y-6">
          {/* Landlord confirmation */}
          <div className="space-y-4">
            <h3 className="font-semibold text-foreground">Uthibitisho wa Mwenye Nyumba</h3>
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <p className="text-sm text-muted-foreground mb-2">Nambari ya OTP</p>
                <div className="flex gap-2">
                  {landlordOtp.map((digit, i) => (
                    <Input
                      key={i}
                      id={`otp-landlord-${i}`}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleOtpChange(setLandlordOtp, i, e.target.value)}
                      className="w-12 h-12 text-center text-lg font-bold rounded border-border"
                      disabled={landlordConfirmed}
                    />
                  ))}
                </div>
              </div>
              <Button 
                onClick={() => setLandlordConfirmed(true)}
                disabled={landlordOtp.some(d => !d) || landlordConfirmed}
                className="rounded"
              >
                {landlordConfirmed ? "✓ Imethibitishwa" : "Thibitisha"}
              </Button>
            </div>
            {landlordConfirmed && (
              <p className="text-xs text-muted-foreground">Imethibitishwa: {new Date().toLocaleString("sw-TZ")}</p>
            )}
          </div>

          {/* Tenant confirmation */}
          <div className="space-y-4">
            <h3 className="font-semibold text-foreground">Uthibitisho wa Mpangaji</h3>
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <p className="text-sm text-muted-foreground mb-2">Nambari ya OTP</p>
                <div className="flex gap-2">
                  {tenantOtp.map((digit, i) => (
                    <Input
                      key={i}
                      id={`otp-tenant-${i}`}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleOtpChange(setTenantOtp, i, e.target.value)}
                      className="w-12 h-12 text-center text-lg font-bold rounded border-border"
                      disabled={tenantConfirmed}
                    />
                  ))}
                </div>
              </div>
              <Button 
                onClick={() => setTenantConfirmed(true)}
                disabled={tenantOtp.some(d => !d) || tenantConfirmed}
                className="rounded"
              >
                {tenantConfirmed ? "✓ Imethibitishwa" : "Thibitisha"}
              </Button>
            </div>
            {tenantConfirmed && (
              <p className="text-xs text-muted-foreground">Imethibitishwa: {new Date().toLocaleString("sw-TZ")}</p>
            )}
          </div>
        </div>

        {/* Download PDF */}
        {landlordConfirmed && tenantConfirmed && (
          <div className="p-6 border-t border-border">
            <Button className="w-full rounded bg-primary text-primary-foreground hover:bg-primary/90">
              <Download className="h-4 w-4 mr-2" strokeWidth={1.5} />
              Pakua PDF
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Agreement;
