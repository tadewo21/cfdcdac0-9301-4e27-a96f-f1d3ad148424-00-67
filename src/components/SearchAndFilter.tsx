import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, MapPin, Briefcase } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

interface SearchAndFilterProps {
  onSearch: (filters: {
    keyword: string;
    city: string;
    category: string;
  }) => void;
}

export function SearchAndFilter({ onSearch }: SearchAndFilterProps) {
  const [keyword, setKeyword] = useState("");
  const [city, setCity] = useState("");
  const [category, setCategory] = useState("");
  

  const { t, language } = useLanguage();

  const cities = language === "am" ? [
    t("search.allCities"),
    "አዲስ አበባ",
    "አዲስ አበባ - ቦሌ", 
    "አዲስ አበባ - ሜርካቶ",
    "አዲስ አበባ - ፒያሳ",
    "ባህር ዳር",
    "ድሬ ዳዋ",
    "ሐረር",
    "ሐወሳ",
    "ጅማ",
    "መቀሌ",
    "ናዝሬት/አዳማ",
  ] : [
    t("search.allCities"),
    "Addis Ababa",
    "Addis Ababa - Bole",
    "Addis Ababa - Mercato", 
    "Addis Ababa - Piazza",
    "Bahir Dar",
    "Dire Dawa",
    "Harar",
    "Hawassa",
    "Jimma",
    "Mekelle",
    "Nazret/Adama",
  ];

  const categories = [
    t("search.allCategories"),
    t("category.it"),
    t("category.education"),
    t("category.health"),
    t("category.finance"),
    t("category.business"),
    t("category.marketing"),
    t("category.engineering"),
    t("category.legal"),
    t("category.hr"),
    t("category.construction"),
    t("category.transport"),
    t("category.hotel"),
    t("category.agriculture"),
    t("category.other")
  ];

  const handleSearch = () => {
    onSearch({
      keyword,
      city: city === t("search.allCities") ? "" : city,
      category: category === t("search.allCategories") ? "" : category,
    });
  };

  const handleReset = () => {
    setKeyword("");
    setCity("");
    setCategory("");
    onSearch({ keyword: "", city: "", category: "" });
  };

  return (
    <div className="bg-card border border-border rounded-xl p-2 md:p-6 shadow-sm w-full mx-auto">
      <h2 className="text-base md:text-lg font-semibold mb-4 text-foreground">{t("search.title")}</h2>
      
      {/* Professional Single Line Layout */}
      <div className="flex flex-col md:flex-row gap-3 items-stretch w-full">
        {/* Line 1: Search Input */}
        <div className="relative flex-1 min-w-0 md:flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder={t("search.keyword")}
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            className="pl-10 h-12 bg-background border-border text-sm md:text-base rounded-lg w-full"
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
          />
        </div>
        
        {/* Line 2: Location and Category (mobile grid) */}
        <div className="flex flex-row md:flex-row gap-3 md:gap-3">
          {/* Location Select */}
          <div className="relative md:w-48 flex-shrink-0">
            <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground z-10" />
            <Select value={city} onValueChange={setCity}>
              <SelectTrigger className="pl-10 h-12 bg-background border-border text-sm md:text-base rounded-lg w-full">
                <SelectValue placeholder={t("search.selectCity")} />
              </SelectTrigger>
              <SelectContent className="bg-popover border border-border shadow-lg">
                {cities.map((cityOption) => (
                  <SelectItem key={cityOption} value={cityOption}>
                    {cityOption}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          {/* Category Select */}
          <div className="relative md:w-48 flex-shrink-0">
            <Briefcase className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground z-10" />
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger className="pl-10 h-12 bg-background border-border text-sm md:text-base rounded-lg w-full">
                <SelectValue placeholder={t("search.selectCategory")} />
              </SelectTrigger>
              <SelectContent className="bg-popover border border-border shadow-lg">
                {categories.map((categoryOption) => (
                  <SelectItem key={categoryOption} value={categoryOption}>
                    {categoryOption}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        
        {/* Line 3: Action Buttons */}
        <div className="flex gap-2 md:flex-shrink-0">
          <Button 
            onClick={handleSearch} 
            variant="default"
            className="h-12 px-6 rounded-lg font-medium text-sm md:text-base min-w-[100px]"
          >
            <Search className="h-4 w-4 mr-2" />
            {t("search.searchBtn")}
          </Button>
          <Button 
            variant="outline" 
            onClick={handleReset}
            className="h-12 px-4 rounded-lg font-medium text-sm md:text-base"
          >
            {t("search.resetBtn")}
          </Button>
        </div>
      </div>
    </div>
  );
}