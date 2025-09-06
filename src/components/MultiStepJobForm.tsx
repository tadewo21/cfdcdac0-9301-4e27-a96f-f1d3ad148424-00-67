import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { ChevronLeft, ChevronRight, Briefcase, MapPin, Building, Mail } from "lucide-react";
import { CompanySelector } from "@/components/CompanySelector";
import { CompanyLogoUpload } from "@/components/CompanyLogoUpload";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";

// Create translation-based arrays
const getCities = (t: any, language: string) => language === "am" ? [
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
] : [
  "Addis Ababa",
  "Addis Ababa - Bole",
  "Addis Ababa - Mercato",
  "Addis Ababa - Piazza",
  "Bahir Dar",
  "Dire Dawa",
  "Harar",
  "Hawassa",
  "Jimma",
  "Mekelle",
  "Nazret/Adama",
];

const getCategories = (t: any) => [
  t("category.it"),
  t("category.education"),
  t("category.health"),
  t("category.finance"),
  t("category.business"),
  t("category.marketing"),
  t("category.engineering"),
  t("category.legal"),
  t("category.hr"),
  t("category.construction"),
  t("category.transport"),
  t("category.hotel"),
  t("category.agriculture"),
  t("category.other")
];

const getJobTypes = (t: any) => [
  t("jobType.fullTime"),
  t("jobType.partTime"),
  t("jobType.contract"),
  t("jobType.freelance"),
  t("jobType.internship"),
  t("jobType.remote")
];

const getSalaryRanges = (t: any) => [
  t("salary.5000_10000"),
  t("salary.10000_15000"),
  t("salary.15000_25000"),
  t("salary.25000_35000"),
  t("salary.35000_50000"),
  t("salary.50000_75000"),
  t("salary.75000_100000"),
  t("salary.100000plus"),
  t("salary.negotiable")
];

const getEducationLevels = (t: any) => [
  t("education.grade12"),
  t("education.diploma"),
  t("education.bachelor"),
  t("education.master"),
  t("education.phd"),
  t("education.certificate"),
  t("education.noRequirement")
];

interface FormData {
  title: string;
  description: string;
  requirements: string;
  city: string;
  category: string;
  job_type: string;
  salary_range: string;
  education_level: string;
  benefits: string;
  company_culture: string;
  application_method: string;
  deadline: string;
  company_name: string;
  phone_number: string;
}

interface MultiStepJobFormProps {
  formData: FormData;
  setFormData: (data: FormData) => void;
  onSubmit: (e: React.FormEvent, logoUrl?: string) => void;
  loading: boolean;
}

const MultiStepJobForm = ({ formData, setFormData, onSubmit, loading }: MultiStepJobFormProps) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [companyLogoUrl, setCompanyLogoUrl] = useState<string>("");
  const [existingLogoUrl, setExistingLogoUrl] = useState<string>("");
  const [companyProfileLoaded, setCompanyProfileLoaded] = useState(false);
  const { t, language } = useLanguage();
  const { user } = useAuth();
  const totalSteps = 4;

  // Get translated arrays
  const cities = getCities(t, language);
  const categories = getCategories(t);
  const jobTypes = getJobTypes(t);
  const educationLevels = getEducationLevels(t);

  // Load employer's company profile data on component mount
  useEffect(() => {
    const loadCompanyProfile = async () => {
      if (!user || companyProfileLoaded) return;

      try {
        // Get user's complete employer profile with all fields
        const { data: employerData } = await supabase
          .from("employers")
          .select("company_name, phone_number, company_logo_url, company_description, company_website, company_address, industry, company_size")
          .eq("email", user.email!)
          .maybeSingle();

        if (employerData) {
          // Auto-populate form with all saved company data
          setFormData({
            ...formData,
            company_name: employerData.company_name || formData.company_name,
            phone_number: employerData.phone_number || formData.phone_number,
            // Auto-populate benefits and company culture from profile
            benefits: formData.benefits || `${employerData.industry ? `Industry: ${employerData.industry}` : ''}${employerData.company_size ? ` | Company Size: ${employerData.company_size}` : ''}${employerData.company_website ? ` | Website: ${employerData.company_website}` : ''}`.trim(),
            company_culture: formData.company_culture || employerData.company_description || "",
          });

          if (employerData.company_logo_url) {
            setExistingLogoUrl(employerData.company_logo_url);
            setCompanyLogoUrl(employerData.company_logo_url);
          }
        }
        setCompanyProfileLoaded(true);
      } catch (error) {
        console.error("Error loading company profile:", error);
        setCompanyProfileLoaded(true);
      }
    };

    loadCompanyProfile();
  }, [user, companyProfileLoaded]);

  // Check for existing company logo and data when company name changes (fallback)
  useEffect(() => {
    const checkExistingCompanyData = async () => {
      if (formData.company_name && !companyLogoUrl && companyProfileLoaded) {
        const { data } = await supabase
          .from("employers")
          .select("company_logo_url, phone_number, company_description, industry, company_size, company_website")
          .eq("company_name", formData.company_name)
          .maybeSingle();
        
        if (data) {
          // Auto-populate any missing data from existing company record
          if (data.company_logo_url) {
            setExistingLogoUrl(data.company_logo_url);
            setCompanyLogoUrl(data.company_logo_url);
          }
          
          // Update form data with existing company information if not already filled
          const updatedFormData = {
            ...formData,
            phone_number: formData.phone_number || data.phone_number || "",
            benefits: formData.benefits || `${data.industry ? `Industry: ${data.industry}` : ''}${data.company_size ? ` | Company Size: ${data.company_size}` : ''}${data.company_website ? ` | Website: ${data.company_website}` : ''}`.trim(),
            company_culture: formData.company_culture || data.company_description || "",
          };
          setFormData(updatedFormData);
        }
      }
    };
    checkExistingCompanyData();
  }, [formData.company_name, companyLogoUrl, companyProfileLoaded]);

  const stepTitles = [
    t("postJob.stepJobInfo"),
    t("postJob.stepJobDetails"),
    t("postJob.stepCompanyInfo"),
    t("postJob.stepApplicationMethod")
  ];

  const stepIcons = [Briefcase, MapPin, Building, Mail];

  const isStepValid = (step: number): boolean => {
    switch (step) {
      case 1:
        return !!(formData.title && formData.description && formData.requirements);
      case 2:
        return !!(formData.city && formData.category && formData.job_type && formData.salary_range && formData.education_level);
      case 3:
        return !!(formData.company_name);
      case 4:
        return !!(formData.application_method && formData.deadline);
      default:
        return false;
    }
  };

  const nextStep = () => {
    if (currentStep < totalSteps && isStepValid(currentStep)) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
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
        );

      case 2:
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

              <div>
                <label className="text-sm font-medium">{t("postJob.educationLevel")} *</label>
                <Select
                  value={formData.education_level}
                  onValueChange={(value) => setFormData({ ...formData, education_level: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={t("postJob.selectEducationLevel")} />
                  </SelectTrigger>
                  <SelectContent>
                    {educationLevels.map((level) => (
                      <SelectItem key={level} value={level}>
                        {level}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

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
        );

      case 3:
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">{t("postJob.companyName")} *</label>
            <CompanySelector
              value={formData.company_name}
              onChange={(value) => setFormData({ ...formData, company_name: value })}
              onCompanySelected={(companyData) => {
                if (companyData.logo) {
                  setExistingLogoUrl(companyData.logo);
                  setCompanyLogoUrl(companyData.logo);
                } else {
                  setExistingLogoUrl("");
                  setCompanyLogoUrl("");
                }
              }}
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
        );

      case 4:
        return (
          <div className="space-y-6">
            <div>
              <label className="text-sm font-medium">{t("postJob.applicationMethod")} *</label>
              <Input
                value={formData.application_method}
                onChange={(e) => setFormData({ ...formData, application_method: e.target.value })}
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
        );

      default:
        return null;
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            {React.createElement(stepIcons[currentStep - 1], { className: "h-5 w-5" })}
            {stepTitles[currentStep - 1]}
          </CardTitle>
          <div className="text-sm text-muted-foreground">
            {currentStep} / {totalSteps}
          </div>
        </div>
        
        {/* Progress Bar */}
        <div className="w-full bg-secondary rounded-full h-2">
          <div 
            className="bg-primary h-2 rounded-full transition-all duration-300"
            style={{ width: `${(currentStep / totalSteps) * 100}%` }}
          />
        </div>
      </CardHeader>
      
      <CardContent>
        <form onSubmit={currentStep === totalSteps ? (e) => onSubmit(e, companyLogoUrl) : (e) => e.preventDefault()}>
          {renderStep()}
          
          <div className="flex justify-between mt-8">
            <Button
              type="button"
              variant="outline"
              onClick={prevStep}
              disabled={currentStep === 1}
            >
              <ChevronLeft className="h-4 w-4 mr-2" />
              {t("postJob.previous")}
            </Button>
            
            {currentStep < totalSteps ? (
              <Button
                type="button"
                onClick={nextStep}
                disabled={!isStepValid(currentStep)}
              >
                {t("postJob.next")}
                <ChevronRight className="h-4 w-4 ml-2" />
              </Button>
            ) : (
              <Button type="submit" disabled={loading || !isStepValid(currentStep)}>
                {loading ? t("postJob.submitting") : t("postJob.submitJob")}
              </Button>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default MultiStepJobForm;