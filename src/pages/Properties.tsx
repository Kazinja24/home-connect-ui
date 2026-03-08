import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { PropertyCard } from "@/components/PropertyCard";
import { Search, SlidersHorizontal } from "lucide-react";
import { useLanguage } from "@/i18n/LanguageContext";
import type { Property } from "@/types";
import { normalizePropertyImages, properties as propertiesApi, features as featuresApi } from "@/lib/api";

function mapApiProperty(item: any): Property {
  return {
    id: String(item.id),
    title: item.title || "Nyumba",
    description: item.description || "",
    price: Number(item.price || 0),
    location: item.location || "Eneo halijatajwa",
    bedrooms: Number(item.bedrooms || 0),
    propertyType: item.property_type || item.propertyType || "house",
    amenities: Array.isArray(item.features) ? item.features.map((f: any) => f.name) : Array.isArray(item.amenities) ? item.amenities : [],
    houseRules: Array.isArray(item.house_rules) ? item.house_rules : Array.isArray(item.houseRules) ? item.houseRules : [],
    images: normalizePropertyImages(item.images),
    status: item.status || "available",
    owner: String(item.owner || ""),
    created_at: item.created_at || "",
  };
}

const Properties = () => {
  const { t } = useLanguage();
  const [location, setLocation] = useState("");
  const [propertyType, setPropertyType] = useState("");
  const [bedrooms, setBedrooms] = useState("");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [availableFeatures, setAvailableFeatures] = useState<any[]>([]);
  const [selectedFeatures, setSelectedFeatures] = useState<number[]>([]);
  const [showFilters, setShowFilters] = useState(false);

  const { data } = useQuery({
    queryKey: ["public-properties", location, propertyType, bedrooms, minPrice, maxPrice, selectedFeatures],
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

  // Only show PUBLISHED properties
  const allProperties = (data || [])
    .filter((item: any) => {
      const ls = String(item.listing_status || "").toLowerCase();
      return ls === "published" || ls === "";
    })
    .map(mapApiProperty);

  const { data: featuresData } = useQuery({
    queryKey: ["features"],
    queryFn: () => featuresApi.list(),
  });

  useEffect(() => {
    if (featuresData) setAvailableFeatures(featuresData);
  }, [featuresData]);

  const filtered = allProperties.filter((p) => {
    if (location && !p.location.toLowerCase().includes(location.toLowerCase())) return false;
    if (propertyType && p.propertyType !== propertyType) return false;
    if (bedrooms && Number(bedrooms) === 3 && p.bedrooms < 3) return false;
    if (bedrooms && Number(bedrooms) !== 3 && p.bedrooms !== Number(bedrooms)) return false;
    return true;
  });

  return (
    <div className="container py-10">
      <div className="mb-8 animate-slide-up">
        <h1 className="text-3xl font-bold text-foreground mb-2">{t("properties.title")}</h1>
        <p className="text-muted-foreground">{t("properties.subtitle")}</p>
      </div>
      <div className="flex gap-2 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder={t("properties.searchPlaceholder")} className="pl-10 h-12" value={location} onChange={(e) => setLocation(e.target.value)} />
        </div>
        <Button variant="outline" size="icon" className="h-12 w-12" onClick={() => setShowFilters(!showFilters)}><SlidersHorizontal className="h-4 w-4" /></Button>
      </div>
      {showFilters && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6 p-5 border rounded-xl glass animate-slide-up">
          <div className="space-y-1.5">
            <Label className="text-xs">{t("properties.propertyType")}</Label>
            <Select value={propertyType} onValueChange={setPropertyType}>
              <SelectTrigger><SelectValue placeholder={t("properties.allTypes")} /></SelectTrigger>
              <SelectContent>
                <SelectItem value="studio">{t("properties.studio")}</SelectItem>
                <SelectItem value="apartment">{t("properties.apartment")}</SelectItem>
                <SelectItem value="house">{t("properties.house")}</SelectItem>
                <SelectItem value="room">{t("properties.room")}</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">{t("properties.bedrooms")}</Label>
            <Select value={bedrooms} onValueChange={setBedrooms}>
              <SelectTrigger><SelectValue placeholder={t("properties.allBedrooms")} /></SelectTrigger>
              <SelectContent>
                <SelectItem value="1">1</SelectItem>
                <SelectItem value="2">2</SelectItem>
                <SelectItem value="3">3+</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">{t("properties.priceRange") || "Price range"}</Label>
            <div className="flex gap-2">
              <Input placeholder={t("properties.min") || "Min"} value={minPrice} onChange={(e) => setMinPrice(e.target.value)} />
              <Input placeholder={t("properties.max") || "Max"} value={maxPrice} onChange={(e) => setMaxPrice(e.target.value)} />
            </div>
          </div>
          <div className="col-span-2 flex items-end">
            <Button variant="ghost" size="sm" onClick={() => { setPropertyType(""); setBedrooms(""); setLocation(""); setMinPrice(""); setMaxPrice(""); setSelectedFeatures([]); }}>{t("properties.clearFilters")}</Button>
          </div>
          <div className="col-span-4">
            <Label className="text-xs">{t("properties.features") || "Features"}</Label>
            <div className="grid grid-cols-3 gap-2 max-h-36 overflow-y-auto p-2 border rounded mt-2">
              {(availableFeatures.length ? availableFeatures : []).map((f) => (
                <label key={f.id} className="flex items-center space-x-2"><input type="checkbox" checked={selectedFeatures.includes(Number(f.id))} onChange={(e) => {
                  if (e.target.checked) setSelectedFeatures(s => Array.from(new Set([...s, Number(f.id)])));
                  else setSelectedFeatures(s => s.filter(id => id !== Number(f.id)));
                }} /> <span className="text-sm">{f.name}</span></label>
              ))}
            </div>
          </div>
        </div>
      )}
      <p className="text-sm text-muted-foreground mb-4">{t("properties.found", { count: String(filtered.length) })}</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 stagger-children">
        {filtered.map((p) => (<div key={p.id} className="animate-slide-up"><PropertyCard property={p} /></div>))}
      </div>
      {filtered.length === 0 && (
        <div className="text-center py-16 text-muted-foreground">
          <p>{t("properties.noResults")}</p>
          <Button variant="link" onClick={() => { setPropertyType(""); setBedrooms(""); setLocation(""); }}>{t("properties.clearAll")}</Button>
        </div>
      )}
    </div>
  );
};

export default Properties;
