import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { PropertyCard } from "@/components/PropertyCard";
import { Input } from "@/components/ui/input";
import { Search, Eye, ClipboardList, FileText, Home, Building2, Shield, Users, ChevronRight, Sparkles } from "lucide-react";
import type { Property } from "@/types";
import heroBg from "@/assets/hero-bg.jpg";

const featuredProperties: Property[] = [
  { id: "1", title: "Studio ya Kisasa Masaki", description: "", price: 800000, location: "Masaki, Dar es Salaam", bedrooms: 1, propertyType: "studio", amenities: [], houseRules: [], images: ["/placeholder.svg"], status: "available", owner: "l1", created_at: "" },
  { id: "2", title: "Nyumba 2BR Mikocheni", description: "", price: 1200000, location: "Mikocheni, Dar es Salaam", bedrooms: 2, propertyType: "apartment", amenities: [], houseRules: [], images: ["/placeholder.svg"], status: "available", owner: "l2", created_at: "" },
  { id: "3", title: "Chumba Sinza", description: "", price: 500000, location: "Sinza, Dar es Salaam", bedrooms: 1, propertyType: "apartment", amenities: [], houseRules: [], images: ["/placeholder.svg"], status: "available", owner: "l3", created_at: "" },
  { id: "4", title: "Nyumba ya Familia Mbezi", description: "", price: 2000000, location: "Mbezi Beach", bedrooms: 3, propertyType: "house", amenities: [], houseRules: [], images: ["/placeholder.svg"], status: "available", owner: "l4", created_at: "" },
];

const steps = [
  { icon: Search, title: "Tafuta", description: "Vinjari nyumba zilizothibitishwa jijini kwako" },
  { icon: Eye, title: "Omba Kuona", description: "Panga muda wa kuona nyumba kwa urahisi" },
  { icon: ClipboardList, title: "Omba", description: "Wasilisha maombi yako ya kukodisha mtandaoni" },
  { icon: FileText, title: "Mkataba", description: "Kagua na ukubali mkataba wa kukodisha" },
];

const Landing = () => {
  return (
    <div>
      {/* Hero with background image */}
      <section className="relative min-h-[85vh] flex items-center overflow-hidden">
        {/* Background image */}
        <div className="absolute inset-0">
          <img src={heroBg} alt="" className="h-full w-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-r from-foreground/85 via-foreground/60 to-foreground/30" />
        </div>

        {/* Floating decorative elements */}
        <div className="absolute top-20 right-20 h-64 w-64 rounded-full bg-primary/20 blur-3xl animate-float" />
        <div className="absolute bottom-20 left-10 h-48 w-48 rounded-full bg-accent/20 blur-3xl animate-float" style={{ animationDelay: '2s' }} />

        <div className="container relative z-10 py-20">
          <div className="max-w-2xl space-y-8 animate-slide-up">
            <div className="inline-flex items-center gap-2 rounded-full bg-primary/20 backdrop-blur-sm border border-primary/30 px-4 py-1.5 text-sm text-primary-foreground">
              <Sparkles className="h-4 w-4" />
              <span>Jukwaa #1 la Kukodisha Tanzania</span>
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight text-primary-foreground leading-[1.1]">
              Pata nyumba yako <br />
              <span className="text-gradient">kwa urahisi</span>
            </h1>
            <p className="text-lg text-primary-foreground/80 max-w-lg">
              NIKONEKTI inaunganisha wapangaji na wamiliki kwenye jukwaa moja la kuaminika. Tafuta, omba, na kodisha — yote sehemu moja.
            </p>
            <div className="flex max-w-lg">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  placeholder="Tafuta vyumba, nyumba, au maeneo…"
                  className="pl-12 h-14 rounded-r-none border-r-0 text-base glass-strong"
                />
              </div>
              <Button className="h-14 rounded-l-none px-8 text-base font-semibold animate-pulse-glow" asChild>
                <Link to="/properties">Tafuta</Link>
              </Button>
            </div>
            <div className="flex gap-8 pt-4">
              <div className="text-center">
                <p className="text-3xl font-bold text-primary-foreground animate-count-up">500+</p>
                <p className="text-sm text-primary-foreground/60">Nyumba</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold text-primary-foreground animate-count-up" style={{ animationDelay: '0.2s' }}>1,200+</p>
                <p className="text-sm text-primary-foreground/60">Watumiaji</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold text-primary-foreground animate-count-up" style={{ animationDelay: '0.4s' }}>98%</p>
                <p className="text-sm text-primary-foreground/60">Kuridhika</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section className="py-24 relative overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 h-px w-2/3 bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
        <div className="container">
          <div className="text-center mb-16 animate-slide-up">
            <p className="text-sm font-semibold text-primary uppercase tracking-widest mb-2">Jinsi Inavyofanya Kazi</p>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground">Hatua 4 rahisi za kupata nyumba</h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 stagger-children">
            {steps.map((step, i) => (
              <Card key={step.title} className="text-center border-none shadow-none bg-transparent group animate-slide-up">
                <CardContent className="pt-6 space-y-4">
                  <div className="relative mx-auto">
                    <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/15 to-accent/10 mx-auto group-hover:scale-110 transition-transform duration-300">
                      <step.icon className="h-7 w-7 text-primary" />
                    </div>
                    <div className="absolute -top-2 -right-2 flex h-7 w-7 items-center justify-center rounded-full bg-accent text-accent-foreground text-xs font-bold shadow-lg">
                      {i + 1}
                    </div>
                  </div>
                  <h3 className="font-bold text-foreground text-lg">{step.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{step.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Properties */}
      <section className="py-24 bg-gradient-to-b from-muted/40 to-background relative">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,hsl(215_80%_48%/0.05),transparent_50%)]" />
        <div className="container relative">
          <div className="flex items-end justify-between mb-10">
            <div>
              <p className="text-sm font-semibold text-primary uppercase tracking-widest mb-2">Nyumba Bora</p>
              <h2 className="text-3xl md:text-4xl font-bold text-foreground">Zilizochaguliwa kwako</h2>
            </div>
            <Button variant="ghost" className="group" asChild>
              <Link to="/properties">
                Tazama zote
                <ChevronRight className="h-4 w-4 ml-1 group-hover:translate-x-1 transition-transform" />
              </Link>
            </Button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 stagger-children">
            {featuredProperties.map((p) => (
              <div key={p.id} className="animate-slide-up">
                <PropertyCard property={p} />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-24 relative overflow-hidden">
        <div className="absolute -top-32 -right-32 h-96 w-96 rounded-full bg-primary/5 blur-3xl" />
        <div className="absolute -bottom-32 -left-32 h-96 w-96 rounded-full bg-accent/5 blur-3xl" />
        <div className="container relative">
          <div className="text-center mb-16">
            <p className="text-sm font-semibold text-primary uppercase tracking-widest mb-2">Faida</p>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground">Kwa nini NIKONEKTI?</h2>
          </div>
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <Card className="hover-lift overflow-hidden group">
              <div className="h-1.5 bg-gradient-to-r from-primary to-primary/50" />
              <CardContent className="p-8 space-y-5">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-primary/15 to-primary/5 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Users className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="font-bold text-foreground text-lg">Kwa Wapangaji</h3>
                </div>
                <ul className="space-y-3 text-sm text-muted-foreground">
                  <li className="flex items-start gap-2"><span className="text-primary mt-0.5">✓</span>Vinjari orodha zilizothibitishwa na picha halisi</li>
                  <li className="flex items-start gap-2"><span className="text-primary mt-0.5">✓</span>Panga kuona nyumba mtandaoni mara moja</li>
                  <li className="flex items-start gap-2"><span className="text-primary mt-0.5">✓</span>Fuatilia maombi kutoka kuwasilisha hadi mkataba</li>
                  <li className="flex items-start gap-2"><span className="text-primary mt-0.5">✓</span>Mikataba ya kidijitali — bila karatasi</li>
                </ul>
              </CardContent>
            </Card>
            <Card className="hover-lift overflow-hidden group">
              <div className="h-1.5 bg-gradient-to-r from-accent to-accent/50" />
              <CardContent className="p-8 space-y-5">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-accent/15 to-accent/5 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Building2 className="h-6 w-6 text-accent" />
                  </div>
                  <h3 className="font-bold text-foreground text-lg">Kwa Wamiliki</h3>
                </div>
                <ul className="space-y-3 text-sm text-muted-foreground">
                  <li className="flex items-start gap-2"><span className="text-accent mt-0.5">✓</span>Orodhesha nyumba na ufikie wapangaji bora</li>
                  <li className="flex items-start gap-2"><span className="text-accent mt-0.5">✓</span>Simamia maombi ya kuona kwa urahisi</li>
                  <li className="flex items-start gap-2"><span className="text-accent mt-0.5">✓</span>Kagua maombi na taarifa za wapangaji</li>
                  <li className="flex items-start gap-2"><span className="text-accent mt-0.5">✓</span>Tengeneza na uchapishie mikataba ya kukodisha</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-accent/5 to-primary/10 animate-gradient-x" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_30%,hsl(35_95%_55%/0.1),transparent_50%)]" />
        <div className="container relative text-center max-w-2xl mx-auto space-y-8">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground">Uko tayari kuanza?</h2>
          <p className="text-lg text-muted-foreground">Jiunge na maelfu ya wapangaji na wamiliki kwenye NIKONEKTI.</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="text-base px-8 h-13 shadow-lg hover:shadow-xl transition-shadow" asChild>
              <Link to="/register?role=tenant">Jisajili kama Mpangaji</Link>
            </Button>
            <Button size="lg" variant="outline" className="text-base px-8 h-13 hover-lift" asChild>
              <Link to="/register?role=landlord">Jisajili kama Mmiliki</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Landing;
