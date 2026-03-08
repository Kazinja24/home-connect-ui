import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/i18n/LanguageContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { User, Mail, Phone, Shield, Calendar } from "lucide-react";

const Profile = () => {
  const { user } = useAuth();
  const { t } = useLanguage();

  if (!user) return null;

  const roleColors: Record<string, string> = {
    tenant: "bg-primary/15 text-primary border-primary/30",
    landlord: "bg-accent/15 text-accent-foreground border-accent/30",
    admin: "bg-destructive/15 text-destructive border-destructive/30",
  };

  return (
    <div className="space-y-6 animate-slide-up max-w-2xl">
      <h1 className="text-2xl font-bold text-foreground">{t("profile.title")}</h1>

      <Card className="glass-strong border-border/30">
        <CardHeader className="pb-4">
          <div className="flex items-center gap-4">
            <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center text-2xl font-bold text-primary-foreground">
              {user.fullName?.charAt(0) ?? "U"}
            </div>
            <div>
              <CardTitle className="text-xl">{user.fullName}</CardTitle>
              <Badge variant="outline" className={`mt-1 ${roleColors[user.role] ?? ""}`}>
                {user.role === "tenant" ? t("role.tenant") : user.role === "landlord" ? t("role.landlord") : t("role.admin")}
              </Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="grid gap-4">
            <div className="flex items-center gap-3 p-3 rounded-xl bg-muted/50">
              <User className="h-5 w-5 text-muted-foreground shrink-0" />
              <div>
                <p className="text-xs text-muted-foreground">{t("profile.fullName")}</p>
                <p className="text-sm font-medium text-foreground">{user.fullName}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-xl bg-muted/50">
              <Mail className="h-5 w-5 text-muted-foreground shrink-0" />
              <div>
                <p className="text-xs text-muted-foreground">{t("profile.email")}</p>
                <p className="text-sm font-medium text-foreground">{user.email}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-xl bg-muted/50">
              <Phone className="h-5 w-5 text-muted-foreground shrink-0" />
              <div>
                <p className="text-xs text-muted-foreground">{t("profile.phone")}</p>
                <p className="text-sm font-medium text-foreground">{user.phone || "—"}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-xl bg-muted/50">
              <Shield className="h-5 w-5 text-muted-foreground shrink-0" />
              <div>
                <p className="text-xs text-muted-foreground">{t("profile.role")}</p>
                <p className="text-sm font-medium text-foreground capitalize">
                  {user.role === "tenant" ? t("role.tenant") : user.role === "landlord" ? t("role.landlord") : t("role.admin")}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-xl bg-muted/50">
              <Calendar className="h-5 w-5 text-muted-foreground shrink-0" />
              <div>
                <p className="text-xs text-muted-foreground">{t("profile.memberSince")}</p>
                <p className="text-sm font-medium text-foreground">{t("profile.prototypeDate")}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Profile;
