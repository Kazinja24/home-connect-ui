import { useState } from "react";
import { Link } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { PropertyCard } from "@/components/PropertyCard";
import { Search, SlidersHorizontal } from "lucide-react";
import type { Property } from "@/types";

// Placeholder data — will be replaced by API
const mockProperties: Property[] = [
  { id: "1", title: "Modern Studio in Masaki", description: "A beautiful modern studio apartment.", price: 800000, location: "Masaki, Dar es Salaam", bedrooms: 1, propertyType: "studio", amenities: ["WiFi", "Parking"], houseRules: [], images: ["/placeholder.svg"], available: true, landlordId: "l1" },
  { id: "2", title: "Spacious 2BR in Mikocheni", description: "Spacious two bedroom apartment.", price: 1200000, location: "Mikocheni, Dar es Salaam", bedrooms: 2, propertyType: "apartment", amenities: ["WiFi", "Security"], houseRules: [], images: ["/placeholder.svg"], available: true, landlordId: "l2" },
  { id: "3", title: "Cozy Apartment in Sinza", description: "Affordable and cozy.", price: 500000, location: "Sinza, Dar es Salaam", bedrooms: 1, propertyType: "apartment", amenities: ["Water"], houseRules: [], images: ["/placeholder.svg"], available: true, landlordId: "l3" },
  { id: "4", title: "Family Home in Mbezi Beach", description: "Large family home.", price: 2000000, location: "Mbezi Beach", bedrooms: 3, propertyType: "house", amenities: ["Garden", "Parking", "WiFi"], houseRules: [], images: ["/placeholder.svg"], available: true, landlordId: "l4" },
  { id: "5", title: "Penthouse in Oyster Bay", description: "Luxury penthouse.", price: 3500000, location: "Oyster Bay", bedrooms: 3, propertyType: "apartment", amenities: ["Pool", "Gym", "WiFi"], houseRules: [], images: ["/placeholder.svg"], available: true, landlordId: "l5" },
  { id: "6", title: "Budget Room in Kinondoni", description: "Affordable single room.", price: 250000, location: "Kinondoni", bedrooms: 1, propertyType: "room", amenities: [], houseRules: [], images: ["/placeholder.svg"], available: true, landlordId: "l6" },
];

const Properties = () => {
  const [location, setLocation] = useState("");
  const [propertyType, setPropertyType] = useState("");
  const [bedrooms, setBedrooms] = useState("");
  const [showFilters, setShowFilters] = useState(false);

  // In production, filters would be sent as API query params
  const filtered = mockProperties.filter((p) => {
    if (location && !p.location.toLowerCase().includes(location.toLowerCase())) return false;
    if (propertyType && p.propertyType !== propertyType) return false;
    if (bedrooms && p.bedrooms !== Number(bedrooms)) return false;
    return true;
  });

  return (
    <div className="container py-8">
      {/* Search bar */}
      <div className="flex gap-2 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by location…"
            className="pl-10"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
          />
        </div>
        <Button variant="outline" size="icon" onClick={() => setShowFilters(!showFilters)}>
          <SlidersHorizontal className="h-4 w-4" />
        </Button>
      </div>

      {/* Filters */}
      {showFilters && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6 p-4 border rounded-lg bg-card">
          <div className="space-y-1.5">
            <Label className="text-xs">Property Type</Label>
            <Select value={propertyType} onValueChange={setPropertyType}>
              <SelectTrigger><SelectValue placeholder="All types" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="studio">Studio</SelectItem>
                <SelectItem value="apartment">Apartment</SelectItem>
                <SelectItem value="house">House</SelectItem>
                <SelectItem value="room">Room</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Bedrooms</Label>
            <Select value={bedrooms} onValueChange={setBedrooms}>
              <SelectTrigger><SelectValue placeholder="Any" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="1">1</SelectItem>
                <SelectItem value="2">2</SelectItem>
                <SelectItem value="3">3+</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="col-span-2 flex items-end">
            <Button variant="ghost" size="sm" onClick={() => { setPropertyType(""); setBedrooms(""); setLocation(""); }}>
              Clear filters
            </Button>
          </div>
        </div>
      )}

      {/* Results */}
      <p className="text-sm text-muted-foreground mb-4">{filtered.length} properties found</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map((p) => (
          <PropertyCard key={p.id} property={p} />
        ))}
      </div>
      {filtered.length === 0 && (
        <div className="text-center py-16 text-muted-foreground">
          <p>No properties match your filters.</p>
          <Button variant="link" onClick={() => { setPropertyType(""); setBedrooms(""); setLocation(""); }}>Clear all filters</Button>
        </div>
      )}
    </div>
  );
};

export default Properties;
