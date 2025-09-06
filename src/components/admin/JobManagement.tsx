import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
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
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { 
  Check, 
  X, 
  Eye, 
  EyeOff, 
  Trash2, 
  Star, 
  Calendar,
  Building,
  MapPin,
  MoreHorizontal,
  Edit,
  StarOff,
  RefreshCw,
  Briefcase,
  BriefcaseIcon,
  Info
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/contexts/LanguageContext";
import { Job } from "@/hooks/useJobs";
import { JobEditDialog } from "./JobEditDialog";
import { JobDetailDialog } from "./JobDetailDialog";

export function JobManagement() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [selectedJobs, setSelectedJobs] = useState<string[]>([]);
  const [bulkAction, setBulkAction] = useState("");
  const [editingJob, setEditingJob] = useState<Job | null>(null);
  const [viewingJob, setViewingJob] = useState<Job | null>(null);
  const { toast } = useToast();
  const { t } = useLanguage();

  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("jobs")
        .select(`
          *,
          employers (
            company_name,
            company_logo_url,
            email
          )
        `)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setJobs(data || []);
    } catch (error: any) {
      console.error("Error fetching jobs:", error);
      toast({
        title: t("admin.error"),
        description: error.message || "Failed to fetch jobs",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleJobApproval = async (jobId: string, approve: boolean) => {
    try {
      // Get job and employer details before updating
      const { data: jobData, error: jobFetchError } = await supabase
        .from("jobs")
        .select(`
          *,
          employers (
            id,
            company_name,
            email
          )
        `)
        .eq("id", jobId)
        .single();

      if (jobFetchError) throw jobFetchError;

      const status = approve ? "active" : "rejected";
      const { error } = await supabase
        .from("jobs")
        .update({ status })
        .eq("id", jobId);

      if (error) throw error;

      // If job is rejected, send notification to employer
      if (!approve && jobData?.employers) {
        try {
          // Create notification in database
          const { error: notificationError } = await supabase
            .from("notifications")
            .insert({
              user_id: jobData.employers.id,
              job_id: jobId,
              title: "Job Rejected",
              message: `Your job posting "${jobData.title}" has been rejected by admin. Please review your job posting and make necessary improvements before resubmitting.`,
              is_read: false,
              created_at: new Date().toISOString()
            });

          if (notificationError && !notificationError.message.includes('relation "notifications" does not exist')) {
            console.error("Error creating notification:", notificationError);
          }

          // Try to send email notification via edge function
          try {
            await supabase.functions.invoke('send-job-notifications', {
              body: {
                type: 'job_rejected',
                to: jobData.employers.email,
                jobTitle: jobData.title,
                reason: 'Your job posting needs review before it can be published.',
                companyName: jobData.employers.company_name
              }
            });
          } catch (emailError) {
            console.warn("Email notification failed (this is expected if function doesn't exist):", emailError);
          }
        } catch (notifyError) {
          console.error("Error sending rejection notification:", notifyError);
          // Don't fail the main operation if notification fails
        }
      }

      toast({
        title: t("admin.success"),
        description: approve ? t("admin.jobApproved") : t("admin.jobRejected"),
      });

      await fetchJobs();
    } catch (error: any) {
      console.error("Error updating job approval:", error);
      toast({
        title: t("admin.error"), 
        description: error.message || "Failed to update job",
        variant: "destructive",
      });
    }
  };

  const handleJobStatusChange = async (jobId: string, newStatus: string) => {
    try {
      // Get job and employer details before updating if status is rejected
      let jobData = null;
      if (newStatus === "rejected") {
        const { data, error: jobFetchError } = await supabase
          .from("jobs")
          .select(`
            *,
            employers (
              id,
              company_name,
              email
            )
          `)
          .eq("id", jobId)
          .single();

        if (jobFetchError) throw jobFetchError;
        jobData = data;
      }

      const { error } = await supabase
        .from("jobs")
        .update({ status: newStatus })
        .eq("id", jobId);

      if (error) throw error;

      // Send notification if job is rejected
      if (newStatus === "rejected" && jobData?.employers) {
        try {
          // Create notification in database
          const { error: notificationError } = await supabase
            .from("notifications")
            .insert({
              user_id: jobData.employers.id,
              job_id: jobId,
              title: "Job Status Changed",
              message: `Your job posting "${jobData.title}" has been rejected. Please review and improve your job posting before resubmitting.`,
              is_read: false,
              created_at: new Date().toISOString()
            });

          if (notificationError && !notificationError.message.includes('relation "notifications" does not exist')) {
            console.error("Error creating notification:", notificationError);
          }

          // Try to send email notification
          try {
            await supabase.functions.invoke('send-job-notifications', {
              body: {
                type: 'job_rejected',
                to: jobData.employers.email,
                jobTitle: jobData.title,
                reason: 'Your job posting status has been changed to rejected.',
                companyName: jobData.employers.company_name
              }
            });
          } catch (emailError) {
            console.warn("Email notification failed:", emailError);
          }
        } catch (notifyError) {
          console.error("Error sending rejection notification:", notifyError);
        }
      }

      const statusMessages = {
        active: t("admin.jobShown"),
        inactive: t("admin.jobHidden"), 
        pending: "Job moved to pending",
        rejected: t("admin.jobRejected"),
        featured: t("admin.jobFeatured"),
      };

      toast({
        title: t("admin.success"),
        description: statusMessages[newStatus as keyof typeof statusMessages] || `Status updated to ${newStatus}`,
      });

      await fetchJobs();
    } catch (error: any) {
      console.error("Error updating job status:", error);
      toast({
        title: t("admin.error"),
        description: error.message || "Failed to update job status", 
        variant: "destructive",
      });
    }
  };

  const handleFeaturedToggle = async (jobId: string, isFeatured: boolean) => {
    try {
      const newStatus = isFeatured ? "active" : "featured";
      await handleJobStatusChange(jobId, newStatus);
    } catch (error: any) {
      console.error("Error toggling featured status:", error);
    }
  };

  const handleFreelanceToggle = async (jobId: string, isFreelance: boolean) => {
    try {
      const updates: any = {
        is_freelance: !isFreelance,
        job_type: isFreelance ? 'full-time' : 'freelance',
        updated_at: new Date().toISOString(),
      };

      // If setting as freelance, also set a default freelance period (30 days from now)
      if (!isFreelance) {
        updates.freelance_until = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();
      } else {
        updates.freelance_until = null;
      }

      const { error } = await supabase
        .from("jobs")
        .update(updates)
        .eq("id", jobId);

      if (error) throw error;

      toast({
        title: t("admin.success"),
        description: !isFreelance ? "Job set as freelance" : "Freelance status removed",
      });

      await fetchJobs();
    } catch (error: any) {
      console.error("Error toggling freelance status:", error);
      toast({
        title: t("admin.error"),
        description: error.message || "Failed to update freelance status",
        variant: "destructive",
      });
    }
  };

  const handleJobDelete = async (jobId: string) => {
    try {
      const { error } = await supabase
        .from("jobs")
        .delete()
        .eq("id", jobId);

      if (error) throw error;

      toast({
        title: t("admin.success"),
        description: t("admin.jobDeleted"),
      });

      await fetchJobs();
      setSelectedJobs(prev => prev.filter(id => id !== jobId));
    } catch (error: any) {
      console.error("Error deleting job:", error);
      toast({
        title: t("admin.error"),
        description: error.message || "Failed to delete job",
        variant: "destructive",
      });
    }
  };

  const handleBulkAction = async () => {
    if (!bulkAction || selectedJobs.length === 0) return;

    try {
      let updates: any = {};
      const isRejection = bulkAction === "rejected";

      // Get job and employer details if this is a rejection action
      let jobsData = [];
      if (isRejection) {
        const { data, error: jobsFetchError } = await supabase
          .from("jobs")
          .select(`
            *,
            employers (
              id,
              company_name,
              email
            )
          `)
          .in("id", selectedJobs);

        if (jobsFetchError) throw jobsFetchError;
        jobsData = data || [];
      }

      if (bulkAction === "freelance") {
        updates = {
          is_freelance: true,
          job_type: 'freelance',
          freelance_until: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
          updated_at: new Date().toISOString()
        };
      } else if (bulkAction === "remove-freelance") {
        updates = {
          is_freelance: false,
          job_type: 'full-time',
          freelance_until: null,
          updated_at: new Date().toISOString()
        };
      } else {
        updates = { status: bulkAction };
      }

      const { error } = await supabase
        .from("jobs")
        .update(updates)
        .in("id", selectedJobs);

      if (error) throw error;

      // Send notifications for rejected jobs
      if (isRejection && jobsData.length > 0) {
        for (const job of jobsData) {
          if (job.employers) {
            try {
              // Create notification in database
              const { error: notificationError } = await supabase
                .from("notifications")
                .insert({
                  user_id: job.employers.id,
                  job_id: job.id,
                  title: "Job Rejected",
                  message: `Your job posting "${job.title}" has been rejected by admin. Please review your job posting and make necessary improvements before resubmitting.`,
                  is_read: false,
                  created_at: new Date().toISOString()
                });

              if (notificationError && !notificationError.message.includes('relation "notifications" does not exist')) {
                console.error("Error creating notification:", notificationError);
              }

              // Try to send email notification
              try {
                await supabase.functions.invoke('send-job-notifications', {
                  body: {
                    type: 'job_rejected',
                    to: job.employers.email,
                    jobTitle: job.title,
                    reason: 'Your job posting has been rejected in bulk action.',
                    companyName: job.employers.company_name
                  }
                });
              } catch (emailError) {
                console.warn("Email notification failed:", emailError);
              }
            } catch (notifyError) {
              console.error("Error sending rejection notification:", notifyError);
            }
          }
        }
      }

      const actionMessages = {
        freelance: `${selectedJobs.length} jobs set as freelance`,
        'remove-freelance': `${selectedJobs.length} jobs removed from freelance`,
        rejected: `${selectedJobs.length} jobs rejected and employers notified`,
      };

      toast({
        title: t("admin.success"),
        description: actionMessages[bulkAction as keyof typeof actionMessages] || `${selectedJobs.length} jobs updated to ${bulkAction}`,
      });

      await fetchJobs();
      setSelectedJobs([]);
      setBulkAction("");
    } catch (error: any) {
      console.error("Error performing bulk action:", error);
      toast({
        title: t("admin.error"),
        description: error.message || "Failed to perform bulk action",
        variant: "destructive",
      });
    }
  };

  const handleBulkDelete = async () => {
    if (selectedJobs.length === 0) return;

    try {
      const { error } = await supabase
        .from("jobs")
        .delete()
        .in("id", selectedJobs);

      if (error) throw error;

      toast({
        title: t("admin.success"),
        description: `${selectedJobs.length} jobs deleted`,
      });

      await fetchJobs();
      setSelectedJobs([]);
    } catch (error: any) {
      console.error("Error performing bulk delete:", error);
      toast({
        title: t("admin.error"),
        description: error.message || "Failed to delete jobs",
        variant: "destructive",
      });
    }
  };

  const toggleJobSelection = (jobId: string) => {
    setSelectedJobs(prev => 
      prev.includes(jobId) 
        ? prev.filter(id => id !== jobId)
        : [...prev, jobId]
    );
  };

  const toggleSelectAll = () => {
    setSelectedJobs(prev => 
      prev.length === filteredJobs.length 
        ? [] 
        : filteredJobs.map(job => job.id)
    );
  };

  const filteredJobs = jobs.filter(job => {
    const matchesSearch = job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.employers?.company_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.category.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === "all" || 
      (statusFilter === "freelance" ? job.is_freelance === true : job.status === statusFilter);
    const matchesCategory = categoryFilter === "all" || job.category === categoryFilter;
    
    return matchesSearch && matchesStatus && matchesCategory;
  });

  const categories = [...new Set(jobs.map(job => job.category))];
  const statusCounts = {
    all: jobs.length,
    pending: jobs.filter(j => j.status === "pending").length,
    active: jobs.filter(j => j.status === "active").length,
    inactive: jobs.filter(j => j.status === "inactive").length,
    rejected: jobs.filter(j => j.status === "rejected").length,
    featured: jobs.filter(j => j.status === "featured").length,
    freelance: jobs.filter(j => j.is_freelance === true).length,
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active": return "default";
      case "featured": return "default";
      case "pending": return "secondary";
      case "inactive": return "outline";
      case "rejected": return "destructive";
      default: return "secondary";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "active": return t("admin.visible");
      case "featured": return "Featured";
      case "freelance": return "Freelance";
      case "pending": return t("admin.pending");
      case "inactive": return t("admin.hidden");
      case "rejected": return t("admin.rejected");
      default: return status;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <RefreshCw className="h-6 w-6 animate-spin mr-2" />
        {t("admin.loading")}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Refresh */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">All Jobs</h2>
        <Button onClick={fetchJobs} variant="outline" size="sm">
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Filters and Stats */}
      <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
        <div className="flex gap-2 flex-wrap">
          <Input
            placeholder={t("admin.searchJobs")}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-64"
          />
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder={t("admin.status")} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t("admin.allStatus")} ({statusCounts.all})</SelectItem>
              <SelectItem value="pending">{t("admin.pending")} ({statusCounts.pending})</SelectItem>
              <SelectItem value="active">{t("admin.visible")} ({statusCounts.active})</SelectItem>
              <SelectItem value="featured">Featured ({statusCounts.featured})</SelectItem>
              <SelectItem value="freelance">Freelance ({statusCounts.freelance})</SelectItem>
              <SelectItem value="inactive">{t("admin.hidden")} ({statusCounts.inactive})</SelectItem>
              <SelectItem value="rejected">{t("admin.rejected")} ({statusCounts.rejected})</SelectItem>
            </SelectContent>
          </Select>
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder={t("admin.category")} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t("admin.allCategories")}</SelectItem>
              {categories.map(category => (
                <SelectItem key={category} value={category}>{category}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Bulk Actions */}
      {selectedJobs.length > 0 && (
        <Card className="p-4 bg-muted/50">
          <div className="flex items-center gap-4">
            <span className="text-sm font-medium">
              {selectedJobs.length} jobs selected
            </span>
            <Select value={bulkAction} onValueChange={setBulkAction}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Bulk Action" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="active">Make Active</SelectItem>
                <SelectItem value="inactive">Make Inactive</SelectItem>
                <SelectItem value="featured">Make Featured</SelectItem>
                <SelectItem value="pending">Move to Pending</SelectItem>
                <SelectItem value="rejected">Reject</SelectItem>
                <SelectItem value="freelance">Make Freelance</SelectItem>
                <SelectItem value="remove-freelance">Remove Freelance</SelectItem>
              </SelectContent>
            </Select>
            <Button onClick={handleBulkAction} disabled={!bulkAction}>
              Apply
            </Button>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" size="sm">
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete Selected
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete {selectedJobs.length} jobs?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This action cannot be undone. All selected jobs will be permanently deleted.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>{t("admin.cancel")}</AlertDialogCancel>
                  <AlertDialogAction onClick={handleBulkDelete}>
                    {t("admin.delete")}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </Card>
      )}

      {/* Jobs List */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>{t("admin.jobsCount", { count: filteredJobs.length })}</CardTitle>
            {filteredJobs.length > 0 && (
              <div className="flex items-center gap-2">
                <Checkbox
                  checked={selectedJobs.length === filteredJobs.length}
                  onCheckedChange={toggleSelectAll}
                />
                <span className="text-sm">Select All</span>
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {filteredJobs.length === 0 ? (
            <p className="text-center py-8 text-muted-foreground">
              {t("admin.noJobsFound")}
            </p>
          ) : (
            <div className="space-y-4">
              {filteredJobs.map((job) => (
                <Card key={job.id} className="p-4">
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex items-start gap-3 flex-1">
                      <Checkbox
                        checked={selectedJobs.includes(job.id)}
                        onCheckedChange={() => toggleJobSelection(job.id)}
                      />
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-semibold text-lg">{job.title}</h3>
                          {job.status === "featured" && (
                            <Star className="h-4 w-4 text-yellow-500 fill-current" />
                          )}
                          { (job.job_type === 'freelance' || job.is_freelance) && (
                            <Briefcase className="h-4 w-4 text-freelance fill-current" />
                          )}
                        </div>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground mb-2">
                          <div className="flex items-center gap-1">
                            <Building className="h-4 w-4" />
                            {job.employers?.company_name}
                          </div>
                          <div className="flex items-center gap-1">
                            <MapPin className="h-4 w-4" />
                            {job.city}
                          </div>
                          <Badge variant="outline">{job.category}</Badge>
                        </div>
                        <p className="text-sm line-clamp-2">{job.description}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2 ml-4">
                      <Badge variant={getStatusColor(job.status)}>
                        {getStatusText(job.status)}
                      </Badge>
                      {(job.job_type === 'freelance' || job.is_freelance) && (
                        <Badge variant="freelance">
                          Freelance
                        </Badge>
                      )}
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center justify-between pt-3 border-t">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Calendar className="h-3 w-3" />
                      {t("admin.postedOn")} {new Date(job.created_at || job.posted_date).toLocaleDateString()}
                      <span>•</span>
                      {t("admin.deadline")} {new Date(job.deadline).toLocaleDateString()}
                    </div>

                    <div className="flex items-center gap-1">
                      {job.status === "pending" && (
                        <>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleJobApproval(job.id, true)}
                            className="text-green-600 hover:bg-green-50"
                          >
                            <Check className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleJobApproval(job.id, false)}
                            className="text-red-600 hover:bg-red-50"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </>
                      )}
                      
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setViewingJob(job)}
                        className="text-blue-600"
                      >
                        <Info className="h-4 w-4" />
                      </Button>
                      
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setEditingJob(job)}
                        className="text-purple-600"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="outline" size="sm">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => setViewingJob(job)}>
                            <Info className="h-4 w-4 mr-2" />
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => setEditingJob(job)}>
                            <Edit className="h-4 w-4 mr-2" />
                            Edit Job
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleJobStatusChange(job.id, "active")}>
                            <Eye className="h-4 w-4 mr-2" />
                            Make Active
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleJobStatusChange(job.id, "inactive")}>
                            <EyeOff className="h-4 w-4 mr-2" />
                            Make Inactive
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleJobStatusChange(job.id, job.status === "featured" ? "active" : "featured")}>
                            {job.status === "featured" ? (
                              <>
                                <StarOff className="h-4 w-4 mr-2" />
                                Remove Featured
                              </>
                            ) : (
                              <>
                                <Star className="h-4 w-4 mr-2" />
                                Make Featured
                              </>
                            )}
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleFreelanceToggle(job.id, (job.job_type === 'freelance') || !!job.is_freelance)}>
                            {(job.job_type === 'freelance' || job.is_freelance) ? (
                              <>
                                <BriefcaseIcon className="h-4 w-4 mr-2" />
                                Remove Freelance
                              </>
                            ) : (
                              <>
                                <Briefcase className="h-4 w-4 mr-2" />
                                Make Freelance
                              </>
                            )}
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleJobStatusChange(job.id, "pending")}>
                            <RefreshCw className="h-4 w-4 mr-2" />
                            Move to Pending
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleJobStatusChange(job.id, "rejected")}>
                            <X className="h-4 w-4 mr-2" />
                            Reject
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                      
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="outline" size="sm" className="text-red-600">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>{t("admin.confirmDelete")}</AlertDialogTitle>
                            <AlertDialogDescription>
                              {t("admin.deleteJobWarning")}
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>{t("admin.cancel")}</AlertDialogCancel>
                            <AlertDialogAction onClick={() => handleJobDelete(job.id)}>
                              {t("admin.delete")}
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <JobEditDialog
        isOpen={!!editingJob}
        onClose={() => setEditingJob(null)}
        job={editingJob}
        onSuccess={fetchJobs}
      />

      {/* Detail Dialog */}
      <JobDetailDialog
        isOpen={!!viewingJob}
        onClose={() => setViewingJob(null)}
        job={viewingJob}
      />
    </div>
  );
}