import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Bell, Plus, X } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useToast } from "@/hooks/use-toast";

interface ProfileData {
  email: string;
  notification_enabled?: boolean;
  email_notifications?: boolean;
  telegram_notifications?: boolean;
  notification_categories?: string[];
  notification_locations?: string[];
  notification_keywords?: string[];
  notification_job_types?: string[];
  notification_experience_levels?: string[];
}

interface NotificationSettingsFormProps {
  profile: ProfileData;
  onUpdate: (updates: Partial<ProfileData>) => void;
}

export function NotificationSettingsForm({ profile, onUpdate }: NotificationSettingsFormProps) {
  const { t } = useLanguage();
  const { toast } = useToast();
  const [newKeyword, setNewKeyword] = useState("");
  const [newLocation, setNewLocation] = useState("");

  const jobCategories = [
    "Technology", "Finance", "Healthcare", "Education", "Marketing", 
    "Sales", "Engineering", "Design", "Management", "Customer Service"
  ];

  const jobTypes = ["Full-time", "Part-time", "Contract", "Freelance", "Remote", "Internship"];
  const experienceLevels = ["Entry Level", "Mid Level", "Senior Level", "Manager", "Executive"];

  const addKeyword = () => {
    if (newKeyword.trim()) {
      const currentKeywords = profile.notification_keywords || [];
      if (!currentKeywords.includes(newKeyword.trim())) {
        onUpdate({ 
          notification_keywords: [...currentKeywords, newKeyword.trim()] 
        });
        setNewKeyword("");
      }
    }
  };

  const removeKeyword = (keyword: string) => {
    const currentKeywords = profile.notification_keywords || [];
    onUpdate({ 
      notification_keywords: currentKeywords.filter(k => k !== keyword) 
    });
  };

  const addLocation = () => {
    if (newLocation.trim()) {
      const currentLocations = profile.notification_locations || [];
      if (!currentLocations.includes(newLocation.trim())) {
        onUpdate({ 
          notification_locations: [...currentLocations, newLocation.trim()] 
        });
        setNewLocation("");
      }
    }
  };

  const removeLocation = (location: string) => {
    const currentLocations = profile.notification_locations || [];
    onUpdate({ 
      notification_locations: currentLocations.filter(l => l !== location) 
    });
  };

  const toggleCategory = (category: string) => {
    const currentCategories = profile.notification_categories || [];
    if (currentCategories.includes(category)) {
      onUpdate({ 
        notification_categories: currentCategories.filter(c => c !== category) 
      });
    } else {
      onUpdate({ 
        notification_categories: [...currentCategories, category] 
      });
    }
  };

  const toggleJobType = (jobType: string) => {
    const currentJobTypes = profile.notification_job_types || [];
    if (currentJobTypes.includes(jobType)) {
      onUpdate({ 
        notification_job_types: currentJobTypes.filter(jt => jt !== jobType) 
      });
    } else {
      onUpdate({ 
        notification_job_types: [...currentJobTypes, jobType] 
      });
    }
  };

  const toggleExperienceLevel = (level: string) => {
    const currentLevels = profile.notification_experience_levels || [];
    if (currentLevels.includes(level)) {
      onUpdate({ 
        notification_experience_levels: currentLevels.filter(l => l !== level) 
      });
    } else {
      onUpdate({ 
        notification_experience_levels: [...currentLevels, level] 
      });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bell className="h-5 w-5" />
          የማስታወቂያ ምርጫዎች (Notification Preferences)
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Basic Email Settings */}
        <div>
          <Label htmlFor="email">የኢሜል አድራሻ (Email Address)</Label>
          <Input
            id="email"
            type="email"
            value={profile.email || ''}
            onChange={(e) => onUpdate({ email: e.target.value })}
            placeholder="your.email@example.com"
          />
          <p className="text-sm text-muted-foreground mt-1">
            የስራ ማስታወቂያዎች በኢሜል ይላካሉ
          </p>
        </div>

        {/* Notification Toggles */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label>ማስታወቂያዎች ንቁ ማድረግ (Enable Notifications)</Label>
              <p className="text-sm text-muted-foreground">
                ሁሉንም ማስታወቂያዎች ማብራት/ማጥፋት
              </p>
            </div>
            <Switch
              checked={profile.notification_enabled ?? true}
              onCheckedChange={(checked) => onUpdate({ notification_enabled: checked })}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label>የኢሜል ማስታወቂያዎች (Email Notifications)</Label>
              <p className="text-sm text-muted-foreground">
                ማስታወቂያዎች በኢሜል ይላካሉ
              </p>
            </div>
            <Switch
              checked={profile.email_notifications ?? true}
              onCheckedChange={(checked) => onUpdate({ email_notifications: checked })}
              disabled={!profile.notification_enabled}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label>የቴሌግራም ማስታወቂያዎች (Telegram Notifications)</Label>
              <p className="text-sm text-muted-foreground">
                ማስታወቂያዎች በቴሌግራም ይላካሉ
              </p>
            </div>
            <Switch
              checked={profile.telegram_notifications ?? true}
              onCheckedChange={(checked) => onUpdate({ telegram_notifications: checked })}
              disabled={!profile.notification_enabled}
            />
          </div>
        </div>

        {/* Job Categories */}
        <div>
          <Label>የስራ ዓይነቶች (Job Categories)</Label>
          <p className="text-sm text-muted-foreground mb-3">
            ስለመነሱት የስራ ዓይነቶች ማስታወቂያ ይደርስዎታል
          </p>
          <div className="flex flex-wrap gap-2">
            {jobCategories.map((category) => (
              <Badge
                key={category}
                variant={(profile.notification_categories || []).includes(category) ? "default" : "outline"}
                className="cursor-pointer"
                onClick={() => toggleCategory(category)}
              >
                {category}
              </Badge>
            ))}
          </div>
        </div>

        {/* Job Types */}
        <div>
          <Label>የስራ ዓይነቶች (Job Types)</Label>
          <p className="text-sm text-muted-foreground mb-3">
            ስለሚፈልጓቸው የስራ ዓይነቶች ማስታወቂያ ይደርስዎታል
          </p>
          <div className="flex flex-wrap gap-2">
            {jobTypes.map((jobType) => (
              <Badge
                key={jobType}
                variant={(profile.notification_job_types || []).includes(jobType) ? "default" : "outline"}
                className="cursor-pointer"
                onClick={() => toggleJobType(jobType)}
              >
                {jobType}
              </Badge>
            ))}
          </div>
        </div>

        {/* Experience Levels */}
        <div>
          <Label>የልምድ ደረጃዎች (Experience Levels)</Label>
          <p className="text-sm text-muted-foreground mb-3">
            ከልምድ ደረጃዎ ጋር የሚመሳሰሉ ስራዎች
          </p>
          <div className="flex flex-wrap gap-2">
            {experienceLevels.map((level) => (
              <Badge
                key={level}
                variant={(profile.notification_experience_levels || []).includes(level) ? "default" : "outline"}
                className="cursor-pointer"
                onClick={() => toggleExperienceLevel(level)}
              >
                {level}
              </Badge>
            ))}
          </div>
        </div>

        {/* Keywords */}
        <div>
          <Label>ቁልል ቃላት (Keywords)</Label>
          <p className="text-sm text-muted-foreground mb-3">
            በስራ ርዕስ ወይም መግለጫ ውስጥ እነዚህ ቃላት ካሉ ማስታወቂያ ይደርስዎታል
          </p>
          <div className="flex gap-2 mb-2">
            <Input
              placeholder="ቁልል ቃል ያክሉ (Add keyword)"
              value={newKeyword}
              onChange={(e) => setNewKeyword(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && addKeyword()}
            />
            <Button onClick={addKeyword} size="sm">
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          <div className="flex flex-wrap gap-2">
            {(profile.notification_keywords || []).map((keyword) => (
              <Badge key={keyword} variant="secondary" className="flex items-center gap-1">
                {keyword}
                <X 
                  className="h-3 w-3 cursor-pointer" 
                  onClick={() => removeKeyword(keyword)}
                />
              </Badge>
            ))}
          </div>
        </div>

        {/* Locations */}
        <div>
          <Label>አካባቢዎች (Locations)</Label>
          <p className="text-sm text-muted-foreground mb-3">
            በእነዚህ አካባቢዎች ስራዎች ሲወጡ ማስታወቂያ ይደርስዎታል
          </p>
          <div className="flex gap-2 mb-2">
            <Input
              placeholder="አካባቢ ያክሉ (Add location)"
              value={newLocation}
              onChange={(e) => setNewLocation(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && addLocation()}
            />
            <Button onClick={addLocation} size="sm">
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          <div className="flex flex-wrap gap-2">
            {(profile.notification_locations || []).map((location) => (
              <Badge key={location} variant="secondary" className="flex items-center gap-1">
                {location}
                <X 
                  className="h-3 w-3 cursor-pointer" 
                  onClick={() => removeLocation(location)}
                />
              </Badge>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}