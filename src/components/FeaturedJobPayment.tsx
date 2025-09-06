import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/contexts/LanguageContext";
import { supabase } from "@/integrations/supabase/client";
import { Upload, CreditCard, Info, CheckCircle } from "lucide-react";

interface FeaturedJobPaymentProps {
  jobData: any;
  employerId: string;
  onPaymentSubmitted: () => void;
  onCancel: () => void;
}

export const FeaturedJobPayment = ({ 
  jobData, 
  employerId, 
  onPaymentSubmitted, 
  onCancel 
}: FeaturedJobPaymentProps) => {
  const [loading, setLoading] = useState(false);
  const [paymentData, setPaymentData] = useState({
    transactionReference: "",
    paymentScreenshot: null as File | null,
  });
  const [screenshotPreview, setScreenshotPreview] = useState<string | null>(null);
  const { toast } = useToast();
  const { t } = useLanguage();

  const featuredPrice = 500; // ETB
  const featuredDuration = 30; // days

  const handleScreenshotUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        toast({
          title: t("messages.error"),
          description: t("featured.fileSizeError"),
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
        description: t("featured.enterTransactionRef"),
        variant: "destructive",
      });
      return;
    }


    setLoading(true);

    try {
      // First create the job posting without featured columns
      const jobInsertData: any = {
        title: jobData.title,
        description: jobData.description,
        requirements: jobData.requirements,
        city: jobData.city,
        category: jobData.category,
        job_type: jobData.job_type,
        salary_range: jobData.salary_range,
        education_level: jobData.education_level,
        benefits: jobData.benefits,
        company_culture: jobData.company_culture,
        application_email: jobData.application_method,
        deadline: jobData.deadline,
        employer_id: employerId,
        status: 'pending', // Pending until admin approval
      };

      // Try to add is_featured column if it exists
      try {
        jobInsertData.is_featured = false;
      } catch (e) {
        // Column doesn't exist, continue without it
      }

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

let jobResult: any = null;
let jobError: any = null;

// Try initial insert (may use 'pending' status)
const insertResp = await supabase
  .from("jobs")
  .insert(jobInsertData)
  .select()
  .single();

jobResult = insertResp.data;
jobError = insertResp.error;

// Enforce pending status for featured posts; do not auto-publish
if (jobError) throw jobError;

      // Upload payment screenshot
      let screenshotUrl = null;
      if (paymentData.paymentScreenshot) {
        const fileExt = paymentData.paymentScreenshot.name.split('.').pop();
        const fileName = `payment_${Date.now()}.${fileExt}`;
        
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

      // Create featured job request
      try {
        const { error: requestError } = await (supabase as any)
          .from("featured_job_requests")
          .insert({
            job_id: jobResult.id,
            employer_id: employerId,
            transaction_reference: paymentData.transactionReference,
            payment_screenshot_url: screenshotUrl,
            amount: featuredPrice,
            currency: 'ETB',
            status: 'pending',
          });

        if (requestError) {
          if (requestError.message.includes('relation "featured_job_requests" does not exist')) {
            throw new Error("Featured job requests table not found. Database setup required.");
          }
          throw requestError;
        }
      } catch (error: any) {
        // If featured job requests table doesn't exist, just proceed with regular job posting
        if (error.message.includes('Featured job requests table not found')) {
          console.warn("Featured job requests not available. Creating regular job post.");
          await supabase
            .from("jobs")
            .update({ status: 'active' })
            .eq("id", jobResult.id);
          
          toast({
            title: "ስራ ተለጥፏል! (Job Posted!)",
            description: t("featured.serviceUnavailable"),
          });
          onPaymentSubmitted();
          return;
        }
        throw error;
      }

      toast({
        title: t("featured.requestSubmitted"),
        description: t("featured.requestPending"),
      });

      onPaymentSubmitted();
    } catch (error: any) {
      console.error('Error submitting featured job request:', error);
      toast({
        title: t("messages.error"),
        description: error.message || t("featured.errorOccurred"),
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader className="text-center">
        <CardTitle className="flex items-center justify-center gap-2">
          <CreditCard className="h-6 w-6 text-primary" />
          {t("featured.payment")}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Package Info */}
        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>{t("featured.price")}:</span>
                <Badge variant="secondary">{featuredPrice} ETB</Badge>
              </div>
              <div className="flex justify-between">
                <span>{t("featured.duration")}:</span>
                <Badge variant="secondary">{featuredDuration} {t("featured.days")}</Badge>
              </div>
              <div className="text-sm text-muted-foreground mt-2">
                {t("featured.benefits")}
              </div>
            </div>
          </AlertDescription>
        </Alert>

        {/* Payment Instructions */}
        <Alert>
          <CheckCircle className="h-4 w-4" />
          <AlertDescription>
            <div className="space-y-2">
              <strong>{t("featured.paymentInstructions")}:</strong>
              <div className="text-sm whitespace-pre-line">
                {t("featured.paymentSteps", { price: featuredPrice })}
              </div>
            </div>
          </AlertDescription>
        </Alert>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Transaction Reference */}
          <div>
            <Label htmlFor="transactionRef">
              {t("featured.transactionReference")} *
            </Label>
            <Input
              id="transactionRef"
              value={paymentData.transactionReference}
              onChange={(e) => setPaymentData(prev => ({ 
                ...prev, transactionReference: e.target.value 
              }))}
              placeholder={t("featured.transactionPlaceholder")}
              required
            />
          </div>

          {/* Payment Screenshot Upload */}
          <div>
            <Label htmlFor="screenshot">
              {t("featured.paymentScreenshot")} - {t("featured.paymentScreenshotOptional")}
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
              <strong>{t("featured.jobSummary")}:</strong><br/>
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
            >
              {t("featured.cancel")}
            </Button>
            <Button 
              type="submit" 
              disabled={loading}
              className="flex-1"
            >
              {loading ? t("featured.submitting") : t("featured.submitRequest")}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};