import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { 
  Activity, 
  Database, 
  Server, 
  Wifi, 
  AlertTriangle, 
  CheckCircle, 
  RefreshCw,
  Clock,
  HardDrive,
  Users,
  Briefcase,
  Mail
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface HealthCheck {
  name: string;
  status: 'healthy' | 'warning' | 'error' | 'checking';
  message: string;
  lastChecked: Date;
  responseTime?: number;
  details?: string;
}

export function SystemHealthMonitor() {
  const [healthChecks, setHealthChecks] = useState<HealthCheck[]>([]);
  const [isChecking, setIsChecking] = useState(false);
  const [lastFullCheck, setLastFullCheck] = useState<Date | null>(null);
  const { toast } = useToast();

  const healthTests = [
    {
      name: "Database Connection",
      icon: Database,
      test: async () => {
        const start = Date.now();
        const { error } = await supabase.from('profiles').select('id').limit(1);
        const responseTime = Date.now() - start;
        
        if (error) {
          return {
            status: 'error' as const,
            message: 'Database connection failed',
            details: error.message,
            responseTime
          };
        }
        
        return {
          status: 'healthy' as const,
          message: `Database connected (${responseTime}ms)`,
          responseTime
        };
      }
    },
    {
      name: "Jobs Table Health",
      icon: Briefcase,
      test: async () => {
        const start = Date.now();
        const { data, error } = await supabase
          .from('jobs')
          .select('id, status')
          .limit(100);
        const responseTime = Date.now() - start;

        if (error) {
          return {
            status: 'error' as const,
            message: 'Jobs table error',
            details: error.message,
            responseTime
          };
        }

        const activeJobs = data?.filter(job => job.status === 'active').length || 0;
        const totalJobs = data?.length || 0;

        return {
          status: 'healthy' as const,
          message: `${activeJobs}/${totalJobs} active jobs (${responseTime}ms)`,
          responseTime
        };
      }
    },
    {
      name: "User Profiles",
      icon: Users,
      test: async () => {
        const start = Date.now();
        const { data, error } = await supabase
          .from('profiles')
          .select('id, user_type')
          .limit(100);
        const responseTime = Date.now() - start;

        if (error) {
          return {
            status: 'error' as const,
            message: 'Profiles table error',
            details: error.message,
            responseTime
          };
        }

        const employers = data?.filter(p => p.user_type === 'employer').length || 0;
        const jobSeekers = data?.filter(p => p.user_type === 'job_seeker').length || 0;

        return {
          status: 'healthy' as const,
          message: `${employers} employers, ${jobSeekers} job seekers (${responseTime}ms)`,
          responseTime
        };
      }
    },
    {
      name: "Authentication Service",
      icon: Server,
      test: async () => {
        const start = Date.now();
        const { data, error } = await supabase.auth.getSession();
        const responseTime = Date.now() - start;

        if (error) {
          return {
            status: 'warning' as const,
            message: 'Auth service issues',
            details: error.message,
            responseTime
          };
        }

        return {
          status: 'healthy' as const,
          message: `Authentication service running (${responseTime}ms)`,
          responseTime
        };
      }
    },
    {
      name: "RLS Policies",
      icon: CheckCircle,
      test: async () => {
        const start = Date.now();
        
        // Test if RLS policies are working by trying to access data
        const { error: jobsError } = await supabase
          .from('jobs')
          .select('id')
          .limit(1);
          
        const { error: profilesError } = await supabase
          .from('profiles')
          .select('id')
          .limit(1);
          
        const responseTime = Date.now() - start;

        if (jobsError || profilesError) {
          return {
            status: 'warning' as const,
            message: 'RLS policy issues detected',
            details: jobsError?.message || profilesError?.message,
            responseTime
          };
        }

        return {
          status: 'healthy' as const,
          message: `RLS policies working (${responseTime}ms)`,
          responseTime
        };
      }
    },
    {
      name: "Storage Health",
      icon: HardDrive,
      test: async () => {
        const start = Date.now();
        
        // Test storage bucket access
        const { data, error } = await supabase.storage
          .from('company-logos')
          .list('', { limit: 1 });
          
        const responseTime = Date.now() - start;

        if (error) {
          return {
            status: 'warning' as const,
            message: 'Storage access limited',
            details: error.message,
            responseTime
          };
        }

        return {
          status: 'healthy' as const,
          message: `Storage accessible (${responseTime}ms)`,
          responseTime
        };
      }
    }
  ];

  const runHealthChecks = async () => {
    setIsChecking(true);
    const results: HealthCheck[] = [];

    for (const test of healthTests) {
      // Set checking status
      const checkingResult: HealthCheck = {
        name: test.name,
        status: 'checking',
        message: 'Running health check...',
        lastChecked: new Date()
      };
      
      setHealthChecks(prev => [
        ...prev.filter(h => h.name !== test.name),
        checkingResult
      ]);

      try {
        const result = await test.test();
        const healthCheck: HealthCheck = {
          name: test.name,
          status: result.status,
          message: result.message,
          details: result.details,
          responseTime: result.responseTime,
          lastChecked: new Date()
        };
        
        results.push(healthCheck);
        
        // Update individual result immediately
        setHealthChecks(prev => [
          ...prev.filter(h => h.name !== test.name),
          healthCheck
        ]);
        
      } catch (error: any) {
        const errorCheck: HealthCheck = {
          name: test.name,
          status: 'error',
          message: 'Health check failed',
          details: error.message,
          lastChecked: new Date()
        };
        
        results.push(errorCheck);
        
        setHealthChecks(prev => [
          ...prev.filter(h => h.name !== test.name),
          errorCheck
        ]);
      }
    }

    setIsChecking(false);
    setLastFullCheck(new Date());
    
    // Show toast with overall health status
    const errorCount = results.filter(r => r.status === 'error').length;
    const warningCount = results.filter(r => r.status === 'warning').length;
    
    if (errorCount > 0) {
      toast({
        title: "Health Check Complete",
        description: `${errorCount} errors, ${warningCount} warnings detected`,
        variant: "destructive"
      });
    } else if (warningCount > 0) {
      toast({
        title: "Health Check Complete", 
        description: `System healthy with ${warningCount} warnings`,
      });
    } else {
      toast({
        title: "Health Check Complete",
        description: "All systems healthy",
      });
    }
  };

  useEffect(() => {
    runHealthChecks();
  }, []);

  const getStatusColor = (status: HealthCheck['status']) => {
    switch (status) {
      case 'healthy': return 'text-green-600 bg-green-100 dark:bg-green-900/20';
      case 'warning': return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/20';
      case 'error': return 'text-red-600 bg-red-100 dark:bg-red-900/20';
      case 'checking': return 'text-blue-600 bg-blue-100 dark:bg-blue-900/20';
      default: return 'text-gray-600 bg-gray-100 dark:bg-gray-900/20';
    }
  };

  const getStatusIcon = (status: HealthCheck['status']) => {
    switch (status) {
      case 'healthy': return <CheckCircle className="h-4 w-4" />;
      case 'warning': return <AlertTriangle className="h-4 w-4" />;
      case 'error': return <AlertTriangle className="h-4 w-4" />;
      case 'checking': return <RefreshCw className="h-4 w-4 animate-spin" />;
    }
  };

  const overallHealth = healthChecks.length > 0 ? 
    healthChecks.every(h => h.status === 'healthy') ? 'healthy' :
    healthChecks.some(h => h.status === 'error') ? 'error' : 'warning'
    : 'checking';

  const healthyCount = healthChecks.filter(h => h.status === 'healthy').length;
  const totalChecks = healthChecks.length;
  const healthPercentage = totalChecks > 0 ? Math.round((healthyCount / totalChecks) * 100) : 0;

  return (
    <div className="space-y-6">
      {/* Overall Health Status */}
      <Card className="border-l-4 border-l-primary">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              System Health Monitor
            </div>
            <Button 
              onClick={runHealthChecks} 
              disabled={isChecking}
              size="sm"
              variant="outline"
            >
              {isChecking ? (
                <RefreshCw className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <RefreshCw className="h-4 w-4 mr-2" />
              )}
              Check Now
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Badge className={getStatusColor(overallHealth)}>
                  {getStatusIcon(overallHealth)}
                  <span className="ml-1 font-medium">
                    {overallHealth === 'healthy' ? 'All Systems Healthy' :
                     overallHealth === 'error' ? 'System Issues Detected' :
                     overallHealth === 'warning' ? 'System Warnings' : 'Checking...'}
                  </span>
                </Badge>
                <span className="text-sm text-muted-foreground">
                  {healthyCount}/{totalChecks} checks passed
                </span>
              </div>
              {lastFullCheck && (
                <span className="text-xs text-muted-foreground flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  Last checked: {lastFullCheck.toLocaleTimeString()}
                </span>
              )}
            </div>
            
            <Progress value={healthPercentage} className="h-2" />
          </div>
        </CardContent>
      </Card>

      {/* Individual Health Checks */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {healthTests.map((test) => {
          const Icon = test.icon;
          const healthCheck = healthChecks.find(h => h.name === test.name);
          
          return (
            <Card key={test.name} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Icon className="h-5 w-5 text-muted-foreground" />
                    <h3 className="font-medium text-sm">{test.name}</h3>
                  </div>
                  {healthCheck && (
                    <Badge className={getStatusColor(healthCheck.status)}>
                      {getStatusIcon(healthCheck.status)}
                    </Badge>
                  )}
                </div>
                
                {healthCheck && (
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">
                      {healthCheck.message}
                    </p>
                    
                    {healthCheck.responseTime && (
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        Response: {healthCheck.responseTime}ms
                      </div>
                    )}
                    
                    {healthCheck.details && healthCheck.status !== 'healthy' && (
                      <details className="text-xs">
                        <summary className="cursor-pointer text-muted-foreground hover:text-foreground">
                          Error Details
                        </summary>
                        <pre className="mt-1 p-2 bg-muted rounded text-xs overflow-x-auto">
                          {healthCheck.details}
                        </pre>
                      </details>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* System Recommendations */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">የሲስተም ጥቆማዎች (System Recommendations)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {healthChecks.some(h => h.status === 'error') && (
              <div className="flex items-start gap-3 p-3 bg-red-50 dark:bg-red-900/10 rounded-lg">
                <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5" />
                <div>
                  <p className="font-medium text-red-800 dark:text-red-200">Critical Issues Detected</p>
                  <p className="text-sm text-red-700 dark:text-red-300">
                    Please review and fix the error conditions above to ensure proper system functionality.
                  </p>
                </div>
              </div>
            )}
            
            {healthChecks.some(h => h.status === 'warning') && (
              <div className="flex items-start gap-3 p-3 bg-yellow-50 dark:bg-yellow-900/10 rounded-lg">
                <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5" />
                <div>
                  <p className="font-medium text-yellow-800 dark:text-yellow-200">Performance Warnings</p>
                  <p className="text-sm text-yellow-700 dark:text-yellow-300">
                    Some systems are experiencing issues that may affect performance.
                  </p>
                </div>
              </div>
            )}
            
            {overallHealth === 'healthy' && (
              <div className="flex items-start gap-3 p-3 bg-green-50 dark:bg-green-900/10 rounded-lg">
                <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                <div>
                  <p className="font-medium text-green-800 dark:text-green-200">All Systems Operational</p>
                  <p className="text-sm text-green-700 dark:text-green-300">
                    Your job board platform is running smoothly. Regular monitoring recommended.
                  </p>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}