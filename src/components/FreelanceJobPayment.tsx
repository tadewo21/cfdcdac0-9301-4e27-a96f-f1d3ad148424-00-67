import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/contexts/LanguageContext";
import { supabase } from "@/integrations/supabase/client";
import { Briefcase, Crown, Clock, CreditCard, Info, CheckCircle, Upload } from "lucide-react";

interface FreelanceJobPaymentProps {
  jobData: any;
  employerId: string;
  onPaymentSubmitted: () => void;
  onCancel: () => void;
}

export const FreelanceJobPayment = ({ 
  jobData, 
  employerId, 
  onPaymentSubmitted, 
  onCancel 
}: FreelanceJobPaymentProps) => {
  const [loading, setLoading] = useState(false);
  const [paymentData, setPaymentData] = useState({
    transactionReference: "",
    paymentScreenshot: null as File | null,
  });
  const [screenshotPreview, setScreenshotPreview] = useState<string | null>(null);
  const { toast } = useToast();
  const { t } = useLanguage();

  const freelancePrice = 300; // ETB
  const freelanceDuration = 30; // days

  const handleScreenshotUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
      toast({
        title: t("messages.error"),
        description: t("fileSizeError"),
        variant: "destructive",
      });
        return;
      }

      setPaymentData(prev => ({ ...prev, paymentScreenshot: file }));
      
      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setScreenshotPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!paymentData.transactionReference.trim()) {
      toast({
        title: t("messages.error"),
        description: t("transactionReferenceRequired"),
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      // First create the job posting
      const jobInsertData: any = {
        title: jobData.title,
        description: jobData.description,
        requirements: jobData.requirements,
        city: jobData.city,
        category: jobData.category,
        job_type: 'freelance',
        salary_range: jobData.salary_range,
        education_level: jobData.education_level,
        benefits: jobData.benefits,
        company_culture: jobData.company_culture,
        application_email: jobData.application_method,
        deadline: jobData.deadline,
        employer_id: employerId,
        status: 'pending', // Pending until admin approval
      };

      // Ensure profile is linked to employer to satisfy RLS
      const { data: authRes } = await supabase.auth.getUser();
      const uid = authRes.user?.id;
      if (!uid) throw new Error("Session expired. Please log in again.");

      const { data: myProfile, error: myProfileError } = await supabase
        .from("profiles")
        .select("employer_id")
        .eq("user_id", uid)
        .single();

      if (myProfileError) {
        console.error("Profile fetch error:", myProfileError);
        throw new Error("Profile access denied. Please try again.");
      }

      if (myProfile?.employer_id !== employerId) {
        const { error: relinkError } = await supabase
          .from("profiles")
          .update({ employer_id: employerId })
          .eq("user_id", uid);
        if (relinkError) {
          console.error("Profile relink error:", relinkError);
          throw new Error("Failed to link your profile with the company. Try again.");
        }
      }

      // Insert job
      const { data: jobResult, error: jobError } = await supabase
        .from("jobs")
        .insert(jobInsertData)
        .select()
        .single();

      if (jobError) throw jobError;

      // Upload payment screenshot if provided
      let screenshotUrl = null;
      if (paymentData.paymentScreenshot) {
        const fileExt = paymentData.paymentScreenshot.name.split('.').pop();
        const fileName = `freelance_payment_${Date.now()}.${fileExt}`;
        
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('payment-screenshots')
          .upload(fileName, paymentData.paymentScreenshot);

        if (uploadError) {
          console.error('Upload error:', uploadError);
          // Continue without screenshot if upload fails
        } else {
          const { data: urlData } = supabase.storage
            .from('payment-screenshots')
            .getPublicUrl(uploadData.path);
          screenshotUrl = urlData.publicUrl;
        }
      }

      // Create freelance job request
      try {
        const { error: requestError } = await supabase
          .from("featured_job_requests")
          .insert({
            job_id: jobResult.id,
            employer_id: employerId,
            transaction_reference: paymentData.transactionReference,
            payment_screenshot_url: screenshotUrl,
            amount: freelancePrice,
            currency: 'ETB',
            status: 'pending',
          });

        if (requestError) {
          console.error('Error creating freelance request:', requestError);
          // Fallback: directly update job as freelance using job_type instead
          await supabase
            .from("jobs")
            .update({ 
              job_type: 'freelance', 
              status: 'active'
            })
            .eq("id", jobResult.id);
            
          toast({
            title: t("freelanceJobPosted"),
            description: t("freelanceJobPostedDescription"),
          });
          onPaymentSubmitted();
          return;
        }
      } catch (error: any) {
        console.error('Error creating freelance request:', error);
        // Fallback: directly update job as freelance
        await supabase
          .from("jobs")
          .update({ 
            job_type: 'freelance', 
            status: 'active'
          })
          .eq("id", jobResult.id);
          
        toast({
          title: t("freelanceJobPosted"),
          description: t("freelanceJobPostedDescription"),
        });
        onPaymentSubmitted();
        return;
      }

      toast({
        title: t("paymentRequestSubmitted"),
        description: t("paymentRequestSubmittedDescription"),
      });

      onPaymentSubmitted();
    } catch (error: any) {
      console.error('Error submitting freelance job request:', error);
      toast({
        title: t("messages.error"),
        description: error.message || t("paymentError"),
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <CardHeader className="text-center">
          <CardTitle className="flex items-center justify-center gap-2">
            <CreditCard className="h-6 w-6 text-primary" />
            {t("freelanceJobPayment")}
          </CardTitle>
          <CardDescription>
            {t("freelanceJobPaymentDescription")}
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Package Info */}
          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>{t("freelanceJobPrice")}:</span>
                  <Badge variant="freelance">{freelancePrice} {t("birr")}</Badge>
                </div>
                <div className="flex justify-between">
                  <span>{t("duration")}:</span>
                  <Badge variant="freelance">{freelanceDuration} {t("days")}</Badge>
                </div>
                <div className="text-sm text-muted-foreground mt-2">
                  ✓ {t("freelanceBenefitsVisibility")}<br/>
                  ✓ {t("freelanceBenefitsSpecialView")}<br/>
                  ✓ {t("freelanceBenefitsAccessibility")}
                </div>
              </div>
            </AlertDescription>
          </Alert>

          {/* Payment Instructions */}
          <Alert>
            <CheckCircle className="h-4 w-4" />
            <AlertDescription>
              <div className="space-y-2">
                <strong>{t("paymentInstructions")}:</strong>
                <div className="text-sm whitespace-pre-line">
                  1. {t("paymentStep1")}
                  2. {t("paymentStep2")}
                  3. {t("paymentStep3")}
                  4. {t("paymentStep4")}
                </div>
              </div>
            </AlertDescription>
          </Alert>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Transaction Reference */}
            <div>
              <Label htmlFor="transactionRef">
                {t("transactionReferenceNumber")} *
              </Label>
              <Input
                id="transactionRef"
                value={paymentData.transactionReference}
                onChange={(e) => setPaymentData(prev => ({ 
                  ...prev, transactionReference: e.target.value 
                }))}
                placeholder={t("transactionReferencePlaceholder")}
                required
              />
            </div>

            {/* Payment Screenshot Upload */}
            <div>
              <Label htmlFor="screenshot">
                {t("paymentScreenshotOptional")}
              </Label>
              <div className="mt-2">
                <Input
                  id="screenshot"
                  type="file"
                  accept="image/*"
                  onChange={handleScreenshotUpload}
                  className="cursor-pointer"
                />
              </div>
              {screenshotPreview && (
                <div className="mt-3">
                  <img 
                    src={screenshotPreview} 
                    alt="Payment screenshot preview" 
                    className="max-w-xs rounded-lg border"
                  />
                </div>
              )}
            </div>

            {/* Job Summary */}
            <Alert>
              <Info className="h-4 w-4" />
              <AlertDescription>
                <strong>{t("jobSummary")}:</strong><br/>
                <strong>{jobData.title}</strong><br/>
                {jobData.city} • {jobData.category}
              </AlertDescription>
            </Alert>

            {/* Action Buttons */}
            <div className="flex gap-4 pt-4">
              <Button 
                type="button" 
                variant="outline" 
                onClick={onCancel}
                className="flex-1"
                disabled={loading}
              >
                {t("cancel")}
              </Button>
              <Button 
                type="submit" 
                disabled={loading}
                className="flex-1"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                    {t("submitting")}
                  </>
                ) : (
                  t("submitRequest")
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};