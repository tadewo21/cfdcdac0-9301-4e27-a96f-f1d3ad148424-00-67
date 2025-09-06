import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/contexts/LanguageContext";
import { supabase } from "@/integrations/supabase/client";
import { Job } from "@/hooks/useJobs";
import { format } from "date-fns";
import { XCircle, CheckCircle } from "lucide-react";

interface FreelanceJobReviewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  job: Job | null;
  onReviewComplete: () => void;
}

export const FreelanceJobReviewDialog = ({
  open,
  onOpenChange,
  job,
  onReviewComplete
}: FreelanceJobReviewDialogProps) => {
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const { t } = useLanguage();

  const handleReject = async () => {
    if (!job) return;
    setLoading(true);

    try {
      const { error } = await supabase
        .from("jobs")
        .update({
          is_freelance: false,
          status: 'inactive',
          admin_notes: notes || 'Rejected by admin',
          updated_at: new Date().toISOString()
        })
        .eq("id", job.id);

      if (error) throw error;

      // Send rejection message to employer
      await sendRejectionMessage(job.id, job.employer_id, job.title, "Freelance", notes);

      toast({
        title: "Job Rejected",
        description: "The freelance job has been rejected and employer has been notified.",
      });

      onOpenChange(false);
      onReviewComplete();
      setNotes("");
    } catch (error) {
      console.error("Error rejecting job:", error);
      toast({
        title: "Error",
        description: "Could not reject the job. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const sendRejectionMessage = async (jobId: string, employerId: string, jobTitle: string, jobType: string, reason?: string) => {
    try {
      const message = `Your ${jobType} job "${jobTitle}" has been rejected by admin.${reason ? ` Reason: ${reason}` : ''}`;
      
      const { error } = await supabase
        .from("notifications")
        .insert({
          user_id: employerId,
          job_id: jobId,
          title: `${jobType} Job Rejected`,
          message: message,
          created_at: new Date().toISOString()
        });

      if (error && !error.message.includes('relation "notifications" does not exist')) {
        console.error("Error creating notification:", error);
      }
    } catch (error) {
      console.error("Error sending rejection message:", error);
    }
  };

  const handleApprove = async () => {
    if (!job) return;
    setLoading(true);

    try {
      const freelanceUntil = new Date();
      freelanceUntil.setDate(freelanceUntil.getDate() + 30);

      const { error } = await supabase
        .from("jobs")
        .update({
          is_freelance: true,
          freelance_until: freelanceUntil.toISOString(),
          status: 'active',
          admin_notes: notes || 'Approved by admin',
          updated_at: new Date().toISOString()
        })
        .eq("id", job.id);

      if (error) throw error;

      toast({
        title: "Job Approved",
        description: "The freelance job has been approved and is now active.",
      });

      onOpenChange(false);
      onReviewComplete();
      setNotes("");
    } catch (error) {
      console.error("Error approving job:", error);
      toast({
        title: "Error",
        description: "Could not approve the job. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (!job) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold">
            Review Freelance Job
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* Job Details */}
          <div className="bg-muted/30 p-4 rounded-lg space-y-2">
            <h3 className="font-semibold text-lg">{job.title}</h3>
            <p className="text-sm text-muted-foreground">
              {job.employers?.company_name} • {job.city} • {job.category}
            </p>
            <p className="text-xs text-muted-foreground">
              Posted: {format(new Date(job.created_at), "MMM dd, yyyy")}
            </p>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <h4 className="font-medium">Job Description</h4>
            <div className="p-3 bg-muted/20 rounded text-sm max-h-32 overflow-y-auto">
              {job.description || 'No description provided'}
            </div>
          </div>

          {/* Admin Notes */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Admin Notes (Optional)</label>
            <Textarea
              placeholder="Add any notes about this decision..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              className="resize-none"
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 pt-4">
          <Button
            variant="destructive"
            className="flex-1 bg-red-500 hover:bg-red-600 text-white"
            onClick={handleReject}
            disabled={loading}
          >
            <XCircle className="w-4 h-4 mr-2" />
            Reject
          </Button>
          <Button
            className="flex-1 bg-green-500 hover:bg-green-600 text-white"
            onClick={handleApprove}
            disabled={loading}
          >
            <CheckCircle className="w-4 h-4 mr-2" />
            Approve
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};