import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Badge } from './ui/badge';
import { Switch } from './ui/switch';
import { Label } from './ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { 
  Settings, 
  Clock, 
  Shield, 
  AlertTriangle, 
  CheckCircle, 
  Calendar,
  Database,
  Activity,
  Bell,
  History
} from 'lucide-react';
import { useMaintenanceMode } from '@/contexts/MaintenanceContext';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useLanguage } from '@/contexts/LanguageContext';

interface MaintenanceLog {
  id: string;
  action: 'enabled' | 'disabled' | 'scheduled' | 'emergency';
  user_email: string;
  message: string;
  timestamp: string;
}

interface SystemHealth {
  database: 'healthy' | 'warning' | 'error';
  api: 'healthy' | 'warning' | 'error';
  lastCheck: string;
}

export const MaintenanceControls: React.FC = () => {
  const { 
    isMaintenanceMode, 
    setMaintenanceMode, 
    maintenanceMessage, 
    setMaintenanceMessage 
  } = useMaintenanceMode();
  const { t } = useLanguage();
  
  const [scheduledMaintenance, setScheduledMaintenance] = useState<Date | null>(null);
  const [customMessage, setCustomMessage] = useState(maintenanceMessage);
  const [notifyUsers, setNotifyUsers] = useState(false);
  const [logs, setLogs] = useState<MaintenanceLog[]>([]);
  const [systemHealth, setSystemHealth] = useState<SystemHealth>({
    database: 'healthy',
    api: 'healthy',
    lastCheck: new Date().toISOString()
  });
  const { toast } = useToast();

  useEffect(() => {
    loadMaintenanceLogs();
    checkSystemHealth();
    
    // Check for scheduled maintenance every minute
    const interval = setInterval(checkScheduledMaintenance, 60000);
    return () => clearInterval(interval);
  }, []);

  const loadMaintenanceLogs = async () => {
    // Load from localStorage for now (until database tables are created)
    try {
      const storedLogs = localStorage.getItem('maintenanceLogs');
      if (storedLogs) {
        setLogs(JSON.parse(storedLogs).slice(0, 10));
      }
    } catch (error) {
      // Silent fail for logs
    }
  };

  const logMaintenanceAction = async (action: MaintenanceLog['action'], message: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const newLog: MaintenanceLog = {
        id: Date.now().toString(),
        action,
        user_email: user?.email || 'system',
        message,
        timestamp: new Date().toISOString()
      };
      
      const storedLogs = localStorage.getItem('maintenanceLogs');
      const existingLogs = storedLogs ? JSON.parse(storedLogs) : [];
      const updatedLogs = [newLog, ...existingLogs].slice(0, 50);
      
      localStorage.setItem('maintenanceLogs', JSON.stringify(updatedLogs));
      setLogs(updatedLogs.slice(0, 10));
    } catch (error) {
      // Silent fail for logging
    }
  };

  const checkSystemHealth = async () => {
    const health: SystemHealth = {
      database: 'healthy',
      api: 'healthy',
      lastCheck: new Date().toISOString()
    };

    try {
      // Test database connection
      const { error: dbError } = await supabase.from('jobs').select('id').limit(1);
      if (dbError) health.database = 'error';
    } catch {
      health.database = 'error';
    }

    try {
      // Test API response time by fetching current page
      const start = Date.now();
      await fetch(window.location.origin, { method: 'HEAD', cache: 'no-cache' });
      const responseTime = Date.now() - start;
      if (responseTime > 5000) health.api = 'warning';
    } catch {
      health.api = 'warning';
    }

    setSystemHealth(health);
  };

  const checkScheduledMaintenance = () => {
    if (scheduledMaintenance && new Date() >= scheduledMaintenance && !isMaintenanceMode) {
      handleMaintenanceToggle(true, 'Scheduled maintenance started automatically');
      setScheduledMaintenance(null);
    }
  };

  const handleMaintenanceToggle = async (enabled: boolean, reason?: string) => {
    setMaintenanceMode(enabled);
    
    const message = reason || `Maintenance mode ${enabled ? 'enabled' : 'disabled'} manually`;
    await logMaintenanceAction(enabled ? 'enabled' : 'disabled', message);
    
    toast({
      title: enabled ? 'Maintenance Mode Enabled' : 'Maintenance Mode Disabled',
      description: message,
      variant: enabled ? 'destructive' : 'default'
    });
  };

  const handleEmergencyMaintenance = async () => {
    await handleMaintenanceToggle(true, 'EMERGENCY: Maintenance enabled due to critical issue');
    await logMaintenanceAction('emergency', 'Emergency maintenance activated');
  };

  const handleScheduleMaintenance = () => {
    if (scheduledMaintenance) {
      logMaintenanceAction('scheduled', `Maintenance scheduled for ${scheduledMaintenance.toLocaleString()}`);
      toast({
        title: 'Maintenance Scheduled',
        description: `Automatic maintenance will start at ${scheduledMaintenance.toLocaleString()}`,
      });
    }
  };

  const updateMaintenanceMessage = () => {
    setMaintenanceMessage(customMessage);
    localStorage.setItem('maintenanceMessage', customMessage);
    toast({
      title: 'Message Updated',
      description: 'Maintenance message has been updated',
    });
  };

  const getHealthIcon = (status: 'healthy' | 'warning' | 'error') => {
    switch (status) {
      case 'healthy': return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'warning': return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
      case 'error': return <AlertTriangle className="w-4 h-4 text-red-500" />;
    }
  };

  const getHealthColor = (status: 'healthy' | 'warning' | 'error') => {
    switch (status) {
      case 'healthy': return 'bg-green-500/10 text-green-700 border-green-200';
      case 'warning': return 'bg-yellow-500/10 text-yellow-700 border-yellow-200';
      case 'error': return 'bg-red-500/10 text-red-700 border-red-200';
    }
  };

  return (
    <div className="space-y-6">
      {/* System Status Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Settings className="w-5 h-5" />
                <span className="font-medium">Maintenance Status</span>
              </div>
              <Badge variant={isMaintenanceMode ? "destructive" : "default"}>
                {isMaintenanceMode ? "ON" : "OFF"}
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Database className="w-5 h-5" />
                <span className="font-medium">Database</span>
              </div>
              <div className={`px-2 py-1 rounded-full text-xs font-medium border ${getHealthColor(systemHealth.database)}`}>
                {getHealthIcon(systemHealth.database)}
                <span className="ml-1 capitalize">{systemHealth.database}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Activity className="w-5 h-5" />
                <span className="font-medium">API Status</span>
              </div>
              <div className={`px-2 py-1 rounded-full text-xs font-medium border ${getHealthColor(systemHealth.api)}`}>
                {getHealthIcon(systemHealth.api)}
                <span className="ml-1 capitalize">{systemHealth.api}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="controls" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="controls">Controls</TabsTrigger>
          <TabsTrigger value="schedule">Schedule</TabsTrigger>
          <TabsTrigger value="logs">Activity</TabsTrigger>
          <TabsTrigger value="health">Health</TabsTrigger>
        </TabsList>

        {/* Main Controls */}
        <TabsContent value="controls" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5" />
                Maintenance Controls
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Maintenance Toggle */}
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="space-y-1">
                  <Label className="text-base font-medium">Maintenance Mode</Label>
                  <p className="text-sm text-muted-foreground">
                    Enable to put the application in maintenance mode
                  </p>
                </div>
                <Switch
                  checked={isMaintenanceMode}
                  onCheckedChange={(checked) => handleMaintenanceToggle(checked)}
                />
              </div>

              {/* Emergency Button */}
              <div className="p-4 border border-red-200 rounded-lg bg-red-50/50">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label className="text-base font-medium text-red-700">Emergency Maintenance</Label>
                    <p className="text-sm text-red-600">
                      Immediately enable maintenance mode for critical issues
                    </p>
                  </div>
                  <Button 
                    variant="destructive" 
                    onClick={handleEmergencyMaintenance}
                    disabled={isMaintenanceMode}
                  >
                    <AlertTriangle className="w-4 h-4 mr-2" />
                    Emergency Mode
                  </Button>
                </div>
              </div>

              {/* Custom Message */}
              <div className="space-y-2">
                <Label>Maintenance Message</Label>
                <Textarea
                  value={customMessage}
                  onChange={(e) => setCustomMessage(e.target.value)}
                  placeholder="Enter custom maintenance message..."
                  rows={3}
                />
                <Button onClick={updateMaintenanceMessage} size="sm">
                  Update Message
                </Button>
              </div>

              {/* User Notifications */}
              <div className="flex items-center space-x-2">
                <Switch
                  id="notify-users"
                  checked={notifyUsers}
                  onCheckedChange={setNotifyUsers}
                />
                <Label htmlFor="notify-users">Send notifications to users</Label>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Scheduled Maintenance */}
        <TabsContent value="schedule" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                Scheduled Maintenance
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Schedule Maintenance</Label>
                <Input
                  type="datetime-local"
                  value={scheduledMaintenance?.toISOString().slice(0, 16) || ''}
                  onChange={(e) => setScheduledMaintenance(e.target.value ? new Date(e.target.value) : null)}
                  min={new Date().toISOString().slice(0, 16)}
                />
              </div>
              
              {scheduledMaintenance && (
                <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-sm text-blue-700">
                    <Clock className="w-4 h-4 inline mr-1" />
                    Maintenance scheduled for: {scheduledMaintenance.toLocaleString()}
                  </p>
                </div>
              )}
              
              <Button 
                onClick={handleScheduleMaintenance}
                disabled={!scheduledMaintenance}
              >
                Schedule Maintenance
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Activity Logs */}
        <TabsContent value="logs" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <History className="w-5 h-5" />
                Maintenance Activity Log
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {logs.length === 0 ? (
                  <p className="text-center text-muted-foreground py-4">No maintenance activity logged</p>
                ) : (
                  logs.map((log) => (
                    <div key={log.id} className="flex items-start gap-3 p-3 border rounded-lg">
                      <div className="mt-1">
                        {log.action === 'emergency' && <AlertTriangle className="w-4 h-4 text-red-500" />}
                        {log.action === 'enabled' && <Shield className="w-4 h-4 text-orange-500" />}
                        {log.action === 'disabled' && <CheckCircle className="w-4 h-4 text-green-500" />}
                        {log.action === 'scheduled' && <Clock className="w-4 h-4 text-blue-500" />}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">{log.message}</p>
                        <p className="text-xs text-muted-foreground">
                          {log.user_email} • {new Date(log.timestamp).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* System Health */}
        <TabsContent value="health" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="w-5 h-5" />
                System Health Monitor
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium">Database Connection</span>
                    {getHealthIcon(systemHealth.database)}
                  </div>
                  <p className="text-sm text-muted-foreground capitalize">
                    Status: {systemHealth.database}
                  </p>
                </div>
                
                <div className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium">API Response</span>
                    {getHealthIcon(systemHealth.api)}
                  </div>
                  <p className="text-sm text-muted-foreground capitalize">
                    Status: {systemHealth.api}
                  </p>
                </div>
              </div>
              
              <div className="text-xs text-muted-foreground">
                Last checked: {new Date(systemHealth.lastCheck).toLocaleString()}
              </div>
              
              <Button onClick={checkSystemHealth} variant="outline" size="sm">
                <Activity className="w-4 h-4 mr-2" />
                Refresh Health Check
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};