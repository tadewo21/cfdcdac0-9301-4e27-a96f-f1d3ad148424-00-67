import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Briefcase, 
  Building, 
  Users, 
  TrendingUp, 
  Eye, 
  Calendar,
  AlertTriangle,
  CheckCircle,
  Clock,
  X,
  Ban,
  Shield,
  BarChart3,
  Activity
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useLanguage } from "@/contexts/LanguageContext";

// Simple Sparkline Component
const Sparkline = ({ data, color = "#3b82f6" }: { data: number[], color?: string }) => {
  if (!data || data.length === 0) return null;
  
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  
  const points = data.map((value, index) => {
    const x = (index / (data.length - 1)) * 60;
    const y = 20 - ((value - min) / range) * 20;
    return `${x},${y}`;
  }).join(' ');
  
  return (
    <svg width="60" height="20" className="ml-2">
      <polyline
        fill="none"
        stroke={color}
        strokeWidth="1.5"
        points={points}
        className="opacity-80"
      />
    </svg>
  );
};

interface DashboardStats {
  totalJobs: number;
  activeJobs: number;
  pendingJobs: number;
  totalEmployers: number;
  totalJobSeekers: number;
  todaysJobs: number;
  todaysUsers: number;
  thisWeekJobs: number;
  thisWeekUsers: number;
  thisMonthJobs: number;
  thisMonthUsers: number;
  pendingFeaturedRequests: number;
  popularCategories: { category: string; count: number }[];
  weeklyJobsData: number[];
  weeklyUsersData: number[];
  dailyViewRateData: number[];
  recentActivity: Array<{
    id: string;
    type: 'job_posted' | 'employer_registered' | 'user_registered' | 'job_approved' | 'job_rejected' | 'user_suspended' | 'company_verified';
    title: string;
    description: string;
    user: string;
    time: string;
    status?: string;
  }>;
}

export function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    totalJobs: 0,
    activeJobs: 0,
    pendingJobs: 0,
    totalEmployers: 0,
    totalJobSeekers: 0,
    todaysJobs: 0,
    todaysUsers: 0,
    thisWeekJobs: 0,
    thisWeekUsers: 0,
    thisMonthJobs: 0,
    thisMonthUsers: 0,
    pendingFeaturedRequests: 0,
    popularCategories: [],
    weeklyJobsData: [],
    weeklyUsersData: [],
    dailyViewRateData: [],
    recentActivity: []
  });
  const [loading, setLoading] = useState(true);
  const { t } = useLanguage();

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      setLoading(true);
      
      // Get date ranges
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const weekAgo = new Date(today);
      weekAgo.setDate(today.getDate() - 7);
      const monthAgo = new Date(today);
      monthAgo.setMonth(today.getMonth() - 1);

      // Fetch jobs data
      const { data: jobsData } = await supabase
        .from("jobs")
        .select("*, employers(company_name, email)")
        .order("created_at", { ascending: false });

      // Fetch employers data
      const { data: employersData } = await supabase
        .from("employers")
        .select("*")
        .order("created_at", { ascending: false });

      // Fetch users data
      const { data: usersData } = await supabase
        .from("profiles")
        .select("*")
        .order("created_at", { ascending: false });

      // Fetch featured job requests
      const { data: featuredRequests } = await supabase
        .from("featured_job_requests")
        .select("*")
        .eq("status", "pending");

      if (jobsData && employersData && usersData) {
        const activeJobs = jobsData.filter(job => job.status === "active").length;
        const pendingJobs = jobsData.filter(job => job.status === "pending").length;
        
        // Time-based filtering
        const todaysJobs = jobsData.filter(job => 
          new Date(job.created_at) >= today
        ).length;
        const thisWeekJobs = jobsData.filter(job => 
          new Date(job.created_at) >= weekAgo
        ).length;
        const thisMonthJobs = jobsData.filter(job => 
          new Date(job.created_at) >= monthAgo
        ).length;

        const todaysUsers = usersData.filter(user => 
          new Date(user.created_at) >= today
        ).length;
        const thisWeekUsers = usersData.filter(user => 
          new Date(user.created_at) >= weekAgo
        ).length;
        const thisMonthUsers = usersData.filter(user => 
          new Date(user.created_at) >= monthAgo
        ).length;

        // Calculate popular categories
        const categoryCount: Record<string, number> = {};
        jobsData.forEach(job => {
          categoryCount[job.category] = (categoryCount[job.category] || 0) + 1;
        });
        const popularCategories = Object.entries(categoryCount)
          .map(([category, count]) => ({ category, count }))
          .sort((a, b) => b.count - a.count)
          .slice(0, 5);

        // Enhanced recent activity with detailed Ethiopian descriptions
        const recentActivity = [
          ...jobsData.slice(0, 4).map(job => ({
            id: job.id,
            type: 'job_posted' as const,
            title: `አዲስ ስራ ተለጥፏል: '${job.title}'`,
            description: `በ '${job.employers?.company_name || 'ያልታወቀ ኩባንያ'}' የተለጠፈ`,
            user: job.employers?.company_name || 'ያልታወቀ',
            time: new Date(job.created_at).toLocaleDateString('am-ET'),
            status: job.status
          })),
          ...employersData.slice(0, 3).map(employer => ({
            id: employer.id,
            type: 'employer_registered' as const,
            title: `አዲስ ኩባንያ ተመዝግቧል: '${employer.company_name}'`,
            description: `የኩባንያ መመዝገቢያ ተጠናቅቋል`,
            user: employer.email || 'ያልታወቀ',
            time: new Date(employer.created_at).toLocaleDateString('am-ET')
          })),
          ...usersData.filter(u => u.user_type === 'job_seeker').slice(0, 3).map(user => ({
            id: user.id,
            type: 'user_registered' as const,
            title: `አዲስ ስራ ፈላጊ ተመዝግቧል: '${user.full_name || 'አዲስ ተጠቃሚ'}'`,
            description: `የስራ ፈላጊ መመዝገቢያ ተጠናቅቋል`,
            user: user.full_name || 'ያልታወቀ',
            time: new Date(user.created_at).toLocaleDateString('am-ET')
          }))
        ].sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime())
         .slice(0, 15);

        // Calculate job seekers specifically
        const totalJobSeekers = usersData.filter(user => user.user_type === 'job_seeker').length;

        // Generate sparkline data for last 7 days
        const weeklyJobsData: number[] = [];
        const weeklyUsersData: number[] = [];
        const dailyViewRateData: number[] = [];
        
        for (let i = 6; i >= 0; i--) {
          const date = new Date(today);
          date.setDate(today.getDate() - i);
          const nextDate = new Date(date);
          nextDate.setDate(date.getDate() + 1);
          
          const dayJobs = jobsData.filter(job => {
            const jobDate = new Date(job.created_at);
            return jobDate >= date && jobDate < nextDate;
          }).length;
          
          const dayUsers = usersData.filter(user => {
            const userDate = new Date(user.created_at);
            return userDate >= date && userDate < nextDate;
          }).length;
          
          const dayActiveJobs = jobsData.filter(job => {
            const jobDate = new Date(job.created_at);
            return jobDate >= date && jobDate < nextDate && job.status === 'active';
          }).length;
          
          const dayViewRate = dayJobs > 0 ? Math.round((dayActiveJobs / dayJobs) * 100) : 0;
          
          weeklyJobsData.push(dayJobs);
          weeklyUsersData.push(dayUsers);
          dailyViewRateData.push(dayViewRate);
        }

        setStats({
          totalJobs: jobsData.length,
          activeJobs,
          pendingJobs,
          totalEmployers: employersData.length,
          totalJobSeekers,
          todaysJobs,
          todaysUsers,
          thisWeekJobs,
          thisWeekUsers,
          thisMonthJobs,
          thisMonthUsers,
          pendingFeaturedRequests: featuredRequests?.length || 0,
          popularCategories,
          weeklyJobsData,
          weeklyUsersData,
          dailyViewRateData,
          recentActivity
        });
      }
    } catch (error) {
      console.error("Error fetching dashboard stats:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {[1, 2, 3, 4, 5].map(i => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-4 bg-muted rounded w-3/4 mb-3"></div>
                <div className="h-8 bg-muted rounded w-1/2"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Pending Items Alert - Top Priority */}
      {(stats.pendingJobs > 0 || stats.pendingFeaturedRequests > 0) && (
        <Card className="border-amber-200 bg-gradient-to-r from-amber-50 to-yellow-50 dark:from-amber-950/20 dark:to-yellow-950/20 shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-amber-100 dark:bg-amber-900/30 rounded-full">
                <AlertTriangle className="h-6 w-6 text-amber-600" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-amber-800 dark:text-amber-200 mb-1">
                  Items Requiring Attention
                </h3>
                <div className="flex flex-wrap gap-6 text-amber-700 dark:text-amber-300">
                  {stats.pendingFeaturedRequests > 0 && (
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-amber-500 rounded-full"></div>
                      <span className="font-medium">{stats.pendingFeaturedRequests} featured request{stats.pendingFeaturedRequests > 1 ? 's' : ''}</span>
                    </div>
                  )}
                  {stats.pendingJobs > 0 && (
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-amber-500 rounded-full"></div>
                      <span className="font-medium">{stats.pendingJobs} pending job{stats.pendingJobs > 1 ? 's' : ''}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Modern Statistics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-6">
        {/* Primary Stats - Larger Cards */}
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950/20 dark:to-blue-900/20 border-blue-200 hover:shadow-lg transition-all duration-300">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-blue-900 dark:text-blue-100">{stats.totalJobs}</p>
                <p className="text-sm font-medium text-blue-700 dark:text-blue-300">{t("admin.totalJobs")}</p>
              </div>
              <div className="p-3 bg-blue-500/20 rounded-full">
                <Briefcase className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-emerald-100 dark:from-green-950/20 dark:to-emerald-900/20 border-green-200 hover:shadow-lg transition-all duration-300">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-green-900 dark:text-green-100">{stats.activeJobs}</p>
                <p className="text-sm font-medium text-green-700 dark:text-green-300">Active Jobs</p>
              </div>
              <div className="p-3 bg-green-500/20 rounded-full">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-amber-50 to-orange-100 dark:from-amber-950/20 dark:to-orange-900/20 border-amber-200 hover:shadow-lg transition-all duration-300">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-amber-900 dark:text-amber-100">{stats.pendingJobs}</p>
                <p className="text-sm font-medium text-amber-700 dark:text-amber-300">Pending Approval</p>
              </div>
              <div className="p-3 bg-amber-500/20 rounded-full">
                <Clock className="h-6 w-6 text-amber-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-violet-100 dark:from-purple-950/20 dark:to-violet-900/20 border-purple-200 hover:shadow-lg transition-all duration-300">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-purple-900 dark:text-purple-100">{stats.totalEmployers}</p>
                <p className="text-sm font-medium text-purple-700 dark:text-purple-300">Employers</p>
              </div>
              <div className="p-3 bg-purple-500/20 rounded-full">
                <Building className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-indigo-50 to-indigo-100 dark:from-indigo-950/20 dark:to-indigo-900/20 border-indigo-200 hover:shadow-lg transition-all duration-300">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-indigo-900 dark:text-indigo-100">{stats.totalJobSeekers}</p>
                <p className="text-sm font-medium text-indigo-700 dark:text-indigo-300">Job Seekers</p>
              </div>
              <div className="p-3 bg-indigo-500/20 rounded-full">
                <Users className="h-6 w-6 text-indigo-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Enhanced Activity Overview with Sparklines - Unified Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Today's Jobs Card - Now matches other cards design */}
        <Card className="bg-gradient-to-br from-slate-50 to-gray-100 dark:from-slate-950/20 dark:to-gray-900/20 border-slate-200 hover:shadow-lg transition-all duration-300">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">{stats.todaysJobs}</p>
                <p className="text-sm font-medium text-slate-700 dark:text-slate-300">Today's Jobs</p>
              </div>
              <div className="p-3 bg-slate-500/20 rounded-full">
                <Calendar className="h-6 w-6 text-slate-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* This Week's Jobs with Sparkline */}
        <Card className="bg-gradient-to-br from-emerald-50 to-teal-100 dark:from-emerald-950/20 dark:to-teal-900/20 border-emerald-200 hover:shadow-lg transition-all duration-300">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-emerald-900 dark:text-emerald-100">{stats.thisWeekJobs}</p>
                <p className="text-sm font-medium text-emerald-700 dark:text-emerald-300">This Week's Jobs</p>
                <div className="flex items-center mt-2">
                  <span className="text-xs text-emerald-600 dark:text-emerald-400">7-day trend</span>
                  <Sparkline data={stats.weeklyJobsData} color="#059669" />
                </div>
              </div>
              <div className="p-3 bg-emerald-500/20 rounded-full">
                <TrendingUp className="h-6 w-6 text-emerald-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Job Approval Rate with Sparkline */}
        <Card className="bg-gradient-to-br from-sky-50 to-cyan-100 dark:from-sky-950/20 dark:to-cyan-900/20 border-sky-200 hover:shadow-lg transition-all duration-300">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-sky-900 dark:text-sky-100">{Math.round((stats.activeJobs / Math.max(stats.totalJobs, 1)) * 100)}%</p>
                <p className="text-sm font-medium text-sky-700 dark:text-sky-300">Job Approval Rate</p>
                <div className="flex items-center mt-2">
                  <span className="text-xs text-sky-600 dark:text-sky-400">Daily rates</span>
                  <Sparkline data={stats.dailyViewRateData} color="#0891b2" />
                </div>
              </div>
              <div className="p-3 bg-sky-500/20 rounded-full">
                <CheckCircle className="h-6 w-6 text-sky-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Weekly Users with Sparkline */}
        <Card className="bg-gradient-to-br from-rose-50 to-pink-100 dark:from-rose-950/20 dark:to-pink-900/20 border-rose-200 hover:shadow-lg transition-all duration-300">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-rose-900 dark:text-rose-100">{stats.thisWeekUsers}</p>
                <p className="text-sm font-medium text-rose-700 dark:text-rose-300">Weekly Users</p>
                <div className="flex items-center mt-2">
                  <span className="text-xs text-rose-600 dark:text-rose-400">7-day trend</span>
                  <Sparkline data={stats.weeklyUsersData} color="#e11d48" />
                </div>
              </div>
              <div className="p-3 bg-rose-500/20 rounded-full">
                <Users className="h-6 w-6 text-rose-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Bottom Section - Popular Categories & Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Popular Categories with Horizontal Bars */}
        <Card className="shadow-lg">
          <CardHeader className="bg-gradient-to-r from-violet-50 to-purple-50 dark:from-violet-950/30 dark:to-purple-950/30">
            <CardTitle className="flex items-center gap-3">
              <div className="p-2 bg-violet-100 dark:bg-violet-900/30 rounded-lg">
                <BarChart3 className="h-5 w-5 text-violet-600" />
              </div>
              Popular Categories
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-4">
              {stats.popularCategories.map((category, index) => {
                const maxCount = Math.max(...stats.popularCategories.map(c => c.count));
                const percentage = maxCount > 0 ? (category.count / maxCount) * 100 : 0;
                
                return (
                  <div key={category.category} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Badge variant="outline" className="bg-violet-100 text-violet-700 border-violet-300 text-xs">#{index + 1}</Badge>
                        <span className="font-medium text-sm">{category.category}</span>
                      </div>
                      <Badge className="bg-violet-600 hover:bg-violet-700 text-xs">{category.count}</Badge>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div 
                        className="bg-gradient-to-r from-violet-500 to-purple-600 h-2 rounded-full transition-all duration-500 ease-out"
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })}
              {stats.popularCategories.length === 0 && (
                <p className="text-center py-8 text-muted-foreground">
                  No data available
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card className="shadow-lg">
          <CardHeader className="bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-950/30 dark:to-teal-950/30">
            <CardTitle className="flex items-center gap-3">
              <div className="p-2 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg">
                <Clock className="h-5 w-5 text-emerald-600" />
              </div>
              Recent Activity
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {stats.recentActivity.slice(0, 6).map((activity, index) => {
                const getActivityIcon = () => {
                  switch (activity.type) {
                    case 'job_posted': return <Briefcase className="h-4 w-4 text-primary" />;
                    case 'employer_registered': return <Building className="h-4 w-4 text-blue-600" />;
                    case 'user_registered': return <Users className="h-4 w-4 text-green-600" />;
                    case 'job_approved': return <CheckCircle className="h-4 w-4 text-green-600" />;
                    case 'job_rejected': return <X className="h-4 w-4 text-red-600" />;
                    case 'user_suspended': return <Ban className="h-4 w-4 text-red-600" />;
                    case 'company_verified': return <Shield className="h-4 w-4 text-blue-600" />;
                    default: return <Eye className="h-4 w-4 text-muted-foreground" />;
                  }
                };

                const getActivityColor = () => {
                  switch (activity.type) {
                    case 'job_approved': 
                    case 'company_verified': 
                    case 'user_registered': return 'bg-green-50 dark:bg-green-950/20 border-green-200';
                    case 'job_rejected': 
                    case 'user_suspended': return 'bg-red-50 dark:bg-red-950/20 border-red-200';
                    case 'job_posted': return 'bg-blue-50 dark:bg-blue-950/20 border-blue-200';
                    default: return 'bg-slate-50 dark:bg-slate-800/50';
                  }
                };

                return (
                  <div key={activity.id || index} className={`flex items-start gap-3 p-4 rounded-lg border ${getActivityColor()}`}>
                    <div className="mt-0.5">
                      {getActivityIcon()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{activity.title}</p>
                      <p className="text-xs text-muted-foreground mt-1">{activity.description}</p>
                      <p className="text-xs text-muted-foreground mt-1">{activity.time}</p>
                    </div>
                  </div>
                );
              })}
              {stats.recentActivity.length === 0 && (
                <p className="text-center py-8 text-muted-foreground">
                  No recent activity
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}