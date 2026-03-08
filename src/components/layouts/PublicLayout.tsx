import { Link, Outlet } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/i18n/LanguageContext";
import nikonektiLogo from "@/assets/nikonekti-logo.png";

export function PublicLayout() {
  const { t, lang, setLang } = useLanguage();

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-card border-b border-border">
        <div className="container flex h-16 items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <div className="flex items-center justify-center">
              <Home className="h-5 w-5 text-primary" strokeWidth={1.5} />
            </div>
            <span className="font-bold text-xl text-primary tracking-tight">Nikonekti</span>
          </Link>

          {/* Right side */}
          <div className="flex items-center gap-4">
            {/* Language toggle */}
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <button
                onClick={() => setLang("sw")}
                className={`px-1.5 py-0.5 rounded ${lang === "sw" ? "bg-primary text-primary-foreground" : "hover:text-foreground"}`}
              >
                SW
              </button>
              <span>|</span>
              <button
                onClick={() => setLang("en")}
                className={`px-1.5 py-0.5 rounded ${lang === "en" ? "bg-primary text-primary-foreground" : "hover:text-foreground"}`}
              >
                EN
              </button>
            </div>

            {/* Auth links */}
            <Link to="/login" className="text-sm font-medium text-foreground hover:text-primary transition-colors">
              {t("nav.login")}
            </Link>
            <Button asChild size="sm" className="rounded bg-accent text-accent-foreground hover:bg-accent/90">
              <Link to="/register">{t("nav.register")}</Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="bg-primary text-primary-foreground">
        <div className="container py-12 grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Home className="h-5 w-5" strokeWidth={1.5} />
              <span className="font-bold text-lg">Nikonekti</span>
            </div>
            <p className="text-sm text-primary-foreground/70">{t("footer.tagline")}</p>
            <p className="text-xs text-primary-foreground/50 mt-4">Powered by M-Pesa payments</p>
          </div>
          <div>
            <h5 className="font-semibold mb-3 text-sm">{t("footer.forTenants")}</h5>
            <ul className="space-y-2 text-sm text-primary-foreground/70">
              <li><Link to="/properties" className="hover:text-primary-foreground transition-colors">{t("footer.browseProperties")}</Link></li>
              <li><Link to="/register" className="hover:text-primary-foreground transition-colors">{t("footer.register")}</Link></li>
            </ul>
          </div>
          <div>
            <h5 className="font-semibold mb-3 text-sm">{t("footer.forLandlords")}</h5>
            <ul className="space-y-2 text-sm text-primary-foreground/70">
              <li><Link to="/register?role=landlord" className="hover:text-primary-foreground transition-colors">{t("footer.listProperty")}</Link></li>
            </ul>
          </div>
          <div>
            <h5 className="font-semibold mb-3 text-sm">{t("footer.company")}</h5>
            <ul className="space-y-2 text-sm text-primary-foreground/70">
              <li><Link to="/" className="hover:text-primary-foreground transition-colors">{t("footer.about")}</Link></li>
              <li><Link to="/" className="hover:text-primary-foreground transition-colors">{t("footer.contact")}</Link></li>
            </ul>
          </div>
        </div>
        <div className="border-t border-primary-foreground/10">
          <div className="container py-4 flex items-center justify-between">
            <p className="text-xs text-primary-foreground/50">{t("footer.copyright")}</p>
            {/* Language toggle again */}
            <div className="flex items-center gap-1 text-xs text-primary-foreground/50">
              <button onClick={() => setLang("sw")} className={lang === "sw" ? "text-primary-foreground" : ""}>SW</button>
              <span>|</span>
              <button onClick={() => setLang("en")} className={lang === "en" ? "text-primary-foreground" : ""}>EN</button>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
