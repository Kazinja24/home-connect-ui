import React, { useState } from 'react';
import { useVerificationSubmit } from '@/hooks/useVerification';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { AlertTriangle, CheckCircle, Upload, Camera } from 'lucide-react';
import { useLanguage } from '@/i18n/LanguageContext';

const LandlordVerification: React.FC = () => {
  const { t } = useLanguage();
  const [identity, setIdentity] = useState<File | null>(null);
  const [selfie, setSelfie] = useState<File | null>(null);
  const [supporting, setSupporting] = useState<File | null>(null);
  const mutation = useVerificationSubmit();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!identity || !selfie || !supporting) return;

    const fd = new FormData();
    fd.append('identity_document', identity);
    fd.append('selfie', selfie);
    fd.append('landlord_supporting_document', supporting);

    mutation.mutate(fd, {
      onSuccess: () => {},
      onError: () => {},
    });
  };

  return (
    <div className="space-y-6 animate-slide-up">
      <h1 className="text-2xl font-bold text-foreground">{t("landlord.verification") || "Landlord Verification"}</h1>

      <Card className="border-warning/30 bg-warning/5">
        <CardContent className="p-4 flex items-start gap-3">
          <AlertTriangle className="h-5 w-5 text-warning mt-0.5 shrink-0" />
          <div className="text-sm text-muted-foreground">
            <p className="font-semibold text-foreground mb-1">{t("landlord.verificationRequired") || "Verification Required"}</p>
            <p>{t("landlord.verificationDesc") || "You must submit identity documents for verification before you can publish properties. An admin will review your submission."}</p>
          </div>
        </CardContent>
      </Card>

      <Card className="glass-strong border-border/30">
        <CardHeader><CardTitle className="text-lg">{t("landlord.submitDocuments") || "Submit Documents"}</CardTitle></CardHeader>
        <CardContent>
          {mutation.isSuccess ? (
            <div className="flex items-center gap-3 text-success py-8 justify-center">
              <CheckCircle className="h-6 w-6" />
              <p className="font-semibold">{t("landlord.verificationSubmitted") || "Verification submitted! Awaiting admin review."}</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label>{t("landlord.identityDoc") || "Identity Document"}</Label>
                <div className="flex items-center gap-3">
                  <label className="flex items-center gap-2 px-4 py-2 border rounded-lg cursor-pointer hover:bg-muted/50 transition-colors">
                    <Upload className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{identity ? identity.name : (t("landlord.chooseFile") || "Choose file")}</span>
                    <input type="file" accept="image/*,application/pdf" className="hidden" onChange={(e) => setIdentity(e.target.files?.[0] ?? null)} />
                  </label>
                </div>
              </div>
              <div className="space-y-2">
                <Label>{t("landlord.selfiePhoto") || "Selfie Photo"}</Label>
                <div className="flex items-center gap-3">
                  <label className="flex items-center gap-2 px-4 py-2 border rounded-lg cursor-pointer hover:bg-muted/50 transition-colors">
                    <Camera className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{selfie ? selfie.name : (t("landlord.takeSelfie") || "Take selfie")}</span>
                    <input type="file" accept="image/*" capture="user" className="hidden" onChange={(e) => setSelfie(e.target.files?.[0] ?? null)} />
                  </label>
                </div>
              </div>
              <div className="space-y-2">
                <Label>{t("landlord.supportingDoc") || "Supporting Document"}</Label>
                <div className="flex items-center gap-3">
                  <label className="flex items-center gap-2 px-4 py-2 border rounded-lg cursor-pointer hover:bg-muted/50 transition-colors">
                    <Upload className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{supporting ? supporting.name : (t("landlord.chooseFile") || "Choose file")}</span>
                    <input type="file" accept="image/*,application/pdf" className="hidden" onChange={(e) => setSupporting(e.target.files?.[0] ?? null)} />
                  </label>
                </div>
              </div>
              <Button type="submit" disabled={mutation.isPending || !identity || !selfie || !supporting} className="font-semibold">
                {mutation.isPending ? (t("common.loading") || "Submitting...") : (t("common.submit") || "Submit for Verification")}
              </Button>
              {mutation.isError && (
                <p className="text-sm text-destructive">{(mutation.error as any)?.message || "Submission failed"}</p>
              )}
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default LandlordVerification;
