import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Settings, Upload, FileText } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";

interface ProfileData {
  experience_years: number;
  skills: string[];
  cv_url: string;
}

interface ProfessionalInfoFormProps {
  profile: ProfileData;
  onUpdate: (updates: Partial<ProfileData>) => void;
  userId: string;
}

export function ProfessionalInfoForm({ profile, onUpdate, userId }: ProfessionalInfoFormProps) {
  const { t } = useLanguage();
  const { toast } = useToast();
  const [uploading, setUploading] = useState(false);

  const handleSkillsChange = (value: string) => {
    const skillsArray = value.split(',').map(skill => skill.trim()).filter(skill => skill);
    onUpdate({ skills: skillsArray });
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    if (!allowedTypes.includes(file.type)) {
      toast({
        title: t("messages.error"),
        description: t("profile.supportedFileTypes"),
        variant: "destructive",
      });
      return;
    }

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: t("messages.error"),
        description: t("profile.maxFileSize"),
        variant: "destructive",
      });
      return;
    }

    setUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${userId}/cv.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('user-files')
        .upload(fileName, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('user-files')
        .getPublicUrl(fileName);

      onUpdate({ cv_url: publicUrl });

      toast({
        title: t("messages.success"),
        description: t("profile.cvUploadSuccess"),
      });
    } catch (error) {
      console.error("Error uploading file:", error);
      toast({
        title: t("messages.error"), 
        description: t("profile.cvUploadError"),
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings className="h-5 w-5" />
          {t("profile.professionalInfo")}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label htmlFor="experience">{t("profile.workExperience")}</Label>
          <Input
            id="experience"
            type="number"
            min="0"
            value={profile.experience_years}
            onChange={(e) => onUpdate({ experience_years: parseInt(e.target.value) || 0 })}
            placeholder="0"
          />
        </div>

        <div>
          <Label htmlFor="skills">{t("profile.skills")}</Label>
          <Input
            id="skills"
            value={profile.skills.join(', ')}
            onChange={(e) => handleSkillsChange(e.target.value)}
            placeholder={t("profile.skillsPlaceholder")}
          />
        </div>

        <div>
          <Label htmlFor="cv">{t("profile.cvFile")}</Label>
          <div className="flex items-center gap-2">
            <Input
              id="cv"
              type="file"
              accept=".pdf,.doc,.docx"
              onChange={handleFileUpload}
              disabled={uploading}
            />
            <Button variant="outline" size="sm" disabled={uploading}>
              <Upload className="h-4 w-4 mr-2" />
              {uploading ? t("profile.uploading") : t("profile.upload")}
            </Button>
          </div>
          {profile.cv_url && (
            <div className="flex items-center gap-2 mt-2 text-sm text-muted-foreground">
              <FileText className="h-4 w-4" />
              <span>{t("profile.cvUploaded")}</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}