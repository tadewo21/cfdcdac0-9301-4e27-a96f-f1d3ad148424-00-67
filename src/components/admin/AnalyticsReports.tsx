import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { 
  TrendingUp, 
  TrendingDown, 
  Users, 
  Briefcase, 
  Calendar,
  BarChart3,
  PieChart,
  Target
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useLanguage } from "@/contexts/LanguageContext";

interface AnalyticsData {
  growthStats: {
    jobsGrowth: number;
    employersGrowth: number;
    weeklyJobs: number;
    monthlyJobs: number;
  };
  popularCategories: Array<{
    category: string;
    count: number;
    percentage: number;
  }>;
  timeSeriesData: Array<{
    date: string;
    jobs: number;
    employers: number;
  }>;
  topPerformers: Array<{
    employer: string;
    jobCount: number;
    activeJobs: number;
  }>;
}

export function AnalyticsReports() {
  const { t } = useLanguage();
  const [analytics, setAnalytics] = useState<AnalyticsData>({
    growthStats: { jobsGrowth: 0, employersGrowth: 0, weeklyJobs: 0, monthlyJobs: 0 },
    popularCategories: [],
    timeSeriesData: [],
    topPerformers: []
  });
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState("30d");

  useEffect(() => {
    fetchAnalytics();
  }, [timeRange]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      
      const now = new Date();
      const daysAgo = timeRange === "7d" ? 7 : timeRange === "30d" ? 30 : 90;
      const startDate = new Date();
      startDate.setDate(now.getDate() - daysAgo);
      
      // Previous period for growth calculation
      const previousStartDate = new Date();
      previousStartDate.setDate(startDate.getDate() - daysAgo);

      // Fetch jobs data
      const { data: jobsData } = await supabase
        .from("jobs")
        .select("*, employers(company_name)")
        .gte("created_at", previousStartDate.toISOString())
        .order("created_at", { ascending: true });

      // Fetch employers data
      const { data: employersData } = await supabase
        .from("employers")
        .select("*")
        .gte("created_at", previousStartDate.toISOString())
        .order("created_at", { ascending: true });

      if (jobsData && employersData) {
        // Calculate growth stats
        const currentPeriodJobs = jobsData.filter(job => new Date(job.created_at) >= startDate);
        const previousPeriodJobs = jobsData.filter(job => 
          new Date(job.created_at) >= previousStartDate && 
          new Date(job.created_at) < startDate
        );
        
        const currentPeriodEmployers = employersData.filter(emp => new Date(emp.created_at) >= startDate);
        const previousPeriodEmployers = employersData.filter(emp => 
          new Date(emp.created_at) >= previousStartDate && 
          new Date(emp.created_at) < startDate
        );

        const jobsGrowth = previousPeriodJobs.length > 0 
          ? ((currentPeriodJobs.length - previousPeriodJobs.length) / previousPeriodJobs.length) * 100
          : 100;
          
        const employersGrowth = previousPeriodEmployers.length > 0
          ? ((currentPeriodEmployers.length - previousPeriodEmployers.length) / previousPeriodEmployers.length) * 100
          : 100;

        // Weekly and monthly stats
        const weekAgo = new Date();
        weekAgo.setDate(now.getDate() - 7);
        const monthAgo = new Date();
        monthAgo.setDate(now.getDate() - 30);

        const weeklyJobs = jobsData.filter(job => new Date(job.created_at) >= weekAgo).length;
        const monthlyJobs = jobsData.filter(job => new Date(job.created_at) >= monthAgo).length;

        // Popular categories
        const categoryCount: Record<string, number> = {};
        currentPeriodJobs.forEach(job => {
          categoryCount[job.category] = (categoryCount[job.category] || 0) + 1;
        });

        const totalJobs = currentPeriodJobs.length;
        const popularCategories = Object.entries(categoryCount)
          .map(([category, count]) => ({
            category,
            count,
            percentage: Math.round((count / Math.max(totalJobs, 1)) * 100)
          }))
          .sort((a, b) => b.count - a.count)
          .slice(0, 8);

        // Time series data (last 7 days)
        const timeSeriesData = [];
        for (let i = 6; i >= 0; i--) {
          const date = new Date();
          date.setDate(now.getDate() - i);
          const dateStr = date.toLocaleDateString();
          
          const dayStart = new Date(date);
          dayStart.setHours(0, 0, 0, 0);
          const dayEnd = new Date(date);
          dayEnd.setHours(23, 59, 59, 999);

          const jobsCount = jobsData.filter(job => {
            const jobDate = new Date(job.created_at);
            return jobDate >= dayStart && jobDate <= dayEnd;
          }).length;

          const employersCount = employersData.filter(emp => {
            const empDate = new Date(emp.created_at);
            return empDate >= dayStart && empDate <= dayEnd;
          }).length;

          timeSeriesData.push({
            date: dateStr,
            jobs: jobsCount,
            employers: employersCount
          });
        }

        // Top performing employers
        const employerStats: Record<string, { jobCount: number; activeJobs: number }> = {};
        currentPeriodJobs.forEach(job => {
          const employer = job.employers?.company_name || "Unknown";
          if (!employerStats[employer]) {
            employerStats[employer] = { jobCount: 0, activeJobs: 0 };
          }
          employerStats[employer].jobCount++;
          if (job.status === "active") {
            employerStats[employer].activeJobs++;
          }
        });

        const topPerformers = Object.entries(employerStats)
          .map(([employer, stats]) => ({ employer, ...stats }))
          .sort((a, b) => b.jobCount - a.jobCount)
          .slice(0, 10);

        setAnalytics({
          growthStats: {
            jobsGrowth: Math.round(jobsGrowth),
            employersGrowth: Math.round(employersGrowth),
            weeklyJobs,
            monthlyJobs
          },
          popularCategories,
          timeSeriesData,
          topPerformers
        });
      }
    } catch (error) {
      console.error("Error fetching analytics:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="text-center py-8">{t("common.loading")}</div>;
  }

  return (
    <div className="space-y-6">
      {/* Time Range Filter */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">{t("admin.analyticsAndReports")}</h2>
        <Select value={timeRange} onValueChange={setTimeRange}>
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7d">{t("admin.last7Days")}</SelectItem>
            <SelectItem value="30d">{t("admin.last30Days")}</SelectItem>
            <SelectItem value="90d">{t("admin.last3Months")}</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Unique Analytics Grid Layout */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="relative overflow-hidden bg-gradient-to-br from-emerald-50 via-emerald-100 to-emerald-50 border-emerald-200 dark:from-emerald-950 dark:via-emerald-900 dark:to-emerald-950">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <p className="text-sm font-medium text-emerald-700 dark:text-emerald-300">{t("admin.jobsGrowth")}</p>
                <p className="text-3xl font-bold text-emerald-900 dark:text-emerald-100">{analytics.growthStats.jobsGrowth}%</p>
              </div>
              <div className="relative">
                {analytics.growthStats.jobsGrowth >= 0 ? (
                  <TrendingUp className="h-12 w-12 text-emerald-600 dark:text-emerald-400" />
                ) : (
                  <TrendingDown className="h-12 w-12 text-red-500" />
                )}
                <div className="absolute -top-1 -right-1 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center text-white text-xs font-bold">1</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden bg-gradient-to-br from-blue-50 via-blue-100 to-blue-50 border-blue-200 dark:from-blue-950 dark:via-blue-900 dark:to-blue-950">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <p className="text-sm font-medium text-blue-700 dark:text-blue-300">{t("admin.employersGrowth")}</p>
                <p className="text-3xl font-bold text-blue-900 dark:text-blue-100">{analytics.growthStats.employersGrowth}%</p>
              </div>
              <div className="relative">
                {analytics.growthStats.employersGrowth >= 0 ? (
                  <TrendingUp className="h-12 w-12 text-blue-600 dark:text-blue-400" />
                ) : (
                  <TrendingDown className="h-12 w-12 text-red-500" />
                )}
                <div className="absolute -top-1 -right-1 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center text-white text-xs font-bold">2</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden bg-gradient-to-br from-purple-50 via-purple-100 to-purple-50 border-purple-200 dark:from-purple-950 dark:via-purple-900 dark:to-purple-950">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <p className="text-sm font-medium text-purple-700 dark:text-purple-300">{t("admin.weeklyJobs")}</p>
                <p className="text-3xl font-bold text-purple-900 dark:text-purple-100">{analytics.growthStats.weeklyJobs}</p>
              </div>
              <div className="relative">
                <Calendar className="h-12 w-12 text-purple-600 dark:text-purple-400" />
                <div className="absolute -top-1 -right-1 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center text-white text-xs font-bold">3</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden bg-gradient-to-br from-orange-50 via-orange-100 to-orange-50 border-orange-200 dark:from-orange-950 dark:via-orange-900 dark:to-orange-950">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <p className="text-sm font-medium text-orange-700 dark:text-orange-300">{t("admin.monthlyJobs")}</p>
                <p className="text-3xl font-bold text-orange-900 dark:text-orange-100">{analytics.growthStats.monthlyJobs}</p>
              </div>
              <div className="relative">
                <BarChart3 className="h-12 w-12 text-orange-600 dark:text-orange-400" />
                <div className="absolute -top-1 -right-1 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center text-white text-xs font-bold">4</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Popular Categories */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PieChart className="h-5 w-5" />
              {t("admin.popularCategories")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {analytics.popularCategories.map((category, index) => (
                <div key={category.category} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">#{index + 1}</Badge>
                      <span className="font-medium">{category.category}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-muted-foreground">{category.count} {t("admin.jobs")}</span>
                      <Badge>{category.percentage}%</Badge>
                    </div>
                  </div>
                  <div className="w-full bg-muted h-2 rounded-full">
                    <div 
                      className="h-2 bg-primary rounded-full"
                      style={{ width: `${category.percentage}%` }}
                    />
                  </div>
                </div>
              ))}
              {analytics.popularCategories.length === 0 && (
                <p className="text-muted-foreground text-center py-4">{t("admin.noDataAvailable")}</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Daily Activity */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              {t("admin.recentActivity")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {analytics.timeSeriesData.map((day, index) => (
                <div key={day.date} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                  <div>
                    <p className="font-medium">{day.date}</p>
                  </div>
                  <div className="flex items-center gap-4 text-sm">
                    <div className="flex items-center gap-1">
                      <Briefcase className="h-4 w-4 text-primary" />
                      <span>{day.jobs} {t("admin.jobs")}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Users className="h-4 w-4 text-blue-600" />
                      <span>{day.employers} {t("admin.employers")}</span>
                    </div>
                  </div>
                </div>
              ))}
              {analytics.timeSeriesData.length === 0 && (
                <p className="text-muted-foreground text-center py-4">{t("admin.noActivity")}</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Top Performers */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            {t("admin.topPerformers")}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {analytics.topPerformers.map((performer, index) => (
              <div key={performer.employer} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  <Badge variant="outline">#{index + 1}</Badge>
                  <div>
                    <p className="font-medium">{performer.employer}</p>
                    <p className="text-sm text-muted-foreground">
                      {performer.jobCount} {t("admin.totalJobs")} • {performer.activeJobs} {t("admin.activeJobs")}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <Badge variant="secondary">
                    {Math.round((performer.activeJobs / Math.max(performer.jobCount, 1)) * 100)}% {t("admin.active")}
                  </Badge>
                </div>
              </div>
            ))}
            {analytics.topPerformers.length === 0 && (
              <p className="text-muted-foreground text-center py-4">{t("admin.noDataAvailable")}</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}