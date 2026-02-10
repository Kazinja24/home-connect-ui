import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-background to-muted/50">
      <div className="text-center space-y-4 animate-slide-up">
        <h1 className="text-8xl font-extrabold text-gradient">404</h1>
        <p className="text-xl text-muted-foreground">Samahani! Ukurasa huu haujapatikana</p>
        <Button asChild className="shadow-md">
          <Link to="/">Rudi Nyumbani</Link>
        </Button>
      </div>
    </div>
  );
};

export default NotFound;
