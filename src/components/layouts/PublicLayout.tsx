import { Link, Outlet } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Home, Globe } from "lucide-react";
import { useLanguage } from "@/i18n/LanguageContext";

export function PublicLayout() {
  const { t, lang, setLang } = useLanguage();

  return (
    <div className="min-h-screen flex flex-col">
      <header className="sticky top-0 z-40 border-b glass-strong">
        <div className="container flex h-16 items-center justify-between">
          <Link to="/" className="flex items-center gap-2 font-extrabold text-xl text-gradient">
            <Home className="h-6 w-6 text-primary" />
            NIKONEKTI
          </Link>
          <nav className="hidden md:flex items-center gap-6 text-sm text-muted-foreground">
            <Link to="/properties" className="hover:text-foreground transition-colors font-medium">{t("nav.browse")}</Link>
          </nav>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1">
              <Globe className="h-4 w-4 text-muted-foreground" />
              <Select value={lang} onValueChange={(v) => setLang(v as "sw" | "en")}>
                <SelectTrigger className="h-8 w-20 text-xs border-border/50">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="sw">SW</SelectItem>
                  <SelectItem value="en">EN</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button variant="ghost" size="sm" asChild>
              <Link to="/login">{t("nav.login")}</Link>
            </Button>
            <Button size="sm" className="shadow-md" asChild>
              <Link to="/register">{t("nav.register")}</Link>
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-1">
        <Outlet />
      </main>

      <footer className="border-t bg-foreground text-primary-foreground">
        <div className="container py-14 grid grid-cols-2 md:grid-cols-4 gap-8">
          <div>
            <h4 className="font-extrabold text-lg mb-3 text-gradient">NIKONEKTI</h4>
            <p className="text-sm text-primary-foreground/60">{t("footer.tagline")}</p>
          </div>
          <div>
            <h5 className="font-semibold mb-3 text-sm text-primary-foreground/80">{t("footer.forTenants")}</h5>
            <ul className="space-y-2 text-sm text-primary-foreground/60">
              <li><Link to="/properties" className="hover:text-primary-foreground transition-colors">{t("footer.browseProperties")}</Link></li>
              <li><Link to="/register" className="hover:text-primary-foreground transition-colors">{t("footer.register")}</Link></li>
            </ul>
          </div>
          <div>
            <h5 className="font-semibold mb-3 text-sm text-primary-foreground/80">{t("footer.forLandlords")}</h5>
            <ul className="space-y-2 text-sm text-primary-foreground/60">
              <li><Link to="/register" className="hover:text-primary-foreground transition-colors">{t("footer.listProperty")}</Link></li>
            </ul>
          </div>
          <div>
            <h5 className="font-semibold mb-3 text-sm text-primary-foreground/80">{t("footer.company")}</h5>
            <ul className="space-y-2 text-sm text-primary-foreground/60">
              <li><Link to="/" className="hover:text-primary-foreground transition-colors">{t("footer.about")}</Link></li>
              <li><Link to="/" className="hover:text-primary-foreground transition-colors">{t("footer.contact")}</Link></li>
            </ul>
          </div>
        </div>
        <div className="border-t border-primary-foreground/10">
          <div className="container py-4 text-center text-xs text-primary-foreground/40">
            {t("footer.copyright")}
          </div>
        </div>
      </footer>
    </div>
  );
}
