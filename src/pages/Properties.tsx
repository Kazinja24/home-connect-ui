import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { PropertyCard } from "@/components/PropertyCard";
import { Search, SlidersHorizontal, X } from "lucide-react";
import { useLanguage } from "@/i18n/LanguageContext";
import type { Property } from "@/types";
import { normalizePropertyImages, properties as propertiesApi, features as featuresApi } from "@/lib/api";

function mapApiProperty(item: any): Property & { verified?: boolean } {
  return {
    id: String(item.id),
    title: item.title || "Nyumba",
    description: item.description || "",
    price: Number(item.price || 0),
    location: item.location || "Eneo halijatajwa",
    bedrooms: Number(item.bedrooms || 0),
    propertyType: item.property_type || item.propertyType || "house",
    amenities: Array.isArray(item.features) ? item.features.map((f: any) => f.name) : Array.isArray(item.amenities) ? item.amenities : [],
    houseRules: Array.isArray(item.house_rules) ? item.house_rules : [],
    images: normalizePropertyImages(item.images),
    status: item.status || "available",
    owner: String(item.owner || ""),
    created_at: item.created_at || "",
    verified: item.verification_status === "verified",
  };
}

const Properties = () => {
  const { t } = useLanguage();
  const [location, setLocation] = useState("");
  const [propertyType, setPropertyType] = useState("");
  const [bedrooms, setBedrooms] = useState("");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [verifiedOnly, setVerifiedOnly] = useState(false);
  const [availableFeatures, setAvailableFeatures] = useState<any[]>([]);
  const [selectedFeatures, setSelectedFeatures] = useState<number[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 9;

  const { data } = useQuery({
    queryKey: ["public-properties", location, propertyType, bedrooms, minPrice, maxPrice, selectedFeatures, verifiedOnly],
    queryFn: () => {
      const params: Record<string, string> = {};
      if (location) params.location = location;
      if (propertyType) params.property_type = propertyType;
      if (bedrooms) params.bedrooms = bedrooms;
      if (minPrice) params.min_price = minPrice;
      if (maxPrice) params.max_price = maxPrice;
      if (selectedFeatures.length) params.features = selectedFeatures.join(",");
      return propertiesApi.list(params);
    },
  });

  const allProperties = (data || [])
    .filter((item: any) => {
      const ls = String(item.listing_status || "").toLowerCase();
      return ls === "published" || ls === "";
    })
    .map(mapApiProperty)
    .filter((p: any) => !verifiedOnly || p.verified);

  const { data: featuresData } = useQuery({
    queryKey: ["features"],
    queryFn: () => featuresApi.list(),
  });

  useEffect(() => {
    if (featuresData) setAvailableFeatures(featuresData);
  }, [featuresData]);

  // Client-side filtering
  const filtered = allProperties.filter((p) => {
    if (location && !p.location.toLowerCase().includes(location.toLowerCase())) return false;
    if (propertyType && p.propertyType !== propertyType) return false;
    if (bedrooms) {
      const b = Number(bedrooms);
      if (b === 3 && p.bedrooms < 3) return false;
      if (b !== 3 && p.bedrooms !== b) return false;
    }
    if (minPrice && p.price < Number(minPrice)) return false;
    if (maxPrice && p.price > Number(maxPrice)) return false;
    return true;
  });

  // Pagination
  const totalPages = Math.ceil(filtered.length / itemsPerPage);
  const paginatedProperties = filtered.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const clearAllFilters = () => {
    setLocation("");
    setPropertyType("");
    setBedrooms("");
    setMinPrice("");
    setMaxPrice("");
    setSelectedFeatures([]);
    setVerifiedOnly(false);
    setCurrentPage(1);
  };

  return (
    <div className="container py-8">
      {/* Search bar */}
      <div className="flex gap-2 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" strokeWidth={1.5} />
          <Input 
            placeholder="Tafuta mtaa, wilaya..." 
            className="pl-11 h-12 rounded border-border" 
            value={location} 
            onChange={(e) => { setLocation(e.target.value); setCurrentPage(1); }} 
          />
        </div>
        <Button 
          variant="outline" 
          className="h-12 px-4 rounded border-border" 
          onClick={() => setShowFilters(!showFilters)}
        >
          <SlidersHorizontal className="h-4 w-4 mr-2" strokeWidth={1.5} />
          Chuja
        </Button>
      </div>

      {/* Filter drawer */}
      {showFilters && (
        <div className="bg-card border border-border rounded-lg p-6 mb-6 space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {/* Price range */}
            <div className="col-span-2 space-y-2">
              <Label className="text-xs text-muted-foreground">Bei (TZS)</Label>
              <div className="flex gap-2">
                <Input 
                  placeholder="Min" 
                  type="number" 
                  value={minPrice} 
                  onChange={(e) => { setMinPrice(e.target.value); setCurrentPage(1); }} 
                  className="rounded"
                />
                <Input 
                  placeholder="Max" 
                  type="number" 
                  value={maxPrice} 
                  onChange={(e) => { setMaxPrice(e.target.value); setCurrentPage(1); }} 
                  className="rounded"
                />
              </div>
            </div>

            {/* Room type */}
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground">Aina ya Chumba</Label>
              <Select value={propertyType} onValueChange={(v) => { setPropertyType(v); setCurrentPage(1); }}>
                <SelectTrigger className="rounded"><SelectValue placeholder="Zote" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="studio">Bedsitter</SelectItem>
                  <SelectItem value="apartment">Apartment</SelectItem>
                  <SelectItem value="house">Nyumba</SelectItem>
                  <SelectItem value="room">Chumba</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Bedrooms */}
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground">Vyumba vya Kulala</Label>
              <Select value={bedrooms} onValueChange={(v) => { setBedrooms(v); setCurrentPage(1); }}>
                <SelectTrigger className="rounded"><SelectValue placeholder="Vyote" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">Chumba kimoja</SelectItem>
                  <SelectItem value="2">Vyumba 2</SelectItem>
                  <SelectItem value="3">Vyumba 3+</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Features chips */}
          {availableFeatures.length > 0 && (
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground">Vifaa</Label>
              <div className="flex flex-wrap gap-2">
                {availableFeatures.slice(0, 6).map((f) => (
                  <button
                    key={f.id}
                    type="button"
                    onClick={() => {
                      setSelectedFeatures(s => 
                        s.includes(Number(f.id)) 
                          ? s.filter(id => id !== Number(f.id))
                          : [...s, Number(f.id)]
                      );
                      setCurrentPage(1);
                    }}
                    className={`px-3 py-1.5 rounded border text-sm ${
                      selectedFeatures.includes(Number(f.id))
                        ? "bg-primary text-primary-foreground border-primary"
                        : "bg-card text-foreground border-border hover:bg-muted"
                    }`}
                  >
                    {f.name}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Verified toggle */}
          <div className="flex items-center justify-between">
            <label className="flex items-center gap-2 text-sm">
              <input 
                type="checkbox" 
                checked={verifiedOnly} 
                onChange={(e) => { setVerifiedOnly(e.target.checked); setCurrentPage(1); }}
                className="rounded"
              />
              Thibitishwa tu
            </label>
            <Button variant="ghost" size="sm" onClick={clearAllFilters} className="text-muted-foreground">
              <X className="h-3 w-3 mr-1" strokeWidth={1.5} />
              Ondoa Vichujio
            </Button>
          </div>
        </div>
      )}

      {/* Results count & sort */}
      <div className="flex items-center justify-between mb-6">
        <p className="text-sm text-muted-foreground">
          Orodha {filtered.length} Zimepatikana
        </p>
        <Select defaultValue="newest">
          <SelectTrigger className="w-40 rounded border-border">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="newest">Mpya zaidi</SelectItem>
            <SelectItem value="price_low">Bei ndogo</SelectItem>
            <SelectItem value="price_high">Bei kubwa</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Property grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {paginatedProperties.map((p) => (
          <PropertyCard key={p.id} property={p} />
        ))}
      </div>

      {/* Empty state */}
      {filtered.length === 0 && (
        <div className="text-center py-16">
          <p className="text-muted-foreground mb-4">{t("properties.noResults")}</p>
          <Button variant="outline" onClick={clearAllFilters} className="rounded">
            Ondoa Vichujio Vyote
          </Button>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-10">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="rounded"
          >
            Nyuma
          </Button>
          {Array.from({ length: totalPages }, (_, i) => i + 1).slice(0, 7).map((page) => (
            <Button
              key={page}
              variant={currentPage === page ? "default" : "outline"}
              size="sm"
              onClick={() => setCurrentPage(page)}
              className="rounded min-w-[36px]"
            >
              {page}
            </Button>
          ))}
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="rounded"
          >
            Mbele
          </Button>
        </div>
      )}
    </div>
  );
};

export default Properties;
