import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Settings, 
  Globe,
  Tag,
  Mail,
  DollarSign,
  Shield
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/contexts/LanguageContext";
import { MaintenanceControls } from "@/components/MaintenanceControls";
import { GeneralSettings } from "./settings/GeneralSettings";
import { CategoryLocationSettings } from "./settings/CategoryLocationSettings";
import { EmailTemplateSettings } from "./settings/EmailTemplateSettings";

export function AdminSettings() {
  const [pricingSettings, setPricingSettings] = useState({
    jobPostPrice: 0,
    featuredJobPrice: 0,
    isPaidPlatform: false
  });

  const { toast } = useToast();
  const { t } = useLanguage();

  const handleSaveSettings = () => {
    // In a real app, you would save to database
    toast({
      title: t("messages.success"),
      description: "ቅንብሮች ተቀምጠዋል"
    });
  };

  return (
    <div className="space-y-6">
      <Tabs defaultValue="general" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="general" className="flex items-center gap-2">
            <Globe className="h-4 w-4" />
            አጠቃላይ
          </TabsTrigger>
          <TabsTrigger value="categories" className="flex items-center gap-2">
            <Tag className="h-4 w-4" />
            ዘርፎች
          </TabsTrigger>
          <TabsTrigger value="emails" className="flex items-center gap-2">
            <Mail className="h-4 w-4" />
            ኢሜይሎች
          </TabsTrigger>
          <TabsTrigger value="pricing" className="flex items-center gap-2">
            <DollarSign className="h-4 w-4" />
            ዋጋ
          </TabsTrigger>
          <TabsTrigger value="system" className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            ስርዓት
          </TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="mt-6">
          <GeneralSettings />
        </TabsContent>

        <TabsContent value="categories" className="mt-6">
          <CategoryLocationSettings />
        </TabsContent>

        <TabsContent value="emails" className="mt-6">
          <EmailTemplateSettings />
        </TabsContent>

        <TabsContent value="pricing" className="mt-6">
          {/* Pricing Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                የዋጋ ቅንብሮች
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="paid-platform">የተከፈለ መድረክ</Label>
                    <p className="text-sm text-muted-foreground">ስራ ለመለጠፍ ክፍያ መጠየቅ</p>
                  </div>
                  <Switch
                    id="paid-platform"
                    checked={pricingSettings.isPaidPlatform}
                    onCheckedChange={(checked) => 
                      setPricingSettings({...pricingSettings, isPaidPlatform: checked})
                    }
                  />
                </div>

                {pricingSettings.isPaidPlatform && (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="job-price">የስራ ልጥፍ ዋጋ (ብር)</Label>
                      <Input
                        id="job-price"
                        type="number"
                        value={pricingSettings.jobPostPrice}
                        onChange={(e) => setPricingSettings({
                          ...pricingSettings, 
                          jobPostPrice: Number(e.target.value)
                        })}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="featured-price">የተለየ ስራ ዋጋ (ብር)</Label>
                      <Input
                        id="featured-price"
                        type="number"
                        value={pricingSettings.featuredJobPrice}
                        onChange={(e) => setPricingSettings({
                          ...pricingSettings,
                          featuredJobPrice: Number(e.target.value)
                        })}
                      />
                    </div>
                  </>
                )}

                <Button onClick={handleSaveSettings} className="w-full">
                  የዋጋ ቅንብሮችን ቀምጥ
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="system" className="mt-6">
          {/* System Maintenance */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                የስርዓት አስተዳደር
              </CardTitle>
            </CardHeader>
            <CardContent>
              <MaintenanceControls />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}