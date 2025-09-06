import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";  
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { useLanguage } from "@/contexts/LanguageContext";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Briefcase, Save } from "lucide-react";
import { CompanyLogoUpload } from "@/components/CompanyLogoUpload";

const cities = [
  "አዲስ አበባ",
  "አዲስ አበባ - ቦሌ",
  "አዲስ አበባ - ሜርካቶ",
  "አዲስ አበባ - ፒያሳ",
  "ባህር ዳር",
  "ድሬ ዳዋ",
  "ሐረር",
  "ሐወሳ",
  "ጅማ",
  "መቀሌ",
  "ናዝሬት/አዳማ",
];

const categories = [
  "መረጃ ቴክኖሎጂ (IT)",
  "ትምህርት",
  "ጤና",
  "ፋይናንስ እና ባንክ",
  "ንግድ እና ሽያጭ",
  "ማርኬቲንግ",
  "ኢንጂነሪንግ",
  "ህግ",
  "ሰብአዊ ሀብት (HR)",
  "ግንባታ",
  "መጓጓዣ",
  "ሆቴል እና ቱሪዝም",
  "አግሪክልቸር",
  "ሌላ"
];

const jobTypes = [
  "ሙሉ ሰዓት (Full-time)",
  "ሐፋሽ ሰዓት (Part-time)",
  "ለጊዜው (Contract)",
  "ሀውልተኛ (Freelance)",
  "ስልጠና (Internship)",
  "ርቀት (Remote)"
];

const salaryRanges = [
  "5,000 - 10,000 ብር",
  "10,000 - 15,000 ብር",
  "15,000 - 25,000 ብር",
  "25,000 - 35,000 ብር",
  "35,000 - 50,000 ብር",
  "50,000 - 75,000 ብር",
  "75,000 - 100,000 ብር",
  "100,000+ ብር",
  "ደመወዝ ለደራሻ"
];

const educationLevels = [
  "የ12ኛ ክፍል ማጠናቀቂያ",
  "ዲፕሎማ",
  "የመጀመሪያ ዲግሪ",
  "የሁለተኛ ዲግሪ (ማስተርስ)",
  "የሦስተኛ ዲግሪ (PhD)",
  "ሙያዊ ሰርተፊኬት",
  "የትምህርት ደረጃ አያስፈልግም"
];

const EditJob = () => {
  const { jobId } = useParams();
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    requirements: "",
    city: "",
    category: "",
    job_type: "",
    salary_range: "",
    benefits: "",
    company_culture: "",
    application_email: "",
    deadline: "",
    company_name: "",
    phone_number: "",
  });
  const [companyLogoUrl, setCompanyLogoUrl] = useState<string>("");
  const [existingLogoUrl, setExistingLogoUrl] = useState<string>("");
  
  const { user } = useAuth();
  const { toast } = useToast();
  const { t } = useLanguage();
  const navigate = useNavigate();

  useEffect(() => {
    if (jobId && user) {
      fetchJob();
    }
  }, [jobId, user]);

  const fetchJob = async () => {
    try {
      setInitialLoading(true);
      
      const { data, error } = await supabase
        .from("jobs")
        .select(`
          *,
          employers (
            company_name,
            company_logo_url,
            phone_number
          )
        `)
        .eq("id", jobId)
        .single();

      if (error) throw error;

      if (!data) {
        toast({
          title: t("messages.error"),
          description: t("editJob.fetchError"),
          variant: "destructive",
        });
        navigate("/manage-jobs");
        return;
      }

      // Check if user owns this job
      const { data: profile } = await supabase
        .from("profiles")
        .select("employer_id")
        .eq("user_id", user!.id)
        .single();

      if (profile?.employer_id !== data.employer_id) {
        toast({
          title: t("messages.error"),
          description: t("editJob.unauthorized"),
          variant: "destructive",
        });
        navigate("/manage-jobs");
        return;
      }

      // Format deadline for datetime-local input
      const deadline = data.deadline ? new Date(data.deadline).toISOString().slice(0, 16) : "";

      setFormData({
        title: data.title || "",
        description: data.description || "",
        requirements: data.requirements || "",
        city: data.city || "",
        category: data.category || "",
        job_type: data.job_type || "",
        salary_range: data.salary_range || "",
        
        benefits: data.benefits || "",
        company_culture: data.company_culture || "",
        application_email: data.application_email || "",
        deadline: deadline,
        company_name: data.employers?.company_name || "",
        phone_number: data.employers?.phone_number || "",
      });

      // Set company logo
      if (data.employers?.company_logo_url) {
        setExistingLogoUrl(data.employers.company_logo_url);
        setCompanyLogoUrl(data.employers.company_logo_url);
      }
    } catch (error: any) {
      toast({
        title: t("messages.error"),
        description: error.message,
        variant: "destructive",
      });
      navigate("/manage-jobs");
    } finally {
      setInitialLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    setLoading(true);

    try {
      // Update job with all fields except company info
      const { company_name, phone_number, ...jobData } = formData;
      const { error: jobError } = await supabase
        .from("jobs")
        .update({
          title: jobData.title,
          description: jobData.description,
          requirements: jobData.requirements,
          city: jobData.city,
          category: jobData.category,
          job_type: jobData.job_type,
          salary_range: jobData.salary_range,
          deadline: jobData.deadline,
        })
        .eq("id", jobId);

      if (jobError) throw jobError;

      // Update employer info if changed
      if (formData.company_name || formData.phone_number || companyLogoUrl !== existingLogoUrl) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("employer_id")
          .eq("user_id", user!.id)
          .single();

        if (profile?.employer_id) {
          const employerUpdate: any = {};
          if (formData.company_name) employerUpdate.company_name = formData.company_name;
          if (formData.phone_number) employerUpdate.phone_number = formData.phone_number;
          if (companyLogoUrl !== existingLogoUrl) employerUpdate.company_logo_url = companyLogoUrl || null;

          if (Object.keys(employerUpdate).length > 0) {
            const { error: employerError } = await supabase
              .from("employers")
              .update(employerUpdate)
              .eq("id", profile.employer_id);

            if (employerError) throw employerError;
          }
        }
      }

      toast({
        title: t("messages.success"),
        description: t("editJob.updateSuccess"),
      });

      navigate("/manage-jobs");
    } catch (error: any) {
      toast({
        title: t("messages.error"),
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="pt-6 text-center">
            <Briefcase className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h2 className="text-xl font-semibold mb-2">{t("manageJobs.loginRequired")}</h2>
            <p className="text-muted-foreground mb-4">
              {t("manageJobs.loginRequiredDesc")}
            </p>
            <Button onClick={() => navigate("/auth")}>
              {t("manageJobs.goToLogin")}
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (initialLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p>{t("common.loading")}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-4">
        <Button
          variant="ghost"
          onClick={() => navigate("/manage-jobs")}
          className="mb-6"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          {t("common.back")}
        </Button>

        <div className="max-w-2xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Briefcase className="h-5 w-5" />
                {t("job.edit")}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-8">
                {/* Job Information Section */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold border-b pb-2">{t("postJob.stepJobInfo")}</h3>
                  
                  <div>
                    <label className="text-sm font-medium">{t("postJob.jobTitle")} *</label>
                    <Input
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      placeholder={t("postJob.titlePlaceholder")}
                      required
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium">{t("postJob.jobDescription")} *</label>
                    <Textarea
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      placeholder={t("postJob.descriptionPlaceholder")}
                      rows={4}
                      required
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium">{t("postJob.jobRequirements")} *</label>
                    <Textarea
                      value={formData.requirements}
                      onChange={(e) => setFormData({ ...formData, requirements: e.target.value })}
                      placeholder={t("postJob.requirementsPlaceholder")}
                      rows={3}
                      required
                    />
                  </div>
                </div>

                {/* Job Details Section */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold border-b pb-2">{t("postJob.stepJobDetails")}</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="text-sm font-medium">{t("postJob.city")} *</label>
                      <Select
                        value={formData.city}
                        onValueChange={(value) => setFormData({ ...formData, city: value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder={t("postJob.selectCity")} />
                        </SelectTrigger>
                        <SelectContent>
                          {cities.map((city) => (
                            <SelectItem key={city} value={city}>
                              {city}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <label className="text-sm font-medium">{t("postJob.category")} *</label>
                      <Select
                        value={formData.category}
                        onValueChange={(value) => setFormData({ ...formData, category: value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder={t("postJob.selectCategory")} />
                        </SelectTrigger>
                        <SelectContent>
                          {categories.map((category) => (
                            <SelectItem key={category} value={category}>
                              {category}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <label className="text-sm font-medium">{t("postJob.jobType")} *</label>
                      <Select
                        value={formData.job_type}
                        onValueChange={(value) => setFormData({ ...formData, job_type: value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder={t("postJob.selectJobType")} />
                        </SelectTrigger>
                        <SelectContent>
                          {jobTypes.map((type) => (
                            <SelectItem key={type} value={type}>
                              {type}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div>
                    <div>
                      <label className="text-sm font-medium">{t("postJob.salaryRange")} *</label>
                      <Input
                        value={formData.salary_range}
                        onChange={(e) => setFormData({ ...formData, salary_range: e.target.value })}
                        placeholder={t("postJob.salaryPlaceholder")}
                        required
                      />
                    </div>
                  </div>
                </div>

                {/* Company Information Section */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold border-b pb-2">{t("postJob.stepCompanyInfo")}</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium">{t("postJob.companyName")} *</label>
                      <Input
                        value={formData.company_name}
                        onChange={(e) => setFormData({ ...formData, company_name: e.target.value })}
                        placeholder={t("postJob.companyName")}
                        required
                      />
                    </div>

                    <div>
                      <label className="text-sm font-medium">{t("postJob.phoneNumber")}</label>
                      <Input
                        value={formData.phone_number}
                        onChange={(e) => setFormData({ ...formData, phone_number: e.target.value })}
                        placeholder={t("postJob.phonePlaceholder")}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium">{t("postJob.benefits")}</label>
                    <Textarea
                      value={formData.benefits}
                      onChange={(e) => setFormData({ ...formData, benefits: e.target.value })}
                      placeholder={t("postJob.benefitsPlaceholder")}
                      rows={3}
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium">{t("postJob.companyCulture")}</label>
                    <Textarea
                      value={formData.company_culture}
                      onChange={(e) => setFormData({ ...formData, company_culture: e.target.value })}
                      placeholder={t("postJob.companyCulturePlaceholder")}
                      rows={3}
                    />
                  </div>

                  {/* Company Logo Upload */}
                  <CompanyLogoUpload
                    companyName={formData.company_name}
                    existingLogoUrl={existingLogoUrl}
                    onLogoUploaded={setCompanyLogoUrl}
                  />
                </div>

                {/* Application Information Section */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold border-b pb-2">{t("postJob.stepApplicationMethod")}</h3>
                  
                  <div>
                    <label className="text-sm font-medium">{t("postJob.applicationMethod")} *</label>
                    <Input
                      type="email"
                      value={formData.application_email}
                      onChange={(e) => setFormData({ ...formData, application_email: e.target.value })}
                      placeholder={t("postJob.applicationMethodPlaceholder")}
                      required
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium">{t("postJob.deadlineField")} *</label>
                    <Input
                      type="datetime-local"
                      value={formData.deadline}
                      onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                      required
                    />
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-4 pt-4 border-t">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => navigate("/manage-jobs")}
                    className="flex-1"
                  >
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    {t("manageJobs.cancel")}
                  </Button>
                  <Button type="submit" className="flex-1" disabled={loading}>
                    <Save className="h-4 w-4 mr-2" />
                    {loading ? t("postJob.submitting") : t("job.save")}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default EditJob;