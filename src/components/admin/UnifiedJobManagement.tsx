import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Job } from "@/hooks/useJobs";
import { format } from "date-fns";
import { 
  Search, 
  Crown, 
  Star,
  Eye, 
  EyeOff, 
  CheckCircle, 
  XCircle,
  Calendar,
  DollarSign,
  Building,
  Clock,
  AlertTriangle,
  Briefcase
} from "lucide-react";
import { FreelanceJobReviewDialog } from "./FreelanceJobReviewDialog";

interface JobRequest {
  id: string;
  job_id: string;
  employer_id: string;
  transaction_reference: string;
  payment_screenshot_url?: string;
  amount: number;
  currency: string;
  status: 'pending' | 'approved' | 'rejected';
  submitted_at: string;
  processed_at?: string;
  processed_by?: string;
  admin_notes?: string;
  jobs: {
    title: string;
    description: string;
    city: string;
    category: string;
    deadline: string;
    job_type?: string;
  };
  employers: {
    company_name: string;
    email: string;
  };
}

export const UnifiedJobManagement = () => {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [jobRequests, setJobRequests] = useState<JobRequest[]>([]);
  const [filteredJobs, setFilteredJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [requestTypeFilter, setRequestTypeFilter] = useState("all"); // New filter for requests
  const [activeTab, setActiveTab] = useState("jobs"); // New tab state
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [selectedRequest, setSelectedRequest] = useState<JobRequest | null>(null);
  const [isReviewDialogOpen, setIsReviewDialogOpen] = useState(false);
  const [isRequestDialogOpen, setIsRequestDialogOpen] = useState(false);
  const [adminNotes, setAdminNotes] = useState("");
  const [processing, setProcessing] = useState(false);
  const { toast } = useToast();
  const { t } = useLanguage();
  const { user } = useAuth();

  useEffect(() => {
    fetchAllData();
  }, []);

  useEffect(() => {
    filterJobs();
  }, [jobs, searchTerm, typeFilter, statusFilter]);

  const fetchAllData = async () => {
    try {
      setLoading(true);
      await Promise.all([fetchJobs(), fetchJobRequests()]);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchJobs = async () => {
    try {
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
    } catch (error) {
      console.error("Error fetching jobs:", error);
      toast({
        title: t("messages.error"),
        description: "Could not fetch jobs",
        variant: "destructive",
      });
    }
  };

  const fetchJobRequests = async () => {
    try {
      const { data, error } = await (supabase as any)
        .from("featured_job_requests")
        .select(`
          *,
          jobs!inner (
            title,
            description,
            city,
            category,
            deadline,
            job_type
          ),
          employers (
            company_name,
            email
          )
        `)
        .order("submitted_at", { ascending: false });

      if (error && !error.message.includes('relation "featured_job_requests" does not exist')) {
        throw error;
      }
      setJobRequests((data || []) as JobRequest[]);
    } catch (error) {
      console.error("Error fetching job requests:", error);
      setJobRequests([]);
    }
  };

  const filterJobs = () => {
    // Only show Featured and Freelance jobs, exclude regular jobs
    let filtered = jobs.filter(job => job.is_freelance === true || job.is_featured === true);

    if (searchTerm) {
      filtered = filtered.filter(
        (job) =>
          job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          job.employers?.company_name?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (typeFilter !== "all") {
      if (typeFilter === "freelance") {
        filtered = filtered.filter(job => job.is_freelance === true);
      } else if (typeFilter === "featured") {
        filtered = filtered.filter(job => job.is_featured === true);
      }
    }

    if (statusFilter !== "all") {
      filtered = filtered.filter(job => job.status === statusFilter);
    }

    setFilteredJobs(filtered);
  };

  const approveFreelanceJob = async (jobId: string) => {
    try {
      const freelanceUntil = new Date();
      freelanceUntil.setDate(freelanceUntil.getDate() + 30);

      const { error } = await supabase
        .from("jobs")
        .update({
          is_freelance: true,
          freelance_until: freelanceUntil.toISOString(),
          status: 'active',
          updated_at: new Date().toISOString()
        })
        .eq("id", jobId);

      if (error) throw error;

      toast({
        title: t("messages.success"),
        description: "Freelance job approved and activated",
      });

      fetchAllData();
    } catch (error) {
      console.error("Error approving freelance job:", error);
      toast({
        title: t("messages.error"),
        description: "Could not approve freelance job",
        variant: "destructive",
      });
    }
  };

  const handleJobRequest = async (requestId: string, action: 'approved' | 'rejected') => {
    setProcessing(true);

    try {
      const request = jobRequests.find(r => r.id === requestId);
      if (!request) return;

      const isFreelance = request.jobs.job_type === 'freelance';

      if (action === 'approved') {
        // Update request status
        const { error: requestError } = await (supabase as any)
          .from("featured_job_requests")
          .update({
            status: action,
            processed_at: new Date().toISOString(),
            processed_by: user?.id || 'admin',
            admin_notes: adminNotes,
          })
          .eq("id", requestId);

        if (requestError) throw requestError;

        if (isFreelance) {
          // Handle freelance job approval
          const freelanceUntil = new Date();
          freelanceUntil.setDate(freelanceUntil.getDate() + 30);

          const { error: jobError } = await supabase
            .from("jobs")
            .update({
              is_freelance: true,
              freelance_until: freelanceUntil.toISOString(),
              status: 'active',
            })
            .eq("id", request.job_id);

          if (jobError) throw jobError;
        } else {
          // Handle featured job approval
          const featuredUntil = new Date();
          featuredUntil.setDate(featuredUntil.getDate() + 30);

          const { error: jobError } = await supabase
            .from("jobs")
            .update({
              is_featured: true,
              featured_until: featuredUntil.toISOString().split('T')[0],
              status: 'active',
            })
            .eq("id", request.job_id);

          if (jobError && !jobError.message.includes('column "is_featured"')) {
            throw jobError;
          }
        }
      } else {
        // Handle rejection
        const { error: requestError } = await (supabase as any)
          .from("featured_job_requests")
          .update({
            status: action,
            processed_at: new Date().toISOString(),
            processed_by: user?.id || 'admin',
            admin_notes: adminNotes,
          })
          .eq("id", requestId);

        if (requestError) throw requestError;

        // Send rejection message
        const jobType = isFreelance ? "Freelance" : "Featured";
        await sendRejectionMessage(request.job_id, request.employer_id, request.jobs.title, jobType, adminNotes);
      }

      toast({
        title: "Success!",
        description: action === 'approved' 
          ? `${isFreelance ? 'Freelance' : 'Featured'} job request approved successfully!` 
          : `${isFreelance ? 'Freelance' : 'Featured'} job request rejected.`,
      });

      fetchAllData();
      setSelectedRequest(null);
      setAdminNotes("");
      setIsRequestDialogOpen(false);
    } catch (error: any) {
      console.error('Error processing request:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to process request",
        variant: "destructive",
      });
    } finally {
      setProcessing(false);
    }
  };

  const suspendJob = async (jobId: string, jobType: string) => {
    try {
      if (jobType === 'freelance') {
        const { error } = await (supabase as any).rpc('suspend_freelance_job', { job_id: jobId, notes: null });
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("jobs")
          .update({ status: 'inactive' })
          .eq("id", jobId);
        if (error) throw error;
      }

      toast({
        title: t("messages.success"),
        description: "Job suspended successfully",
      });

      fetchAllData();
    } catch (error) {
      console.error("Error suspending job:", error);
      toast({
        title: t("messages.error"),
        description: "Could not suspend job",
        variant: "destructive",
      });
    }
  };

  const extendPeriod = async (jobId: string, jobType: string) => {
    try {
      if (jobType === 'freelance') {
        const { error } = await (supabase as any).rpc('extend_freelance_period', { job_id: jobId, days: 30 });
        if (error) throw error;
      } else {
        const featuredUntil = new Date();
        featuredUntil.setDate(featuredUntil.getDate() + 30);
        const { error } = await supabase
          .from("jobs")
          .update({ featured_until: featuredUntil.toISOString().split('T')[0] })
          .eq("id", jobId);
        if (error) throw error;
      }

      toast({
        title: t("messages.success"),
        description: `${jobType === 'freelance' ? 'Freelance' : 'Featured'} period extended by 30 days`,
      });

      fetchAllData();
    } catch (error) {
      console.error("Error extending period:", error);
      toast({
        title: t("messages.error"),
        description: "Could not extend period",
        variant: "destructive",
      });
    }
  };

  const unsuspendJob = async (jobId: string) => {
    try {
      const { error } = await supabase
        .from("jobs")
        .update({ status: 'active' })
        .eq("id", jobId);

      if (error) throw error;

      toast({
        title: t("messages.success"),
        description: "Job unsuspended successfully",
      });

      fetchAllData();
    } catch (error) {
      console.error("Error unsuspending job:", error);
      toast({
        title: t("messages.error"),
        description: "Could not unsuspend job",
        variant: "destructive",
      });
    }
  };

  const deleteJob = async (jobId: string) => {
    if (!confirm("Are you sure you want to delete this job? This action cannot be undone.")) {
      return;
    }

    try {
      const { error } = await supabase
        .from("jobs")
        .delete()
        .eq("id", jobId);

      if (error) throw error;

      toast({
        title: t("messages.success"),
        description: "Job deleted successfully",
      });

      fetchAllData();
    } catch (error) {
      console.error("Error deleting job:", error);
      toast({
        title: t("messages.error"),
        description: "Could not delete job",
        variant: "destructive",
      });
    }
  };

  const sendRejectionMessage = async (jobId: string, employerId: string, jobTitle: string, jobType: string, reason?: string) => {
    try {
      // Create notification for the employer
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

  const getJobTypeBadge = (job: Job) => {
    const badges = [];
    
    if (job.is_freelance) {
      badges.push(
        <Badge key="freelance" variant="secondary" className="text-xs bg-blue-100 text-blue-800 border-blue-200">
          <Briefcase className="w-3 h-3 mr-1" />
          Freelance Job
        </Badge>
      );
    }
    
    if (job.is_featured) {
      badges.push(
        <Badge key="featured" variant="secondary" className="text-xs bg-yellow-100 text-yellow-800 border-yellow-200">
          <Crown className="w-3 h-3 mr-1" />
          Featured Job
        </Badge>
      );
    }

    return badges;
  };

  const getStatusBadge = (status: string, job: Job) => {
    const isExpired = (job.is_freelance && job.freelance_until && new Date(job.freelance_until) < new Date()) ||
                     (job.is_featured && job.featured_until && new Date(job.featured_until) < new Date()) ||
                     (new Date(job.deadline) < new Date());

    if (status === 'active' && !isExpired) {
      return (
        <Badge variant="default" className="text-xs bg-green-100 text-green-800 border-green-200">
          <Eye className="w-3 h-3 mr-1" />
          Active
        </Badge>
      );
    } else {
      return (
        <Badge variant="outline" className="text-xs bg-red-50 text-red-700 border-red-200">
          <EyeOff className="w-3 h-3 mr-1" />
          {isExpired ? 'Expired' : status}
        </Badge>
      );
    }
  };

  const openReviewDialog = (job: Job) => {
    setSelectedJob(job);
    setIsReviewDialogOpen(true);
  };

  const openRequestDialog = (request: JobRequest) => {
    setSelectedRequest(request);
    setAdminNotes("");
    setIsRequestDialogOpen(true);
  };

  // Filter job requests based on type
  const filteredJobRequests = jobRequests.filter(request => {
    if (requestTypeFilter === "featured") {
      return request.jobs.job_type !== 'freelance';
    }
    if (requestTypeFilter === "freelance") {
      return request.jobs.job_type === 'freelance';
    }
    return true; // Show all if filter is "all"
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-lg">{t("admin.loading")}</div>
      </div>
    );
  }

  const pendingRequests = jobRequests.filter(r => r.status === 'pending');

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Featured & Freelance Jobs Management</h2>
          <p className="text-muted-foreground">
            Manage Featured and Freelance jobs - Review, approve, suspend, and extend job periods
          </p>
        </div>
        <div className="flex gap-2">
          <Badge variant="secondary" className="text-lg">
            {filteredJobs.length} Jobs
          </Badge>
          {pendingRequests.length > 0 && (
            <Badge variant="default" className="text-lg bg-yellow-600">
              {pendingRequests.length} Pending Requests
            </Badge>
          )}
        </div>
      </div>

      {/* Pending Featured Job Requests */}
      {pendingRequests.length > 0 && (
        <Card className="border-yellow-200 bg-yellow-50/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-yellow-700">
              <AlertTriangle className="w-5 h-5" />
              Pending Job Requests ({pendingRequests.length})
            </CardTitle>
            <CardDescription>
              Review and approve featured & freelance job payment requests
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4">
              {pendingRequests.map((request) => (
                <div
                  key={request.id}
                  className="border rounded-lg p-4 bg-white hover:bg-yellow-50/50 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Building className="h-4 w-4 text-primary" />
                        <strong>{request.employers.company_name}</strong>
                        <Badge variant="secondary" className="text-xs bg-yellow-100 text-yellow-800">
                          <Clock className="w-3 h-3 mr-1" />
                          {request.jobs.job_type === 'freelance' ? 'Pending Freelance Review' : 'Pending Featured Review'}
                        </Badge>
                      </div>
                      <div className="text-lg font-medium">{request.jobs.title}</div>
                      <div className="text-sm text-muted-foreground">
                        {request.jobs.city} • {request.jobs.category}
                      </div>
                      <div className="flex items-center gap-4 text-sm">
                        <div className="flex items-center gap-1">
                          <DollarSign className="h-4 w-4" />
                          {request.amount} {request.currency}
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          {new Date(request.submitted_at).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                    <Button
                      size="sm"
                      onClick={() => openRequestDialog(request)}
                      className="bg-yellow-600 hover:bg-yellow-700 text-white"
                    >
                      <Eye className="w-3 h-3 mr-1" />
                      Review Payment
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Main Jobs Management */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Crown className="w-5 h-5" />
            All Jobs Management
          </CardTitle>
          <CardDescription>
            Control job visibility, status, and special features
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder={t("admin.searchJobs")}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
                <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="featured">Featured Jobs</SelectItem>
                <SelectItem value="freelance">Freelance Jobs</SelectItem>
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-4">
            {filteredJobs.map((job) => {
              const isExpired = (job.is_freelance && job.freelance_until && new Date(job.freelance_until) < new Date()) ||
                              (job.is_featured && job.featured_until && new Date(job.featured_until) < new Date()) ||
                              (new Date(job.deadline) < new Date());
              
              return (
                <div
                  key={job.id}
                  className="border rounded-lg p-4 hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-semibold">{job.title}</h3>
                        {getJobTypeBadge(job)}
                        {getStatusBadge(job.status, job)}
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">
                        {job.employers?.company_name} • {job.city} • {job.category}
                      </p>
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span>{t("admin.postedOn")} {format(new Date(job.created_at), "MMM dd, yyyy")}</span>
                        <span>Deadline: {format(new Date(job.deadline), "MMM dd, yyyy")}</span>
                        {job.is_freelance && job.freelance_until && (
                          <span>Freelance until: {format(new Date(job.freelance_until), "MMM dd, yyyy")}</span>
                        )}
                        {job.is_featured && job.featured_until && (
                          <span>Featured until: {format(new Date(job.featured_until), "MMM dd, yyyy")}</span>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-2 flex-wrap">
                      {/* Review Job - for pending jobs */}
                      {job.status === 'pending' && (
                        <Button
                          size="sm"
                          onClick={() => openReviewDialog(job)}
                          className="bg-blue-600 hover:bg-blue-700 text-white"
                        >
                          <CheckCircle className="w-3 h-3 mr-1" />
                          Review
                        </Button>
                      )}
                      
                      {/* Suspend/Unsuspend Job */}
                      {job.status === 'active' ? (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => suspendJob(job.id, job.is_freelance ? 'freelance' : 'featured')}
                          className="border-red-200 text-red-700 hover:bg-red-50"
                        >
                          <EyeOff className="w-3 h-3 mr-1" />
                          Suspend
                        </Button>
                      ) : job.status === 'inactive' && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => unsuspendJob(job.id)}
                          className="border-green-200 text-green-700 hover:bg-green-50"
                        >
                          <Eye className="w-3 h-3 mr-1" />
                          Unsuspend
                        </Button>
                      )}

                      {/* Extend Period */}
                      {(job.is_freelance || job.is_featured) && (
                        <Button
                          size="sm"
                          variant="default"
                          onClick={() => extendPeriod(job.id, job.is_freelance ? 'freelance' : 'featured')}
                          className="bg-green-600 hover:bg-green-700 text-white"
                        >
                          <Calendar className="w-3 h-3 mr-1" />
                          Extend +30 Days
                        </Button>
                      )}

                      {/* Delete Job */}
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => deleteJob(job.id)}
                        className="border-red-200 text-red-700 hover:bg-red-50"
                      >
                        <XCircle className="w-3 h-3 mr-1" />
                        Delete
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {filteredJobs.length === 0 && (
            <div className="text-center py-8">
              <Crown className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No jobs found matching the current filters</p>
            </div>
          )}
        </CardContent>
      </Card>
      
      {/* Review Dialog for Jobs */}
      <FreelanceJobReviewDialog
        open={isReviewDialogOpen}
        onOpenChange={setIsReviewDialogOpen}
        job={selectedJob}
        onReviewComplete={fetchAllData}
      />

      {/* Featured Request Review Dialog */}
      <Dialog open={isRequestDialogOpen} onOpenChange={setIsRequestDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {selectedRequest?.jobs.job_type === 'freelance' ? 'Freelance' : 'Featured'} Job Request Details
            </DialogTitle>
          </DialogHeader>
          
          {selectedRequest && (
            <div className="space-y-6">
              {/* Job Details */}
              <div className="space-y-2">
                <h3 className="text-lg font-semibold">Job Information</h3>
                <div className="bg-muted/30 p-4 rounded-lg space-y-2">
                  <div><strong>Title:</strong> {selectedRequest.jobs.title}</div>
                  <div><strong>Company:</strong> {selectedRequest.employers.company_name}</div>
                  <div><strong>Location:</strong> {selectedRequest.jobs.city}</div>
                  <div><strong>Category:</strong> {selectedRequest.jobs.category}</div>
                  <div><strong>Deadline:</strong> {selectedRequest.jobs.deadline}</div>
                </div>
              </div>

              {/* Payment Details */}
              <div className="space-y-2">
                <h3 className="text-lg font-semibold">Payment Information</h3>
                <div className="bg-muted/30 p-4 rounded-lg space-y-2">
                  <div><strong>Amount:</strong> {selectedRequest.amount} {selectedRequest.currency}</div>
                  <div><strong>Transaction Reference:</strong> {selectedRequest.transaction_reference}</div>
                  <div><strong>Submitted:</strong> {new Date(selectedRequest.submitted_at).toLocaleString()}</div>
                </div>
              </div>

              {/* Payment Screenshot */}
              {selectedRequest.payment_screenshot_url && (
                <div className="space-y-2">
                  <h3 className="text-lg font-semibold">Payment Screenshot</h3>
                  <img 
                    src={selectedRequest.payment_screenshot_url} 
                    alt="Payment screenshot" 
                    className="max-w-full rounded-lg border"
                  />
                </div>
              )}

              {/* Admin Notes */}
              <div className="space-y-2">
                <Label htmlFor="adminNotes">Admin Notes (Optional)</Label>
                <Textarea
                  id="adminNotes"
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  placeholder="Add any notes about this request..."
                  rows={3}
                />
              </div>

              {/* Actions */}
              {selectedRequest.status === 'pending' && (
                <div className="flex gap-4 pt-4">
                  <Button
                    onClick={() => handleJobRequest(selectedRequest.id, 'rejected')}
                    variant="destructive"
                    disabled={processing}
                    className="flex-1"
                  >
                    <XCircle className="h-4 w-4 mr-2" />
                    {processing ? "Processing..." : "Reject"}
                  </Button>
                  <Button
                    onClick={() => handleJobRequest(selectedRequest.id, 'approved')}
                    disabled={processing}
                    className="flex-1"
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    {processing ? "Processing..." : "Approve"}
                  </Button>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};