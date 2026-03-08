import { MapPin, Droplets, Zap, Wifi, Car, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useLanguage } from "@/i18n/LanguageContext";
import type { Property } from "@/types";

// Inclusion icons component
function InclusionIcon({ type, included }: { type: string; included: boolean }) {
  const iconClass = `h-4 w-4 ${included ? "text-primary" : "text-muted-foreground/40"}`;
  const icons: Record<string, React.ReactNode> = {
    water: <Droplets className={iconClass} strokeWidth={1.5} />,
    electric: <Zap className={iconClass} strokeWidth={1.5} />,
    wifi: <Wifi className={iconClass} strokeWidth={1.5} />,
    parking: <Car className={iconClass} strokeWidth={1.5} />,
  };
  return icons[type] || null;
}

interface PropertyCardProps {
  property: Property & { verified?: boolean };
}

export function PropertyCard({ property }: PropertyCardProps) {
  const { t } = useLanguage();
  
  // Determine inclusions from amenities
  const amenitiesLower = property.amenities.map(a => a.toLowerCase());
  const hasWater = amenitiesLower.some(a => a.includes("maji") || a.includes("water"));
  const hasElectric = amenitiesLower.some(a => a.includes("umeme") || a.includes("electric") || a.includes("generator"));
  const hasWifi = amenitiesLower.some(a => a.includes("wifi") || a.includes("internet"));
  const hasParking = amenitiesLower.some(a => a.includes("parking") || a.includes("gari"));
  
  // Property type badge
  const getTypeBadge = () => {
    const beds = property.bedrooms;
    if (beds === 0 || property.propertyType === "studio") return "BEDSITTER";
    if (beds === 1) return "1 BED";
    if (beds === 2) return "2 BED";
    return `${beds} BED`;
  };

  return (
    <div className="bg-card border border-border rounded-lg overflow-hidden shadow-subtle hover:shadow-md transition-shadow">
      {/* Image */}
      <div className="aspect-[4/3] overflow-hidden bg-muted relative">
        <img 
          src={property.images[0] || "/placeholder.svg"} 
          alt={property.title} 
          className="h-full w-full object-cover"
          loading="lazy"
        />
        {/* Property type badge */}
        <span className="absolute top-3 left-3 tag-label bg-primary text-primary-foreground px-2 py-1 rounded">
          {getTypeBadge()}
        </span>
        {/* Verified badge */}
        {property.verified && (
          <span className="absolute top-3 right-3 flex items-center gap-1 tag-label text-accent bg-card/90 px-2 py-1 rounded">
            <Shield className="h-3 w-3" strokeWidth={1.5} />
            Imethibitishwa
          </span>
        )}
      </div>
      
      {/* Content */}
      <div className="p-4 space-y-3">
        {/* Price */}
        <p className="text-xl font-bold text-primary">
          TZS {property.price.toLocaleString()}
          <span className="text-sm font-normal text-muted-foreground">/mo</span>
        </p>
        
        {/* Location */}
        <p className="flex items-center gap-1.5 text-sm text-muted-foreground">
          <MapPin className="h-3.5 w-3.5" strokeWidth={1.5} />
          {property.location}
        </p>
        
        {/* Inclusions */}
        <div className="flex items-center gap-3">
          <InclusionIcon type="water" included={hasWater} />
          <InclusionIcon type="electric" included={hasElectric} />
          <InclusionIcon type="wifi" included={hasWifi} />
          <InclusionIcon type="parking" included={hasParking} />
        </div>
        
        {/* View button */}
        <Button asChild variant="outline" size="sm" className="w-full rounded border-border text-foreground hover:bg-muted">
          <Link to={`/properties/${property.id}`}>Angalia</Link>
        </Button>
      </div>
    </div>
  );
}
