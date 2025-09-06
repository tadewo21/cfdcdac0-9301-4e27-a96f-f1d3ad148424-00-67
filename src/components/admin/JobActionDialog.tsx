import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { AlertTriangle, CheckCircle, X } from "lucide-react";

interface JobActionDialogProps {
  isOpen: boolean;
  onClose: () => void;
  jobId: string;
  jobTitle: string;
  employerEmail: string;
  action: 'approve' | 'reject';
  onSuccess: () => void;
}

export function JobActionDialog({
  isOpen,
  onClose,
  jobId,
  jobTitle,
  employerEmail,
  action,
  onSuccess
}: JobActionDialogProps) {
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  const handleSubmit = async () => {
    if (action === 'reject' && !reason.trim()) {
      toast({
        title: "Error",
        description: "Please provide a reason for rejection",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const status = action === 'approve' ? 'active' : 'rejected';
      
      // Update job status
      const { error: jobError } = await supabase
        .from("jobs")
        .update({ 
          status
        })
        .eq("id", jobId);

      if (jobError) throw jobError;

      // Create a notification record for logging
      const { error: logError } = await supabase
        .from("notifications")
        .insert({
          user_id: jobId, // Using job ID as user reference for system logs
          job_id: jobId,
          title: `Job ${action === 'approve' ? 'Approved' : 'Rejected'}`,
          message: action === 'reject' ? `Reason: ${reason}` : 'Job approved for publication',
          is_read: false
        });

      // Send email notification to employer
      try {
        if (action === 'reject' && reason.trim()) {
          await supabase.functions.invoke('send-job-notifications', {
            body: {
              type: 'job_rejected',
              to: employerEmail,
              jobTitle: jobTitle,
              reason: reason,
              adminEmail: user?.email
            }
          });
        } else if (action === 'approve') {
          await supabase.functions.invoke('send-job-notifications', {
            body: {
              type: 'job_approved',
              to: employerEmail,
              jobTitle: jobTitle,
              adminEmail: user?.email
            }
          });
        }
      } catch (emailError) {
        console.error("Email notification failed:", emailError);
        // Don't fail the whole operation if email fails
      }

      toast({
        title: "Success",
        description: `Job ${action === 'approve' ? 'approved' : 'rejected'} successfully`,
      });

      onSuccess();
      onClose();
      setReason("");
    } catch (error: any) {
      console.error("Error updating job:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to update job",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setReason("");
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-3">
            {action === 'approve' ? (
              <div className="bg-green-100 dark:bg-green-900/20 p-2 rounded-full">
                <CheckCircle className="h-5 w-5 text-green-600" />
              </div>
            ) : (
              <div className="bg-red-100 dark:bg-red-900/20 p-2 rounded-full">
                <X className="h-5 w-5 text-red-600" />
              </div>
            )}
            <div>
              <DialogTitle>
                {action === 'approve' ? 'Approve Job' : 'Reject Job'}
              </DialogTitle>
              <DialogDescription className="mt-1">
                {jobTitle}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-4">
          <div className="bg-muted/50 p-3 rounded-lg">
            <p className="text-sm text-muted-foreground">
              <strong>Employer:</strong> {employerEmail}
            </p>
          </div>

          {action === 'reject' && (
            <div className="space-y-2">
              <Label htmlFor="reason">
                Reason for Rejection <span className="text-red-500">*</span>
              </Label>
              <Textarea
                id="reason"
                placeholder="Please provide a clear reason for rejecting this job posting..."
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                rows={4}
              />
              <p className="text-xs text-muted-foreground">
                This reason will be sent to the employer via email.
              </p>
            </div>
          )}

          {action === 'approve' && (
            <div className="bg-green-50 dark:bg-green-950/20 p-3 rounded-lg border border-green-200">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <p className="text-sm text-green-800 dark:text-green-200">
                  This job will be published and visible to job seekers.
                </p>
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose} disabled={loading}>
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit} 
            disabled={loading || (action === 'reject' && !reason.trim())}
            variant={action === 'approve' ? 'default' : 'destructive'}
          >
            {loading ? 'Processing...' : (action === 'approve' ? 'Approve Job' : 'Reject Job')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}