import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Eye,
  Users,
  TrendingUp,
  MapPin,
  Briefcase
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useLanguage } from "@/contexts/LanguageContext";

interface MostViewedJob {
  id: string;
  title: string;
  company_name: string;
  category: string;
  location: string;
  views_count: number;
  applications_count: number;
}

interface CategoryStats {
  category: string;
  job_count: number;
  views_count: number;
  applications_count: number;
}

interface LocationStats {
  location: string;
  job_count: number;
  popularity: number;
}

export function JobAnalytics() {
  const { t } = useLanguage();
  const [mostViewedJobs, setMostViewedJobs] = useState<MostViewedJob[]>([]);
  const [mostAppliedJobs, setMostAppliedJobs] = useState<MostViewedJob[]>([]);
  const [categoryStats, setCategoryStats] = useState<CategoryStats[]>([]);
  const [locationStats, setLocationStats] = useState<LocationStats[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchJobAnalytics();
  }, []);

  const fetchJobAnalytics = async () => {
    try {
      setLoading(true);

      // Fetch jobs with employer info and calculate views/applications
      // Note: In a real implementation, you'd have views and applications tracking
      const { data: jobsData } = await supabase
        .from("jobs")
        .select(`
          id,
          title,
          category,
          city,
          created_at,
          status,
          employers!inner(company_name)
        `)
        .eq("status", "active")
        .order("created_at", { ascending: false })
        .limit(100);

      if (jobsData) {
        // Simulate analytics data (in production, you'd have actual tracking)
        const jobsWithStats = jobsData.map(job => ({
          id: job.id,
          title: job.title,
          company_name: job.employers.company_name,
          category: job.category,
          location: job.city,
          views_count: Math.floor(Math.random() * 500) + 50, // Simulated
          applications_count: Math.floor(Math.random() * 50) + 5, // Simulated
        }));

        // Most viewed jobs
        const sortedByViews = [...jobsWithStats].sort((a, b) => b.views_count - a.views_count);
        setMostViewedJobs(sortedByViews.slice(0, 10));

        // Most applied jobs
        const sortedByApplications = [...jobsWithStats].sort((a, b) => b.applications_count - a.applications_count);
        setMostAppliedJobs(sortedByApplications.slice(0, 10));

        // Category statistics
        const categoryMap = new Map<string, CategoryStats>();
        jobsWithStats.forEach(job => {
          if (categoryMap.has(job.category)) {
            const existing = categoryMap.get(job.category)!;
            categoryMap.set(job.category, {
              ...existing,
              job_count: existing.job_count + 1,
              views_count: existing.views_count + job.views_count,
              applications_count: existing.applications_count + job.applications_count,
            });
          } else {
            categoryMap.set(job.category, {
              category: job.category,
              job_count: 1,
              views_count: job.views_count,
              applications_count: job.applications_count,
            });
          }
        });

        const categoryStatsArray = Array.from(categoryMap.values())
          .sort((a, b) => b.views_count - a.views_count);
        setCategoryStats(categoryStatsArray);

        // Location statistics
        const locationMap = new Map<string, LocationStats>();
        jobsWithStats.forEach(job => {
          if (locationMap.has(job.location)) {
            const existing = locationMap.get(job.location)!;
            locationMap.set(job.location, {
              ...existing,
              job_count: existing.job_count + 1,
              popularity: existing.popularity + job.views_count,
            });
          } else {
            locationMap.set(job.location, {
              location: job.location,
              job_count: 1,
              popularity: job.views_count,
            });
          }
        });

        const locationStatsArray = Array.from(locationMap.values())
          .sort((a, b) => b.popularity - a.popularity);
        setLocationStats(locationStatsArray.slice(0, 8));
      }
    } catch (error) {
      console.error("Error fetching job analytics:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {[1, 2, 3, 4].map(i => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="animate-pulse">
                  <div className="h-4 bg-muted rounded w-3/4 mb-4"></div>
                  <div className="space-y-3">
                    <div className="h-3 bg-muted rounded w-full"></div>
                    <div className="h-3 bg-muted rounded w-5/6"></div>
                    <div className="h-3 bg-muted rounded w-4/6"></div>
                  </div>
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
      <h2 className="text-2xl font-bold">{t("admin.jobAnalytics")}</h2>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Most Viewed Jobs */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Eye className="h-5 w-5" />
              {t("admin.mostViewed")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {mostViewedJobs.map((job, index) => (
                <div key={job.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <Badge variant="outline">#{index + 1}</Badge>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">{job.title}</p>
                      <p className="text-xs text-muted-foreground">{job.company_name}</p>
                      <p className="text-xs text-muted-foreground">{job.category} • {job.location}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center gap-1 text-sm">
                      <Eye className="h-4 w-4" />
                      <span className="font-medium">{job.views_count}</span>
                    </div>
                    <p className="text-xs text-muted-foreground">{t("admin.views")}</p>
                  </div>
                </div>
              ))}
              {mostViewedJobs.length === 0 && (
                <p className="text-center py-4 text-muted-foreground">{t("admin.noDataAvailable")}</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Most Applied Jobs */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              {t("admin.mostApplied")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {mostAppliedJobs.map((job, index) => (
                <div key={job.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <Badge variant="outline">#{index + 1}</Badge>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">{job.title}</p>
                      <p className="text-xs text-muted-foreground">{job.company_name}</p>
                      <p className="text-xs text-muted-foreground">{job.category} • {job.location}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center gap-1 text-sm">
                      <Users className="h-4 w-4" />
                      <span className="font-medium">{job.applications_count}</span>
                    </div>
                    <p className="text-xs text-muted-foreground">{t("admin.applications")}</p>
                  </div>
                </div>
              ))}
              {mostAppliedJobs.length === 0 && (
                <p className="text-center py-4 text-muted-foreground">{t("admin.noDataAvailable")}</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Popular Categories */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Briefcase className="h-5 w-5" />
              {t("admin.popularCategories")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {categoryStats.map((category, index) => (
                <div key={category.category} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">#{index + 1}</Badge>
                      <span className="font-medium">{category.category}</span>
                    </div>
                    <div className="flex items-center gap-4 text-sm">
                      <div className="flex items-center gap-1">
                        <Briefcase className="h-3 w-3" />
                        <span>{category.job_count}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Eye className="h-3 w-3" />
                        <span>{category.views_count}</span>
                      </div>
                    </div>
                  </div>
                  <div className="w-full bg-muted h-2 rounded-full">
                    <div 
                      className="h-2 bg-primary rounded-full"
                      style={{ 
                        width: `${Math.min((category.views_count / Math.max(...categoryStats.map(c => c.views_count))) * 100, 100)}%` 
                      }}
                    />
                  </div>
                </div>
              ))}
              {categoryStats.length === 0 && (
                <p className="text-center py-4 text-muted-foreground">{t("admin.noDataAvailable")}</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Popular Locations */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              {t("admin.popularLocations")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {locationStats.map((location, index) => (
                <div key={location.location} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <Badge variant="outline">#{index + 1}</Badge>
                    <div>
                      <p className="font-medium">{location.location}</p>
                      <p className="text-xs text-muted-foreground">{location.job_count} {t("admin.jobs")}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center gap-1">
                      <TrendingUp className="h-4 w-4 text-green-600" />
                      <Badge variant="secondary">{location.popularity}</Badge>
                    </div>
                  </div>
                </div>
              ))}
              {locationStats.length === 0 && (
                <p className="text-center py-4 text-muted-foreground">{t("admin.noDataAvailable")}</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}