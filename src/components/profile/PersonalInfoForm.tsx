import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { User } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

interface ProfileData {
  full_name: string;
  phone: string;
  user_type: string;
}

interface PersonalInfoFormProps {
  profile: ProfileData;
  onUpdate: (updates: Partial<ProfileData>) => void;
}

export function PersonalInfoForm({ profile, onUpdate }: PersonalInfoFormProps) {
  const { t } = useLanguage();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <User className="h-5 w-5" />
          {t("profile.personalInfo")}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <Label htmlFor="fullName">{t("profile.fullName")}</Label>
            <Input
              id="fullName"
              value={profile.full_name}
              onChange={(e) => onUpdate({ full_name: e.target.value })}
              placeholder={t("profile.enterFullName")}
            />
          </div>
          <div>
            <Label htmlFor="phone">{t("profile.phoneNumber")}</Label>
            <Input
              id="phone"
              value={profile.phone}
              onChange={(e) => onUpdate({ phone: e.target.value })}
              placeholder="+251911123456"
            />
          </div>
        </div>

        <div>
          <Label htmlFor="userType">{t("profile.accountType")}</Label>
          <Select value={profile.user_type} onValueChange={(value) => onUpdate({ user_type: value })}>
            <SelectTrigger>
              <SelectValue placeholder={t("profile.selectAccountType")} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="job_seeker">{t("auth.userTypeSeeker")}</SelectItem>
              <SelectItem value="employer">{t("auth.userTypeEmployer")}</SelectItem>
              <SelectItem value="admin">{t("role.admin")}</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardContent>
    </Card>
  );
}