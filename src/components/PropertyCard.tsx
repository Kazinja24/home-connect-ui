import { MapPin, Bed } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import type { Property } from "@/types";

export function PropertyCard({ property }: { property: Property }) {
  return (
    <Card className="overflow-hidden group hover-lift border-border/50">
      <div className="aspect-[4/3] overflow-hidden bg-muted relative">
        <img
          src={property.images[0] || "/placeholder.svg"}
          alt={property.title}
          className="h-full w-full object-cover group-hover:scale-110 transition-transform duration-500"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-foreground/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        {property.available && (
          <div className="absolute top-3 left-3 rounded-full bg-success/90 backdrop-blur-sm text-success-foreground text-xs font-semibold px-3 py-1 shadow-md">
            Inapatikana
          </div>
        )}
      </div>
      <CardContent className="p-5 space-y-3">
        <h3 className="font-bold text-foreground truncate">{property.title}</h3>
        <p className="text-xl font-extrabold text-primary">
          TZS {property.price.toLocaleString()}<span className="text-sm font-normal text-muted-foreground">/mwezi</span>
        </p>
        <div className="flex items-center gap-3 text-sm text-muted-foreground">
          <span className="flex items-center gap-1"><MapPin className="h-3.5 w-3.5" />{property.location}</span>
          <span className="flex items-center gap-1"><Bed className="h-3.5 w-3.5" />{property.bedrooms} chumba</span>
        </div>
        <Button asChild variant="outline" className="w-full mt-2 font-semibold" size="sm">
          <Link to={`/properties/${property.id}`}>Tazama Zaidi</Link>
        </Button>
      </CardContent>
    </Card>
  );
}
