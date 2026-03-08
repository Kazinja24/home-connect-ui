import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

const steps = [
  { key: "submitted", label: "Imewasilishwa" },
  { key: "reviewed", label: "Imekaguliwa" },
  { key: "viewing", label: "Kuona Imepangwa" },
  { key: "offer", label: "Ofa Imetumwa" },
  { key: "active", label: "Mkataba Hai" },
];

interface ApplicationTrackerProps {
  currentStep: number; // 0-4 index
}

export function ApplicationTracker({ currentStep }: ApplicationTrackerProps) {
  return (
    <div className="w-full">
      <div className="flex items-center justify-between">
        {steps.map((step, idx) => (
          <div key={step.key} className="flex flex-col items-center flex-1">
            <div className="flex items-center w-full">
              {/* Line before */}
              {idx > 0 && (
                <div className={cn(
                  "flex-1 h-0.5",
                  idx <= currentStep ? "bg-primary" : "bg-border"
                )} />
              )}
              
              {/* Circle */}
              <div className={cn(
                "flex items-center justify-center h-8 w-8 rounded-full border-2 shrink-0",
                idx < currentStep ? "bg-primary border-primary text-primary-foreground" :
                idx === currentStep ? "bg-card border-primary text-primary" :
                "bg-card border-border text-muted-foreground"
              )}>
                {idx < currentStep ? (
                  <Check className="h-4 w-4" strokeWidth={2} />
                ) : (
                  <span className="text-xs font-semibold">{idx + 1}</span>
                )}
              </div>
              
              {/* Line after */}
              {idx < steps.length - 1 && (
                <div className={cn(
                  "flex-1 h-0.5",
                  idx < currentStep ? "bg-primary" : "bg-border"
                )} />
              )}
            </div>
            
            {/* Label */}
            <span className={cn(
              "text-xs mt-2 text-center",
              idx <= currentStep ? "text-foreground font-medium" : "text-muted-foreground"
            )}>
              {step.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
