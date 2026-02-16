import { cn } from "@/lib/utils";
import { useLanguage } from "@/i18n/LanguageContext";
import type { RequestStatus } from "@/types";

const variants: Record<RequestStatus, string> = {
  pending: "bg-warning/15 text-warning border-warning/30",
  approved: "bg-success/15 text-success border-success/30",
  rejected: "bg-destructive/15 text-destructive border-destructive/30",
};

export function StatusBadge({ status }: { status: RequestStatus }) {
  const { t } = useLanguage();
  const labels: Record<RequestStatus, string> = {
    pending: t("status.pending"),
    approved: t("status.approved"),
    rejected: t("status.rejected"),
  };

  return (
    <span className={cn("inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold", variants[status])}>
      <span className="mr-1.5 h-1.5 w-1.5 rounded-full bg-current animate-pulse" />
      {labels[status]}
    </span>
  );
}
