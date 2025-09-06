import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useLanguage } from "@/contexts/LanguageContext";
import { X, Plus, Bell, Mail, MessageCircle, Settings, MapPin, Briefcase, Target } from "lucide-react";

const JOB_CATEGORIES = [
  "Technology",
  "Finance",
  "Healthcare",
  "Education",
  "Manufacturing",
  "Retail",
  "Hospitality",
  "Construction",
  "Transportation",
  "Government",
  "NGO",
  "Agriculture",
  "Other"
];

const JOB_TYPES = [
  "Full-time",
  "Part-time",
  "Contract",
  "Internship",
  "Remote",
  "Hybrid"
];

const EXPERIENCE_LEVELS = [
  "Entry Level",
  "Mid Level",
  "Senior",
  "Executive",
  "No Experience Required"
];

const ETHIOPIAN_CITIES = [
  "Addis Ababa",
  "Hawassa", 
  "Bahir Dar",
  "Mekelle",
  "Dire Dawa",
  "Adama",
  "Gondar",
  "Dessie",
  "Jimma",
  "Harar"
];

export const NotificationPreferences = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const { t, language } = useLanguage();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  
  // Notification settings
  const [notificationEnabled, setNotificationEnabled] = useState(true);
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [telegramNotifications, setTelegramNotifications] = useState(false);
  
  // Preferences
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedLocations, setSelectedLocations] = useState<string[]>([]);
  const [keywords, setKeywords] = useState<string[]>([]);
  const [selectedJobTypes, setSelectedJobTypes] = useState<string[]>([]);
  const [selectedExperienceLevels, setSelectedExperienceLevels] = useState<string[]>([]);
  
  // Input states
  const [locationInput, setLocationInput] = useState("");
  const [keywordInput, setKeywordInput] = useState("");

  useEffect(() => {
    if (user) {
      fetchPreferences();
    }
  }, [user]);

  const fetchPreferences = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("user_id", user.id)
        .single();

      if (error && error.code !== "PGRST116") throw error;

      if (data) {
        const prefs = data as any;
        setNotificationEnabled(prefs.notification_enabled ?? true);
        setEmailNotifications(prefs.email_notifications ?? true);
        setTelegramNotifications(prefs.telegram_notifications ?? false);
        setSelectedCategories(prefs.notification_categories || []);
        setSelectedLocations(prefs.notification_locations || []);
        setKeywords(prefs.notification_keywords || []);
        setSelectedJobTypes(prefs.notification_job_types || []);
        setSelectedExperienceLevels(prefs.notification_experience_levels || []);
      }
    } catch (error) {
      console.error("Error fetching preferences:", error);
      toast({
        title: language === 'am' ? "ስህተት" : "Error",
        description: language === 'am' 
          ? "ቅንብሮችን መጫን አልተሳካም" 
          : "Failed to load notification preferences",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const savePreferences = async () => {
    if (!user) return;
    
    setSaving(true);
    try {
      const updateData: any = {
        notification_enabled: notificationEnabled,
        email_notifications: emailNotifications,
        telegram_notifications: telegramNotifications,
        notification_categories: selectedCategories,
        notification_locations: selectedLocations,
        notification_keywords: keywords,
        notification_job_types: selectedJobTypes,
        notification_experience_levels: selectedExperienceLevels,
      };

      const { error } = await supabase
        .from("profiles")
        .update(updateData)
        .eq("user_id", user.id);

      if (error) throw error;

      toast({
        title: language === 'am' ? "ተሳክቷል" : "Success",
        description: language === 'am' 
          ? "የማሳወቂያ ቅንብሮች ተቀመጡ" 
          : "Notification preferences saved successfully",
      });
    } catch (error) {
      console.error("Error saving preferences:", error);
      toast({
        title: language === 'am' ? "ስህተት" : "Error",
        description: language === 'am' 
          ? "ቅንብሮችን ማስቀመጥ አልተሳካም" 
          : "Failed to save notification preferences",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const setupQuickAlerts = () => {
    setNotificationEnabled(true);
    setEmailNotifications(true);
    
    if (selectedCategories.length === 0) {
      setSelectedCategories(["Technology", "Finance"]);
    }
    if (selectedLocations.length === 0) {
      setSelectedLocations(["Addis Ababa"]);
    }
    if (selectedJobTypes.length === 0) {
      setSelectedJobTypes(["Full-time"]);
    }
    if (selectedExperienceLevels.length === 0) {
      setSelectedExperienceLevels(["Mid Level"]);
    }
  };

  const toggleCategory = (category: string) => {
    setSelectedCategories(prev =>
      prev.includes(category)
        ? prev.filter(c => c !== category)
        : [...prev, category]
    );
  };

  const toggleLocation = (location: string) => {
    setSelectedLocations(prev =>
      prev.includes(location)
        ? prev.filter(l => l !== location)
        : [...prev, location]
    );
  };

  const toggleJobType = (jobType: string) => {
    setSelectedJobTypes(prev =>
      prev.includes(jobType)
        ? prev.filter(t => t !== jobType)
        : [...prev, jobType]
    );
  };

  const toggleExperienceLevel = (level: string) => {
    setSelectedExperienceLevels(prev =>
      prev.includes(level)
        ? prev.filter(l => l !== level)
        : [...prev, level]
    );
  };

  const addLocation = () => {
    if (locationInput.trim() && !selectedLocations.includes(locationInput.trim())) {
      setSelectedLocations([...selectedLocations, locationInput.trim()]);
      setLocationInput("");
    }
  };

  const removeLocation = (location: string) => {
    setSelectedLocations(prev => prev.filter(l => l !== location));
  };

  const addKeyword = () => {
    if (keywordInput.trim() && !keywords.includes(keywordInput.trim())) {
      setKeywords([...keywords, keywordInput.trim()]);
      setKeywordInput("");
    }
  };

  const removeKeyword = (keyword: string) => {
    setKeywords(prev => prev.filter(k => k !== keyword));
  };

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
          <Settings className="h-5 w-5" />
          {language === 'am' ? "የስራ ማስታወቂያ ቅንብሮች" : "Job Alert Settings"}
        </CardTitle>
        <CardDescription>
          {language === 'am' 
            ? "የሚመጥንላችሁ ስራዎች ማሳወቂያ ለመቀበል ቅንብሮችን አዋቅሩ"
            : "Set up job alerts to receive notifications about relevant opportunities"
          }
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Quick Setup Button */}
        {!notificationEnabled && (
          <div className="p-4 bg-gradient-to-r from-primary/10 to-secondary/10 rounded-lg border">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium text-primary">
                  {language === 'am' ? "በቀላሉ አዋቅር" : "Quick Setup"}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {language === 'am' 
                    ? "የተመረጡ ቅንብሮች ጋር ማስታወቂያዎችን አብራ"
                    : "Enable alerts with recommended settings"
                  }
                </p>
              </div>
              <Button onClick={setupQuickAlerts} className="bg-primary hover:bg-primary/90">
                {language === 'am' ? "አዋቅር" : "Setup Now"}
              </Button>
            </div>
          </div>
        )}

        {/* Main notification toggle */}
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label className="text-base">
              {language === 'am' ? "ማስታወቂያዎችን አብራ" : "Enable Notifications"}
            </Label>
            <p className="text-sm text-muted-foreground">
              {language === 'am' 
                ? "አዳዲስ ስራዎች ሲወጡ ማሳወቂያ ይቀበሉ"
                : "Receive notifications about new jobs"
              }
            </p>
          </div>
          <Switch
            checked={notificationEnabled}
            onCheckedChange={setNotificationEnabled}
          />
        </div>

        {notificationEnabled && (
          <>
            {/* Notification Methods */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  <div className="space-y-0.5">
                    <Label>{language === 'am' ? "ኢሜይል ማሳወቂያ" : "Email Notifications"}</Label>
                    <p className="text-sm text-muted-foreground">
                      {language === 'am' ? "በኢሜይል ማሳወቂያ ይቀበሉ" : "Get notified via email"}
                    </p>
                  </div>
                </div>
                <Switch
                  checked={emailNotifications}
                  onCheckedChange={setEmailNotifications}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <MessageCircle className="h-4 w-4" />
                  <div className="space-y-0.5">
                    <Label>{language === 'am' ? "ቴሌግራም ማሳወቂያ" : "Telegram Notifications"}</Label>
                    <p className="text-sm text-muted-foreground">
                      {language === 'am' ? "በቴሌግራም ማሳወቂያ ይቀበሉ" : "Get notified on Telegram"}
                    </p>
                  </div>
                </div>
                <Switch
                  checked={telegramNotifications}
                  onCheckedChange={setTelegramNotifications}
                />
              </div>
            </div>

            {/* Job Categories */}
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Briefcase className="h-4 w-4" />
                {language === 'am' ? "የስራ ዓይነቶች" : "Job Categories"}
              </Label>
              <p className="text-sm text-muted-foreground">
                {language === 'am' 
                  ? "የሚፈልጓቸውን የስራ ዓይነቶች ይምረጡ (ባዶ ቢተወቱ ሁሉንም ያገኛሉ)"
                  : "Select categories you're interested in (leave empty for all)"
                }
              </p>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {JOB_CATEGORIES.map(category => (
                  <div key={category} className="flex items-center space-x-2">
                    <Checkbox
                      id={category}
                      checked={selectedCategories.includes(category)}
                      onCheckedChange={() => toggleCategory(category)}
                    />
                    <Label
                      htmlFor={category}
                      className="text-sm font-normal cursor-pointer"
                    >
                      {category}
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            {/* Job Types */}
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Target className="h-4 w-4" />
                {language === 'am' ? "የስራ ሁኔታ" : "Job Types"}
              </Label>
              <p className="text-sm text-muted-foreground">
                {language === 'am' 
                  ? "የሚፈልጓቸውን የስራ ሁኔታዎች ይምረጡ (ባዶ ቢተወቱ ሁሉንም ያገኛሉ)"
                  : "Select job types you prefer (leave empty for all)"
                }
              </p>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {JOB_TYPES.map(jobType => (
                  <div key={jobType} className="flex items-center space-x-2">
                    <Checkbox
                      id={jobType}
                      checked={selectedJobTypes.includes(jobType)}
                      onCheckedChange={() => toggleJobType(jobType)}
                    />
                    <Label
                      htmlFor={jobType}
                      className="text-sm font-normal cursor-pointer"
                    >
                      {jobType}
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            {/* Experience Levels */}
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Target className="h-4 w-4" />
                {language === 'am' ? "የሙያ ደረጃ" : "Experience Levels"}
              </Label>
              <p className="text-sm text-muted-foreground">
                {language === 'am' 
                  ? "የሙያ ደረጃዎ ይምረጡ (ባዶ ቢተወቱ ሁሉንም ያገኛሉ)"
                  : "Select experience levels that match your profile (leave empty for all)"
                }
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {EXPERIENCE_LEVELS.map(level => (
                  <div key={level} className="flex items-center space-x-2">
                    <Checkbox
                      id={level}
                      checked={selectedExperienceLevels.includes(level)}
                      onCheckedChange={() => toggleExperienceLevel(level)}
                    />
                    <Label
                      htmlFor={level}
                      className="text-sm font-normal cursor-pointer"
                    >
                      {level}
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            {/* Locations */}
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                {language === 'am' ? "ቦታዎች" : "Preferred Locations"}
              </Label>
              <p className="text-sm text-muted-foreground">
                {language === 'am' 
                  ? "መስራት የሚፈልጓቸውን ቦታዎች ይምረጡ ወይም ጨምሩ"
                  : "Select cities or regions you want to work in (leave empty for all)"
                }
              </p>
              
              {/* Ethiopian Cities Quick Selection */}
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mb-3">
                {ETHIOPIAN_CITIES.map(location => (
                  <div key={location} className="flex items-center space-x-2">
                    <Checkbox
                      id={`eth-${location}`}
                      checked={selectedLocations.includes(location)}
                      onCheckedChange={() => toggleLocation(location)}
                    />
                    <Label
                      htmlFor={`eth-${location}`}
                      className="text-sm cursor-pointer hover:text-primary"
                    >
                      {location}
                    </Label>
                  </div>
                ))}
              </div>
              
              {/* Custom location input */}
              <div className="flex gap-2">
                <Input
                  placeholder={language === 'am' ? "ምሳሌ፣ አዲስ አበባ፣ ባህር ዳር" : "e.g., Addis Ababa, Hawassa"}
                  value={locationInput}
                  onChange={(e) => setLocationInput(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && addLocation()}
                />
                <Button
                  type="button"
                  size="icon"
                  onClick={addLocation}
                  disabled={!locationInput.trim()}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {selectedLocations.map(location => (
                  <Badge key={location} variant="secondary" className="gap-1">
                    {location}
                    <X
                      className="h-3 w-3 cursor-pointer"
                      onClick={() => removeLocation(location)}
                    />
                  </Badge>
                ))}
              </div>
            </div>

            {/* Keywords */}
            <div className="space-y-2">
              <Label>{language === 'am' ? "ቁልፍ ቃላት" : "Keywords"}</Label>
              <p className="text-sm text-muted-foreground">
                {language === 'am' 
                  ? "በስራ ርዕስ ወይም መግለጫ ውስጥ የሚፈልጓቸውን ቃላት ጨምሩ"
                  : "Add keywords to match in job titles or descriptions (leave empty for all)"
                }
              </p>
              <div className="flex gap-2">
                <Input
                  placeholder={language === 'am' ? "ምሳሌ፣ React፣ Manager፣ Remote" : "e.g., React, Manager, Remote"}
                  value={keywordInput}
                  onChange={(e) => setKeywordInput(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && addKeyword()}
                />
                <Button
                  type="button"
                  size="icon"
                  onClick={addKeyword}
                  disabled={!keywordInput.trim()}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {keywords.map(keyword => (
                  <Badge key={keyword} variant="secondary" className="gap-1">
                    {keyword}
                    <X
                      className="h-3 w-3 cursor-pointer"
                      onClick={() => removeKeyword(keyword)}
                    />
                  </Badge>
                ))}
              </div>
            </div>
          </>
        )}

        {/* Save button */}
        <Button
          onClick={savePreferences}
          disabled={saving}
          className="w-full"
        >
          {saving ? (language === 'am' ? "በማስቀመጥ ላይ..." : "Saving...") : (language === 'am' ? "ቅንብሮች አስቀምጥ" : "Save Preferences")}
        </Button>
        
        {/* Info message */}
        {notificationEnabled && (
          <p className="text-sm text-muted-foreground text-center">
            {language === 'am' 
              ? "💡 ምክር፡ ሁሉንም ቅንብሮች ባዶ ቢተወቱ ስለሁሉም ስራዎች ማሳወቂያ ያገኛሉ" 
              : "💡 Tip: Leave all preferences empty to receive notifications for all jobs"
            }
          </p>
        )}
      </CardContent>
    </Card>
  );
};