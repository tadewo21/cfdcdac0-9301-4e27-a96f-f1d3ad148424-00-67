import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, Database, Code, ExternalLink } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

interface DatabaseSetupAlertProps {
  title: string;
  description: string;
  missingTables?: string[];
  missingColumns?: { table: string; columns: string[] }[];
}

export function DatabaseSetupAlert({ 
  title, 
  description, 
  missingTables = [], 
  missingColumns = [] 
}: DatabaseSetupAlertProps) {
  const { t } = useLanguage();
  const sqlCommands = [
    // Create featured_job_requests table
    `-- Create featured_job_requests table
CREATE TABLE featured_job_requests (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  job_id UUID NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
  employer_id UUID NOT NULL REFERENCES employers(id) ON DELETE CASCADE,
  transaction_reference TEXT NOT NULL,
  payment_screenshot_url TEXT,
  amount DECIMAL(10,2) NOT NULL,
  currency TEXT NOT NULL DEFAULT 'ETB',
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  processed_at TIMESTAMP WITH TIME ZONE,
  processed_by TEXT,
  admin_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);`,
    
    // Add featured columns to jobs table
    `-- Add featured columns to jobs table
ALTER TABLE jobs 
ADD COLUMN IF NOT EXISTS is_featured BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS featured_until DATE;`,

    // Create indexes for performance
    `-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_featured_job_requests_status ON featured_job_requests(status);
CREATE INDEX IF NOT EXISTS idx_featured_job_requests_submitted_at ON featured_job_requests(submitted_at);
CREATE INDEX IF NOT EXISTS idx_jobs_is_featured ON jobs(is_featured) WHERE is_featured = TRUE;
CREATE INDEX IF NOT EXISTS idx_jobs_featured_until ON jobs(featured_until) WHERE featured_until IS NOT NULL;`,

    // Enable RLS
    `-- Enable Row Level Security
ALTER TABLE featured_job_requests ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Employers can view own requests" ON featured_job_requests
FOR SELECT USING (employer_id IN (
  SELECT employer_id FROM profiles WHERE user_id = auth.uid()
));

CREATE POLICY "Employers can insert own requests" ON featured_job_requests
FOR INSERT WITH CHECK (employer_id IN (
  SELECT employer_id FROM profiles WHERE user_id = auth.uid()
));

CREATE POLICY "Only admins can update requests" ON featured_job_requests
FOR UPDATE USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE user_id = auth.uid() 
    AND user_type = 'admin'
  )
);`
  ];

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
    } catch (err) {
      console.error('Failed to copy SQL to clipboard:', err);
    }
  };

  return (
    <Alert className="border-orange-200 bg-orange-50 dark:bg-orange-950/20">
      <AlertTriangle className="h-5 w-5 text-orange-600" />
      <AlertTitle className="text-orange-800 dark:text-orange-300 flex items-center gap-2">
        <Database className="h-4 w-4" />
        {title}
      </AlertTitle>
      <AlertDescription className="mt-3 space-y-4">
        <p className="text-orange-700 dark:text-orange-400">
          {description}
        </p>

        {/* Missing Tables */}
        {missingTables.length > 0 && (
          <div>
            <h4 className="font-semibold text-orange-800 dark:text-orange-300 mb-2">{t("database.missingTables")}</h4>
            <div className="flex flex-wrap gap-2">
              {missingTables.map((table) => (
                <Badge key={table} variant="outline" className="border-orange-300 text-orange-700">
                  {table}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Missing Columns */}
        {missingColumns.length > 0 && (
          <div>
            <h4 className="font-semibold text-orange-800 dark:text-orange-300 mb-2">{t("database.missingColumns")}</h4>
            <div className="space-y-2">
              {missingColumns.map((item) => (
                <div key={item.table} className="flex items-center gap-2">
                  <Badge variant="outline" className="border-orange-300 text-orange-700">
                    {item.table}
                  </Badge>
                  <span className="text-sm text-orange-600">→</span>
                  <div className="flex flex-wrap gap-1">
                    {item.columns.map((column) => (
                      <Badge key={column} variant="secondary" className="text-xs">
                        {column}
                      </Badge>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Setup Instructions */}
        <div className="bg-white dark:bg-gray-900 rounded-lg p-4 border border-orange-200">
          <h4 className="font-semibold text-orange-800 dark:text-orange-300 mb-3 flex items-center gap-2">
            <Code className="h-4 w-4" />
            {t("database.setupRequired")}
          </h4>
          
          <div className="space-y-3">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {t("database.setupInstructions")}
            </p>

            {sqlCommands.map((sql, index) => (
              <div key={index} className="relative">
                <pre className="bg-gray-100 dark:bg-gray-800 p-3 rounded text-xs overflow-x-auto border">
                  <code className="text-gray-800 dark:text-gray-200">{sql}</code>
                </pre>
                <Button
                  size="sm"
                  variant="outline"
                  className="absolute top-2 right-2 h-6 text-xs"
                  onClick={() => copyToClipboard(sql)}
                >
                  {t("database.copy")}
                </Button>
              </div>
            ))}

            <div className="flex items-center gap-2 mt-4 pt-3 border-t border-orange-200">
              <ExternalLink className="h-4 w-4 text-orange-600" />
              <a 
                href="https://supabase.com/dashboard" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-sm text-orange-700 hover:text-orange-800 underline"
              >
                {t("database.openSupabaseDashboard")}
              </a>
            </div>
          </div>
        </div>

        <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 rounded-lg p-3">
          <p className="text-sm text-blue-700 dark:text-blue-300">
            <strong>Note:</strong> {t("database.afterRunningCommands")}
          </p>
        </div>
      </AlertDescription>
    </Alert>
  );
}