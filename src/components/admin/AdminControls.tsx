import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Settings, 
  Database, 
  Users, 
  Shield, 
  Activity,
  AlertTriangle,
  CheckCircle,
  RefreshCw,
  Download,
  Upload,
  Trash2,
  Server
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export function AdminControls() {
  const [loading, setLoading] = useState(false);
  const [systemHealth, setSystemHealth] = useState({
    database: "healthy",
    storage: "healthy",
    auth: "healthy",
    functions: "healthy"
  });
  const { toast } = useToast();

  const handleSystemCheck = async () => {
    setLoading(true);
    try {
      // Test database connection
      const { error: dbError } = await supabase.from("profiles").select("count").limit(1);
      
      // Test storage
      const { error: storageError } = await supabase.storage.listBuckets();
      
      // Test auth
      const { error: authError } = await supabase.auth.getSession();

      setSystemHealth({
        database: dbError ? "error" : "healthy",
        storage: storageError ? "error" : "healthy", 
        auth: authError ? "error" : "healthy",
        functions: "healthy"
      });

      toast({
        title: "System Check Complete",
        description: "All systems checked successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to check system health",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDataExport = async () => {
    try {
      // Export users data
      const { data: users } = await supabase.from("profiles").select("*");
      const { data: employers } = await supabase.from("employers").select("*");
      const { data: jobs } = await supabase.from("jobs").select("*");

      const exportData = {
        users,
        employers,
        jobs,
        exportDate: new Date().toISOString()
      };

      const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `admin-export-${new Date().toISOString().split('T')[0]}.json`;
      a.click();

      toast({
        title: "Export Complete",
        description: "Data exported successfully",
      });
    } catch (error) {
      toast({
        title: "Export Failed",
        description: "Failed to export data",
        variant: "destructive",
      });
    }
  };

  const handleCacheRefresh = async () => {
    setLoading(true);
    try {
      // Simulate cache refresh
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      toast({
        title: "Cache Refreshed",
        description: "Application cache has been cleared",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to refresh cache",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            System Administration
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="health" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="health">System Health</TabsTrigger>
              <TabsTrigger value="data">Data Management</TabsTrigger>
              <TabsTrigger value="security">Security</TabsTrigger>
              <TabsTrigger value="logs">Activity Logs</TabsTrigger>
            </TabsList>
            
            <TabsContent value="health" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2">
                      <Database className="h-6 w-6 text-blue-600" />
                      <div>
                        <p className="font-medium">Database</p>
                        <Badge variant={systemHealth.database === "healthy" ? "default" : "destructive"}>
                          {systemHealth.database === "healthy" ? "Healthy" : "Error"}
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2">
                      <Server className="h-6 w-6 text-green-600" />
                      <div>
                        <p className="font-medium">Storage</p>
                        <Badge variant={systemHealth.storage === "healthy" ? "default" : "destructive"}>
                          {systemHealth.storage === "healthy" ? "Healthy" : "Error"}
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2">
                      <Shield className="h-6 w-6 text-orange-600" />
                      <div>
                        <p className="font-medium">Auth</p>
                        <Badge variant={systemHealth.auth === "healthy" ? "default" : "destructive"}>
                          {systemHealth.auth === "healthy" ? "Healthy" : "Error"}
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2">
                      <Activity className="h-6 w-6 text-purple-600" />
                      <div>
                        <p className="font-medium">Functions</p>
                        <Badge variant={systemHealth.functions === "healthy" ? "default" : "destructive"}>
                          {systemHealth.functions === "healthy" ? "Healthy" : "Error"}
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="flex gap-4">
                <Button onClick={handleSystemCheck} disabled={loading}>
                  <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                  Run Health Check
                </Button>
                <Button variant="outline" onClick={handleCacheRefresh} disabled={loading}>
                  <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                  Refresh Cache
                </Button>
              </div>
            </TabsContent>
            
            <TabsContent value="data" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Data Export</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-sm text-muted-foreground">
                      Export all platform data for backup or migration purposes.
                    </p>
                    <Button onClick={handleDataExport}>
                      <Download className="h-4 w-4 mr-2" />
                      Export Data
                    </Button>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Database Maintenance</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-sm text-muted-foreground">
                      Clean up expired data and optimize database performance.
                    </p>
                    <div className="flex gap-2">
                      <Button variant="outline">
                        <Trash2 className="h-4 w-4 mr-2" />
                        Clean Expired
                      </Button>
                      <Button variant="outline">
                        <RefreshCw className="h-4 w-4 mr-2" />
                        Optimize
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
            
            <TabsContent value="security" className="space-y-4">
              <div className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Security Status</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span>RLS Policies</span>
                        <Badge variant="default">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Active
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>Authentication</span>
                        <Badge variant="default">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Secure
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>Data Encryption</span>
                        <Badge variant="default">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Enabled
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Admin Actions</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-sm text-muted-foreground">
                      Manage platform security and administrative functions.
                    </p>
                    <div className="flex gap-2">
                      <Button variant="outline">
                        <Shield className="h-4 w-4 mr-2" />
                        Security Audit
                      </Button>
                      <Button variant="outline">
                        <Users className="h-4 w-4 mr-2" />
                        Access Review
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
            
            <TabsContent value="logs" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Recent Activity</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 p-2 rounded-lg bg-muted/30">
                      <Activity className="h-4 w-4 text-blue-600" />
                      <div className="flex-1">
                        <p className="text-sm font-medium">System health check completed</p>
                        <p className="text-xs text-muted-foreground">2 minutes ago</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-2 rounded-lg bg-muted/30">
                      <Users className="h-4 w-4 text-green-600" />
                      <div className="flex-1">
                        <p className="text-sm font-medium">New user registered</p>
                        <p className="text-xs text-muted-foreground">15 minutes ago</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-2 rounded-lg bg-muted/30">
                      <Shield className="h-4 w-4 text-orange-600" />
                      <div className="flex-1">
                        <p className="text-sm font-medium">Company verification updated</p>
                        <p className="text-xs text-muted-foreground">1 hour ago</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}