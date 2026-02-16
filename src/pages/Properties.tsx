import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { PropertyCard } from "@/components/PropertyCard";
import { Search, SlidersHorizontal } from "lucide-react";
import { useLanguage } from "@/i18n/LanguageContext";
import type { Property } from "@/types";

const mockProperties: Property[] = [
  { id: "1", title: "Studio ya Kisasa Masaki", description: "Studio nzuri ya kisasa.", price: 800000, location: "Masaki, Dar es Salaam", bedrooms: 1, propertyType: "studio", amenities: ["WiFi", "Parking"], houseRules: [], images: ["/placeholder.svg"], status: "available", owner: "l1", created_at: "" },
  { id: "2", title: "Nyumba 2BR Mikocheni", description: "Nyumba pana ya vyumba viwili.", price: 1200000, location: "Mikocheni, Dar es Salaam", bedrooms: 2, propertyType: "apartment", amenities: ["WiFi", "Ulinzi"], houseRules: [], images: ["/placeholder.svg"], status: "available", owner: "l2", created_at: "" },
  { id: "3", title: "Chumba Sinza", description: "Bei nafuu na starehe.", price: 500000, location: "Sinza, Dar es Salaam", bedrooms: 1, propertyType: "apartment", amenities: ["Maji"], houseRules: [], images: ["/placeholder.svg"], status: "available", owner: "l3", created_at: "" },
  { id: "4", title: "Nyumba ya Familia Mbezi", description: "Nyumba kubwa ya familia.", price: 2000000, location: "Mbezi Beach", bedrooms: 3, propertyType: "house", amenities: ["Bustani", "Parking", "WiFi"], houseRules: [], images: ["/placeholder.svg"], status: "available", owner: "l4", created_at: "" },
  { id: "5", title: "Penthouse Oyster Bay", description: "Penthouse ya kifahari.", price: 3500000, location: "Oyster Bay", bedrooms: 3, propertyType: "apartment", amenities: ["Bwawa", "Gym", "WiFi"], houseRules: [], images: ["/placeholder.svg"], status: "available", owner: "l5", created_at: "" },
  { id: "6", title: "Chumba Kinondoni", description: "Chumba kimoja bei nafuu.", price: 250000, location: "Kinondoni", bedrooms: 1, propertyType: "room", amenities: [], houseRules: [], images: ["/placeholder.svg"], status: "available", owner: "l6", created_at: "" },
];

const Properties = () => {
  const { t } = useLanguage();
  const [location, setLocation] = useState("");
  const [propertyType, setPropertyType] = useState("");
  const [bedrooms, setBedrooms] = useState("");
  const [showFilters, setShowFilters] = useState(false);

  const filtered = mockProperties.filter((p) => {
    if (location && !p.location.toLowerCase().includes(location.toLowerCase())) return false;
    if (propertyType && p.propertyType !== propertyType) return false;
    if (bedrooms && p.bedrooms !== Number(bedrooms)) return false;
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
          <div className="col-span-2 flex items-end">
            <Button variant="ghost" size="sm" onClick={() => { setPropertyType(""); setBedrooms(""); setLocation(""); }}>{t("properties.clearFilters")}</Button>
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
