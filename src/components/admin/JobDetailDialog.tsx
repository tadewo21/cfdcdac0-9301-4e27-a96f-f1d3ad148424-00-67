import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { 
  Building, 
  MapPin, 
  Clock, 
  Calendar, 
  Mail, 
  Eye, 
  Star,
  Briefcase,
  DollarSign,
  Users,
  FileText
} from "lucide-react";
import { Job } from "@/hooks/useJobs";
import { getCategoryTranslation } from "@/lib/categoryTranslation";
import { useLanguage } from "@/contexts/LanguageContext";

interface JobDetailDialogProps {
  isOpen: boolean;
  onClose: () => void;
  job: Job | null;
}

export function JobDetailDialog({ isOpen, onClose, job }: JobDetailDialogProps) {
  const { t } = useLanguage();

  if (!job) return null;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
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
      case "active": return "Active";
      case "featured": return "Featured";
      case "pending": return "Pending";
      case "inactive": return "Inactive";
      case "rejected": return "Rejected";
      default: return status;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <DialogTitle className="text-2xl font-bold pr-8">{job.title}</DialogTitle>
              <DialogDescription className="mt-2 text-lg">
                <div className="flex items-center gap-2">
                  {job.employers?.company_logo_url ? (
                    <img 
                      src={job.employers.company_logo_url} 
                      alt={`${job.employers.company_name} logo`}
                      className="h-6 w-6 rounded object-cover"
                    />
                  ) : (
                    <Building className="h-5 w-5" />
                  )}
                  <span>{job.employers?.company_name || 'Unknown Company'}</span>
                  <span className="text-green-500">✅</span>
                </div>
              </DialogDescription>
            </div>
            <div className="flex flex-col gap-2">
              <Badge variant={getStatusColor(job.status)}>
                {getStatusText(job.status)}
              </Badge>
              {job.is_featured && (
                <Badge variant="default" className="bg-yellow-500">
                  <Star className="h-3 w-3 mr-1" />
                  Featured
                </Badge>
              )}
              {(job.job_type === 'freelance' || job.is_freelance) && (
                <Badge variant="outline" className="border-freelance text-freelance">
                  <Briefcase className="h-3 w-3 mr-1" />
                  Freelance
                </Badge>
              )}
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {/* Key Information Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="flex items-center gap-2 text-sm">
              <MapPin className="h-4 w-4 text-muted-foreground" />
              <span>{job.city}</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Briefcase className="h-4 w-4 text-muted-foreground" />
              <span>{getCategoryTranslation(job.category, t)}</span>
            </div>
            {job.job_type && (
              <div className="flex items-center gap-2 text-sm">
                <Users className="h-4 w-4 text-muted-foreground" />
                <span>{job.job_type}</span>
              </div>
            )}
            {job.salary_range && (
              <div className="flex items-center gap-2 text-sm">
                <DollarSign className="h-4 w-4 text-muted-foreground" />
                <span>{job.salary_range}</span>
              </div>
            )}
            <div className="flex items-center gap-2 text-sm">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span>Posted: {formatDate(job.posted_date || job.created_at)}</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span>Deadline: {formatDate(job.deadline)}</span>
            </div>
          </div>

          <Separator />

          {/* Job Description */}
          <div>
            <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Job Description
            </h3>
            <div className="prose prose-sm max-w-none text-muted-foreground">
              {job.description.split('\n').map((paragraph, index) => (
                <p key={index} className="mb-2">{paragraph}</p>
              ))}
            </div>
          </div>

          <Separator />

          {/* Requirements */}
          <div>
            <h3 className="text-lg font-semibold mb-3">Requirements</h3>
            <div className="space-y-1">
              {job.requirements.split('\n').filter(req => req.trim()).map((requirement, index) => (
                <div key={index} className="flex items-start gap-2 text-sm">
                  <span className="text-primary mt-1">•</span>
                  <span className="flex-1">{requirement.trim()}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Benefits */}
          {job.benefits && (
            <>
              <Separator />
              <div>
                <h3 className="text-lg font-semibold mb-3">Benefits</h3>
                <div className="prose prose-sm max-w-none text-muted-foreground">
                  {job.benefits.split('\n').map((benefit, index) => (
                    <p key={index} className="mb-1">{benefit}</p>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* Company Culture */}
          {job.company_culture && (
            <>
              <Separator />
              <div>
                <h3 className="text-lg font-semibold mb-3">Company Culture</h3>
                <div className="prose prose-sm max-w-none text-muted-foreground">
                  {job.company_culture.split('\n').map((culture, index) => (
                    <p key={index} className="mb-1">{culture}</p>
                  ))}
                </div>
              </div>
            </>
          )}

          <Separator />

          {/* Application Information */}
          <div>
            <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
              <Mail className="h-5 w-5" />
              Application Information
            </h3>
            <div className="bg-muted/50 p-4 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-sm font-medium">Application Method:</span>
                <span className="text-sm">{job.application_email}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">Deadline:</span>
                <span className="text-sm">{formatDate(job.deadline)}</span>
              </div>
            </div>
          </div>

          {/* Company Information */}
          {job.employers && (
            <>
              <Separator />
              <div>
                <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                  <Building className="h-5 w-5" />
                  Company Information
                </h3>
                <div className="bg-muted/50 p-4 rounded-lg">
                  <div className="flex items-start gap-3">
                    {job.employers.company_logo_url ? (
                      <img 
                        src={job.employers.company_logo_url} 
                        alt={`${job.employers.company_name} logo`}
                        className="h-12 w-12 rounded object-cover flex-shrink-0"
                      />
                    ) : (
                      <div className="h-12 w-12 bg-muted rounded flex items-center justify-center flex-shrink-0">
                        <Building className="h-6 w-6 text-muted-foreground" />
                      </div>
                    )}
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-semibold">{job.employers.company_name}</h4>
                        <span className="text-green-500 text-sm">✅ Verified</span>
                      </div>
                      <p className="text-sm text-muted-foreground mb-1">
                        Contact: {job.employers.email || 'Not provided'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* Job Analytics Info */}
          <Separator />
          <div>
            <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
              <Eye className="h-5 w-5" />
              Job Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium">Job ID:</span> {job.id}
              </div>
              <div>
                <span className="font-medium">Employer ID:</span> {job.employer_id}
              </div>
              <div>
                <span className="font-medium">Created:</span> {formatDate(job.created_at)}
              </div>
              <div>
                <span className="font-medium">Last Updated:</span> {formatDate(job.updated_at)}
              </div>
              {job.featured_until && (
                <div>
                  <span className="font-medium">Featured Until:</span> {formatDate(job.featured_until)}
                </div>
              )}
              {job.freelance_until && (
                <div>
                  <span className="font-medium">Freelance Until:</span> {formatDate(job.freelance_until)}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="flex justify-end pt-4">
          <Button onClick={onClose} variant="outline">
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}