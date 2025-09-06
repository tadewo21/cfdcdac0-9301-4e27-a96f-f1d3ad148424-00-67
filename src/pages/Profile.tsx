import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";
import { PersonalInfoForm } from "@/components/profile/PersonalInfoForm";
import { ProfessionalInfoForm } from "@/components/profile/ProfessionalInfoForm";
import { NotificationPreferences } from "@/components/profile/NotificationPreferences";

import { EmployerProfile } from "@/components/profile/EmployerProfile";
import { useRoles } from "@/hooks/useRoles";

interface ProfileData {
  full_name: string;
  phone: string;
  user_type: string;
  email: string;
}

const Profile = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const { t } = useLanguage();
  const { refreshRole } = useRoles();
  const [profile, setProfile] = useState<ProfileData>({
    full_name: "",
    phone: "",
    user_type: "job_seeker",
    email: "",
  });

  useEffect(() => {
    if (user) {
      fetchProfile();
    }
  }, [user]);

  const fetchProfile = async () => {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("user_id", user!.id)
        .single();

      if (error && error.code !== "PGRST116") throw error;

      if (data) {
        setProfile({
          full_name: data.full_name || "",
          phone: data.phone || "",
          user_type: data.user_type || "job_seeker",
          email: "", // Profile table doesn't have email, it's in employers table
        });
      }
    } catch (error) {
      console.error("Error fetching profile:", error);
    }
  };

  const [companyData, setCompanyData] = useState({});

  const handleProfileUpdate = (updates: Partial<ProfileData>) => {
    setProfile(prev => ({ ...prev, ...updates }));
  };

  const handleCompanyUpdate = (updates: any) => {
    setCompanyData(updates);
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      // Save profile data
      const profileUpdateData = {
        full_name: profile.full_name,
        phone: profile.phone,
        user_type: profile.user_type,
      };

      const { error: profileError } = await supabase
        .from("profiles")
        .upsert({
          user_id: user!.id,
          ...profileUpdateData,
        });

      if (profileError) throw profileError;

      // Save company data if user is employer
      if (profile.user_type === 'employer' && companyData && Object.keys(companyData).length > 0 && (companyData as any).company_name) {
        const { error: employerError } = await supabase
          .from("employers")
          .upsert({
            company_name: (companyData as any).company_name,
            company_logo_url: (companyData as any).company_logo_url || null,
            email: user!.email,
            phone_number: profile.phone || null,
          });

        if (employerError) throw employerError;
      }

      toast({
        title: t("form.success"),
        description: t("profile.updated"),
      });
      
      // Refresh role if user_type was changed
      await refreshRole();
    } catch (error) {
      console.error("Error updating profile:", error);
      toast({
        title: t("messages.error"),
        description: t("profile.updateError"),
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">{t("manageJobs.loginRequired")}</h2>
          <Button onClick={() => navigate("/auth")}>
            {t("manageJobs.goToLogin")}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-2xl font-bold text-foreground">{t("profile.edit")}</h1>
        </div>

        {/* Personal Information */}
        <PersonalInfoForm 
          profile={profile} 
          onUpdate={handleProfileUpdate} 
        />

        {/* Job Seeker Features */}
        {profile.user_type === 'job_seeker' && (
          <NotificationPreferences />
        )}

        {/* Employer Features */}
        {profile.user_type === 'employer' && (
          <EmployerProfile onUpdate={handleCompanyUpdate} />
        )}

        <Separator />

        {/* Save Button */}
        <div className="flex justify-end">
          <Button onClick={handleSave} disabled={loading} size="lg">
            {loading ? t("profile.saving") : t("profile.saveProfile")}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Profile;