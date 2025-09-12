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
    <div className="bg-white rounded-2xl p-6 md:p-8 shadow-lg border border-gray-100 w-full max-w-4xl mx-auto">
      <h2 className="text-2xl md:text-3xl font-bold text-gray-900 text-center mb-8">
        Find Your Next Job
      </h2>
      
      <div className="space-y-4">
        {/* Search Input */}
        <div className="relative w-full">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <Input
            placeholder="Keyword (e.g., Driver, IT)"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            className="pl-12 h-14 bg-gray-50 border-gray-200 text-base rounded-xl w-full focus:bg-white focus:border-primary transition-colors"
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
          />
        </div>
        
        {/* Location and Category Dropdowns */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Location Select */}
          <div className="relative">
            <MapPin className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 z-10" />
            <Select value={city} onValueChange={setCity}>
              <SelectTrigger className="pl-12 h-14 bg-gray-50 border-gray-200 text-base rounded-xl focus:bg-white focus:border-primary transition-colors">
                <SelectValue placeholder="Select City" />
              </SelectTrigger>
              <SelectContent className="bg-white border border-gray-200 shadow-xl rounded-xl z-50">
                {cities.map((cityOption) => (
                  <SelectItem key={cityOption} value={cityOption} className="text-base py-3">
                    {cityOption}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          {/* Category Select */}
          <div className="relative">
            <Briefcase className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 z-10" />
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger className="pl-12 h-14 bg-gray-50 border-gray-200 text-base rounded-xl focus:bg-white focus:border-primary transition-colors">
                <SelectValue placeholder="Select Category" />
              </SelectTrigger>
              <SelectContent className="bg-white border border-gray-200 shadow-xl rounded-xl z-50">
                {categories.map((categoryOption) => (
                  <SelectItem key={categoryOption} value={categoryOption} className="text-base py-3">
                    {categoryOption}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        
        {/* Action Buttons */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
          <Button 
            onClick={handleSearch} 
            className="h-14 bg-green-600 hover:bg-green-700 text-white rounded-xl font-semibold text-base transition-colors"
          >
            <Search className="h-5 w-5 mr-3" />
            Search
          </Button>
          <Button 
            variant="outline" 
            onClick={handleReset}
            className="h-14 bg-gray-100 hover:bg-gray-200 text-gray-700 border-gray-200 rounded-xl font-semibold text-base transition-colors"
          >
            Reset
          </Button>
        </div>
      </div>
    </div>
  );
}