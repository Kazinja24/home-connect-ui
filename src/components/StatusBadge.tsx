import { cn } from "@/lib/utils";
import { useLanguage } from "@/i18n/LanguageContext";

export type BadgeStatus = "pending" | "approved" | "rejected" | "hai" | "imekaguliwa" | "imepangwa" | "imethibitishwa" | "draft" | "active" | "signed";

const variants: Record<string, string> = {
  pending: "bg-muted text-muted-foreground border-border",
  approved: "bg-success/10 text-success border-success/20",
  rejected: "bg-destructive/10 text-destructive border-destructive/20",
  hai: "bg-success/10 text-success border-success/20",
  imekaguliwa: "bg-accent/10 text-accent border-accent/20",
  imepangwa: "bg-primary/10 text-primary border-primary/20",
  imethibitishwa: "bg-accent/10 text-accent border-accent/20",
  draft: "bg-muted text-muted-foreground border-border",
  active: "bg-success/10 text-success border-success/20",
  signed: "bg-success/10 text-success border-success/20",
};

export function StatusBadge({ status }: { status: BadgeStatus | string }) {
  const { t } = useLanguage();
  
  const statusLower = status.toLowerCase();
  const variant = variants[statusLower] || variants.pending;
  
  // Translate status
  const labels: Record<string, string> = {
    pending: t("status.pending"),
    approved: t("status.approved"),
    rejected: t("status.rejected"),
    hai: "Hai",
    imekaguliwa: "Imekaguliwa",
    imepangwa: "Imepangwa",
    imethibitishwa: "Imethibitishwa",
    draft: t("status.draft"),
    active: t("status.active"),
    signed: t("status.signed"),
  };

  return (
    <span className={cn(
      "inline-flex items-center rounded border px-2 py-0.5 text-xs font-medium",
      variant
    )}>
      {labels[statusLower] || status}
    </span>
  );
}
