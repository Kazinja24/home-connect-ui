import { Link, Outlet } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Home } from "lucide-react";

export function PublicLayout() {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="sticky top-0 z-40 border-b glass-strong">
        <div className="container flex h-16 items-center justify-between">
          <Link to="/" className="flex items-center gap-2 font-extrabold text-xl text-gradient">
            <Home className="h-6 w-6 text-primary" />
            NIKONEKTI
          </Link>
          <nav className="hidden md:flex items-center gap-6 text-sm text-muted-foreground">
            <Link to="/properties" className="hover:text-foreground transition-colors font-medium">Vinjari Nyumba</Link>
          </nav>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" asChild>
              <Link to="/login">Ingia</Link>
            </Button>
            <Button size="sm" className="shadow-md" asChild>
              <Link to="/register">Anza Sasa</Link>
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
            <p className="text-sm text-primary-foreground/60">Tunaunganisha wapangaji na wamiliki kote Tanzania.</p>
          </div>
          <div>
            <h5 className="font-semibold mb-3 text-sm text-primary-foreground/80">Kwa Wapangaji</h5>
            <ul className="space-y-2 text-sm text-primary-foreground/60">
              <li><Link to="/properties" className="hover:text-primary-foreground transition-colors">Vinjari Nyumba</Link></li>
              <li><Link to="/register" className="hover:text-primary-foreground transition-colors">Jisajili</Link></li>
            </ul>
          </div>
          <div>
            <h5 className="font-semibold mb-3 text-sm text-primary-foreground/80">Kwa Wamiliki</h5>
            <ul className="space-y-2 text-sm text-primary-foreground/60">
              <li><Link to="/register" className="hover:text-primary-foreground transition-colors">Orodhesha Nyumba</Link></li>
            </ul>
          </div>
          <div>
            <h5 className="font-semibold mb-3 text-sm text-primary-foreground/80">Kampuni</h5>
            <ul className="space-y-2 text-sm text-primary-foreground/60">
              <li><Link to="/" className="hover:text-primary-foreground transition-colors">Kuhusu</Link></li>
              <li><Link to="/" className="hover:text-primary-foreground transition-colors">Wasiliana</Link></li>
            </ul>
          </div>
        </div>
        <div className="border-t border-primary-foreground/10">
          <div className="container py-4 text-center text-xs text-primary-foreground/40">
            © 2026 NIKONEKTI. Haki zote zimehifadhiwa.
          </div>
        </div>
      </footer>
    </div>
  );
}
