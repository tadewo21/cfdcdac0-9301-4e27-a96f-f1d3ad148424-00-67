import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Users,
  TrendingUp,
  TrendingDown,
  Calendar,
  UserPlus,
  Building
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useLanguage } from "@/contexts/LanguageContext";

interface DailyStats {
  date: string;
  new_users: number;
  new_employers: number;
  total_users: number;
}

interface GrowthMetrics {
  total_users: number;
  users_growth_rate: number;
  monthly_new_users: number;
  weekly_new_users: number;
  daily_new_users: number;
  total_employers: number;
  employers_growth_rate: number;
}

export function UserGrowthAnalytics() {
  const { t } = useLanguage();
  const [dailyStats, setDailyStats] = useState<DailyStats[]>([]);
  const [growthMetrics, setGrowthMetrics] = useState<GrowthMetrics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUserGrowthAnalytics();
  }, []);

  const fetchUserGrowthAnalytics = async () => {
    try {
      setLoading(true);

      // Fetch user profiles
      const { data: profilesData } = await supabase
        .from("profiles")
        .select("created_at, user_type")
        .order("created_at", { ascending: true });

      // Fetch employers
      const { data: employersData } = await supabase
        .from("employers")
        .select("created_at")
        .order("created_at", { ascending: true });

      if (profilesData && employersData) {
        // Calculate daily stats for the last 30 days
        const now = new Date();
        const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        
        const dailyStatsMap = new Map<string, DailyStats>();
        
        // Initialize with zeros for the last 30 days
        for (let i = 29; i >= 0; i--) {
          const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
          const dateStr = date.toLocaleDateString();
          dailyStatsMap.set(dateStr, {
            date: dateStr,
            new_users: 0,
            new_employers: 0,
            total_users: 0,
          });
        }

        // Count new users by day
        profilesData.forEach(profile => {
          const profileDate = new Date(profile.created_at);
          if (profileDate >= thirtyDaysAgo) {
            const dateStr = profileDate.toLocaleDateString();
            const existing = dailyStatsMap.get(dateStr);
            if (existing) {
              existing.new_users++;
            }
          }
        });

        // Count new employers by day
        employersData.forEach(employer => {
          const employerDate = new Date(employer.created_at);
          if (employerDate >= thirtyDaysAgo) {
            const dateStr = employerDate.toLocaleDateString();
            const existing = dailyStatsMap.get(dateStr);
            if (existing) {
              existing.new_employers++;
            }
          }
        });

        // Calculate running totals
        let runningTotal = profilesData.filter(p => new Date(p.created_at) < thirtyDaysAgo).length;
        const dailyStatsArray = Array.from(dailyStatsMap.values()).map(day => {
          runningTotal += day.new_users;
          return {
            ...day,
            total_users: runningTotal,
          };
        });

        setDailyStats(dailyStatsArray);

        // Calculate growth metrics
        const totalUsers = profilesData.length;
        const totalEmployers = employersData.length;
        
        const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        const oneMonthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        const twoMonthsAgo = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);
        
        const weeklyNewUsers = profilesData.filter(p => new Date(p.created_at) >= oneWeekAgo).length;
        const monthlyNewUsers = profilesData.filter(p => new Date(p.created_at) >= oneMonthAgo).length;
        const dailyNewUsers = profilesData.filter(p => {
          const pDate = new Date(p.created_at);
          const today = new Date();
          return pDate.toDateString() === today.toDateString();
        }).length;

        // Calculate growth rates
        const usersLastMonth = profilesData.filter(p => 
          new Date(p.created_at) >= twoMonthsAgo && new Date(p.created_at) < oneMonthAgo
        ).length;
        const usersGrowthRate = usersLastMonth > 0 
          ? ((monthlyNewUsers - usersLastMonth) / usersLastMonth) * 100 
          : monthlyNewUsers > 0 ? 100 : 0;

        const employersLastMonth = employersData.filter(e => 
          new Date(e.created_at) >= twoMonthsAgo && new Date(e.created_at) < oneMonthAgo
        ).length;
        const employersThisMonth = employersData.filter(e => new Date(e.created_at) >= oneMonthAgo).length;
        const employersGrowthRate = employersLastMonth > 0 
          ? ((employersThisMonth - employersLastMonth) / employersLastMonth) * 100 
          : employersThisMonth > 0 ? 100 : 0;

        setGrowthMetrics({
          total_users: totalUsers,
          users_growth_rate: Math.round(usersGrowthRate),
          monthly_new_users: monthlyNewUsers,
          weekly_new_users: weeklyNewUsers,
          daily_new_users: dailyNewUsers,
          total_employers: totalEmployers,
          employers_growth_rate: Math.round(employersGrowthRate),
        });
      }
    } catch (error) {
      console.error("Error fetching user growth analytics:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[1, 2, 3].map(i => (
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
      <h2 className="text-2xl font-bold">{t("admin.userGrowthAnalytics")}</h2>

      {/* Growth Metrics Grid */}
      {growthMetrics && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {/* Total Users - Large Card */}
          <Card className="sm:col-span-2 lg:col-span-1 bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200 dark:from-blue-950 dark:to-blue-900 dark:border-blue-800">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <p className="text-sm font-medium text-blue-700 dark:text-blue-300">Total Users</p>
                  <p className="text-3xl font-bold text-blue-900 dark:text-blue-100">{growthMetrics.total_users}</p>
                  <p className="text-xs text-blue-600 dark:text-blue-400">Registered Users</p>
                </div>
                <div className="p-3 bg-blue-100 dark:bg-blue-800 rounded-full">
                  <Users className="h-8 w-8 text-blue-600 dark:text-blue-300" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Monthly New Users */}
          <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200 dark:from-green-950 dark:to-green-900 dark:border-green-800">
            <CardContent className="p-6">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-green-700 dark:text-green-300">Monthly New</p>
                  <div className="p-2 bg-green-100 dark:bg-green-800 rounded-lg">
                    <UserPlus className="h-5 w-5 text-green-600 dark:text-green-300" />
                  </div>
                </div>
                <p className="text-2xl font-bold text-green-900 dark:text-green-100">{growthMetrics.monthly_new_users}</p>
                <div className="flex items-center gap-2">
                  {growthMetrics.users_growth_rate >= 0 ? (
                    <TrendingUp className="h-4 w-4 text-green-600" />
                  ) : (
                    <TrendingDown className="h-4 w-4 text-red-600" />
                  )}
                  <span className={`text-sm font-semibold ${
                    growthMetrics.users_growth_rate >= 0 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {Math.abs(growthMetrics.users_growth_rate)}% growth
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Weekly New Users */}
          <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200 dark:from-purple-950 dark:to-purple-900 dark:border-purple-800">
            <CardContent className="p-6">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-purple-700 dark:text-purple-300">Weekly New</p>
                  <div className="p-2 bg-purple-100 dark:bg-purple-800 rounded-lg">
                    <Calendar className="h-5 w-5 text-purple-600 dark:text-purple-300" />
                  </div>
                </div>
                <p className="text-2xl font-bold text-purple-900 dark:text-purple-100">{growthMetrics.weekly_new_users}</p>
                <p className="text-xs text-purple-600 dark:text-purple-400">This Week</p>
              </div>
            </CardContent>
          </Card>

          {/* Daily New Users */}
          <Card className="bg-gradient-to-br from-amber-50 to-amber-100 border-amber-200 dark:from-amber-950 dark:to-amber-900 dark:border-amber-800">
            <CardContent className="p-6">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-amber-700 dark:text-amber-300">Today</p>
                  <div className="p-2 bg-amber-100 dark:bg-amber-800 rounded-lg">
                    <UserPlus className="h-5 w-5 text-amber-600 dark:text-amber-300" />
                  </div>
                </div>
                <p className="text-2xl font-bold text-amber-900 dark:text-amber-100">{growthMetrics.daily_new_users}</p>
                <p className="text-xs text-amber-600 dark:text-amber-400">New Today</p>
              </div>
            </CardContent>
          </Card>

          {/* Total Employers - Spans 2 columns on larger screens */}
          <Card className="lg:col-span-2 bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200 dark:from-orange-950 dark:to-orange-900 dark:border-orange-800">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="space-y-3">
                  <p className="text-sm font-medium text-orange-700 dark:text-orange-300">Total Employers</p>
                  <p className="text-3xl font-bold text-orange-900 dark:text-orange-100">{growthMetrics.total_employers}</p>
                  <div className="flex items-center gap-2">
                    {growthMetrics.employers_growth_rate >= 0 ? (
                      <TrendingUp className="h-4 w-4 text-green-600" />
                    ) : (
                      <TrendingDown className="h-4 w-4 text-red-600" />
                    )}
                    <span className={`text-sm font-semibold ${
                      growthMetrics.employers_growth_rate >= 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {Math.abs(growthMetrics.employers_growth_rate)}% monthly growth
                    </span>
                  </div>
                </div>
                <div className="p-4 bg-orange-100 dark:bg-orange-800 rounded-full">
                  <Building className="h-10 w-10 text-orange-600 dark:text-orange-300" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Additional Stats Card */}
          <Card className="lg:col-span-1 bg-gradient-to-br from-indigo-50 to-indigo-100 border-indigo-200 dark:from-indigo-950 dark:to-indigo-900 dark:border-indigo-800">
            <CardContent className="p-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-indigo-700 dark:text-indigo-300">Growth Rate</p>
                  <div className="p-2 bg-indigo-100 dark:bg-indigo-800 rounded-lg">
                    <TrendingUp className="h-5 w-5 text-indigo-600 dark:text-indigo-300" />
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-indigo-600 dark:text-indigo-400">Users</span>
                    <span className="text-sm font-bold text-indigo-900 dark:text-indigo-100">
                      {growthMetrics.users_growth_rate >= 0 ? '+' : ''}{growthMetrics.users_growth_rate}%
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-indigo-600 dark:text-indigo-400">Employers</span>
                    <span className="text-sm font-bold text-indigo-900 dark:text-indigo-100">
                      {growthMetrics.employers_growth_rate >= 0 ? '+' : ''}{growthMetrics.employers_growth_rate}%
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* User Registration Growth Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            {t("admin.userRegistrations")} - {t("admin.last30Days")}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {dailyStats.slice(-14).map((day, index) => { // Show last 14 days
              const maxUsers = Math.max(...dailyStats.map(d => d.new_users));
              const width = maxUsers > 0 ? (day.new_users / maxUsers) * 100 : 0;
              
              return (
                <div key={day.date} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">{day.date}</span>
                    <div className="flex items-center gap-4 text-sm">
                      <div className="flex items-center gap-1">
                        <Users className="h-4 w-4 text-blue-600" />
                        <span>{day.new_users} {t("admin.userRegistrations")}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Building className="h-4 w-4 text-orange-600" />
                        <span>{day.new_employers} {t("admin.employers")}</span>
                      </div>
                      <Badge variant="outline">{day.total_users} Total</Badge>
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
            {dailyStats.length === 0 && (
              <p className="text-center py-8 text-muted-foreground">{t("admin.noDataAvailable")}</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}