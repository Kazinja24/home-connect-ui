import { useQuery } from "@tanstack/react-query";
import { StatusBadge } from "@/components/StatusBadge";
import { ApplicationTracker } from "@/components/ApplicationTracker";
import { applications as appApi } from "@/lib/api";
import { useLanguage } from "@/i18n/LanguageContext";
import { Skeleton } from "@/components/ui/skeleton";
import type { RequestStatus } from "@/types";

function normalizeStatus(status: string): RequestStatus {
  const normalized = status.toLowerCase();
  if (["approved", "accepted", "leased", "active", "closed", "viewing_scheduled"].includes(normalized)) return "approved";
  if (normalized === "rejected") return "rejected";
  return "pending";
}

// Determine tracker step from application status
function getTrackerStep(status: string): number {
  const s = status.toLowerCase();
  if (s === "pending") return 0;
  if (s === "approved" || s === "accepted") return 1;
  if (s === "viewing_scheduled") return 2;
  if (s === "offer_sent") return 3;
  if (s === "leased" || s === "active") return 4;
  return 0;
}

const TenantApplications = () => {
  const { t } = useLanguage();

  const { data, isLoading } = useQuery({
    queryKey: ["tenant-applications"],
    queryFn: () => appApi.list(),
  });

  // Get the most advanced application for the tracker
  const applications = data || [];
  const primaryApp = applications.length > 0 ? applications.reduce((a: any, b: any) => 
    getTrackerStep(a.status) > getTrackerStep(b.status) ? a : b
  ) : null;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-foreground">{t("tenant.myApplications")}</h1>

      {/* Application Tracker */}
      {primaryApp && (
        <div className="bg-card border border-border rounded-lg p-6">
          <h2 className="text-sm font-semibold text-muted-foreground mb-6">Hatua ya Ombi Lako</h2>
          <ApplicationTracker currentStep={getTrackerStep(primaryApp.status)} />
        </div>
      )}

      {/* Applications list */}
      <div className="bg-card border border-border rounded-lg">
        <div className="p-4 border-b border-border">
          <h2 className="font-semibold text-foreground">{t("tenant.myApplications")}</h2>
        </div>
        <div className="divide-y divide-border">
          {isLoading ? (
            [1, 2, 3].map((i) => (
              <div key={i} className="p-4">
                <Skeleton className="h-12 w-full" />
              </div>
            ))
          ) : applications.length > 0 ? (
            applications.map((a: any) => (
              <div key={a.id} className="p-4 flex items-center justify-between">
                <div>
                  <p className="font-medium text-foreground">{a.property_title || `${t("common.property")} #${a.property}`}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {a.created_at ? new Date(a.created_at).toLocaleDateString("sw-TZ") : ""}
                  </p>
                </div>
                <StatusBadge status={normalizeStatus(a.status)} />
              </div>
            ))
          ) : (
            <p className="p-8 text-center text-muted-foreground">{t("tenant.noApplications")}</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default TenantApplications;
