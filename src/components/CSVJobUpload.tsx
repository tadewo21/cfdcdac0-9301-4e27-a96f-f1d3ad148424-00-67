import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { useLanguage } from "@/contexts/LanguageContext";
import { supabase } from "@/integrations/supabase/client";
import { Download, Upload, FileText, AlertCircle, CheckCircle, ChevronDown } from "lucide-react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

interface CSVJobUploadProps {
  onJobsUploaded?: () => void;
}

const CSVJobUpload: React.FC<CSVJobUploadProps> = ({ onJobsUploaded }) => {
  const [uploading, setUploading] = useState(false);
  const [uploadResults, setUploadResults] = useState<{
    successful: number;
    failed: number;
    errors: string[];
  } | null>(null);
  const [isGuideOpen, setIsGuideOpen] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();
  const { t } = useLanguage();

  // CSV template data
  const csvTemplate = `title,description,requirements,city,category,job_type,salary_range,education_level,benefits,company_culture,application_method,deadline,company_name,phone_number
"የሶፍትዌር ዲቨሎፐር","የዌብ እና የሞባይል መተግበሪያዎችን ማዳበር","JavaScript, React, Node.js","አዲስ አበባ","Technology","full-time","15000-25000","የመጀመሪያ ዲግሪ","ሕክምና መድን፣ የመጓጓዣ አገልግሎት","የተከታታይ ትምህርት እና እድገት","hr@company.com","2024-12-31","ቴክ ኢኖቬሽን","0911123456"
"የግብይት ስፔሻሊስት","የዲጂታል ግብይት ዘርፍ","Digital Marketing, SEO, Social Media","አዲስ አበባ","Marketing","part-time","8000-12000","ዲፕሎማ","የጊዜ መርሐ-ግብር ተለዋዋጭነት","የዘመናዊ ቢሮ አካባቢ","jobs@marketing.com","2024-12-25","ግሎባል ማርኬቲንግ","0922234567"`;

  const downloadTemplate = () => {
    const blob = new Blob([csvTemplate], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', 'jobs-template.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast({
      title: t("messages.success"),
      description: t("csvUpload.downloadTemplate"),
    });
  };

  const parseCSV = (text: string): any[] => {
    const lines = text.split('\n');
    const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
    const data = [];

    for (let i = 1; i < lines.length; i++) {
      if (lines[i].trim() === '') continue;
      
      const values = [];
      let current = '';
      let inQuotes = false;
      
      for (let j = 0; j < lines[i].length; j++) {
        const char = lines[i][j];
        if (char === '"') {
          inQuotes = !inQuotes;
        } else if (char === ',' && !inQuotes) {
          values.push(current.trim());
          current = '';
        } else {
          current += char;
        }
      }
      values.push(current.trim());

            const row: any = {};
            headers.forEach((header, index) => {
              // Normalize header name to match expected fields
              const normalizedHeader = header.toLowerCase().replace(/"/g, '');
              let fieldName = normalizedHeader;
              
              // Map alternative header names
              switch (normalizedHeader) {
                case 'application_method':
                  fieldName = 'application_method';
                  break;
                case 'application_email':
                  fieldName = 'application_method';
                  break;
                default:
                  fieldName = normalizedHeader;
              }
              
              row[fieldName] = values[index] || '';
            });
            data.push(row);
    }

    return data;
  };

  const validateJobData = (job: any): string[] => {
    const errors: string[] = [];
    const requiredFields = [
      'title', 'description', 'requirements', 'city', 'category', 
      'job_type', 'salary_range', 'education_level', 'application_method', 'deadline', 'company_name'
    ];

    requiredFields.forEach(field => {
      if (!job[field] || job[field].trim() === '') {
        errors.push(t("form.required"));
      }
    });

    // Validate deadline format
    if (job.deadline && !isValidDate(job.deadline)) {
      errors.push(t("csvUpload.invalidDateFormat"));
    }

    // Validate email format
    if (job.application_method && !isValidEmail(job.application_method)) {
      errors.push(t("form.email"));
    }

    return errors;
  };

  const isValidDate = (dateString: string): boolean => {
    const regex = /^\d{4}-\d{2}-\d{2}$/;
    if (!regex.test(dateString)) return false;
    const date = new Date(dateString);
    return date instanceof Date && !isNaN(date.getTime()) && date > new Date();
  };

  const isValidEmail = (email: string): boolean => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.type !== 'text/csv' && !file.name.endsWith('.csv')) {
      toast({
        title: t("messages.error"),
        description: t("csvUpload.invalidFile"),
        variant: "destructive",
      });
      return;
    }

    setUploading(true);
    setUploadResults(null);

    try {
      const text = await file.text();
      const jobs = parseCSV(text);
      
      let successful = 0;
      let failed = 0;
      const errors: string[] = [];

      // Get or create employer profile
      const { data: profile } = await supabase
        .from("profiles")
        .select("employer_id, user_type")
        .eq("user_id", user!.id)
        .single();

      // Auto-update user type to employer
      if (profile?.user_type !== "employer") {
        await supabase
          .from("profiles")
          .update({ user_type: "employer" })
          .eq("user_id", user!.id);
      }

      for (const job of jobs) {
        try {
          const validationErrors = validateJobData(job);
          if (validationErrors.length > 0) {
            failed++;
            errors.push(`Row ${failed + successful + 1}: ${validationErrors.join(', ')}`);
            continue;
          }

          // Check or create employer
          let employerId = profile?.employer_id;
          
          if (!employerId) {
            const { data: existingCompany } = await supabase
              .from("employers")
              .select("id")
              .eq("company_name", job.company_name)
              .maybeSingle();

            if (existingCompany) {
              employerId = existingCompany.id;
            } else {
              const { data: employer, error: employerError } = await supabase
                .from("employers")
                .insert({
                  company_name: job.company_name,
                  email: user!.email!,
                  phone_number: job.phone_number || null,
                })
                .select()
                .single();

              if (employerError) throw employerError;
              employerId = employer.id;

              // Update profile with employer_id
              await supabase
                .from("profiles")
                .update({ employer_id: employerId })
                .eq("user_id", user!.id);
            }
          }

          // Insert job
          const { company_name, phone_number, ...jobData } = job;
          await supabase
            .from("jobs")
            .insert({
              title: job.title,
              description: job.description,
              requirements: job.requirements,
              city: job.city,
              category: job.category,
              job_type: job.job_type,
              salary_range: job.salary_range,
              education_level: job.education_level,
              benefits: job.benefits || '',
              company_culture: job.company_culture || '',
              application_email: job.application_method,
              deadline: job.deadline,
              employer_id: employerId,
              status: 'active',
            });

          successful++;
        } catch (error) {
          failed++;
          errors.push(`Row ${failed + successful}: ${error instanceof Error ? error.message : t("messages.operationFailed")}`);
        }
      }

      setUploadResults({ successful, failed, errors });

      if (successful > 0) {
        toast({
          title: t("messages.success"),
          description: t("csvUpload.uploadSuccess"),
        });
        onJobsUploaded?.();
      }

      if (failed > 0) {
        toast({
          title: t("messages.error"),
          description: t("csvUpload.uploadError"),
          variant: "destructive",
        });
      }

    } catch (error) {
      toast({
        title: t("messages.error"),
        description: t("csvUpload.fileReadError"),
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          {t("csvUpload.title")}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Template Download */}
        <div className="space-y-2">
          <h3 className="text-sm font-medium">{t("csvUpload.downloadTemplate")}</h3>
          <Button 
            onClick={downloadTemplate}
            variant="outline" 
            className="w-full"
          >
            <Download className="h-4 w-4 mr-2" />
            {t("csvUpload.downloadTemplate")}
          </Button>
        </div>

        {/* Guide */}
        <Collapsible open={isGuideOpen} onOpenChange={setIsGuideOpen}>
          <CollapsibleTrigger asChild>
            <Button variant="outline" className="w-full justify-between bg-background hover:bg-accent hover:text-accent-foreground border border-border">
              <span className="flex items-center gap-2">
                <AlertCircle className="h-4 w-4" />
                CSV Upload Step by Step Guide
              </span>
              <ChevronDown className={`h-3 w-3 transition-transform duration-200 ${isGuideOpen ? 'rotate-180' : ''}`} />
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent className="z-50">
            <Alert className="mt-2 bg-background border border-border">
              <AlertDescription>
                <ol className="list-decimal list-inside space-y-1 text-sm">
                  <li>ከላይ ያሉትን የCSV template ያውርዱ</li>
                  <li>ፋይሉን በExcel ወይም Google Sheets ይክፈቱ</li>
                  <li>የናሙና መረጃዎችን በእርስዎ የስራ መረጃዎች ይቀይሩ</li>
                  <li>ሁሉም የሚያስፈልጋቸው መስኮች መሞላታቸውን ያረጋግጡ</li>
                  <li>የማመልከቻ ጊዜ ወሰን YYYY-MM-DD ቅርፀት መሆን አለበት</li>
                  <li>ፋይሉን እንደ CSV ያስቀምጡ</li>
                  <li>ከታች ባለው የመስቀያ ቦታ ይስቀሉ</li>
                </ol>
              </AlertDescription>
            </Alert>
          </CollapsibleContent>
        </Collapsible>

        {/* File Upload */}
        <div className="space-y-2">
          <h3 className="text-sm font-medium">{t("csvUpload.upload")}</h3>
          <Input
            type="file"
            accept=".csv"
            onChange={handleFileUpload}
            disabled={uploading}
            className="cursor-pointer"
          />
          <Button 
            onClick={() => (document.querySelector('input[type="file"]') as HTMLInputElement)?.click()}
            disabled={uploading}
            className="w-full"
          >
            <Upload className="h-4 w-4 mr-2" />
            {uploading ? t("csvUpload.uploading") : t("csvUpload.upload")}
          </Button>
        </div>

        {/* Results */}
        {uploadResults && (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <span className="text-sm">{t("messages.success")}: {uploadResults.successful}</span>
            </div>
            {uploadResults.failed > 0 && (
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 text-red-600" />
                  <span className="text-sm">{t("messages.error")}: {uploadResults.failed}</span>
                </div>
                {uploadResults.errors.length > 0 && (
                  <div className="bg-red-50 border border-red-200 rounded p-3">
                    <h4 className="text-sm font-medium text-red-800 mb-2">{t("messages.error")}:</h4>
                    <ul className="text-xs text-red-700 space-y-1">
                      {uploadResults.errors.map((error, index) => (
                        <li key={index}>• {error}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default CSVJobUpload;