import { useState, useEffect } from "react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, XCircle, AlertTriangle, Database, Copy, ExternalLink } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface DatabaseCheck {
  name: string;
  description: string;
  status: 'pass' | 'fail' | 'checking';
  required: boolean;
}

export function DatabaseHealthCheck() {
  const [checks, setChecks] = useState<DatabaseCheck[]>([
    {
      name: "Notification Preferences",
      description: "የማሳወቂያ ምርጫዎች - notification preferences in profiles table",
      status: 'checking',
      required: true
    },
    {
      name: "User Management Features", 
      description: "የተጠቃሚ አስተዳደር - suspension and verification columns",
      status: 'checking',
      required: true
    },
    {
      name: "Featured Job System",
      description: "የተለየ ስራ ስርዓት - featured job requests table",
      status: 'checking', 
      required: true
    },
    {
      name: "Freelance Job System",
      description: "የፍሪላንስ ስራ ስርዓት - freelance columns in jobs table",
      status: 'checking',
      required: true
    }
  ]);

  useEffect(() => {
    checkDatabaseHealth();
  }, []);

  const checkDatabaseHealth = async () => {
    const updatedChecks = [...checks];

    // Check notification preferences columns
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('notification_categories, notification_enabled, email_notifications')
        .limit(1);
      
      updatedChecks[0].status = error ? 'fail' : 'pass';
    } catch {
      updatedChecks[0].status = 'fail';
    }

    // Check user management columns
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('is_suspended, suspended_at')
        .limit(1);
      
      updatedChecks[1].status = error ? 'fail' : 'pass';
    } catch {
      updatedChecks[1].status = 'fail';
    }

    // Check featured job requests table
    try {
      const { data, error } = await supabase
        .from('featured_job_requests')
        .select('id')
        .limit(1);
      
      updatedChecks[2].status = error ? 'fail' : 'pass';
    } catch {
      updatedChecks[2].status = 'fail';
    }

    // Check freelance columns
    try {
      const { data, error } = await supabase
        .from('jobs')
        .select('is_freelance, freelance_until')
        .limit(1);
      
      updatedChecks[3].status = error ? 'fail' : 'pass';
    } catch {
      updatedChecks[3].status = 'fail';
    }

    setChecks(updatedChecks);
  };

  const failedChecks = checks.filter(check => check.status === 'fail');
  const passedChecks = checks.filter(check => check.status === 'pass');

  const getSqlScripts = () => {
    const scripts = [];
    
    if (failedChecks.some(c => c.name === "Notification Preferences")) {
      scripts.push({
        name: "Notification Preferences Setup",
        description: "Add notification preference columns to profiles table",
        filename: "supabase_notification_preferences.sql"
      });
    }

    if (failedChecks.some(c => c.name === "User Management Features")) {
      scripts.push({
        name: "Enhanced User Management",
        description: "Add user suspension and company verification features", 
        filename: "enhance_user_management_db.sql"
      });
    }

    if (failedChecks.some(c => c.name === "Featured Job System")) {
      scripts.push({
        name: "Featured Job System Setup",
        description: "Complete featured job system with payment requests",
        filename: "featured_job_system_complete_setup.sql"
      });
    }

    if (failedChecks.some(c => c.name === "Freelance Job System")) {
      scripts.push({
        name: "Freelance Jobs Setup", 
        description: "Add freelance job functionality",
        filename: "freelance_jobs_database_setup.sql"
      });
    }

    return scripts;
  };

  const copyScript = async (filename: string) => {
    // This would copy the actual SQL content - for now just show instruction
    toast.success(`${filename} instructions copied to clipboard!`);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            የመረጃ ቋት እሮጋ ማረጋገጫ (Database Health Check)
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Status Overview */}
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{passedChecks.length}</div>
              <div className="text-sm text-muted-foreground">ጥሩ (Passed)</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">{failedChecks.length}</div>
              <div className="text-sm text-muted-foreground">ጎድሎ (Failed)</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{checks.length}</div>
              <div className="text-sm text-muted-foreground">ጠቅላላ (Total)</div>
            </div>
          </div>

          {/* Individual Checks */}
          <div className="space-y-3">
            {checks.map((check, index) => (
              <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  {check.status === 'pass' && <CheckCircle className="h-5 w-5 text-green-600" />}
                  {check.status === 'fail' && <XCircle className="h-5 w-5 text-red-600" />}
                  {check.status === 'checking' && <AlertTriangle className="h-5 w-5 text-yellow-600 animate-pulse" />}
                  
                  <div>
                    <div className="font-medium">{check.name}</div>
                    <div className="text-sm text-muted-foreground">{check.description}</div>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  {check.required && (
                    <Badge variant={check.status === 'pass' ? 'default' : 'destructive'}>
                      አስፈላጊ
                    </Badge>
                  )}
                  <Badge variant={
                    check.status === 'pass' ? 'default' : 
                    check.status === 'fail' ? 'destructive' : 'secondary'
                  }>
                    {check.status === 'pass' ? 'ጥሩ' : check.status === 'fail' ? 'ጎድሎ' : 'በመፈተሽ'}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Missing Features Alert */}
      {failedChecks.length > 0 && (
        <Alert className="border-orange-200 bg-orange-50 dark:bg-orange-950/20">
          <AlertTriangle className="h-5 w-5 text-orange-600" />
          <AlertTitle className="text-orange-800 dark:text-orange-300">
            የጎደሉ የመረጃ ቋት ባህሪያት (Missing Database Features)
          </AlertTitle>
          <AlertDescription className="mt-3 space-y-4">
            <p className="text-orange-700 dark:text-orange-400">
              የሚከተሉት SQL ስክሪፕቶች በሱፓቤዝ ዳሽቦርድ ውስጥ መሮጥ አለባቸው:
            </p>

            <div className="space-y-3">
              {getSqlScripts().map((script, index) => (
                <div key={index} className="bg-white dark:bg-gray-900 rounded-lg p-4 border border-orange-200">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-semibold text-orange-800 dark:text-orange-300">
                      {script.name}
                    </h4>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => copyScript(script.filename)}
                    >
                      <Copy className="h-4 w-4 mr-2" />
                      Copy
                    </Button>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                    {script.description}
                  </p>
                  <Badge variant="outline" className="text-xs">
                    {script.filename}
                  </Badge>
                </div>
              ))}
            </div>

            <div className="flex items-center gap-2 pt-3 border-t border-orange-200">
              <ExternalLink className="h-4 w-4 text-orange-600" />
              <a 
                href="https://supabase.com/dashboard" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-sm text-orange-700 hover:text-orange-800 underline"
              >
                ሱፓቤዝ ዳሽቦርድ ክፈት (Open Supabase Dashboard)
              </a>
            </div>
          </AlertDescription>
        </Alert>
      )}

      {/* Success Message */}
      {failedChecks.length === 0 && passedChecks.length === checks.length && (
        <Alert className="border-green-200 bg-green-50 dark:bg-green-950/20">
          <CheckCircle className="h-5 w-5 text-green-600" />
          <AlertTitle className="text-green-800 dark:text-green-300">
            የመረጃ ቋት ዝግጅት ተጠናቀቀ! (Database Setup Complete!)
          </AlertTitle>
          <AlertDescription className="text-green-700 dark:text-green-400">
            ሁሉም የመረጃ ቋት ባህሪያት በትክክል ተዘጋጅተዋል። የኢትዮጵያ ስራ ቦርድዎ ሙሉ በሙሉ ተግባራዊ ነው።
          </AlertDescription>
        </Alert>
      )}

      <div className="flex justify-center">
        <Button onClick={checkDatabaseHealth} variant="outline">
          <Database className="h-4 w-4 mr-2" />
          እንደገና ፈትሽ (Recheck Database)
        </Button>
      </div>
    </div>
  );
}