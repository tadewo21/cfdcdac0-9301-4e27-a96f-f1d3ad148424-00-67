import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  BarChart3, Users, Search, Eye, TrendingUp, MapPin, Briefcase, Hash
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

export function AdminAnalyticsDashboard() {
  const [loading, setLoading] = useState(true);
  const [analytics, setAnalytics] = useState({
    mostViewed: [],
    mostApplied: [],
    popularCategories: [],
    userGrowth: [],
    topKeywords: []
  });

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      const { data: jobsData } = await supabase
        .from("jobs")
        .select("*, employers(company_name)")
        .limit(50);
      
      if (jobsData) {
        // Simulate analytics data
        const mostViewed = jobsData.slice(0, 10).map((job, index) => ({
          title: job.title,
          company: job.employers?.company_name || 'N/A',
          views: Math.floor(Math.random() * 500) + 50,
          category: job.category
        }));

        const categories = jobsData.reduce((acc, job) => {
          acc[job.category] = (acc[job.category] || 0) + 1;
          return acc;
        }, {});

        const popularCategories = Object.entries(categories)
          .map(([category, count]) => ({ category, count: Number(count) }))
          .sort((a, b) => b.count - a.count);

        const topKeywords = [
          { keyword: "Software Developer", count: 245 },
          { keyword: "Accountant", count: 189 },
          { keyword: "Teacher", count: 167 },
          { keyword: "Nurse", count: 156 },
          { keyword: "Driver", count: 123 }
        ];

        setAnalytics({
          mostViewed,
          mostApplied: mostViewed,
          popularCategories,
          userGrowth: [],
          topKeywords
        });
      }
    } catch (error) {
      console.error("Analytics fetch error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Admin Panel ትንታኔ (Analytics & Reports)</h1>
      
      <Tabs defaultValue="jobs" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="jobs">የስራ ትንታኔ (Job Analytics)</TabsTrigger>
          <TabsTrigger value="users">የተጠቃሚ እድገት (User Growth)</TabsTrigger>
          <TabsTrigger value="search">የፍለጋ ትንታኔ (Search Analytics)</TabsTrigger>
        </TabsList>

        <TabsContent value="jobs" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Eye className="h-5 w-5" />
                  በጣም የታዩ ስራዎች (Most Viewed Jobs)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {analytics.mostViewed.slice(0, 5).map((job, index) => (
                    <div key={index} className="flex justify-between items-center p-2 border rounded">
                      <div>
                        <p className="font-medium text-sm">{job.title}</p>
                        <p className="text-xs text-muted-foreground">{job.company}</p>
                      </div>
                      <Badge>{job.views} views</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Briefcase className="h-5 w-5" />
                  ተወዳዳጅ የስራ ዘርፎች (Popular Categories)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {analytics.popularCategories.slice(0, 5).map((cat, index) => (
                    <div key={index} className="flex justify-between items-center">
                      <span>{cat.category}</span>
                      <Badge variant="secondary">{cat.count} jobs</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="users" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <Users className="h-8 w-8 text-blue-600" />
                  <div>
                    <p className="text-2xl font-bold">1,234</p>
                    <p className="text-sm text-muted-foreground">ጠቅላላ ተጠቃሚዎች</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-8 w-8 text-green-600" />
                  <div>
                    <p className="text-2xl font-bold">+45</p>
                    <p className="text-sm text-muted-foreground">የሳምንቱ አዳዲስ</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <Users className="h-8 w-8 text-purple-600" />
                  <div>
                    <p className="text-2xl font-bold">567</p>
                    <p className="text-sm text-muted-foreground">የወሩ አዳዲስ</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="search" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Search className="h-5 w-5" />
                በብዛት የሚፈለጉ ቁልፍ ቃላት (Top Search Keywords)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {analytics.topKeywords.map((keyword, index) => (
                  <div key={index} className="flex justify-between items-center p-2 border rounded">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">#{index + 1}</Badge>
                      <span>{keyword.keyword}</span>
                    </div>
                    <Badge>{keyword.count} searches</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}