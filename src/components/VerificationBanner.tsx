import { Shield } from "lucide-react";

interface VerificationBannerProps {
  message?: string;
}

export function VerificationBanner({ message = "Mwenye nyumba amethibitishwa na NIDA" }: VerificationBannerProps) {
  return (
    <div className="flex items-center gap-3 bg-accent/10 border border-accent/20 rounded px-4 py-3">
      <Shield className="h-5 w-5 text-accent shrink-0" strokeWidth={1.5} />
      <p className="text-sm font-medium text-foreground">{message}</p>
    </div>
  );
}
