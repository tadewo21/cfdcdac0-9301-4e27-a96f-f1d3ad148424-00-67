import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Search,
  TrendingUp,
  Hash,
  BarChart3
} from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

interface SearchKeyword {
  keyword: string;
  search_count: number;
  trend: 'up' | 'down' | 'stable';
  category?: string;
}

interface SearchStats {
  total_searches: number;
  unique_keywords: number;
  avg_searches_per_keyword: number;
  top_search_day: string;
}

export function SearchAnalytics() {
  const { t } = useLanguage();
  const [searchKeywords, setSearchKeywords] = useState<SearchKeyword[]>([]);
  const [searchStats, setSearchStats] = useState<SearchStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSearchAnalytics();
  }, []);

  const fetchSearchAnalytics = async () => {
    try {
      setLoading(true);

      // Note: In a real implementation, you would have a search_logs table
      // For demonstration, we'll simulate popular search keywords
      const simulatedKeywords: SearchKeyword[] = [
        { keyword: "Software Developer", search_count: 245, trend: 'up', category: "IT" },
        { keyword: "Accountant", search_count: 189, trend: 'up', category: "Finance" },
        { keyword: "Teacher", search_count: 167, trend: 'stable', category: "Education" },
        { keyword: "Nurse", search_count: 156, trend: 'up', category: "Health" },
        { keyword: "Sales Manager", search_count: 134, trend: 'down', category: "Business" },
        { keyword: "Driver", search_count: 123, trend: 'stable', category: "Transport" },
        { keyword: "Engineer", search_count: 112, trend: 'up', category: "Engineering" },
        { keyword: "Marketing Specialist", search_count: 98, trend: 'up', category: "Marketing" },
        { keyword: "Data Analyst", search_count: 87, trend: 'up', category: "IT" },
        { keyword: "Project Manager", search_count: 76, trend: 'stable', category: "Business" },
        { keyword: "Graphic Designer", search_count: 65, trend: 'down', category: "IT" },
        { keyword: "Customer Service", search_count: 54, trend: 'stable', category: "Business" },
        { keyword: "Human Resources", search_count: 43, trend: 'up', category: "HR" },
        { keyword: "Pharmacist", search_count: 39, trend: 'stable', category: "Health" },
        { keyword: "Construction Worker", search_count: 32, trend: 'down', category: "Construction" }
      ];

      setSearchKeywords(simulatedKeywords);

      const totalSearches = simulatedKeywords.reduce((sum, keyword) => sum + keyword.search_count, 0);
      const stats: SearchStats = {
        total_searches: totalSearches,
        unique_keywords: simulatedKeywords.length,
        avg_searches_per_keyword: Math.round(totalSearches / simulatedKeywords.length),
        top_search_day: "በትላንት" // Yesterday in Amharic
      };

      setSearchStats(stats);
    } catch (error) {
      console.error("Error fetching search analytics:", error);
    } finally {
      setLoading(false);
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up':
        return <TrendingUp className="h-3 w-3 text-green-600" />;
      case 'down':
        return <TrendingUp className="h-3 w-3 text-red-600 transform rotate-180" />;
      default:
        return <Hash className="h-3 w-3 text-gray-600" />;
    }
  };

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case 'up':
        return 'text-green-600';
      case 'down':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => (
            <Card key={i}>
              <CardContent className="p-4">
                <div className="animate-pulse">
                  <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
                  <div className="h-8 bg-muted rounded w-1/2"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">{t("admin.searchAnalytics")}</h2>

      {/* Search Statistics */}
      {searchStats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{t("admin.searchVolume")}</p>
                  <p className="text-2xl font-bold">{searchStats.total_searches.toLocaleString()}</p>
                </div>
                <Search className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">የተለያዩ ቁልፍ ቃላት</p>
                  <p className="text-2xl font-bold">{searchStats.unique_keywords}</p>
                </div>
                <Hash className="h-8 w-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">አማካይ ፍለጋ</p>
                  <p className="text-2xl font-bold">{searchStats.avg_searches_per_keyword}</p>
                </div>
                <BarChart3 className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">ምርጥ ቀን</p>
                  <p className="text-lg font-bold">{searchStats.top_search_day}</p>
                </div>
                <TrendingUp className="h-8 w-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Top Search Keywords */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            {t("admin.topSearchKeywords")}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {searchKeywords.map((keyword, index) => {
              const maxCount = Math.max(...searchKeywords.map(k => k.search_count));
              const width = (keyword.search_count / maxCount) * 100;
              
              return (
                <div key={keyword.keyword} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Badge variant="outline">#{index + 1}</Badge>
                      <div>
                        <span className="font-medium">{keyword.keyword}</span>
                        {keyword.category && (
                          <span className="ml-2 text-xs text-muted-foreground">
                            ({keyword.category})
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-1">
                        {getTrendIcon(keyword.trend)}
                        <span className={`text-sm ${getTrendColor(keyword.trend)}`}>
                          {keyword.search_count} {t("admin.searchCount")}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="w-full bg-muted h-2 rounded-full">
                    <div 
                      className="h-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full transition-all duration-500"
                      style={{ width: `${width}%` }}
                    />
                  </div>
                </div>
              );
            })}
            {searchKeywords.length === 0 && (
              <p className="text-center py-8 text-muted-foreground">{t("admin.noSearchData")}</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Search Trends by Category */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            የፍለጋ ዝንባሌ በዘርፍ
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Array.from(new Set(searchKeywords.map(k => k.category)))
              .filter(Boolean)
              .map(category => {
                const categoryKeywords = searchKeywords.filter(k => k.category === category);
                const totalSearches = categoryKeywords.reduce((sum, k) => sum + k.search_count, 0);
                const maxCategoryTotal = Math.max(
                  ...Array.from(new Set(searchKeywords.map(k => k.category)))
                    .filter(Boolean)
                    .map(cat => searchKeywords
                      .filter(k => k.category === cat)
                      .reduce((sum, k) => sum + k.search_count, 0)
                    )
                );
                const width = (totalSearches / maxCategoryTotal) * 100;

                return (
                  <div key={category} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-medium">{category}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-muted-foreground">
                          {categoryKeywords.length} {t("admin.keyword")}
                        </span>
                        <Badge variant="secondary">{totalSearches} {t("admin.searchCount")}</Badge>
                      </div>
                    </div>
                    <div className="w-full bg-muted h-3 rounded-full">
                      <div 
                        className="h-3 bg-gradient-to-r from-green-500 to-blue-500 rounded-full transition-all duration-500"
                        style={{ width: `${width}%` }}
                      />
                    </div>
                  </div>
                );
              })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}