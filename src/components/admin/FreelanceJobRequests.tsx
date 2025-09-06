import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/contexts/LanguageContext";
import { supabase } from "@/integrations/supabase/client";
import { 
  AlertTriangle, 
  Eye, 
  CheckCircle, 
  XCircle, 
  DollarSign, 
  Calendar,
  Building,
  MapPin,
  User,
  Briefcase,
  Clock,
  ImageIcon
} from "lucide-react";

interface FreelanceJobRequest {
  id: string;
  job_id: string;
  employer_id: string;
  transaction_reference: string;
  payment_screenshot_url?: string;
  amount: number;
  currency: string;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
  admin_notes?: string;
  jobs: {
    title: string;
    city: string;
    category: string;
    description: string;
    job_type: string;
  };
  employers: {
    company_name: string;
    email: string;
  };
}

export const FreelanceJobRequests = () => {
  const [requests, setRequests] = useState<FreelanceJobRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState<string | null>(null);
  const [selectedRequest, setSelectedRequest] = useState<FreelanceJobRequest | null>(null);
  const [adminNotes, setAdminNotes] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { toast } = useToast();
  const { t } = useLanguage();

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      
      // Fetch freelance job requests from employers (not admin-posted jobs)
      const { data, error } = await supabase
        .from("featured_job_requests")
        .select(`
          *,
          jobs!inner (
            title,
            city, 
            category,
            description,
            job_type
          ),
          employers (
            company_name,
            email
          )
        `)
        .eq("jobs.job_type", "freelance")
        .order("submitted_at", { ascending: false });

      if (error && !error.message.includes('relation')) {
        throw error;
      }

      setRequests((data || []) as FreelanceJobRequest[]);
    } catch (error) {
      console.error("Error fetching freelance requests:", error);
      toast({
        title: t("messages.error"),
        description: "Failed to load freelance job requests",
        variant: "destructive",
      });
      setRequests([]);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (requestId: string) => {
    setProcessing(requestId);
    try {
      const request = requests.find(r => r.id === requestId);
      if (!request) throw new Error("Request not found");

      // Update request status
      let { error } = await supabase
        .from("featured_job_requests")
        .update({
          status: 'approved',
          approved_at: new Date().toISOString(),
          admin_notes: adminNotes || null
        })
        .eq("id", requestId);

      if (error) throw error;

      // Update job to be freelance and active
      ({ error } = await supabase
        .from("jobs")
        .update({
          job_type: 'freelance',
          is_freelance: true,
          freelance_until: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
          status: 'active'
        })
        .eq("id", request.job_id));

      if (error) throw error;

      toast({
        title: "Request Approved",
        description: "Freelance job has been activated successfully.",
      });

      await fetchRequests();
      setIsDialogOpen(false);
      setAdminNotes("");
    } catch (error: any) {
      console.error("Error approving request:", error);
      toast({
        title: t("messages.error"),
        description: error.message || "Failed to approve request",
        variant: "destructive",
      });
    } finally {
      setProcessing(null);
    }
  };

  const handleReject = async (requestId: string) => {
    setProcessing(requestId);
    try {
      const { error } = await supabase
        .from("featured_job_requests")
        .update({
          status: 'rejected',
          admin_notes: adminNotes || null
        })
        .eq("id", requestId);

      if (error) throw error;

      toast({
        title: "Request Rejected",
        description: "Freelance job request has been rejected.",
      });

      await fetchRequests();
      setIsDialogOpen(false);
      setAdminNotes("");
    } catch (error: any) {
      console.error("Error rejecting request:", error);
      toast({
        title: t("messages.error"),
        description: error.message || "Failed to reject request",
        variant: "destructive",
      });
    } finally {
      setProcessing(null);
    }
  };

  const openRequestDialog = (request: FreelanceJobRequest) => {
    setSelectedRequest(request);
    setAdminNotes(request.admin_notes || "");
    setIsDialogOpen(true);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-300">
          <Clock className="h-3 w-3 mr-1" />
          Pending
        </Badge>;
      case 'approved':
        return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-300">
          <CheckCircle className="h-3 w-3 mr-1" />
          Approved
        </Badge>;
      case 'rejected':
        return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-300">
          <XCircle className="h-3 w-3 mr-1" />
          Rejected
        </Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">Freelance Job Requests</h2>
        </div>
        <div className="grid gap-4">
          {[1, 2, 3].map(i => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-4 bg-muted rounded w-3/4 mb-3"></div>
                <div className="h-4 bg-muted rounded w-1/2"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  const pendingRequests = requests.filter(r => r.status === 'pending');
  const processedRequests = requests.filter(r => r.status !== 'pending');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Freelance Job Requests</h2>
          <p className="text-muted-foreground">
            Review and approve freelance job payment requests
          </p>
        </div>
        <Badge variant="outline" className="text-lg px-3 py-1">
          {pendingRequests.length} Pending
        </Badge>
      </div>

      {/* Pending Requests Alert */}
      {pendingRequests.length > 0 && (
        <Alert className="border-amber-200 bg-amber-50 dark:bg-amber-950/20">
          <AlertTriangle className="h-4 w-4 text-amber-600" />
          <AlertDescription className="text-amber-800 dark:text-amber-200">
            You have {pendingRequests.length} pending freelance job request{pendingRequests.length > 1 ? 's' : ''} awaiting review.
          </AlertDescription>
        </Alert>
      )}

      {/* Pending Requests */}
      {pendingRequests.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-amber-700">Pending Requests ({pendingRequests.length})</h3>
          <div className="grid gap-4">
            {pendingRequests.map((request) => (
              <Card key={request.id} className="border-amber-200 bg-gradient-to-r from-amber-50 to-yellow-50 dark:from-amber-950/20 dark:to-yellow-950/20">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 space-y-3">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-amber-100 dark:bg-amber-900/30 rounded-lg">
                          <Briefcase className="h-4 w-4 text-amber-600" />
                        </div>
                        <div>
                          <h4 className="font-semibold text-lg">{request.jobs.title}</h4>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <Building className="h-3 w-3" />
                              {request.employers.company_name}
                            </div>
                            <div className="flex items-center gap-1">
                              <MapPin className="h-3 w-3" />
                              {request.jobs.city}
                            </div>
                            <div className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              {new Date(request.created_at).toLocaleDateString()}
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-6 text-sm">
                        <div className="flex items-center gap-2">
                          <DollarSign className="h-4 w-4 text-green-600" />
                          <span className="font-medium">{request.amount} {request.currency}</span>
                        </div>
                        <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-300">
                          {request.jobs.category}
                        </Badge>
                        {getStatusBadge(request.status)}
                      </div>

                      <div className="flex items-center gap-2 text-sm">
                        <span className="font-medium">Transaction Ref:</span>
                        <code className="bg-muted px-2 py-1 rounded text-xs">
                          {request.transaction_reference}
                        </code>
                      </div>
                    </div>

                    <div className="flex flex-col gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => openRequestDialog(request)}
                        className="flex items-center gap-2"
                      >
                        <Eye className="h-4 w-4" />
                        Review Payment
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Processed Requests */}
      {processedRequests.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Recent Activity ({processedRequests.length})</h3>
          <div className="grid gap-4">
            {processedRequests.slice(0, 10).map((request) => (
              <Card key={request.id} className="opacity-75">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-muted rounded-lg">
                        <Briefcase className="h-4 w-4" />
                      </div>
                      <div>
                        <h4 className="font-medium">{request.jobs.title}</h4>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <span>{request.employers.company_name}</span>
                          <span>•</span>
                          <span>{request.amount} {request.currency}</span>
                          <span>•</span>
                          <span>{new Date(request.created_at).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>
                    {getStatusBadge(request.status)}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* No Requests */}
      {requests.length === 0 && (
        <Card>
          <CardContent className="p-12 text-center">
            <div className="mx-auto w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
              <Briefcase className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold mb-2">No Freelance Requests</h3>
            <p className="text-muted-foreground">
              There are no freelance job requests at the moment.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Request Review Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Review Freelance Job Request</DialogTitle>
          </DialogHeader>
          
          {selectedRequest && (
            <div className="space-y-6">
              {/* Job Info */}
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold text-lg mb-2">{selectedRequest.jobs.title}</h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-medium">Company:</span>
                      <p>{selectedRequest.employers.company_name}</p>
                    </div>
                    <div>
                      <span className="font-medium">Location:</span>
                      <p>{selectedRequest.jobs.city}</p>
                    </div>
                    <div>
                      <span className="font-medium">Category:</span>
                      <p>{selectedRequest.jobs.category}</p>
                    </div>
                    <div>
                      <span className="font-medium">Submitted:</span>
                      <p>{new Date(selectedRequest.created_at).toLocaleDateString()}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Payment Details */}
              <div className="bg-muted/50 p-4 rounded-lg">
                <h5 className="font-semibold mb-3">Payment Information</h5>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium">Amount:</span>
                    <p className="text-lg font-bold text-green-600">
                      {selectedRequest.amount} {selectedRequest.currency}
                    </p>
                  </div>
                  <div>
                    <span className="font-medium">Transaction Reference:</span>
                    <code className="block bg-background p-2 rounded mt-1">
                      {selectedRequest.transaction_reference}
                    </code>
                  </div>
                </div>
              </div>

              {/* Payment Screenshot */}
              {selectedRequest.payment_screenshot_url && (
                <div>
                  <h5 className="font-semibold mb-3 flex items-center gap-2">
                    <ImageIcon className="h-4 w-4" />
                    Payment Screenshot
                  </h5>
                  <div className="border rounded-lg p-2">
                    <img 
                      src={selectedRequest.payment_screenshot_url} 
                      alt="Payment screenshot" 
                      className="max-w-full h-auto rounded"
                    />
                  </div>
                </div>
              )}

              {/* Admin Notes */}
              <div>
                <Label htmlFor="adminNotes">Admin Notes (Optional)</Label>
                <Textarea
                  id="adminNotes"
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  placeholder="Add notes about this request..."
                  className="mt-2"
                />
              </div>

              {/* Action Buttons */}
              {selectedRequest.status === 'pending' && (
                <div className="flex gap-4 pt-4">
                  <Button
                    variant="outline"
                    onClick={() => handleReject(selectedRequest.id)}
                    disabled={processing === selectedRequest.id}
                    className="flex-1 text-red-600 border-red-300 hover:bg-red-50"
                  >
                    <XCircle className="h-4 w-4 mr-2" />
                    {processing === selectedRequest.id ? "Processing..." : "Reject Request"}
                  </Button>
                  <Button
                    onClick={() => handleApprove(selectedRequest.id)}
                    disabled={processing === selectedRequest.id}
                    className="flex-1 bg-green-600 hover:bg-green-700"
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    {processing === selectedRequest.id ? "Processing..." : "Approve & Activate"}
                  </Button>
                </div>
              )}

              {selectedRequest.status !== 'pending' && (
                <Alert>
                  <AlertDescription>
                    This request has already been {selectedRequest.status}.
                    {selectedRequest.admin_notes && (
                      <div className="mt-2">
                        <strong>Admin Notes:</strong> {selectedRequest.admin_notes}
                      </div>
                    )}
                  </AlertDescription>
                </Alert>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};