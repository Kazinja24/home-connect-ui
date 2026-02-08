import { MapPin, Bed } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import type { Property } from "@/types";

export function PropertyCard({ property }: { property: Property }) {
  return (
    <Card className="overflow-hidden group hover:shadow-lg transition-shadow">
      <div className="aspect-[4/3] overflow-hidden bg-muted">
        <img
          src={property.images[0] || "/placeholder.svg"}
          alt={property.title}
          className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
      </div>
      <CardContent className="p-4 space-y-2">
        <h3 className="font-semibold text-foreground truncate">{property.title}</h3>
        <p className="text-lg font-bold text-primary">
          TZS {property.price.toLocaleString()}<span className="text-sm font-normal text-muted-foreground">/mo</span>
        </p>
        <div className="flex items-center gap-3 text-sm text-muted-foreground">
          <span className="flex items-center gap-1"><MapPin className="h-3.5 w-3.5" />{property.location}</span>
          <span className="flex items-center gap-1"><Bed className="h-3.5 w-3.5" />{property.bedrooms} bed</span>
        </div>
        <Button asChild variant="outline" className="w-full mt-2" size="sm">
          <Link to={`/properties/${property.id}`}>View Details</Link>
        </Button>
      </CardContent>
    </Card>
  );
}
