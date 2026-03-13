import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/i18n/LanguageContext";

interface ApplicationTrackerProps {
  currentStep: number; // 0-4 index
}

export function ApplicationTracker({ currentStep }: ApplicationTrackerProps) {
  const { t } = useLanguage();

  const steps = [
    { key: "submitted", label: t("tracker.submitted") },
    { key: "reviewed", label: t("tracker.reviewed") },
    { key: "viewing", label: t("tracker.viewing") },
    { key: "offer", label: t("tracker.offer") },
    { key: "active", label: t("tracker.activeLease") },
  ];

  return (
    <div className="w-full">
      <div className="flex items-center justify-between">
        {steps.map((step, idx) => (
          <div key={step.key} className="flex flex-col items-center flex-1">
            <div className="flex items-center w-full">
              {idx > 0 && (
                <div className={cn(
                  "flex-1 h-0.5",
                  idx <= currentStep ? "bg-primary" : "bg-border"
                )} />
              )}
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
              {idx < steps.length - 1 && (
                <div className={cn(
                  "flex-1 h-0.5",
                  idx < currentStep ? "bg-primary" : "bg-border"
                )} />
              )}
            </div>
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
