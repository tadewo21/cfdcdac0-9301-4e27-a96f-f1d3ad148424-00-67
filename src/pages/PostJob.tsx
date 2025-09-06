import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Briefcase, Star, Zap } from "lucide-react";
import MultiStepJobForm from "@/components/MultiStepJobForm";
import CSVJobUpload from "@/components/CSVJobUpload";
import { FeaturedJobPayment } from "@/components/FeaturedJobPayment";
import { FreelanceJobPayment } from "@/components/FreelanceJobPayment";
import { useLanguage } from "@/contexts/LanguageContext";

const PostJob = () => {
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<'form' | 'post-type' | 'payment' | 'freelance-payment' | 'success'>('form');
  const [postType, setPostType] = useState<'free' | 'featured' | 'freelance'>('free');
  const [employerId, setEmployerId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    requirements: "",
    city: "",
    category: "",
    job_type: "",
    salary_range: "",
    education_level: "",
    benefits: "",
    company_culture: "",
    application_method: "",
    deadline: "",
    company_name: "",
    phone_number: "",
  });
  
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const { t } = useLanguage();

  const handleFormSubmit = async (e: React.FormEvent, logoUrl?: string) => {
    e.preventDefault();
    if (!user) {
      toast({
        title: t("messages.error"),
        description: t("postJob.loginRequired"),
        variant: "destructive",
      });
      return;
    }

    // Validate required fields
    if (!formData.job_type || !formData.salary_range) {
      toast({
        title: t("messages.error"), 
        description: t("postJob.jobTypeAndSalaryRequired"),
        variant: "destructive",
      });
      return;
    }

    // Validate application method
    if (!formData.application_method) {
      toast({
        title: t("messages.error"),
        description: t("postJob.applicationMethodRequired"),
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      // First, get or create user profile
      let profile;
      const { data: existingProfile, error: profileError } = await supabase
        .from("profiles")
        .select("employer_id, user_type")
        .eq("user_id", user.id)
        .maybeSingle();

      if (profileError && profileError.code !== "PGRST116") {
        console.error("Profile fetch error:", profileError);
      }

      profile = existingProfile;

      // Create profile if it doesn't exist
      if (!profile) {
        const { data: newProfile, error: createProfileError } = await supabase
          .from("profiles")
          .insert({
            user_id: user.id,
            user_type: "employer",
            full_name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'User',
            email: user.email!,
          })
          .select("employer_id, user_type")
          .single();

        if (createProfileError) {
          console.error("Profile creation error:", createProfileError);
          throw new Error("አስተያየት መለያ መፍጠር አልተቻለም። እባክዎ እንደገና ይሞክሩ። (Failed to create profile. Please try again.)");
        }
        profile = newProfile;
      }

      let currentEmployerId = profile?.employer_id;

      // Check if user is admin (admins can post jobs without employer restrictions)
      const adminEmails = ['admin@jobboard.et', 'admin@zehulu.jobs', 'zehulu3@gmail.com'];
      const isAdmin = user?.email && adminEmails.includes(user.email);

      // Auto-update user type to employer when posting a job (unless admin)
      if (profile?.user_type !== "employer" && !isAdmin) {
        const { error: updateUserTypeError } = await supabase
          .from("profiles")
          .update({ user_type: "employer" })
          .eq("user_id", user.id);

        if (updateUserTypeError) {
          console.error("User type update error:", updateUserTypeError);
        }
      }

      // Check if user already has an employer account with same email
      const { data: userEmployer } = await supabase
        .from("employers")
        .select("id, company_name, email, company_logo_url")
        .eq("email", user.email!)
        .maybeSingle();

      // Check if company already exists by name (only check if it's owned by someone else)
      const { data: existingCompany } = await supabase
        .from("employers")
        .select("id, email, company_name")
        .eq("company_name", formData.company_name)
        .maybeSingle();

      if (userEmployer) {
        // User already has an employer account - they can always use it
        currentEmployerId = userEmployer.id;
        
        // Check if they're trying to use a company name that belongs to someone else
        if (existingCompany && existingCompany.email !== user.email && !isAdmin) {
          throw new Error(`የ"${formData.company_name}" ስም ቀደም ሲል በሌላ ሰው ተወስዷል። እባክዎ ሌላ ስም ይምረጡ። (Company name "${formData.company_name}" is already taken by another user. Please choose a different name.)`);
        }
        
        // Update company details for this user's employer account
        const { error: updateError } = await supabase
          .from("employers")
          .update({
            company_name: formData.company_name,
            phone_number: formData.phone_number || null,
            company_logo_url: logoUrl || userEmployer.company_logo_url || null,
          })
          .eq("id", currentEmployerId);
            
        if (updateError) {
          console.error("Employer update error:", updateError);
          throw new Error("የድርጅት መረጃ ማዘመን አልተቻለም። (Failed to update company information.)");
        }
        
      } else if (existingCompany && existingCompany.email !== user.email && !isAdmin) {
        // Company name exists and is owned by someone else
        throw new Error(`የ"${formData.company_name}" ስም ቀደም ሲል በሌላ ሰው ተወስዷል። እባክዎ ሌላ ስም ይምረጡ። (Company name "${formData.company_name}" is already taken by another user. Please choose a different name.)`);
        
      } else {
        // Create new employer company
        const { data: employer, error: employerError } = await supabase
          .from("employers")
          .insert({
            company_name: formData.company_name,
            email: user.email!,
            phone_number: formData.phone_number || null,
            company_logo_url: logoUrl || null,
          })
          .select()
          .single();

        if (employerError) {
          console.error("Employer creation error:", employerError);
          
          // Handle specific error types
          if (employerError.code === '23505') {
            if (employerError.message.includes('email')) {
              throw new Error("የኢሜይል አድራሻዎ ቀደም ሲል ተመዝግቧል። (Your email is already registered as an employer.)");
            } else {
              throw new Error(`የ"${formData.company_name}" ስም ቀደም ሲል ተወስዷል። (Company name "${formData.company_name}" already exists.)`);
            }
          } else {
            throw new Error("የአሰሪ መለያ መፍጠር አልተቻለም። እባክዎ እንደገና ይሞክሩ። (Failed to create employer account. Please try again.)");
          }
        }
        
        currentEmployerId = employer.id;
        
        // Update profile with new employer_id
        const { error: updateProfileError } = await supabase
          .from("profiles")
          .update({ employer_id: currentEmployerId })
          .eq("user_id", user.id);
          
        if (updateProfileError) {
          console.error("Profile employer link error:", updateProfileError);
          // Don't throw error here, just log it
        }
      }

      setEmployerId(currentEmployerId);
      
      // Move to post type selection
      setStep('post-type');
    } catch (error: any) {
      toast({
        title: t("messages.error"),
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePostTypeSelection = (type: 'free' | 'featured' | 'freelance') => {
    setPostType(type);
    
    if (type === 'featured') {
      setStep('payment');
    } else if (type === 'freelance') {
      setStep('freelance-payment');
    } else {
      handleFreeJobSubmit();
    }
  };

  const handleFreeJobSubmit = async () => {
    if (!employerId) return;
    
    setLoading(true);
    try {
      console.log("Starting job submission with employerId:", employerId);
      
      // Get current user
      const { data: authRes } = await supabase.auth.getUser();
      const uid = authRes.user?.id;
      if (!uid) throw new Error("Session expired. Please log in again.");
      
      console.log("User ID:", uid);

      // Check current profile state
      const { data: myProfile, error: myProfileError } = await supabase
        .from("profiles")
        .select("employer_id, user_type")
        .eq("user_id", uid)
        .single();

      if (myProfileError) {
        console.error("Profile fetch error:", myProfileError);
        throw new Error("Profile access denied. Please try again.");
      }

      console.log("Current profile:", myProfile);

      // Ensure profile is properly linked to employer
      if (myProfile?.employer_id !== employerId) {
        console.log("Updating profile employer_id from", myProfile?.employer_id, "to", employerId);
        
        const { error: relinkError } = await supabase
          .from("profiles")
          .update({ employer_id: employerId })
          .eq("user_id", uid);
          
        if (relinkError) {
          console.error("Profile relink error:", relinkError);
          throw new Error("Failed to link your profile with the company. Try again.");
        }
        
        // Verify the update worked
        const { data: updatedProfile, error: verifyError } = await supabase
          .from("profiles")
          .select("employer_id")
          .eq("user_id", uid)
          .single();
          
        if (verifyError || updatedProfile?.employer_id !== employerId) {
          console.error("Profile verification failed:", verifyError, updatedProfile);
          throw new Error("Failed to verify profile link. Please try again.");
        }
        
        console.log("Profile successfully linked to employer:", updatedProfile);
      }

      // Verify employer exists and user has access
      const { data: employerCheck, error: employerError } = await supabase
        .from("employers")
        .select("id, email, company_name")
        .eq("id", employerId)
        .single();

      if (employerError || !employerCheck) {
        console.error("Employer verification failed:", employerError);
        throw new Error("Employer account not found. Please try again.");
      }

      console.log("Employer verified:", employerCheck);

      // Create job posting with additional logging
      console.log("Attempting to create job with data:", {
        title: formData.title,
        employer_id: employerId,
        city: formData.city,
        category: formData.category
      });

      const { data: jobResult, error } = await supabase
        .from("jobs")
        .insert({
          title: formData.title,
          description: formData.description,
          requirements: formData.requirements,
          city: formData.city,
          category: formData.category,
          job_type: formData.job_type,
          salary_range: formData.salary_range,
          education_level: formData.education_level,
          benefits: formData.benefits,
          company_culture: formData.company_culture,
          application_email: formData.application_method,
          deadline: formData.deadline,
          employer_id: employerId,
          status: 'pending',
        })
        .select()
        .single();

      if (error) {
        console.error("Job creation error:", error);
        
        // Handle specific RLS policy errors
        if (error.code === '42501' || error.message.includes('row-level security')) {
          throw new Error("የደህንነት ፖሊሲ ችግር። እባክዎ ተለያዩ መረጃዎችዎን በትክክል ሞልተው ማረጋገጥ ያረጋግጡ። RLS policy error - please ensure your profile is properly set up and try again.");
        } else if (error.code === '23503') {
          throw new Error("የኩባንያ መረጃ ላይ ችግር አለ። እባክዎ እንደገና ይሞክሩ። Company information error - please try again.");
        } else if (error.code === '23505') {
          throw new Error("ተመሳሳይ ስራ ቀደም ሲል ተለጥፏል። በተለያዩ መረጃዎች ይሞክሩ። Duplicate job posting detected - please use different details.");
        } else {
          throw new Error(`ስራ መላክ አልተቻለም: ${error.message} | Job posting failed: ${error.message}`);
        }
      }

      console.log("Job created successfully:", jobResult);

      // Send notifications to job seekers
      try {
        await supabase.functions.invoke('send-job-notifications', {
          body: {
            job_id: jobResult.id,
            job_title: formData.title,
            company_name: formData.company_name,
            city: formData.city,
          },
        });
      } catch (notificationError) {
        // Don't fail the job posting if notifications fail
      }

      toast({
        title: t("postJob.jobPosted"),
        description: "ስራዎ ለማጽደቅ ይጠበቃል። አስተዳዳሪ ካፀደቀ በኋላ ይታያል። / Your job is pending approval. It will be visible after admin approval.",
      });

      navigate("/");
    } catch (error: any) {
      toast({
        title: t("messages.error"),
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePaymentSubmitted = () => {
    setStep('success');
  };

  const handleFreelanceJobSubmit = async () => {
    if (!employerId) return;
    
    setLoading(true);
    try {
      console.log("Starting freelance job submission with employerId:", employerId);
      
      // Get current user
      const { data: authRes } = await supabase.auth.getUser();
      const uid = authRes.user?.id;
      if (!uid) throw new Error("Session expired. Please log in again.");
      
      console.log("User ID:", uid);

      // Check current profile state
      const { data: myProfile, error: myProfileError } = await supabase
        .from("profiles")
        .select("employer_id, user_type")
        .eq("user_id", uid)
        .single();

      if (myProfileError) {
        console.error("Profile fetch error:", myProfileError);
        throw new Error("Profile access denied. Please try again.");
      }

      console.log("Current profile:", myProfile);

      // Ensure profile is properly linked to employer
      if (myProfile?.employer_id !== employerId) {
        console.log("Updating profile employer_id from", myProfile?.employer_id, "to", employerId);
        
        const { error: relinkError } = await supabase
          .from("profiles")
          .update({ employer_id: employerId })
          .eq("user_id", uid);
          
        if (relinkError) {
          console.error("Profile relink error:", relinkError);
          throw new Error("Failed to link your profile with the company. Try again.");
        }
        
        // Verify the update worked
        const { data: updatedProfile, error: verifyError } = await supabase
          .from("profiles")
          .select("employer_id")
          .eq("user_id", uid)
          .single();
          
        if (verifyError || updatedProfile?.employer_id !== employerId) {
          console.error("Profile verification failed:", verifyError, updatedProfile);
          throw new Error("Failed to verify profile link. Please try again.");
        }
        
        console.log("Profile successfully linked to employer:", updatedProfile);
      }

      // Verify employer exists and user has access
      const { data: employerCheck, error: employerError } = await supabase
        .from("employers")
        .select("id, email, company_name")
        .eq("id", employerId)
        .single();

      if (employerError || !employerCheck) {
        console.error("Employer verification failed:", employerError);
        throw new Error("Employer account not found. Please try again.");
      }

      console.log("Employer verified:", employerCheck);

      // Create job posting
      console.log("Attempting to create job with data:", {
        title: formData.title,
        employer_id: employerId,
        city: formData.city,
        category: formData.category,
        job_type: formData.job_type
      });

      
      const { data: jobResult, error } = await supabase
        .from("jobs")
        .insert({
          title: formData.title,
          description: formData.description,
          requirements: formData.requirements,
          city: formData.city,
          category: formData.category,
          job_type: formData.job_type,
          salary_range: formData.salary_range,
          education_level: formData.education_level,
          benefits: formData.benefits,
          company_culture: formData.company_culture,
          application_email: formData.application_method,
          deadline: formData.deadline,
          employer_id: employerId,
          status: 'pending'
        })
        .select()
        .single();

      if (error) {
        console.error("Freelance job creation error:", error);
        
        // Handle specific RLS policy errors
        if (error.code === '42501' || error.message.includes('row-level security')) {
          throw new Error("የደህንነት ፖሊሲ ችግር። እባክዎ ተለያዩ መረጃዎችዎን በትክክል ሞልተው ማረጋገጥ ያረጋግጡ። RLS policy error - please ensure your profile is properly set up and try again.");
        } else if (error.code === '23503') {
          throw new Error("የኩባንያ መረጃ ላይ ችግር አለ። እባክዎ እንደገና ይሞክሩ። Company information error - please try again.");
        } else if (error.code === '23505') {
          throw new Error("ተመሳሳይ ስራ ቀደም ሲል ተለጥፏል። በተለያዩ መረጃዎች ይሞክሩ። Duplicate job posting detected - please use different details.");
        } else {
          throw new Error(`ነጻ ኮንትራክት ስራ መላክ አልተቻለም: ${error.message} | Freelance job posting failed: ${error.message}`);
        }
      }

      console.log("Freelance job created successfully:", jobResult);

      // Send notifications to job seekers
      try {
        await supabase.functions.invoke('send-job-notifications', {
          body: {
            job_id: jobResult.id,
            job_title: formData.title,
            company_name: formData.company_name,
            city: formData.city,
          },
        });
      } catch (notificationError) {
        // Don't fail the job posting if notifications fail
      }

      toast({
        title: t("freelance.paymentSuccess"),
        description: "የነጻ ኮንትራክት ስራዎ ለማጽደቅ ይጠበቃል። አስተዳዳሪ ካፀደቀ በኋላ ይታያል። / Your freelance job is pending approval. It will be visible after admin approval.",
      });

      navigate("/");
    } catch (error: any) {
      toast({
        title: t("messages.error"),
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="pt-6 text-center">
            <Briefcase className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h2 className="text-xl font-semibold mb-2">{t("postJob.loginRequired")}</h2>
            <p className="text-muted-foreground mb-4">
              {t("postJob.loginRequired")}
            </p>
            <Button onClick={() => navigate("/auth")}>
              {t("postJob.goToLogin")}
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

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

        <div className="max-w-2xl mx-auto space-y-8">
          {step === 'form' && (
            <>
              {/* Manual Form */}
              <MultiStepJobForm
                formData={formData}
                setFormData={setFormData}
                onSubmit={handleFormSubmit}
                loading={loading}
              />
              
              {/* Divider */}
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-background px-2 text-muted-foreground">
                    {t("postJob.bulkUpload")}
                  </span>
                </div>
              </div>

              {/* CSV Upload Section */}
              <CSVJobUpload onJobsUploaded={() => navigate("/")} />
            </>
          )}

          {step === 'post-type' && (
            <div className="space-y-6">
              <div className="text-center space-y-2">
                <h2 className="text-2xl font-bold">{t('postType.title')}</h2>
                <p className="text-muted-foreground">
                  {t('postType.subtitle')}
                </p>
              </div>

              <div className="grid md:grid-cols-3 gap-6">
                {/* Free Post Option */}
                <Card 
                  className="relative cursor-pointer hover:shadow-lg transition-shadow border-2 hover:border-primary/50"
                  onClick={() => handlePostTypeSelection('free')}
                >
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Briefcase className="h-5 w-5" />
                      {t('postType.free.title')}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="text-3xl font-bold text-green-600">{t('postType.free.price')}</div>
                    <ul className="space-y-2 text-sm">
                      <li>✓ {t('postType.free.feature1')}</li>
                      <li>✓ {t('postType.free.feature2')}</li>
                      <li>✓ {t('postType.free.feature3')}</li>
                      <li>✓ {t('postType.free.feature4')}</li>
                    </ul>
                    <Button className="w-full" variant="outline">
                      {t('postType.free.button')}
                    </Button>
                  </CardContent>
                </Card>

                {/* Freelance Post Option */}
                <Card 
                  className="relative cursor-pointer hover:shadow-freelance transition-all duration-300 border-2 hover:border-freelance bg-gradient-freelance-card"
                  onClick={() => handlePostTypeSelection('freelance')}
                >
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Briefcase className="h-5 w-5 text-freelance" />
                      {t('postType.freelance.title')}
                      <Badge variant="freelance">FREELANCE</Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="text-3xl font-bold text-freelance">{t('postType.freelance.price')}</div>
                    <ul className="space-y-2 text-sm">
                      <li>✓ {t('postType.freelance.feature1')}</li>
                      <li>✓ {t('postType.freelance.feature2')}</li>
                      <li>✓ {t('postType.freelance.feature3')}</li>
                      <li>✓ {t('postType.freelance.feature4')}</li>
                      <li>✓ {t('postType.freelance.feature5')}</li>
                    </ul>
                    <Button className="w-full bg-freelance hover:bg-freelance/90 text-freelance-foreground shadow-freelance">
                      {t('postType.freelance.button')}
                    </Button>
                  </CardContent>
                </Card>

                {/* Featured Post Option */}
                <Card 
                  className="relative cursor-pointer hover:shadow-lg transition-shadow border-2 hover:border-yellow-500 bg-gradient-to-br from-yellow-50 to-orange-50"
                  onClick={() => handlePostTypeSelection('featured')}
                >
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Star className="h-5 w-5 text-yellow-600" />
                      {t('postType.featured.title')}
                      <Badge className="bg-yellow-600">PREMIUM</Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="text-3xl font-bold text-yellow-600">{t('postType.featured.price')}</div>
                    <ul className="space-y-2 text-sm">
                      <li className="flex items-center gap-2">
                        <Zap className="h-4 w-4 text-yellow-600" />
                        {t('postType.featured.feature1')}
                      </li>
                      <li className="flex items-center gap-2">
                        <Star className="h-4 w-4 text-yellow-600" />
                        {t('postType.featured.feature2')}
                      </li>
                      <li>✓ {t('postType.featured.feature3')}</li>
                      <li>✓ {t('postType.featured.feature4')}</li>
                      <li>✓ {t('postType.featured.feature5')}</li>
                      <li>✓ {t('postType.featured.feature6')}</li>
                    </ul>
                    <Button className="w-full bg-yellow-600 hover:bg-yellow-700">
                      {t('postType.featured.button')}
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}

          {step === 'payment' && employerId && (
            <FeaturedJobPayment
              jobData={formData}
              employerId={employerId}
              onPaymentSubmitted={handlePaymentSubmitted}
              onCancel={() => setStep('post-type')}
            />
          )}

          {step === 'freelance-payment' && employerId && (
            <FreelanceJobPayment
              jobData={formData}
              employerId={employerId}
              onPaymentSubmitted={handlePaymentSubmitted}
              onCancel={() => setStep('post-type')}
            />
          )}

          {step === 'success' && (
            <Card className={`text-center p-8 ${
              postType === 'freelance' ? 
                'border-freelance bg-gradient-freelance-card shadow-freelance' : 
              postType === 'featured' ?
                'border-yellow-400 bg-gradient-to-br from-yellow-50/50 to-orange-50/30 shadow-lg' :
                ''
            }`}>
              <CardContent className="space-y-4">
                <div className="text-6xl">
                  {postType === 'freelance' ? '💼' : '🎉'}
                </div>
                <h2 className={`text-2xl font-bold ${
                  postType === 'freelance' ? 'text-freelance' : 'text-green-600'
                }`}>
                  {postType === 'freelance' ? 
                    'የፍሪላንስ ስራ ጥያቄ ተልኳል! (Freelance Job Request Submitted!)' :
                    'የተመራጭ ስራ ጥያቄ ተልኳል! (Featured Job Request Submitted!)'
                  }
                </h2>
                <p className="text-muted-foreground">
                  {postType === 'freelance' ?
                    'ክፍያዎ በአስተዳዳሪ እየተመረመረ ነው። እርግጠኛ ከሆነ በኋላ ማስታወቂያዎ በፍሪላንስ ክፍል ውስጥ ይታያል።' :
                    'ክፍያዎ በአስተዳዳሪ እየተመረመረ ነው። እርግጠኛ ከሆነ በኋላ ማስታወቂያዎ በተመራጭ ሁኔታ ይታያል።'
                  }
                </p>
                <p className="text-sm text-muted-foreground">
                  {postType === 'freelance' ?
                    'Your payment is being reviewed by our admin team. Once confirmed, your job post will be displayed prominently in the freelance section.' :
                    'Your payment is being reviewed by our admin team. Once confirmed, your job post will be featured prominently on our platform.'
                  }
                </p>
                <div className="flex gap-4 justify-center pt-4">
                  <Button onClick={() => navigate("/")} className="px-8">
                    ወደ ቤት ገጽ (Go to Homepage)
                  </Button>
                  <Button 
                    onClick={() => navigate("/manage-jobs")} 
                    variant="outline"
                    className="px-8"
                  >
                    ስራዎቼን ይመልከቱ (View My Jobs)
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default PostJob;