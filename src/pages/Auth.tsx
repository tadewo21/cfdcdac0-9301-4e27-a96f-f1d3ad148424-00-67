import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useTelegramWebApp } from "@/hooks/useTelegramWebApp";
import { ArrowLeft, User, Briefcase, Mail, Building, Globe, Phone, MapPin, FileText } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";
import { CompanyLogoUpload } from "@/components/CompanyLogoUpload";

const Auth = () => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    fullName: "",
    userType: "job_seeker",
    // Company profile fields
    companyName: "",
    companyDescription: "",
    companyWebsite: "",
    companyAddress: "",
    contactEmail: "",
    contactPhone: "",
    industry: "",
    companySize: "",
    companyLogoUrl: ""
  });
  const { toast } = useToast();
  const navigate = useNavigate();
  const { webAppData } = useTelegramWebApp();
  const { t, language } = useLanguage();

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Create user account first
      const { data, error } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          emailRedirectTo: `${window.location.origin}/`,
          data: {
            full_name: formData.fullName,
            user_type: formData.userType,
          }
        }
      });

      if (error) throw error;

      // If employer, create employer record
      if (formData.userType === 'employer' && data.user) {
        const { error: employerError } = await supabase
          .from("employers")
          .insert({
            company_name: formData.companyName,
            email: formData.contactEmail || formData.email,
            phone_number: formData.contactPhone,
            company_logo_url: formData.companyLogoUrl,
          });

        if (employerError) {
          console.error("Error creating employer record:", employerError);
          // Don't fail the signup if employer creation fails
        }
      }

      // If signup successful and user is confirmed immediately
      if (data.user && data.user.email_confirmed_at) {
        toast({
          title: t("auth.accountCreated"),
          description: t("auth.accountCreatedDesc"),
        });
        navigate("/");
        return;
      }

      // Email confirmation required
      toast({
        title: t("form.success"),
        description: t("auth.checkEmailConfirmation"),
      });
    } catch (error: any) {
      toast({
        title: t("auth.error"),
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.password,
      });

      if (error) throw error;

      toast({
        title: t("auth.signedIn"),
        description: t("auth.signedInDesc"),
      });
      navigate("/");
    } catch (error: any) {
      toast({
        title: t("auth.error"),
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/`,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
        },
      });

      if (error) throw error;

      toast({
        title: t("auth.connectingGoogle"),
        description: t("auth.pleaseWait"),
      });
    } catch (error: any) {
      toast({
        title: t("auth.error"),
        description: error.message === "provider is not enabled" 
          ? t("auth.googleNotEnabled")
          : error.message,
        variant: "destructive",
      });
      setLoading(false);
    }
  };

  const handleTelegramAuth = async () => {
    setLoading(true);
    try {
      if (!webAppData.user) {
        toast({
          title: t("auth.error"),
          description: t("auth.telegramDataNotFound"),
          variant: "destructive",
        });
        setLoading(false);
        return;
      }

      // Use Telegram user data for authentication
      const telegramUser = webAppData.user;
      const telegramEmail = `telegram_${telegramUser.id}@telegram.user`;
      const telegramPassword = `telegram_${telegramUser.id}_secure`;
      
      // Try to sign in first
      const { error } = await supabase.auth.signInWithPassword({
        email: telegramEmail,
        password: telegramPassword,
      });

      if (error && error.message.includes('Invalid login credentials')) {
        // If user doesn't exist, create account
        const { error: signUpError } = await supabase.auth.signUp({
          email: telegramEmail,
          password: telegramPassword,
          options: {
            emailRedirectTo: `${window.location.origin}/`,
            data: {
              full_name: `${telegramUser.first_name} ${telegramUser.last_name || ''}`.trim(),
              user_type: 'job_seeker',
              telegram_id: telegramUser.id,
              telegram_username: telegramUser.username,
            },
          },
        });

        if (signUpError) throw signUpError;
        
        toast({
          title: t("auth.telegramCreated"),
          description: t("auth.telegramWelcome", { name: telegramUser.first_name }),
        });
      } else if (error) {
        throw error;
      } else {
        toast({
          title: t("auth.telegramSignedIn"),
          description: t("auth.telegramWelcome", { name: telegramUser.first_name }),
        });
      }
      
      navigate("/");
    } catch (error: any) {
      toast({
        title: t("auth.error"),
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-4">
        <Button
          variant="ghost"
          onClick={() => navigate("/")}
          className="mb-6"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          {t("navigation.home")}
        </Button>

        <div className={`mx-auto ${formData.userType === 'employer' ? 'max-w-2xl' : 'max-w-md'}`}>
          <Tabs defaultValue="signin" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="signin">{t("navigation.login")}</TabsTrigger>
              <TabsTrigger value="signup">{t("auth.createAccount")}</TabsTrigger>
            </TabsList>

            <TabsContent value="signin">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="h-5 w-5" />
                    {t("auth.signInTitle")}
                  </CardTitle>
                  <CardDescription>
                    {t("auth.signInDescription")}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSignIn} className="space-y-4">
                    <Input
                      type="email"
                      placeholder={t("auth.email")}
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      required
                    />
                    <Input
                      type="password"
                      placeholder={t("auth.password")}
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      required
                    />
                    <Button type="submit" className="w-full" disabled={loading}>
                      {loading ? t("auth.signing") : t("auth.signInButton")}
                    </Button>
                  </form>
                  
                  <div className="relative my-4">
                    <Separator />
                    <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-background px-2 text-sm text-muted-foreground">
                      {t("auth.or")}
                    </span>
                  </div>

                  <div className="space-y-2">
                    <Button
                      type="button"
                      variant="outline"
                      className="w-full"
                      onClick={handleGoogleSignIn}
                      disabled={loading}
                    >
                      <Mail className="h-4 w-4 mr-2" />
                      {t("auth.signInGoogle")}
                    </Button>
                    
                    {webAppData.user && (
                      <Button
                        type="button"
                        variant="outline"
                        className="w-full"
                        onClick={handleTelegramAuth}
                        disabled={loading}
                      >
                        {t("auth.signInTelegram")}
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="signup">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Briefcase className="h-5 w-5" />
                    {t("auth.signUpTitle")}
                  </CardTitle>
                  <CardDescription>
                    {t("auth.signUpDescription")}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSignUp} className="space-y-4">
                    <Input
                      type="text"
                      placeholder={t("auth.fullName")}
                      value={formData.fullName}
                      onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                      required
                    />
                    <Input
                      type="email"
                      placeholder={t("auth.email")}
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      required
                    />
                    <Input
                      type="password"
                      placeholder={t("auth.password")}
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      required
                    />
                    <Select
                      value={formData.userType}
                      onValueChange={(value) => setFormData({ ...formData, userType: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder={t("auth.selectUserType")} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="job_seeker">{t("auth.userTypeSeeker")}</SelectItem>
                        <SelectItem value="employer">{t("auth.userTypeEmployer")}</SelectItem>
                      </SelectContent>
                    </Select>
                    {formData.userType === 'employer' && (
                      <div className="space-y-4 p-4 border rounded-lg bg-muted/20">
                        <div className="flex items-center gap-2 mb-4">
                          <Building className="h-5 w-5" />
                          <h3 className="font-semibold">
                            {language === 'am' ? "የኩባንያ መረጃ" : "Company Information"}
                          </h3>
                        </div>

                        {/* Company Name */}
                        <div className="space-y-2">
                          <Label htmlFor="companyName" className="flex items-center gap-2">
                            <Building className="h-4 w-4" />
                            {language === 'am' ? "የኩባንያ ስም" : "Company Name"} *
                          </Label>
                          <Input
                            id="companyName"
                            type="text"
                            placeholder={language === 'am' ? "የኩባንያዎን ስም ያስገቡ" : "Enter your company name"}
                            value={formData.companyName}
                            onChange={(e) => handleInputChange("companyName", e.target.value)}
                            required
                          />
                        </div>

                        {/* Company Logo */}
                        <div className="space-y-2">
                          <Label className="text-sm font-medium">
                            {language === 'am' ? "የኩባንያ አርማ (አማራጭ)" : "Company Logo (Optional)"}
                          </Label>
                          <CompanyLogoUpload
                            companyName={formData.companyName}
                            existingLogoUrl={formData.companyLogoUrl}
                            onLogoUploaded={(url) => handleInputChange("companyLogoUrl", url)}
                          />
                        </div>

                        {/* Company Description */}
                        <div className="space-y-2">
                          <Label htmlFor="companyDescription" className="flex items-center gap-2">
                            <FileText className="h-4 w-4" />
                            {language === 'am' ? "የኩባንያ መግለጫ" : "Company Description"}
                          </Label>
                          <Textarea
                            id="companyDescription"
                            placeholder={language === 'am' 
                              ? "ስለ ኩባንያዎ ይጻፉ..." 
                              : "Tell us about your company..."
                            }
                            value={formData.companyDescription}
                            onChange={(e) => handleInputChange("companyDescription", e.target.value)}
                            rows={3}
                          />
                        </div>

                        {/* Industry and Company Size */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="industry">
                              {language === 'am' ? "ኢንዱስትሪ" : "Industry"}
                            </Label>
                            <Input
                              id="industry"
                              placeholder={language === 'am' ? "ምሳሌ: ቴክኖሎጂ, ገንዘብ" : "e.g., Technology, Finance"}
                              value={formData.industry}
                              onChange={(e) => handleInputChange("industry", e.target.value)}
                            />
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="companySize">
                              {language === 'am' ? "የኩባንያ መጠን" : "Company Size"}
                            </Label>
                            <Input
                              id="companySize"
                              placeholder={language === 'am' ? "ምሳሌ: 1-10, 11-50" : "e.g., 1-10, 11-50"}
                              value={formData.companySize}
                              onChange={(e) => handleInputChange("companySize", e.target.value)}
                            />
                          </div>
                        </div>

                        {/* Contact Information */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="contactEmail" className="flex items-center gap-2">
                              <Mail className="h-4 w-4" />
                              {language === 'am' ? "የመገናኛ ኢሜይል" : "Contact Email"}
                            </Label>
                            <Input
                              id="contactEmail"
                              type="email"
                              placeholder={language === 'am' ? "hr@company.com" : "hr@company.com"}
                              value={formData.contactEmail}
                              onChange={(e) => handleInputChange("contactEmail", e.target.value)}
                            />
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="contactPhone" className="flex items-center gap-2">
                              <Phone className="h-4 w-4" />
                              {language === 'am' ? "የመገናኛ ስልክ" : "Contact Phone"}
                            </Label>
                            <Input
                              id="contactPhone"
                              placeholder={language === 'am' ? "+251 11 XXX XXXX" : "+251 11 XXX XXXX"}
                              value={formData.contactPhone}
                              onChange={(e) => handleInputChange("contactPhone", e.target.value)}
                            />
                          </div>
                        </div>

                        {/* Website */}
                        <div className="space-y-2">
                          <Label htmlFor="companyWebsite" className="flex items-center gap-2">
                            <Globe className="h-4 w-4" />
                            {language === 'am' ? "ድህረ ገጽ" : "Company Website"}
                          </Label>
                          <Input
                            id="companyWebsite"
                            type="url"
                            placeholder="https://www.company.com"
                            value={formData.companyWebsite}
                            onChange={(e) => handleInputChange("companyWebsite", e.target.value)}
                          />
                        </div>

                        {/* Address */}
                        <div className="space-y-2">
                          <Label htmlFor="companyAddress" className="flex items-center gap-2">
                            <MapPin className="h-4 w-4" />
                            {language === 'am' ? "አድራሻ" : "Company Address"}
                          </Label>
                          <Textarea
                            id="companyAddress"
                            placeholder={language === 'am' 
                              ? "የኩባንያዎን አድራሻ ያስገቡ..." 
                              : "Enter your company address..."
                            }
                            value={formData.companyAddress}
                            onChange={(e) => handleInputChange("companyAddress", e.target.value)}
                            rows={2}
                          />
                        </div>

                        {/* Info */}
                        <div className="p-3 bg-muted/50 rounded-lg">
                          <p className="text-xs text-muted-foreground text-center">
                            💡 {language === 'am' 
                              ? "ይህ መረጃ በስራ ድምፅዎ እና የኩባንያ መገለጫ ላይ ይታያል"
                              : "This information will be displayed on your job posts and company profile"
                            }
                          </p>
                        </div>
                      </div>
                    )}
                    <Button type="submit" className="w-full" disabled={loading}>
                      {loading ? t("auth.creating") : t("auth.signUpButton")}
                    </Button>
                  </form>
                  
                  <div className="relative my-4">
                    <Separator />
                    <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-background px-2 text-sm text-muted-foreground">
                      {t("auth.or")}
                    </span>
                  </div>

                  <div className="space-y-2">
                    <Button
                      type="button"
                      variant="outline"
                      className="w-full"
                      onClick={handleGoogleSignIn}
                      disabled={loading}
                      >
                        <Mail className="h-4 w-4 mr-2" />
                        {t("auth.signUpGoogle")}
                      </Button>
                    
                    {webAppData.user && (
                      <Button
                        type="button"
                        variant="outline"
                        className="w-full"
                        onClick={handleTelegramAuth}
                        disabled={loading}
                      >
                        {t("auth.signUpTelegram")}
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default Auth;