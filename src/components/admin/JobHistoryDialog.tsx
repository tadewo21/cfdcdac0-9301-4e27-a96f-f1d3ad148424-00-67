import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { supabase } from "@/integrations/supabase/client";
import { 
  Clock, 
  User, 
  CheckCircle, 
  X, 
  Eye, 
  Edit,
  Star,
  AlertTriangle,
  Briefcase
} from "lucide-react";

interface JobHistory {
  id: string;
  action_type: string;
  title: string;
  description?: string;
  admin_email?: string;
  created_at: string;
  status?: string;
}

interface JobHistoryDialogProps {
  isOpen: boolean;
  onClose: () => void;
  jobId: string;
  jobTitle: string;
}

export function JobHistoryDialog({
  isOpen,
  onClose,
  jobId,
  jobTitle
}: JobHistoryDialogProps) {
  const [history, setHistory] = useState<JobHistory[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen && jobId) {
      fetchJobHistory();
    }
  }, [isOpen, jobId]);

  const fetchJobHistory = async () => {
    setLoading(true);
    try {
      // Get job data
      const { data: jobData } = await supabase
        .from("jobs")
        .select("*, employers(company_name, email)")
        .eq("id", jobId)
        .single();

      // Get notifications related to this job
      const { data: notificationData } = await supabase
        .from("notifications")
        .select("*")
        .eq("job_id", jobId)
        .order("created_at", { ascending: false });

      const historyItems: JobHistory[] = [];

      // Add job creation event
      if (jobData) {
        historyItems.push({
          id: `create-${jobId}`,
          action_type: 'job_created',
          title: 'Job Posted',
          description: `Job posted by ${jobData.employers?.company_name || 'Unknown Company'}`,
          admin_email: jobData.employers?.email,
          created_at: jobData.created_at,
          status: jobData.status
        });

        // Add status-based events
        if (jobData.status === 'active') {
          historyItems.push({
            id: `approve-${jobId}`,
            action_type: 'job_approved',
            title: 'Job Approved',
            description: 'Job approved and published',
            admin_email: 'Admin',
            created_at: jobData.updated_at || jobData.created_at,
            status: 'active'
          });
        } else if (jobData.status === 'rejected') {
          historyItems.push({
            id: `reject-${jobId}`,
            action_type: 'job_rejected', 
            title: 'Job Rejected',
            description: 'Job rejected by admin',
            admin_email: 'Admin',
            created_at: jobData.updated_at || jobData.created_at,
            status: 'rejected'
          });
        }
      }

      // Add notification events as history
      if (notificationData && notificationData.length > 0) {
        const notificationEvents = notificationData.map(notification => ({
          id: notification.id,
          action_type: 'admin_action',
          title: notification.title,
          description: notification.message,
          admin_email: 'System',
          created_at: notification.created_at,
          status: notification.is_read ? 'read' : 'unread'
        }));
        historyItems.push(...notificationEvents);
      }

      // Sort by date
      historyItems.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

      setHistory(historyItems);
    } catch (error) {
      console.error("Error fetching job history:", error);
    } finally {
      setLoading(false);
    }
  };

  const getActionIcon = (actionType: string) => {
    switch (actionType) {
      case 'job_created':
      case 'job_posted':
        return <Briefcase className="h-4 w-4 text-blue-600" />;
      case 'job_approved':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'job_rejected':
        return <X className="h-4 w-4 text-red-600" />;
      case 'job_featured':
        return <Star className="h-4 w-4 text-yellow-600" />;
      case 'job_edited':
        return <Edit className="h-4 w-4 text-purple-600" />;
      case 'job_viewed':
        return <Eye className="h-4 w-4 text-gray-600" />;
      default:
        return <Clock className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getActionColor = (actionType: string) => {
    switch (actionType) {
      case 'job_approved':
        return 'bg-green-50 dark:bg-green-950/20 border-green-200';
      case 'job_rejected':
        return 'bg-red-50 dark:bg-red-950/20 border-red-200';
      case 'job_featured':
        return 'bg-yellow-50 dark:bg-yellow-950/20 border-yellow-200';
      case 'job_created':
      case 'job_posted':
        return 'bg-blue-50 dark:bg-blue-950/20 border-blue-200';
      default:
        return 'bg-muted/30';
    }
  };

  const getStatusBadge = (status?: string) => {
    if (!status) return null;
    
    const variants: Record<string, any> = {
      'active': { variant: 'default', label: 'Active' },
      'pending': { variant: 'secondary', label: 'Pending' },
      'rejected': { variant: 'destructive', label: 'Rejected' },
      'featured': { variant: 'default', label: 'Featured' },
      'inactive': { variant: 'outline', label: 'Inactive' }
    };

    const config = variants[status] || { variant: 'outline', label: status };
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Job Activity History
          </DialogTitle>
          <p className="text-sm text-muted-foreground mt-1">
            {jobTitle}
          </p>
        </DialogHeader>

        <ScrollArea className="max-h-[60vh]">
          <div className="space-y-4">
            {loading ? (
              <div className="space-y-3">
                {[1, 2, 3].map(i => (
                  <div key={i} className="flex items-start gap-3 p-3 rounded-lg bg-muted/30">
                    <div className="w-4 h-4 bg-muted rounded-full animate-pulse" />
                    <div className="flex-1">
                      <div className="h-4 bg-muted rounded w-3/4 mb-2 animate-pulse" />
                      <div className="h-3 bg-muted rounded w-1/2 animate-pulse" />
                    </div>
                  </div>
                ))}
              </div>
            ) : history.length === 0 ? (
              <div className="text-center py-8">
                <AlertTriangle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No history available for this job.</p>
              </div>
            ) : (
              history.map((item, index) => (
                <div 
                  key={item.id} 
                  className={`relative flex items-start gap-3 p-4 rounded-lg border ${getActionColor(item.action_type)}`}
                >
                  {/* Timeline line */}
                  {index < history.length - 1 && (
                    <div className="absolute left-5 top-12 w-0.5 h-8 bg-border" />
                  )}
                  
                  <div className="mt-0.5">
                    {getActionIcon(item.action_type)}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="font-medium text-sm">{item.title}</h4>
                        {item.description && (
                          <p className="text-xs text-muted-foreground mt-1">
                            {item.description}
                          </p>
                        )}
                      </div>
                      {item.status && (
                        <div className="ml-2">
                          {getStatusBadge(item.status)}
                        </div>
                      )}
                    </div>
                    
                    <div className="flex items-center justify-between mt-3">
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <User className="h-3 w-3" />
                        <span>{item.admin_email || 'System'}</span>
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {new Date(item.created_at).toLocaleString('am-ET', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </ScrollArea>

        <div className="flex justify-end">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}