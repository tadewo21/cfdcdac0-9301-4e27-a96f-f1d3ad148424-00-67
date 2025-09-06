import { useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Globe, Upload } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/contexts/LanguageContext";
import { useSettings, type SiteSettings } from "@/contexts/SettingsContext";

export function GeneralSettings() {
  const { settings, updateSettings, loading } = useSettings();
  const { toast } = useToast();
  const { t } = useLanguage();

  const handleInputChange = (field: string, value: string) => {
    updateSettings({ ...settings, [field]: value });
  };

  const handleSocialMediaChange = (platform: string, value: string) => {
    updateSettings({
      ...settings,
      socialMedia: { ...settings.socialMedia, [platform]: value }
    });
  };

  const handleSaveSettings = () => {
    try {
      // Validate social media URLs
      const urlPattern = /^https?:\/\/.+/;
      const socialMediaUrls = Object.entries(settings.socialMedia);
      
      for (const [platform, url] of socialMediaUrls) {
        if (url && url.trim() && !urlPattern.test(url.trim())) {
          toast({
            title: "URL ስህተት",
            description: `${platform} ማገናኛው ትክክለኛ URL አይደለም። በ http:// ወይም https:// መጀመር አለበት።`,
            variant: "destructive"
          });
          return;
        }
      }
      
      // Settings are automatically saved when changed due to updateSettings
      toast({
        title: t("messages.success"),
        description: "የቦታ ቅንብሮች በተሳካ ሁኔታ ተቀምጠዋል እና በወዲያውኑ በድረ-ገጹ ላይ ይታያሉ። የማህበራዊ ሚዲያ ማገናኛዎች በ Footer ውስጥ ተዘምነዋል።"
      });
    } catch (error) {
      toast({
        title: "ስህተት",
        description: "ቅንብሮችን በማስቀመጥ ላይ ችግር ተፈጥሯል። እባክዎ እንደገና ይሞክሩ።",
        variant: "destructive"
      });
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-muted rounded w-1/4"></div>
            <div className="h-10 bg-muted rounded"></div>
            <div className="h-10 bg-muted rounded"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Globe className="h-5 w-5" />
          የድረ-ገጽ አጠቃላይ ቅንብሮች
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="site-name">የድረ-ገጽ ስም</Label>
              <Input
                id="site-name"
                value={settings.siteName}
                onChange={(e) => handleInputChange("siteName", e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="contact-email">የእውቂያ ኢሜይል</Label>
              <Input
                id="contact-email"
                type="email"
                value={settings.contactEmail}
                onChange={(e) => handleInputChange("contactEmail", e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="site-description">የድረ-ገጽ መግለጫ</Label>
            <Textarea
              id="site-description"
              value={settings.siteDescription}
              onChange={(e) => handleInputChange("siteDescription", e.target.value)}
              rows={3}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="contact-phone">የእውቂያ ስልክ</Label>
              <Input
                id="contact-phone"
                value={settings.contactPhone}
                onChange={(e) => handleInputChange("contactPhone", e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="address">አድራሻ</Label>
              <Input
                id="address"
                value={settings.address}
                onChange={(e) => handleInputChange("address", e.target.value)}
              />
            </div>
          </div>

          {/* Logo Upload */}
          <div className="space-y-2">
            <Label htmlFor="logo">ሎጎ</Label>
            <div className="flex items-center gap-2">
              <Input
                id="logo"
                value={settings.logoUrl}
                onChange={(e) => handleInputChange("logoUrl", e.target.value)}
                placeholder="የሎጎ URL ያስገቡ"
              />
              <Button variant="outline" size="sm">
                <Upload className="h-4 w-4 mr-2" />
                ሎጎ ያዝምቱ
              </Button>
            </div>
          </div>

          {/* Social Media */}
          <div className="space-y-4">
            <Label className="text-base font-medium">የማህበራዊ ሚዲያ ሊንኮች</Label>
            <p className="text-sm text-muted-foreground">
              የማህበራዊ ሚዲያ መገለጫዎችዎን ሙሉ URL ያስገቡ። ባዶ ከትወው የእነዚህ አገናኞች አዶዎች በ Footer ላይ ተደብቀዋል።
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="facebook" className="flex items-center gap-2">
                  <span>Facebook</span>
                  {settings.socialMedia.facebook && (
                    <span className="text-xs text-green-600">✓ ተሰናድቷል</span>
                  )}
                </Label>
                <Input
                  id="facebook"
                  value={settings.socialMedia.facebook}
                  onChange={(e) => handleSocialMediaChange("facebook", e.target.value)}
                  placeholder="https://facebook.com/yourpage"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="twitter" className="flex items-center gap-2">
                  <span>Twitter/X</span>
                  {settings.socialMedia.twitter && (
                    <span className="text-xs text-green-600">✓ ተሰናድቷል</span>
                  )}
                </Label>
                <Input
                  id="twitter"
                  value={settings.socialMedia.twitter}
                  onChange={(e) => handleSocialMediaChange("twitter", e.target.value)}
                  placeholder="https://twitter.com/yourhandle"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="linkedin" className="flex items-center gap-2">
                  <span>LinkedIn</span>
                  {settings.socialMedia.linkedin && (
                    <span className="text-xs text-green-600">✓ ተሰናድቷል</span>
                  )}
                </Label>
                <Input
                  id="linkedin"
                  value={settings.socialMedia.linkedin}
                  onChange={(e) => handleSocialMediaChange("linkedin", e.target.value)}
                  placeholder="https://linkedin.com/company/yourcompany"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="telegram" className="flex items-center gap-2">
                  <span>Telegram</span>
                  {settings.socialMedia.telegram && (
                    <span className="text-xs text-green-600">✓ ተሰናድቷል</span>
                  )}
                </Label>
                <Input
                  id="telegram"
                  value={settings.socialMedia.telegram}
                  onChange={(e) => handleSocialMediaChange("telegram", e.target.value)}
                  placeholder="https://t.me/yourchannel"
                />
              </div>
            </div>
            
            {/* Preview Section */}
            <div className="p-4 bg-muted/50 rounded-lg">
              <Label className="text-sm font-medium mb-2 block">የአዶዎች ቅድመ እይታ:</Label>
              <div className="flex space-x-2">
                {[
                  { name: 'Facebook', url: settings.socialMedia.facebook },
                  { name: 'Twitter', url: settings.socialMedia.twitter },
                  { name: 'LinkedIn', url: settings.socialMedia.linkedin },
                  { name: 'Telegram', url: settings.socialMedia.telegram }
                ].map(({ name, url }) => (
                  <div
                    key={name}
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-xs transition-opacity ${
                      url ? 'bg-primary text-primary-foreground' : 'bg-muted-foreground/20 text-muted-foreground'
                    }`}
                    title={`${name}${url ? ' - ተሰናድቷል' : ' - ባዶ'}`}
                  >
                    {name[0]}
                  </div>
                ))}
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                ሙሉ አድረጋዎች በ Footer ውስጥ እንደ የማህበራዊ ሚዲያ አዶዎች ይታያሉ
              </p>
            </div>
          </div>

          <Button onClick={handleSaveSettings} className="w-full">
            ቅንብሮችን ቀምጥ
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}