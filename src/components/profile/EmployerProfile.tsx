import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useLanguage } from "@/contexts/LanguageContext";
import { Building, Globe, FileText, Save } from "lucide-react";
import { CompanyLogoUpload } from "@/components/CompanyLogoUpload";
import { useToast } from "@/hooks/use-toast";

interface EmployerProfileProps {
  onUpdate: (data: any) => void;
}

export const EmployerProfile = ({ onUpdate }: EmployerProfileProps) => {
  const { user } = useAuth();
  const { language } = useLanguage();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [userProfile, setUserProfile] = useState<any>(null);
  
  // Company profile data
  const [companyData, setCompanyData] = useState({
    company_name: "",
    company_description: "",
    company_website: "",
    company_address: "",
    industry: "",
    company_size: "",
    company_logo_url: "",
  });

  useEffect(() => {
    if (user) {
      loadProfile();
    }
  }, [user]);

  const loadProfile = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      // Check user profile first - use maybeSingle to avoid errors
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();

      if (profileError) {
        console.error("Error loading profile:", profileError);
        return;
      }

      if (profile) {
        setUserProfile(profile);
        
        // Only load for employers
        if (profile.user_type === 'employer') {
          // Load employer/company data with all fields
          const { data: employerData, error: employerError } = await supabase
            .from("employers")
            .select("company_name, email, phone_number, company_logo_url, company_description, company_website, company_address, industry, company_size")
            .eq("email", user.email)
            .maybeSingle();

          if (employerError) {
            console.error("Error loading employer data:", employerError);
          } else if (employerData) {
            const newCompanyData = {
              company_name: employerData.company_name || "",
              company_description: employerData.company_description || "",
              company_website: employerData.company_website || "",
              company_address: employerData.company_address || "",
              industry: employerData.industry || "",
              company_size: employerData.company_size || "",
              company_logo_url: employerData.company_logo_url || "",
            };
            setCompanyData(newCompanyData);
            onUpdate(newCompanyData);
          }
        }
      } else {
        // Create profile if it doesn't exist
        const { data: newProfile, error: createError } = await supabase
          .from("profiles")
          .upsert({
            user_id: user.id,
            user_type: "employer",
            full_name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'User',
            email: user.email!,
          }, {
            onConflict: 'user_id'
          })
          .select()
          .single();

        if (createError) {
          console.error("Error creating profile:", createError);
        } else {
          setUserProfile(newProfile);
        }
      }
    } catch (error) {
      console.error("Error loading profile:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    const updatedData = { ...companyData, [field]: value };
    setCompanyData(updatedData);
    onUpdate(updatedData);
  };

  // Debounced save function using useCallback
  const debouncedSave = useCallback(
    (() => {
      let timeoutId: NodeJS.Timeout;
      return (data: typeof companyData) => {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => saveCompanyData(data), 1000); // Wait 1 second after user stops typing
      };
    })(),
    []
  );

  const saveCompanyData = async (data: typeof companyData) => {
    if (!user || !data.company_name || saving) return;

    try {
      setSaving(true);
      
      // Use upsert to handle both insert and update in one operation
      const { error } = await supabase
        .from("employers")
        .upsert({
          company_name: data.company_name,
          email: user.email!,
          company_description: data.company_description || null,
          company_website: data.company_website || null,
          company_address: data.company_address || null,
          industry: data.industry || null,
          company_size: data.company_size || null,
          company_logo_url: data.company_logo_url || null,
        }, {
          onConflict: 'email'
        });

      if (error) {
        console.error("Supabase error:", error);
        throw error;
      }

      toast({
        title: language === 'am' ? "ተመዝግቧል" : "Saved",
        description: language === 'am' ? "የኩባንያ መረጃ በተሳካ ሁኔታ ተመዝግቧል" : "Company information saved successfully",
      });
    } catch (error) {
      console.error("Error saving company data:", error);
      toast({
        title: language === 'am' ? "ስህተት" : "Error",
        description: language === 'am' ? "የኩባንያ መረጃ ማስቀመጥ አልተቻለም" : "Could not save company information",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleManualSave = () => {
    saveCompanyData(companyData);
  };

  // Don't show for job seekers
  if (userProfile && userProfile.user_type !== 'employer') {
    return null;
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="py-8">
          <div className="flex items-center justify-center">
            <div className="text-sm text-muted-foreground">
              {language === 'am' ? "በመጫን ላይ..." : "Loading..."}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Building className="h-5 w-5" />
          {language === 'am' ? "የኩባንያ መረጃ" : "Company Profile"}
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          {language === 'am' 
            ? "የኩባንያዎን መረጃ ያዘምኑ እና ለስራ ፈላጊዎች ይህን መረጃ ያሳዩ"
            : "Update your company information and showcase it to job seekers"
          }
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Company Name */}
        <div className="space-y-2">
          <Label htmlFor="company_name" className="flex items-center gap-2">
            <Building className="h-4 w-4" />
            {language === 'am' ? "የኩባንያ ስም" : "Company Name"} *
          </Label>
          <Input
            id="company_name"
            value={companyData.company_name}
          onChange={(e) => {
            handleInputChange("company_name", e.target.value);
            debouncedSave({ ...companyData, company_name: e.target.value });
          }}
            placeholder={language === 'am' ? "የኩባንያዎን ስም ያስገቡ" : "Enter your company name"}
            required
          />
        </div>

        {/* Company Logo */}
        <CompanyLogoUpload
          companyName={companyData.company_name}
          existingLogoUrl={companyData.company_logo_url}
          onLogoUploaded={(url) => {
            handleInputChange("company_logo_url", url);
            saveCompanyData({ ...companyData, company_logo_url: url });
          }}
        />

        {/* Company Description */}
        <div className="space-y-2">
          <Label htmlFor="company_description" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            {language === 'am' ? "የኩባንያ መግለጫ" : "Company Description"}
          </Label>
          <Textarea
            id="company_description"
            value={companyData.company_description}
          onChange={(e) => {
            handleInputChange("company_description", e.target.value);
            debouncedSave({ ...companyData, company_description: e.target.value });
          }}
            placeholder={language === 'am' 
              ? "ስለ ኩባንያዎ ይጻፉ..." 
              : "Tell us about your company..."
            }
            rows={4}
          />
        </div>

        {/* Industry */}
        <div className="space-y-2">
          <Label htmlFor="industry">
            {language === 'am' ? "ኢንዱስትሪ" : "Industry"}
          </Label>
          <Input
            id="industry"
            value={companyData.industry}
          onChange={(e) => {
            handleInputChange("industry", e.target.value);
            debouncedSave({ ...companyData, industry: e.target.value });
          }}
            placeholder={language === 'am' ? "ምሳሌ: ቴክኖሎጂ, ገንዘብ, ጤና" : "e.g., Technology, Finance, Healthcare"}
          />
        </div>

        {/* Company Size */}
        <div className="space-y-2">
          <Label htmlFor="company_size">
            {language === 'am' ? "የኩባንያ መጠን" : "Company Size"}
          </Label>
          <Input
            id="company_size"
            value={companyData.company_size}
          onChange={(e) => {
            handleInputChange("company_size", e.target.value);
            debouncedSave({ ...companyData, company_size: e.target.value });
          }}
            placeholder={language === 'am' ? "ምሳሌ: 1-10, 11-50, 51-200" : "e.g., 1-10, 11-50, 51-200"}
          />
        </div>

        {/* Website */}
        <div className="space-y-2">
          <Label htmlFor="company_website" className="flex items-center gap-2">
            <Globe className="h-4 w-4" />
            {language === 'am' ? "ድህረ ገጽ" : "Company Website"}
          </Label>
          <Input
            id="company_website"
            type="url"
            value={companyData.company_website}
          onChange={(e) => {
            handleInputChange("company_website", e.target.value);
            debouncedSave({ ...companyData, company_website: e.target.value });
          }}
            placeholder="https://www.company.com"
          />
        </div>

        {/* Address */}
        <div className="space-y-2">
          <Label htmlFor="company_address">
            {language === 'am' ? "አድራሻ" : "Company Address"}
          </Label>
          <Textarea
            id="company_address"
            value={companyData.company_address}
          onChange={(e) => {
            handleInputChange("company_address", e.target.value);
            debouncedSave({ ...companyData, company_address: e.target.value });
          }}
            placeholder={language === 'am' 
              ? "የኩባንያዎን አድራሻ ያስገቡ..." 
              : "Enter your company address..."
            }
            rows={2}
          />
        </div>
        
      </CardContent>
    </Card>
  );
};