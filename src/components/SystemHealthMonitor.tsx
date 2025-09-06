import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Progress } from './ui/progress';
import { 
  Activity, 
  Database, 
  Server, 
  Wifi, 
  AlertTriangle, 
  CheckCircle, 
  RefreshCw,
  TrendingUp,
  Clock
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from '@/contexts/LanguageContext';

interface HealthMetrics {
  database: {
    status: 'healthy' | 'warning' | 'error';
    responseTime: number;
    connectionCount?: number;
  };
  api: {
    status: 'healthy' | 'warning' | 'error';
    responseTime: number;
    uptime: number;
  };
  storage: {
    status: 'healthy' | 'warning' | 'error';
    usedSpace: number;
    totalSpace: number;
  };
  memory: {
    used: number;
    total: number;
    status: 'healthy' | 'warning' | 'error';
  };
}

interface HealthCheck {
  id: string;
  timestamp: string;
  metrics: HealthMetrics;
  overall_status: 'healthy' | 'warning' | 'error';
}

export const SystemHealthMonitor: React.FC = () => {
  const [currentHealth, setCurrentHealth] = useState<HealthMetrics | null>(null);
  const [healthHistory, setHealthHistory] = useState<HealthCheck[]>([]);
  const [isChecking, setIsChecking] = useState(false);
  const [lastCheck, setLastCheck] = useState<Date | null>(null);
  const { toast } = useToast();
  const { t } = useLanguage();

  const runHealthCheck = async (): Promise<HealthMetrics> => {
    const metrics: HealthMetrics = {
      database: { status: 'healthy', responseTime: 0 },
      api: { status: 'healthy', responseTime: 0, uptime: 0 },
      storage: { status: 'healthy', usedSpace: 0, totalSpace: 100 },
      memory: { used: 0, total: 100, status: 'healthy' }
    };

    try {
      // Database health check
      const dbStart = Date.now();
      const { error: dbError } = await supabase
        .from('jobs')
        .select('id')
        .limit(1);
      
      metrics.database.responseTime = Date.now() - dbStart;
      metrics.database.status = dbError ? 'error' : 
        metrics.database.responseTime > 1000 ? 'warning' : 'healthy';

      // API health check
      const apiStart = Date.now();
      try {
        const response = await fetch(window.location.origin + '/health', {
          method: 'GET',
          cache: 'no-cache'
        });
        metrics.api.responseTime = Date.now() - apiStart;
        metrics.api.status = response.ok ? 
          (metrics.api.responseTime > 2000 ? 'warning' : 'healthy') : 'error';
      } catch {
        metrics.api.responseTime = Date.now() - apiStart;
        metrics.api.status = 'warning';
      }

      // Simulated storage and memory metrics (in real app, get from server)
      metrics.storage.usedSpace = Math.random() * 80;
      metrics.storage.status = metrics.storage.usedSpace > 85 ? 'error' : 
        metrics.storage.usedSpace > 70 ? 'warning' : 'healthy';

      metrics.memory.used = Math.random() * 90;
      metrics.memory.status = metrics.memory.used > 90 ? 'error' :
        metrics.memory.used > 75 ? 'warning' : 'healthy';

    } catch (error) {
      console.error('Health check error:', error);
    }

    return metrics;
  };

  const performHealthCheck = async () => {
    setIsChecking(true);
    try {
      const metrics = await runHealthCheck();
      setCurrentHealth(metrics);
      setLastCheck(new Date());

      // Store health check result
      const overallStatus = Object.values(metrics).some(m => m.status === 'error') ? 'error' :
        Object.values(metrics).some(m => m.status === 'warning') ? 'warning' : 'healthy';

      const healthCheck: HealthCheck = {
        id: Date.now().toString(),
        timestamp: new Date().toISOString(),
        metrics,
        overall_status: overallStatus
      };

      setHealthHistory(prev => [healthCheck, ...prev.slice(0, 9)]);

      // Save to local storage for persistence
      localStorage.setItem('healthHistory', JSON.stringify([healthCheck, ...healthHistory.slice(0, 9)]));

      if (overallStatus === 'error') {
        toast({
          title: 'System Health Alert',
          description: 'Critical issues detected in system health',
          variant: 'destructive'
        });
      }

    } catch (error: any) {
      toast({
        title: 'Health Check Failed',
        description: 'Unable to complete system health check',
        variant: 'destructive'
      });
    } finally {
      setIsChecking(false);
    }
  };

  useEffect(() => {
    // Load health history from local storage
    const savedHistory = localStorage.getItem('healthHistory');
    if (savedHistory) {
      try {
        setHealthHistory(JSON.parse(savedHistory));
      } catch {
        // Invalid JSON, ignore
      }
    }

    // Perform initial health check
    performHealthCheck();

    // Set up automatic health checks every 5 minutes
    const interval = setInterval(performHealthCheck, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const getStatusColor = (status: 'healthy' | 'warning' | 'error') => {
    switch (status) {
      case 'healthy': return 'text-green-600 bg-green-50 border-green-200';
      case 'warning': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'error': return 'text-red-600 bg-red-50 border-red-200';
    }
  };

  const getStatusIcon = (status: 'healthy' | 'warning' | 'error') => {
    switch (status) {
      case 'healthy': return <CheckCircle className="w-4 h-4" />;
      case 'warning': return <AlertTriangle className="w-4 h-4" />;
      case 'error': return <AlertTriangle className="w-4 h-4" />;
    }
  };

  if (!currentHealth) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
          <p className="text-muted-foreground">{t("maintenance.runningHealthCheck")}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Health Overview */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">{t("maintenance.systemHealthMonitor")}</h3>
        <div className="flex items-center gap-2">
          {lastCheck && (
            <span className="text-sm text-muted-foreground">
              <Clock className="w-4 h-4 inline mr-1" />
              {lastCheck.toLocaleTimeString()}
            </span>
          )}
          <Button 
            onClick={performHealthCheck} 
            disabled={isChecking}
            size="sm"
            variant="outline"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${isChecking ? 'animate-spin' : ''}`} />
            {isChecking ? t("maintenance.checking") : t("maintenance.refresh")}
          </Button>
        </div>
      </div>

      {/* Health Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Database Health */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-3">
              <Database className="w-5 h-5 text-muted-foreground" />
              <Badge className={getStatusColor(currentHealth.database.status)}>
                {getStatusIcon(currentHealth.database.status)}
                <span className="ml-1">{currentHealth.database.status}</span>
              </Badge>
            </div>
            <h4 className="font-medium mb-1">{t("maintenance.database")}</h4>
            <p className="text-sm text-muted-foreground">
              {t("maintenance.response")}: {currentHealth.database.responseTime}ms
            </p>
          </CardContent>
        </Card>

        {/* API Health */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-3">
              <Server className="w-5 h-5 text-muted-foreground" />
              <Badge className={getStatusColor(currentHealth.api.status)}>
                {getStatusIcon(currentHealth.api.status)}
                <span className="ml-1">{currentHealth.api.status}</span>
              </Badge>
            </div>
            <h4 className="font-medium mb-1">{t("maintenance.api")}</h4>
            <p className="text-sm text-muted-foreground">
              {t("maintenance.response")}: {currentHealth.api.responseTime}ms
            </p>
          </CardContent>
        </Card>

        {/* Storage Health */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-3">
              <Activity className="w-5 h-5 text-muted-foreground" />
              <Badge className={getStatusColor(currentHealth.storage.status)}>
                {getStatusIcon(currentHealth.storage.status)}
                <span className="ml-1">{currentHealth.storage.status}</span>
              </Badge>
            </div>
            <h4 className="font-medium mb-1">{t("maintenance.storage")}</h4>
            <div className="space-y-1">
              <Progress value={currentHealth.storage.usedSpace} className="h-2" />
              <p className="text-xs text-muted-foreground">
                {currentHealth.storage.usedSpace.toFixed(1)}% {t("maintenance.used")}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Memory Health */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-3">
              <TrendingUp className="w-5 h-5 text-muted-foreground" />
              <Badge className={getStatusColor(currentHealth.memory.status)}>
                {getStatusIcon(currentHealth.memory.status)}
                <span className="ml-1">{currentHealth.memory.status}</span>
              </Badge>
            </div>
            <h4 className="font-medium mb-1">{t("maintenance.memory")}</h4>
            <div className="space-y-1">
              <Progress value={currentHealth.memory.used} className="h-2" />
              <p className="text-xs text-muted-foreground">
                {currentHealth.memory.used.toFixed(1)}% {t("maintenance.used")}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Health History */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">{t("maintenance.recentHealthChecks")}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {healthHistory.length === 0 ? (
              <p className="text-center text-muted-foreground py-4">{t("maintenance.noHealthHistory")}</p>
            ) : (
              healthHistory.map((check) => (
                <div key={check.id} className="flex items-center justify-between p-2 border rounded">
                  <div className="flex items-center gap-3">
                    <Badge className={getStatusColor(check.overall_status)}>
                      {getStatusIcon(check.overall_status)}
                    </Badge>
                    <span className="text-sm">
                      {new Date(check.timestamp).toLocaleString()}
                    </span>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    DB: {check.metrics.database.responseTime}ms | 
                    API: {check.metrics.api.responseTime}ms
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};