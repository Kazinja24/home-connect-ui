import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { PropertyCard } from "@/components/PropertyCard";
import { Input } from "@/components/ui/input";
import { Search, Eye, ClipboardList, FileText, Home, Building2, Shield, Users } from "lucide-react";
import type { Property } from "@/types";

// Placeholder data — will be replaced by API calls
const featuredProperties: Property[] = [
  { id: "1", title: "Modern Studio in Masaki", description: "", price: 800000, location: "Masaki, Dar es Salaam", bedrooms: 1, propertyType: "studio", amenities: [], houseRules: [], images: ["/placeholder.svg"], available: true, landlordId: "l1" },
  { id: "2", title: "Spacious 2BR in Mikocheni", description: "", price: 1200000, location: "Mikocheni, Dar es Salaam", bedrooms: 2, propertyType: "apartment", amenities: [], houseRules: [], images: ["/placeholder.svg"], available: true, landlordId: "l2" },
  { id: "3", title: "Cozy Apartment in Sinza", description: "", price: 500000, location: "Sinza, Dar es Salaam", bedrooms: 1, propertyType: "apartment", amenities: [], houseRules: [], images: ["/placeholder.svg"], available: true, landlordId: "l3" },
  { id: "4", title: "Family Home in Mbezi", description: "", price: 2000000, location: "Mbezi Beach", bedrooms: 3, propertyType: "house", amenities: [], houseRules: [], images: ["/placeholder.svg"], available: true, landlordId: "l4" },
];

const steps = [
  { icon: Search, title: "Discover", description: "Browse verified rental listings across your city" },
  { icon: Eye, title: "Request Viewing", description: "Schedule a viewing at your convenience" },
  { icon: ClipboardList, title: "Apply", description: "Submit your rental application online" },
  { icon: FileText, title: "Lease", description: "Review and acknowledge your lease agreement" },
];

const Landing = () => {
  return (
    <div>
      {/* Hero */}
      <section className="relative bg-gradient-to-b from-primary/5 to-background py-20 md:py-32">
        <div className="container text-center max-w-3xl mx-auto space-y-6">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-foreground">
            Find your next <span className="text-primary">home</span>, effortlessly
          </h1>
          <p className="text-lg text-muted-foreground max-w-xl mx-auto">
            NIKONEKTI connects tenants and landlords on one trusted platform. Browse, apply, and lease — all in one place.
          </p>
          <div className="flex max-w-lg mx-auto">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search rooms, apartments, or areas…" className="pl-10 h-12 rounded-r-none border-r-0" />
            </div>
            <Button className="h-12 rounded-l-none px-6" asChild>
              <Link to="/properties">Search</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section className="py-20">
        <div className="container">
          <h2 className="text-2xl md:text-3xl font-bold text-center text-foreground mb-12">How it works</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {steps.map((step, i) => (
              <Card key={step.title} className="text-center border-none shadow-none bg-transparent">
                <CardContent className="pt-6 space-y-3">
                  <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
                    <step.icon className="h-6 w-6 text-primary" />
                  </div>
                  <div className="text-xs font-medium text-muted-foreground">Step {i + 1}</div>
                  <h3 className="font-semibold text-foreground">{step.title}</h3>
                  <p className="text-sm text-muted-foreground">{step.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Properties */}
      <section className="py-20 bg-muted/40">
        <div className="container">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl md:text-3xl font-bold text-foreground">Featured Properties</h2>
            <Button variant="ghost" asChild>
              <Link to="/properties">View all →</Link>
            </Button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredProperties.map((p) => (
              <PropertyCard key={p.id} property={p} />
            ))}
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-20">
        <div className="container">
          <h2 className="text-2xl md:text-3xl font-bold text-center text-foreground mb-12">Why NIKONEKTI?</h2>
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <Card>
              <CardContent className="p-6 space-y-4">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center"><Users className="h-5 w-5 text-primary" /></div>
                  <h3 className="font-semibold text-foreground">For Tenants</h3>
                </div>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>• Browse verified listings with real photos</li>
                  <li>• Schedule viewings online instantly</li>
                  <li>• Track applications from submission to lease</li>
                  <li>• Digital lease agreements — no paperwork</li>
                </ul>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6 space-y-4">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-accent/10 flex items-center justify-center"><Building2 className="h-5 w-5 text-accent" /></div>
                  <h3 className="font-semibold text-foreground">For Landlords</h3>
                </div>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>• List properties and reach quality tenants</li>
                  <li>• Manage viewing requests effortlessly</li>
                  <li>• Review applications with tenant details</li>
                  <li>• Generate and publish lease agreements</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-primary/5">
        <div className="container text-center max-w-2xl mx-auto space-y-6">
          <h2 className="text-2xl md:text-3xl font-bold text-foreground">Ready to get started?</h2>
          <p className="text-muted-foreground">Join thousands of tenants and landlords on NIKONEKTI.</p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button size="lg" asChild>
              <Link to="/register?role=tenant">Register as Tenant</Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link to="/register?role=landlord">Register as Landlord</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Landing;
