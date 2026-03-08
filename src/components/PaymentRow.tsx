import { Receipt } from "lucide-react";
import { StatusBadge } from "./StatusBadge";

interface PaymentRowProps {
  date: string;
  tenant?: string;
  amount: number;
  method: string;
  status: string;
  reference?: string;
}

export function PaymentRow({ date, tenant, amount, method, status, reference }: PaymentRowProps) {
  return (
    <div className="flex items-center justify-between py-3 border-b border-border last:border-0">
      <div className="flex items-center gap-4">
        <div className="h-10 w-10 rounded bg-muted flex items-center justify-center">
          <Receipt className="h-5 w-5 text-muted-foreground" strokeWidth={1.5} />
        </div>
        <div>
          <p className="text-sm font-medium text-foreground">
            TZS {amount.toLocaleString()}
          </p>
          <p className="text-xs text-muted-foreground">
            {date} {tenant && `• ${tenant}`}
          </p>
        </div>
      </div>
      <div className="flex items-center gap-4 text-right">
        <div>
          <p className="text-xs text-muted-foreground">{method}</p>
          {reference && <p className="text-xs text-muted-foreground">{reference}</p>}
        </div>
        <StatusBadge status={status} />
      </div>
    </div>
  );
}
