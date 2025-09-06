import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { JobCard } from "@/components/JobCard";
import { supabase } from "@/integrations/supabase/client";
import { ArrowLeft, Building2, MapPin, Globe, Mail, Phone } from "lucide-react";
import { Job } from "@/hooks/useJobs";
import { useLanguage } from "@/contexts/LanguageContext";

interface CompanyData {
  id: string;
  company_name: string;
  company_logo_url?: string;
  email: string;
  phone_number?: string;
  created_at: string;
}

const CompanyProfile = () => {
  const { companyId } = useParams();
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [company, setCompany] = useState<CompanyData | null>(null);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!companyId) return;

    const fetchCompanyData = async () => {
      try {
        // Fetch company details
        const { data: companyData, error: companyError } = await supabase
          .from("employers")
          .select("*")
          .eq("id", companyId)
          .single();

        if (companyError) throw companyError;

        // Fetch company jobs
        const { data: jobsData, error: jobsError } = await supabase
          .from("jobs")
          .select(`
            *,
            employers (
              company_name,
              company_logo_url
            )
          `)
          .eq("employer_id", companyId)
          .eq("status", "active")
          .gte("deadline", new Date().toISOString())
          .order("posted_date", { ascending: false });

        if (jobsError) throw jobsError;

        setCompany(companyData);
        setJobs(jobsData || []);
      } catch (error) {
        console.error("Error fetching company data:", error);
        navigate("/");
      } finally {
        setLoading(false);
      }
    };

    fetchCompanyData();
  }, [companyId, navigate]);

  const handleJobClick = (jobId: string) => {
    // Navigate to job detail or implement job detail modal
    // TODO: Implement navigation to job detail
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="max-w-6xl mx-auto p-4 space-y-6">
          <div className="animate-pulse">
            <div className="h-8 bg-muted rounded w-1/4 mb-4"></div>
            <div className="h-32 bg-muted rounded mb-6"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-48 bg-muted rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!company) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-foreground mb-2">{t("companyProfile.companyNotFound")}</h2>
          <p className="text-muted-foreground mb-4">{t("companyProfile.noCompanyInfo")}</p>
          <Button onClick={() => navigate("/")}>
            {t("companyProfile.backToHome")}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-6xl mx-auto p-4 space-y-6">
        {/* Back Button */}
        <Button 
          variant="ghost" 
          onClick={() => navigate("/")}
          className="mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          {t("companyProfile.backToHome")}
        </Button>

        {/* Company Header */}
        <Card>
          <CardHeader>
            <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
              <div className="w-20 h-20 rounded-lg overflow-hidden bg-muted flex items-center justify-center">
                {company.company_logo_url ? (
                  <img 
                    src={company.company_logo_url} 
                    alt={company.company_name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <Building2 className="h-10 w-10 text-muted-foreground" />
                )}
              </div>
              
              <div className="flex-1 space-y-2">
                <CardTitle className="text-3xl">{company.company_name}</CardTitle>

                <div className="flex flex-wrap gap-4 text-sm text-muted-foreground mt-4">
                  <div className="flex items-center gap-1">
                    <Mail className="h-4 w-4" />
                    {company.email}
                  </div>
                  
                  {company.phone_number && (
                    <div className="flex items-center gap-1">
                      <Phone className="h-4 w-4" />
                      {company.phone_number}
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-4 pt-2">
                  <Badge variant="secondary">
                    {t("companyProfile.openJobsCount", { count: jobs.length })}
                  </Badge>
                  <span className="text-sm text-muted-foreground">
                    ከ {new Date(company.created_at).toLocaleDateString("am-ET")} ጀምሮ
                  </span>
                </div>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Jobs Section */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-foreground">
                  {t("companyProfile.openPositions")} ({jobs.length})
                </h2>
          </div>

          {jobs.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <Building2 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">{t("companyProfile.noOpenJobs")}</h3>
                <p className="text-muted-foreground">
                  {t("companyProfile.noOpenJobsDescription")}
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {jobs.map((job, index) => (
                <div
                  key={job.id}
                  className="animate-fade-in hover-scale"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <JobCard 
                    job={job} 
                    onViewDetails={() => handleJobClick(job.id)}
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CompanyProfile;