import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Plus } from "lucide-react";
import { Job } from "@/hooks/useJobs";
import { useLanguage } from "@/contexts/LanguageContext";
import { CSVUploadDialog } from "@/components/manage-jobs/CSVUploadDialog";
import { JobsList } from "@/components/manage-jobs/JobsList";

const ManageJobs = () => {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const { t } = useLanguage();

  useEffect(() => {
    fetchMyJobs();
  }, [user]);

  const fetchMyJobs = async () => {
    if (!user) return;

    try {
      setLoading(true);
      
      // Get user's employer_id
      const { data: profile } = await supabase
        .from("profiles")
        .select("employer_id")
        .eq("user_id", user.id)
        .single();

      if (!profile?.employer_id) {
        setJobs([]);
        return;
      }

      const { data, error } = await supabase
        .from("jobs")
        .select(`
          *,
          employers (
            company_name,
            company_logo_url
          )
        `)
        .eq("employer_id", profile.employer_id)
        .order("posted_date", { ascending: false });

      if (error) throw error;
      setJobs(data || []);
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

  const handleStatusToggle = async (jobId: string, currentStatus: string) => {
    try {
      let newStatus: string;
      
      // For pending jobs, only allow activation/deactivation by admin approval
      if (currentStatus === "pending") {
        // Pending jobs cannot be toggled by employers - they need admin approval
        toast({
          title: "Pending Approval",
          description: "የተጠበቀ ስራ የአስተዳዳሪ ማጽደቅ ይጠበቃል። / Pending jobs require admin approval.",
          variant: "default",
        });
        return;
      }
      
      // Proper status logic: preserve featured status, only toggle visibility
      if (currentStatus === "featured") {
        // Featured job -> hide it but keep featured info
        newStatus = "inactive";
      } else if (currentStatus === "inactive") {
        // Hidden job -> check if it was originally featured
        const job = jobs.find(j => j.id === jobId);
        if (job?.is_featured && job?.featured_until && new Date(job.featured_until) > new Date()) {
          // If still within featured period, restore to featured
          newStatus = "featured";
        } else {
          // Otherwise make it active
          newStatus = "active";
        }
      } else if (currentStatus === "active") {
        // Active job -> hide it
        newStatus = "inactive";
      } else {
        // Default fallback
        newStatus = currentStatus === "active" ? "inactive" : "active";
      }
      
      const { error } = await supabase
        .from("jobs")
        .update({ status: newStatus })
        .eq("id", jobId);

      if (error) throw error;

      const statusText = newStatus === "active" || newStatus === "featured" 
        ? t("manageJobs.active") 
        : t("manageJobs.hidden");
      toast({
        title: t("messages.success"),
        description: t("manageJobs.statusToggled", { status: statusText }),
      });

      fetchMyJobs();
    } catch (error: any) {
      toast({
        title: t("messages.error"),
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (jobId: string) => {
    try {
      const { error } = await supabase
        .from("jobs")
        .delete()
        .eq("id", jobId);

      if (error) throw error;

      toast({
        title: t("messages.success"),
        description: t("manageJobs.jobDeleted"),
      });

      fetchMyJobs();
    } catch (error: any) {
      toast({
        title: t("messages.error"),
        description: error.message,
        variant: "destructive",
      });
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">{t("manageJobs.loginRequired")}</h2>
          <p className="text-muted-foreground mb-4">
            {t("manageJobs.loginRequiredDesc")}
          </p>
          <Button onClick={() => navigate("/auth")}>
            {t("manageJobs.goToLogin")}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-4">
        <div className="flex items-center justify-between mb-6">
          <Button
            variant="ghost"
            onClick={() => navigate("/")}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          
          <div className="flex gap-2">
            <CSVUploadDialog 
              userId={user.id} 
              onUploadComplete={fetchMyJobs}
            />

            <Button onClick={() => navigate("/post-job")}>
              <Plus className="h-4 w-4 mr-2" />
              {t("manageJobs.addNewJob")}
            </Button>
          </div>
        </div>

        <JobsList
          jobs={jobs}
          loading={loading}
          onStatusToggle={handleStatusToggle}
          onDelete={handleDelete}
        />
      </div>
    </div>
  );
};

export default ManageJobs;