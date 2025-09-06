import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Activity,
  Clock,
  Users,
  Briefcase,
  ShieldCheck,
  Shield,
  UserX,
  UserCheck,
  TrendingUp,
  Calendar,
  MapPin,
  Eye
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface UserActivity {
  id: string;
  user_id: string;
  user_name: string;
  user_type: string;
  action: string;
  description: string;
  timestamp: string;
  ip_address?: string;
  user_agent?: string;
}

interface UserStats {
  total_users: number;
  new_users_today: number;
  active_users_week: number;
  suspended_users: number;
  verified_companies: number;
  total_jobs_posted: number;
  average_session_time: number;
  top_locations: Array<{ location: string; count: number }>;
}

export function UserActivityDashboard() {
  const [activities, setActivities] = useState<UserActivity[]>([]);
  const [stats, setStats] = useState<UserStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeFilter, setTimeFilter] = useState("today");
  const { toast } = useToast();

  useEffect(() => {
    fetchUserActivities();
    fetchUserStats();
  }, [timeFilter]);

  const fetchUserActivities = async () => {
    try {
      // Get recent notifications as activity logs
      const { data: notificationsData } = await supabase
        .from("notifications")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(50);

      if (notificationsData) {
        // Get user profiles for the notifications
        const userIds = [...new Set(notificationsData.map(n => n.user_id))];
        const { data: profilesData } = await supabase
          .from("profiles")
          .select("user_id, full_name, user_type")
          .in("user_id", userIds);

        const profilesMap = new Map(profilesData?.map(p => [p.user_id, p]) || []);

        const activities: UserActivity[] = notificationsData.map(notification => {
          const profile = profilesMap.get(notification.user_id);
          return {
            id: notification.id,
            user_id: notification.user_id,
            user_name: profile?.full_name || 'Unknown User',
            user_type: profile?.user_type || 'unknown',
            action: notification.title,
            description: notification.message,
            timestamp: notification.created_at,
          };
        });

        setActivities(activities);
      }
    } catch (error: any) {
      console.error("Error fetching activities:", error);
    }
  };

  const fetchUserStats = async () => {
    try {
      setLoading(true);

      // Get basic user stats
      const { data: profiles } = await supabase
        .from("profiles")
        .select("created_at, user_type, location, is_suspended");

      const { data: employers } = await supabase
        .from("employers")
        .select("is_verified");

      const { data: jobs } = await supabase
        .from("jobs")
        .select("created_at");

      if (profiles) {
        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

        const stats: UserStats = {
          total_users: profiles.length,
          new_users_today: profiles.filter(p => new Date(p.created_at) >= today).length,
          active_users_week: profiles.filter(p => new Date(p.created_at) >= weekAgo).length,
          suspended_users: profiles.filter(p => p.is_suspended).length,
          verified_companies: employers?.filter(e => e.is_verified).length || 0,
          total_jobs_posted: jobs?.length || 0,
          average_session_time: 0, // Would need session tracking
          top_locations: getTopLocations(profiles.filter(p => p.location).map(p => p.location))
        };

        setStats(stats);
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getTopLocations = (locations: string[]): Array<{ location: string; count: number }> => {
    const locationCounts = locations.reduce((acc, location) => {
      acc[location] = (acc[location] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(locationCounts)
      .map(([location, count]) => ({ location, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
  };

  const getActivityIcon = (action: string) => {
    if (action.includes('suspended') || action.includes('Suspended')) return <UserX className="h-4 w-4 text-red-500" />;
    if (action.includes('verified') || action.includes('Verified')) return <ShieldCheck className="h-4 w-4 text-blue-500" />;
    if (action.includes('job') || action.includes('Job')) return <Briefcase className="h-4 w-4 text-green-500" />;
    if (action.includes('login') || action.includes('Login')) return <Users className="h-4 w-4 text-blue-500" />;
    return <Activity className="h-4 w-4 text-gray-500" />;
  };

  const getUserTypeBadgeVariant = (userType: string) => {
    switch (userType) {
      case 'admin': return 'destructive';
      case 'employer': return 'default';
      case 'job_seeker': return 'secondary';
      default: return 'outline';
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
      {/* Unique Activity Grid Layout */}
      {stats && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="relative overflow-hidden bg-gradient-to-br from-cyan-50 via-cyan-100 to-cyan-50 border-cyan-200 dark:from-cyan-950 dark:via-cyan-900 dark:to-cyan-950">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <p className="text-3xl font-bold text-cyan-900 dark:text-cyan-100">{stats.total_users}</p>
                  <p className="text-sm font-medium text-cyan-700 dark:text-cyan-300">Total Users</p>
                </div>
                <div className="relative">
                  <Users className="h-12 w-12 text-cyan-600 dark:text-cyan-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="relative overflow-hidden bg-gradient-to-br from-lime-50 via-lime-100 to-lime-50 border-lime-200 dark:from-lime-950 dark:via-lime-900 dark:to-lime-950">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <p className="text-3xl font-bold text-lime-900 dark:text-lime-100">{stats.new_users_today}</p>
                  <p className="text-sm font-medium text-lime-700 dark:text-lime-300">New Today</p>
                </div>
                <div className="relative">
                  <TrendingUp className="h-12 w-12 text-lime-600 dark:text-lime-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="relative overflow-hidden bg-gradient-to-br from-violet-50 via-violet-100 to-violet-50 border-violet-200 dark:from-violet-950 dark:via-violet-900 dark:to-violet-950">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <p className="text-3xl font-bold text-violet-900 dark:text-violet-100">{stats.verified_companies}</p>
                  <p className="text-sm font-medium text-violet-700 dark:text-violet-300">Verified Companies</p>
                </div>
                <div className="relative">
                  <ShieldCheck className="h-12 w-12 text-violet-600 dark:text-violet-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="relative overflow-hidden bg-gradient-to-br from-amber-50 via-amber-100 to-amber-50 border-amber-200 dark:from-amber-950 dark:via-amber-900 dark:to-amber-950">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <p className="text-3xl font-bold text-amber-900 dark:text-amber-100">{stats.total_jobs_posted}</p>
                  <p className="text-sm font-medium text-amber-700 dark:text-amber-300">Jobs Posted</p>
                </div>
                <div className="relative">
                  <Briefcase className="h-12 w-12 text-amber-600 dark:text-amber-400" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <Tabs defaultValue="activity" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="activity">Recent Activity</TabsTrigger>
          <TabsTrigger value="analytics">User Analytics</TabsTrigger>
          <TabsTrigger value="locations">Top Locations</TabsTrigger>
        </TabsList>

        <TabsContent value="activity" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Recent User Activities
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {activities.map((activity) => (
                  <div key={activity.id} className="flex items-start gap-3 p-3 border rounded-lg">
                    <div className="mt-1">
                      {getActivityIcon(activity.action)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-sm">{activity.user_name}</span>
                        <Badge variant={getUserTypeBadgeVariant(activity.user_type)} className="text-xs">
                          {activity.user_type.replace('_', ' ')}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-1">{activity.action}</p>
                      <p className="text-xs text-muted-foreground">{activity.description}</p>
                      <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        {new Date(activity.timestamp).toLocaleString()}
                      </div>
                    </div>
                  </div>
                ))}

                {activities.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    No recent activities found.
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>User Growth</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span>This Week</span>
                    <Badge variant="secondary">{stats?.active_users_week} new users</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Suspended Users</span>
                    <Badge variant="destructive">{stats?.suspended_users}</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Verified Companies</span>
                    <Badge variant="default">{stats?.verified_companies}</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Platform Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span>Total Jobs Posted</span>
                    <Badge variant="secondary">{stats?.total_jobs_posted}</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Active Sessions</span>
                    <Badge variant="outline">-</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Avg. Session Time</span>
                    <Badge variant="outline">-</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="locations" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Top User Locations
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {stats?.top_locations.map((location, index) => (
                  <div key={location.location} className="flex justify-between items-center p-2 border rounded">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">#{index + 1}</Badge>
                      <span>{location.location}</span>
                    </div>
                    <Badge variant="secondary">{location.count} users</Badge>
                  </div>
                )) || (
                  <div className="text-center py-8 text-muted-foreground">
                    No location data available.
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}