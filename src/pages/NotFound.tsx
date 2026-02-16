import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/i18n/LanguageContext";

const NotFound = () => {
  const location = useLocation();
  const { t } = useLanguage();

  useEffect(() => {
    console.error("404 Error:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-background to-muted/50">
      <div className="text-center space-y-4 animate-slide-up">
        <h1 className="text-8xl font-extrabold text-gradient">{t("notFound.title")}</h1>
        <p className="text-xl text-muted-foreground">{t("notFound.message")}</p>
        <Button asChild className="shadow-md"><Link to="/">{t("notFound.back")}</Link></Button>
      </div>
    </div>
  );
};

export default NotFound;
