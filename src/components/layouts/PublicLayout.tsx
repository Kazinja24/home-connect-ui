import { Link, Outlet } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Home } from "lucide-react";

export function PublicLayout() {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          <Link to="/" className="flex items-center gap-2 font-bold text-xl text-primary">
            <Home className="h-6 w-6" />
            NIKONEKTI
          </Link>
          <nav className="hidden md:flex items-center gap-6 text-sm text-muted-foreground">
            <Link to="/properties" className="hover:text-foreground transition-colors">Browse Properties</Link>
          </nav>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" asChild>
              <Link to="/login">Log in</Link>
            </Button>
            <Button size="sm" asChild>
              <Link to="/register">Get Started</Link>
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-1">
        <Outlet />
      </main>

      <footer className="border-t bg-muted/40">
        <div className="container py-12 grid grid-cols-2 md:grid-cols-4 gap-8">
          <div>
            <h4 className="font-bold text-foreground mb-3">NIKONEKTI</h4>
            <p className="text-sm text-muted-foreground">Connecting tenants and landlords across Tanzania.</p>
          </div>
          <div>
            <h5 className="font-semibold text-foreground mb-3 text-sm">For Tenants</h5>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link to="/properties" className="hover:text-foreground transition-colors">Browse Properties</Link></li>
              <li><Link to="/register" className="hover:text-foreground transition-colors">Register</Link></li>
            </ul>
          </div>
          <div>
            <h5 className="font-semibold text-foreground mb-3 text-sm">For Landlords</h5>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link to="/register" className="hover:text-foreground transition-colors">List Property</Link></li>
            </ul>
          </div>
          <div>
            <h5 className="font-semibold text-foreground mb-3 text-sm">Company</h5>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link to="/" className="hover:text-foreground transition-colors">About</Link></li>
              <li><Link to="/" className="hover:text-foreground transition-colors">Contact</Link></li>
            </ul>
          </div>
        </div>
        <div className="border-t">
          <div className="container py-4 text-center text-xs text-muted-foreground">
            © 2026 NIKONEKTI. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
