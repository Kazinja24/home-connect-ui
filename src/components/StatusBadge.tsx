import { cn } from "@/lib/utils";
import type { RequestStatus } from "@/types";

const variants: Record<RequestStatus, string> = {
  pending: "bg-warning/15 text-warning border-warning/30",
  approved: "bg-success/15 text-success border-success/30",
  rejected: "bg-destructive/15 text-destructive border-destructive/30",
};

export function StatusBadge({ status }: { status: RequestStatus }) {
  return (
    <span className={cn("inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium capitalize", variants[status])}>
      {status}
    </span>
  );
}
