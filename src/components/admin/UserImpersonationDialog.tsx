import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { AlertTriangle, Shield, User, Lock } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface UserImpersonationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  targetUser: {
    id: string;
    user_id: string;
    full_name: string;
    email?: string;
    user_type: string;
  };
}

export function UserImpersonationDialog({
  isOpen,
  onClose,
  targetUser
}: UserImpersonationDialogProps) {
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleImpersonate = async () => {
    if (!reason.trim()) {
      toast({
        title: "Error",
        description: "Please provide a reason for impersonation",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      // Log the impersonation attempt in notifications table
      const { error: logError } = await supabase
        .from("notifications")
        .insert({
          user_id: targetUser.user_id,
          job_id: targetUser.user_id, // Using user_id as job_id for system logs
          title: "Admin Impersonation Started",
          message: `Admin ${user?.email} started impersonating this account. Reason: ${reason}`,
          is_read: false
        });

      // Store impersonation session data
      const impersonationData = {
        original_admin_id: user?.id,
        original_admin_email: user?.email,
        target_user_id: targetUser.user_id,
        target_user_email: targetUser.email,
        target_user_name: targetUser.full_name,
        reason: reason,
        started_at: new Date().toISOString(),
        is_active: true
      };

      localStorage.setItem('admin_impersonation_session', JSON.stringify(impersonationData));

      // Set a warning flag
      localStorage.setItem('impersonation_warning', 'true');

      toast({
        title: "Impersonation Started",
        description: `You are now impersonating ${targetUser.full_name}. Use this responsibly.`,
        variant: "destructive",
      });

      // Redirect to home page as the impersonated user
      navigate("/");
      
      // Force a page reload to refresh the auth context
      setTimeout(() => {
        window.location.reload();
      }, 1000);

      onClose();
      setReason("");
    } catch (error: any) {
      console.error("Error starting impersonation:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to start impersonation",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setReason("");
    setShowConfirmation(false);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="bg-red-100 dark:bg-red-900/20 p-2 rounded-full">
              <Shield className="h-5 w-5 text-red-600" />
            </div>
            <div>
              <DialogTitle className="text-red-800 dark:text-red-200">
                User Impersonation
              </DialogTitle>
              <DialogDescription className="mt-1">
                This is a sensitive administrative action
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-4">
          {/* Warning Banner */}
          <div className="bg-red-50 dark:bg-red-950/20 p-4 rounded-lg border border-red-200">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5" />
              <div className="space-y-2">
                <h4 className="font-semibold text-red-800 dark:text-red-200">
                  Security Warning
                </h4>
                <ul className="text-sm text-red-700 dark:text-red-300 space-y-1">
                  <li>• You will have full access to this user's account</li>
                  <li>• All actions will be logged and monitored</li>
                  <li>• Use only for legitimate support purposes</li>
                  <li>• End the session as soon as possible</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Target User Info */}
          <div className="bg-muted/50 p-3 rounded-lg">
            <div className="flex items-center gap-3">
              <User className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="font-medium">{targetUser.full_name}</p>
                <p className="text-sm text-muted-foreground">
                  {targetUser.email} • {targetUser.user_type.replace('_', ' ')}
                </p>
              </div>
            </div>
          </div>

          {/* Reason Input */}
          <div className="space-y-2">
            <Label htmlFor="impersonation-reason">
              Reason for Impersonation <span className="text-red-500">*</span>
            </Label>
            <Textarea
              id="impersonation-reason"
              placeholder="Provide a detailed reason for this impersonation (e.g., troubleshooting user reported issue, investigating account problems, etc.)"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={4}
            />
            <p className="text-xs text-muted-foreground">
              This reason will be logged and may be audited.
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose} disabled={loading}>
            Cancel
          </Button>
          
          <AlertDialog open={showConfirmation} onOpenChange={setShowConfirmation}>
            <AlertDialogTrigger asChild>
              <Button 
                variant="destructive" 
                disabled={loading || !reason.trim()}
                onClick={() => setShowConfirmation(true)}
              >
                <Lock className="h-4 w-4 mr-2" />
                Start Impersonation
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-red-600" />
                  Final Confirmation
                </AlertDialogTitle>
                <AlertDialogDescription>
                  Are you absolutely sure you want to impersonate <strong>{targetUser.full_name}</strong>?
                  <br /><br />
                  This action will:
                  <ul className="list-disc list-inside mt-2 space-y-1">
                    <li>Log you in as this user</li>
                    <li>Give you access to their private data</li>
                    <li>Record all your actions</li>
                    <li>Be permanently logged for audit purposes</li>
                  </ul>
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel onClick={() => setShowConfirmation(false)}>
                  Cancel
                </AlertDialogCancel>
                <AlertDialogAction 
                  onClick={handleImpersonate}
                  className="bg-red-600 hover:bg-red-700"
                  disabled={loading}
                >
                  {loading ? 'Starting...' : 'Yes, Start Impersonation'}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}