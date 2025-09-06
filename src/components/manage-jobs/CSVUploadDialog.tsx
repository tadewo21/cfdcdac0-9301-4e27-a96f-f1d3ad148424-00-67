import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Upload } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface CSVUploadDialogProps {
  userId: string;
  onUploadComplete: () => void;
}

export function CSVUploadDialog({ userId, onUploadComplete }: CSVUploadDialogProps) {
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const { t } = useLanguage();
  const { toast } = useToast();

  const processCsvFile = (file: File): Promise<any[]> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const csv = e.target?.result as string;
          const lines = csv.split('\n').filter(line => line.trim());
          
          if (lines.length < 2) {
            throw new Error(t("csvUpload.minRowsError"));
          }
          
          // Parse CSV properly handling commas in quoted fields
          const parseCSVLine = (line: string): string[] => {
            const result: string[] = [];
            let current = '';
            let inQuotes = false;
            
            for (let i = 0; i < line.length; i++) {
              const char = line[i];
              
              if (char === '"') {
                inQuotes = !inQuotes;
              } else if (char === ',' && !inQuotes) {
                result.push(current.trim());
                current = '';
              } else {
                current += char;
              }
            }
            result.push(current.trim());
            return result;
          };
          
          const headers = parseCSVLine(lines[0]).map(h => h.replace(/"/g, '').trim());
          
          const jobs = lines.slice(1).map((line, index) => {
            const values = parseCSVLine(line).map(v => v.replace(/"/g, '').trim());
            const job: any = {
              status: 'active',
              posted_date: new Date().toISOString()
            };
            
            headers.forEach((header, headerIndex) => {
              const value = values[headerIndex] || '';
              
              // Map CSV headers to database columns
              switch (header.toLowerCase()) {
                case 'title':
                case 'ሥራ ማስታወቂያ ርዕስ':
                  job.title = value;
                  break;
                case 'description':
                case 'ዝርዝር መግለጫ':
                  job.description = value;
                  break;
                case 'requirements':
                case 'መስፈርቶች':
                  job.requirements = value;
                  break;
                case 'city':
                case 'ከተማ':
                  job.city = value;
                  break;
                case 'category':
                case 'ዘርፍ':
                  job.category = value;
                  break;
                case 'application_email':
                case 'application_method':
                case 'የማመልከቻ ኢሜይል':
                  job.application_email = value;
                  break;
                case 'job_type':
                case 'የስራ አይነት':
                  job.job_type = value;
                  break;
                case 'salary_range':
                case 'የደመወዝ መጠን':
                  job.salary_range = value;
                  break;
                case 'education_level':
                case 'የትምህርት ደረጃ':
                  job.education_level = value;
                  break;
                case 'benefits':
                case 'ጥቅማ ጥቅሞች':
                  job.benefits = value;
                  break;
                case 'company_culture':
                case 'የድርጅት ባህል':
                  job.company_culture = value;
                  break;
                case 'company_name':
                case 'የድርጅት ስም':
                  job.company_name = value;
                  break;
                case 'phone_number':
                case 'ስልክ ቁጥር':
                  job.phone_number = value;
                  break;
              case 'deadline':
              case 'የመጨረሻ ቀን':
                if (value) {
                  const date = new Date(value);
                  if (!isNaN(date.getTime())) {
                    job.deadline = date.toISOString();
                  } else {
                    throw new Error(t("csvUpload.invalidDateFormat", { 
                      line: (index + 2).toString(), 
                      date: value 
                    }));
                  }
                }
                break;
              case 'company_logo_url':
              case 'የድርጅት አርማ':
                if (value) {
                  // Validate URL format
                  try {
                    new URL(value);
                    job.company_logo_url = value;
                  } catch {
                    console.warn(`Invalid logo URL at line ${index + 2}: ${value}`);
                  }
                }
                break;
              }
            });
            
            // Validate required fields
            if (!job.title) throw new Error(`Line ${index + 2}: Title is required`);
            if (!job.description) throw new Error(`Line ${index + 2}: Description is required`);
            if (!job.city) throw new Error(`Line ${index + 2}: City is required`);
            if (!job.category) throw new Error(`Line ${index + 2}: Category is required`);
            if (!job.application_email) throw new Error(`Line ${index + 2}: Application email is required`);
            if (!job.deadline) throw new Error(`Line ${index + 2}: Deadline is required`);
            if (!job.company_name) throw new Error(`Line ${index + 2}: Company name is required`);
            
            return job;
          });
          
          resolve(jobs);
        } catch (error) {
          reject(error);
        }
      };
      reader.onerror = () => reject(new Error(t("csvUpload.fileReadError")));
      reader.readAsText(file, 'UTF-8');
    });
  };

  const downloadCSVTemplate = () => {
    const headers = [
      'title',
      'description', 
      'requirements',
      'city',
      'category',
      'job_type',
      'salary_range',
      'education_level',
      'benefits',
      'company_culture',
      'application_email',
      'deadline',
      'company_name',
      'phone_number'
    ];
    
    const sampleData = [
      'የሶፍትዌር ዲቨሎፐር',
      'ተሞክሮ ያለው የሶፍትዌር ዲቨሎፐር ይፈለጋል። React እና Node.js ማወቅ አለበት።',
      'ዩኒቨርሲቲ ዲግሪ፣ የ3 ዓመት ተሞክሮ፣ React፣ Node.js',
      'አዲስ አበባ',
      'መረጃ ቴክኖሎጂ (IT)',
      'ሙሉ ሰዓት (Full-time)',
      '15,000 - 25,000 ብር',
      'የመጀመሪያ ዲግሪ',
      'ሕክምና መድን፣ የመጓጓዣ አገልግሎት',
      'የተከታታይ ትምህርት እና እድገት',
      'hr@company.com',
      '2024-12-31',
      'ቴክ ኢኖቬሽን',
      '0911123456'
    ];
    
    const csvContent = [
      headers.join(','),
      sampleData.map(field => `"${field}"`).join(',')
    ].join('\n');
    
    const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'job-template.csv';
    link.click();
    URL.revokeObjectURL(link.href);
  };

  const handleCsvUpload = async () => {
    if (!csvFile) return;

    try {
      setUploading(true);

      // Process the CSV file first
      const jobs = await processCsvFile(csvFile);

      // Get user's employer_id
      const { data: profile } = await supabase
        .from("profiles")
        .select("employer_id")
        .eq("user_id", userId)
        .single();

      let employerId = profile?.employer_id;

      if (!employerId) {
        // Create employer entry with first job's company info
        const firstJob = jobs[0];
        const { data: employer, error: employerError } = await supabase
          .from("employers")
          .insert({
            company_name: firstJob?.company_name || t("csvUpload.defaultCompanyName"),
            email: userId,
            company_logo_url: firstJob?.company_logo_url || null,
          })
          .select()
          .single();

        if (employerError) throw employerError;
        employerId = employer.id;

        // Update profile
        await supabase
          .from("profiles")
          .update({ employer_id: employerId })
          .eq("user_id", userId);
      }
      
      // Process each job and insert individually for better error handling
      let successful = 0;
      let failed = 0;
      const errors: string[] = [];

      for (const job of jobs) {
        try {
          const { error } = await supabase
            .from("jobs")
            .insert({
              title: job.title,
              description: job.description,
              requirements: job.requirements || '',
              city: job.city,
              category: job.category,
              job_type: job.job_type || 'ሙሉ ሰዓት (Full-time)',
              salary_range: job.salary_range || 'ደመወዝ ለደራሻ',
              education_level: job.education_level || 'የመጀመሪያ ዲግሪ',
              benefits: job.benefits || '',
              company_culture: job.company_culture || '',
              application_email: job.application_email,
              deadline: job.deadline,
              employer_id: employerId,
              status: 'active',
            });

          if (error) throw error;
          successful++;
        } catch (error: any) {
          failed++;
          errors.push(`Row ${successful + failed}: ${error.message}`);
        }
      }

      if (successful > 0) {
        toast({
          title: t("messages.success"),
          description: t("manageJobs.jobsUploaded", { count: successful.toString() }),
        });
      }

      if (failed > 0) {
        toast({
          title: t("messages.error"),
          description: `${failed} jobs failed to upload. ${successful} jobs uploaded successfully.`,
          variant: "destructive",
        });
        console.log("Upload errors:", errors);
      }

      setCsvFile(null);
      onUploadComplete();
    } catch (error: any) {
      toast({
        title: t("messages.error"),
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline">
          <Upload className="h-4 w-4 mr-2" />
          {t("manageJobs.uploadCSV")}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("csvUpload.title")}</DialogTitle>
          <DialogDescription>
            {t("csvUpload.description")}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="flex justify-center">
            <Button
              variant="outline"
              onClick={downloadCSVTemplate}
              className="w-full"
            >
              {t("csvUpload.downloadTemplate")}
            </Button>
          </div>
          
          <div className="border-t pt-4">
            <Input
              type="file"
              accept=".csv"
              onChange={(e) => setCsvFile(e.target.files?.[0] || null)}
            />
            <Button 
              onClick={handleCsvUpload} 
              disabled={!csvFile || uploading}
              className="w-full mt-2"
            >
              {uploading ? t("csvUpload.uploading") : t("csvUpload.upload")}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}