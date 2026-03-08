import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { PropertyCard } from "@/components/PropertyCard";
import { Search, SlidersHorizontal, X, CalendarIcon } from "lucide-react";
import { useLanguage } from "@/i18n/LanguageContext";
import { cn } from "@/lib/utils";
import type { Property } from "@/types";
import { normalizePropertyImages, properties as propertiesApi } from "@/lib/api";

const PROPERTY_TYPES = [
  { value: "bedsitter", label: "Bedsitter" },
  { value: "1bedroom", label: "Chumba 1" },
  { value: "2bedroom", label: "Vyumba 2" },
  { value: "3bedroom", label: "Vyumba 3" },
  { value: "studio", label: "Studio" },
  { value: "house", label: "Nyumba" },
  { value: "room", label: "Chumba" },
];

const REGIONS = [
  "Dar es Salaam", "Mwanza", "Arusha", "Dodoma", "Mbeya", "Morogoro", "Tanga", "Zanzibar", "Kilimanjaro", "Iringa"
];

function mapApiProperty(item: any): Property & { verified?: boolean; available_from?: string } {
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
    available_from: item.available_from,
  };
}

const Properties = () => {
  const { t } = useLanguage();
  const [location, setLocation] = useState("");
  const [propertyType, setPropertyType] = useState("");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [region, setRegion] = useState("");
  const [availableDate, setAvailableDate] = useState<Date | undefined>();
  const [verifiedOnly, setVerifiedOnly] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortBy, setSortBy] = useState("newest");
  const itemsPerPage = 9;

  const { data } = useQuery({
    queryKey: ["public-properties"],
    queryFn: () => propertiesApi.list(),
  });

  const allProperties = (data || [])
    .filter((item: any) => {
      const ls = String(item.listing_status || "").toLowerCase();
      return ls === "published" || ls === "";
    })
    .map(mapApiProperty);

  // Client-side filtering
  const filtered = allProperties.filter((p) => {
    if (location && !p.location.toLowerCase().includes(location.toLowerCase())) return false;
    if (region && !p.location.toLowerCase().includes(region.toLowerCase())) return false;
    if (propertyType && p.propertyType !== propertyType) return false;
    if (minPrice && p.price < Number(minPrice)) return false;
    if (maxPrice && p.price > Number(maxPrice)) return false;
    if (verifiedOnly && !p.verified) return false;
    if (availableDate) {
      // Show properties available on or before the selected date
      if (p.available_from && new Date(p.available_from) > availableDate) return false;
    }
    return true;
  });

  // Sort
  const sorted = [...filtered].sort((a, b) => {
    if (sortBy === "price_low") return a.price - b.price;
    if (sortBy === "price_high") return b.price - a.price;
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
  });

  const totalPages = Math.ceil(sorted.length / itemsPerPage);
  const paginatedProperties = sorted.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const hasActiveFilters = location || propertyType || minPrice || maxPrice || region || availableDate || verifiedOnly;

  const clearAllFilters = () => {
    setLocation("");
    setPropertyType("");
    setMinPrice("");
    setMaxPrice("");
    setRegion("");
    setAvailableDate(undefined);
    setVerifiedOnly(false);
    setCurrentPage(1);
  };

  return (
    <div className="container py-8">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground">Tafuta Nyumba</h1>
        <p className="text-sm text-muted-foreground mt-1">Pata nyumba bora inayokufaa</p>
      </div>

      {/* Search bar */}
      <div className="flex gap-2 mb-4">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" strokeWidth={1.5} />
          <Input
            placeholder="Tafuta mtaa, wilaya, eneo..."
            className="pl-11 h-12 rounded border-border"
            value={location}
            onChange={(e) => { setLocation(e.target.value); setCurrentPage(1); }}
          />
        </div>
        <Button
          variant={showFilters ? "default" : "outline"}
          className="h-12 px-4 rounded"
          onClick={() => setShowFilters(!showFilters)}
        >
          <SlidersHorizontal className="h-4 w-4 mr-2" strokeWidth={1.5} />
          Chuja
          {hasActiveFilters && <span className="ml-1.5 h-2 w-2 rounded-full bg-accent" />}
        </Button>
      </div>

      {/* Filter panel */}
      {showFilters && (
        <div className="bg-card border border-border rounded-lg p-5 mb-6 space-y-5 animate-in slide-in-from-top-2">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {/* Region */}
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">Mkoa</Label>
              <Select value={region} onValueChange={(v) => { setRegion(v); setCurrentPage(1); }}>
                <SelectTrigger className="rounded"><SelectValue placeholder="Mkoa wote" /></SelectTrigger>
                <SelectContent>
                  {REGIONS.map(r => <SelectItem key={r} value={r}>{r}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>

            {/* Room type */}
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">Aina ya Chumba</Label>
              <Select value={propertyType} onValueChange={(v) => { setPropertyType(v); setCurrentPage(1); }}>
                <SelectTrigger className="rounded"><SelectValue placeholder="Aina zote" /></SelectTrigger>
                <SelectContent>
                  {PROPERTY_TYPES.map(pt => (
                    <SelectItem key={pt.value} value={pt.value}>{pt.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Price range */}
            <div className="col-span-2 space-y-1.5">
              <Label className="text-xs text-muted-foreground">Bei (TZS)</Label>
              <div className="flex gap-2">
                <Input placeholder="Ndogo" type="number" value={minPrice} onChange={(e) => { setMinPrice(e.target.value); setCurrentPage(1); }} className="rounded" />
                <span className="self-center text-muted-foreground">—</span>
                <Input placeholder="Kubwa" type="number" value={maxPrice} onChange={(e) => { setMaxPrice(e.target.value); setCurrentPage(1); }} className="rounded" />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {/* Available date */}
            <div className="col-span-2 space-y-1.5">
              <Label className="text-xs text-muted-foreground">Inapatikana Kuanzia</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className={cn("w-full justify-start text-left font-normal rounded", !availableDate && "text-muted-foreground")}>
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {availableDate ? format(availableDate, "dd MMM yyyy") : "Tarehe yoyote"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={availableDate}
                    onSelect={(d) => { setAvailableDate(d); setCurrentPage(1); }}
                    initialFocus
                    className={cn("p-3 pointer-events-auto")}
                  />
                </PopoverContent>
              </Popover>
            </div>

            {/* Verified toggle + clear */}
            <div className="col-span-2 flex items-end justify-between">
              <label className="flex items-center gap-2 text-sm cursor-pointer">
                <input
                  type="checkbox"
                  checked={verifiedOnly}
                  onChange={(e) => { setVerifiedOnly(e.target.checked); setCurrentPage(1); }}
                  className="rounded"
                />
                Zilizothibitishwa tu
              </label>
              <Button variant="ghost" size="sm" onClick={clearAllFilters} className="text-muted-foreground">
                <X className="h-3 w-3 mr-1" strokeWidth={1.5} />
                Ondoa vyote
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Results header */}
      <div className="flex items-center justify-between mb-6">
        <p className="text-sm text-muted-foreground">
          Orodha <span className="font-semibold text-foreground">{sorted.length}</span> zimepatikana
        </p>
        <Select value={sortBy} onValueChange={setSortBy}>
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
      {sorted.length === 0 && (
        <div className="text-center py-16">
          <p className="text-muted-foreground mb-4">Hakuna nyumba zinazolingana na vichujio vyako.</p>
          <Button variant="outline" onClick={clearAllFilters} className="rounded">
            Ondoa Vichujio Vyote
          </Button>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-10">
          <Button variant="outline" size="sm" onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="rounded">
            Nyuma
          </Button>
          {Array.from({ length: totalPages }, (_, i) => i + 1).slice(0, 7).map((page) => (
            <Button key={page} variant={currentPage === page ? "default" : "outline"} size="sm" onClick={() => setCurrentPage(page)} className="rounded min-w-[36px]">
              {page}
            </Button>
          ))}
          <Button variant="outline" size="sm" onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="rounded">
            Mbele
          </Button>
        </div>
      )}
    </div>
  );
};

export default Properties;
