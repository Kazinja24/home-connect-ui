import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { PropertyCard } from "@/components/PropertyCard";
import { Check, ChevronRight, Home, Shield } from "lucide-react";
import { useLanguage } from "@/i18n/LanguageContext";
import type { Property } from "@/types";
import { normalizePropertyImages, properties as propertiesApi } from "@/lib/api";

const Landing = () => {
  const { t } = useLanguage();

  const { data } = useQuery({
    queryKey: ["landing-featured-properties"],
    queryFn: () => propertiesApi.list(),
  });

  const featuredProperties: Property[] = (data || [])
    .filter((item: any) => item.listing_status === "published" || !item.listing_status)
    .slice(0, 4)
    .map((item: any) => ({
      id: String(item.id),
      title: item.title || "Nyumba",
      description: item.description || "",
      price: Number(item.price || 0),
      location: item.location || "Eneo halijatajwa",
      bedrooms: Number(item.bedrooms || 0),
      propertyType: item.property_type || item.propertyType || "house",
      amenities: Array.isArray(item.amenities) ? item.amenities : [],
      houseRules: Array.isArray(item.house_rules) ? item.house_rules : [],
      images: normalizePropertyImages(item.images),
      status: item.status || "available",
      owner: String(item.owner || ""),
      created_at: item.created_at || "",
      verified: item.verification_status === "verified",
    }));

  return (
    <div className="bg-background">
      {/* Hero Section */}
      <section className="py-16 md:py-24 border-b border-border">
        <div className="container">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            {/* Left: Text content */}
            <div className="space-y-6">
              {/* Overline tag */}
              <p className="tag-label text-primary">TANZANIA'S TRUSTED RENTAL PLATFORM</p>
              
              {/* Headline */}
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-foreground leading-tight tracking-tight">
                Pata Nyumba Halisi.<br />
                <span className="text-primary">Haraka. Salama.</span>
              </h1>
              
              {/* Subtext */}
              <p className="text-lg text-muted-foreground max-w-lg">
                Browse verified rentals in Dar es Salaam, Mwanza na Arusha. No fake listings. No wasted trips.
              </p>
              
              {/* CTAs */}
              <div className="flex flex-wrap gap-3 pt-2">
                <Button asChild className="h-12 px-6 rounded bg-primary text-primary-foreground hover:bg-primary/90">
                  <Link to="/properties">Tafuta Nyumba</Link>
                </Button>
                <Button asChild variant="outline" className="h-12 px-6 rounded border-primary text-primary hover:bg-primary hover:text-primary-foreground">
                  <Link to="/register?role=landlord">Orodhesha Nyumba</Link>
                </Button>
              </div>
              
              {/* Trust strip */}
              <div className="flex flex-wrap gap-6 pt-4 text-sm text-muted-foreground">
                <span className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-primary" strokeWidth={1.5} />
                  500+ Orodha Zilizothibitishwa
                </span>
                <span className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-primary" strokeWidth={1.5} />
                  Malipo ya M-Pesa
                </span>
                <span className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-primary" strokeWidth={1.5} />
                  Mikataba ya Kidijitali
                </span>
              </div>
            </div>
            
            {/* Right: Property card mockup */}
            <div className="hidden md:block">
              <div className="bg-card border border-border rounded-lg p-4 shadow-subtle max-w-sm ml-auto">
                <div className="aspect-[4/3] bg-muted rounded mb-4 flex items-center justify-center">
                  <Home className="h-12 w-12 text-muted-foreground/30" strokeWidth={1.5} />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="tag-label bg-primary text-primary-foreground px-2 py-0.5 rounded">2 BED</span>
                    <span className="flex items-center gap-1 text-xs text-accent">
                      <Shield className="h-3 w-3" strokeWidth={1.5} />
                      Imethibitishwa
                    </span>
                  </div>
                  <p className="text-xl font-bold text-primary">TZS 450,000/mo</p>
                  <p className="text-sm text-muted-foreground">Kinondoni, Dar es Salaam</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 md:py-20">
        <div className="container">
          <div className="border-t border-border pt-12">
            <p className="tag-label text-primary mb-8">JINSI INAVYOFANYA KAZI</p>
            
            <div className="grid md:grid-cols-3 gap-12">
              {[
                { num: "01", title: "Tafuta", desc: "Vinjari orodha zilizothibitishwa katika jiji lako. Chuja kwa bei, eneo, na vifaa." },
                { num: "02", title: "Omba & Angalia", desc: "Wasilisha ombi, panga kuona nyumba, na wasiliana na mmiliki moja kwa moja." },
                { num: "03", title: "Kodi & Lipa", desc: "Saini mkataba wa kidijitali na lipa kodi salama kupitia M-Pesa." },
              ].map((step) => (
                <div key={step.num} className="space-y-3">
                  <span className="text-5xl font-extrabold text-primary/20">{step.num}</span>
                  <h3 className="text-xl font-bold text-foreground">{step.title}</h3>
                  <p className="text-muted-foreground leading-relaxed">{step.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Featured Listings */}
      <section className="py-16 md:py-20 bg-card border-y border-border">
        <div className="container">
          <div className="flex items-end justify-between mb-8">
            <div>
              <p className="tag-label text-primary mb-2">ORODHA MPYA</p>
              <h2 className="text-2xl md:text-3xl font-bold text-foreground">New Listings</h2>
            </div>
            <Button asChild variant="ghost" className="text-primary hover:bg-primary/5">
              <Link to="/properties" className="flex items-center gap-1">
                {t("landing.viewAll")}
                <ChevronRight className="h-4 w-4" strokeWidth={1.5} />
              </Link>
            </Button>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredProperties.map((p) => (
              <PropertyCard key={p.id} property={p} />
            ))}
            {featuredProperties.length === 0 && (
              <p className="col-span-full text-center text-muted-foreground py-12">Hakuna orodha bado.</p>
            )}
          </div>
        </div>
      </section>

      {/* Trust & Safety */}
      <section className="py-16 md:py-20">
        <div className="container">
          <div className="grid md:grid-cols-2 gap-12 items-start">
            <div className="space-y-4">
              <div className="border-l-4 border-primary pl-6">
                <p className="text-5xl font-extrabold text-foreground">0</p>
                <p className="text-xl font-bold text-foreground">Orodha za Uongo</p>
              </div>
              <p className="text-muted-foreground max-w-md">
                Kila orodha inakaguliwa na timu yetu. Wamiliki lazima wathibitishe kitambulisho cha NIDA na hati za umiliki kabla ya kuchapisha.
              </p>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <Shield className="h-8 w-8 text-accent" strokeWidth={1.5} />
                <h3 className="text-xl font-bold text-foreground">NIDA Verification</h3>
              </div>
              <p className="text-muted-foreground">
                Wamiliki wote wamethibitishwa kupitia Kitambulisho cha Taifa cha NIDA. Ukaguzi wa msimamizi unahakikisha orodha zinaonyesha nyumba halisi na maelezo sahihi.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Landing;
