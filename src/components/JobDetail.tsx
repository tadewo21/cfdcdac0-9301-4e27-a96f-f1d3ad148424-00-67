import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, MapPin, Clock, Building, ExternalLink, Mail, Calendar } from "lucide-react";
import { Job } from "@/hooks/useJobs";
import { FavoriteButton } from "./FavoriteButton";
import { TelegramShareButton } from "./TelegramShareButton";
import { useLanguage } from "@/contexts/LanguageContext";
import { getCategoryTranslation } from "@/lib/categoryTranslation";

interface JobDetailProps {
  job: Job;
  onBack: () => void;
}

export function JobDetail({ job, onBack }: JobDetailProps) {
  const { t } = useLanguage();
  const handleApply = () => {
    if (job.application_email.includes('@')) {
      // Email application
      const subject = encodeURIComponent(`የስራ ማመልከቻ - ${job.title}`);
      const body = encodeURIComponent(`ውድ ${job.employers?.company_name || 'ድርጅት'} ቡድን,\n\nለ${job.title} ስራው ማመልከት እፈልጋለሁ።\n\nአመስግናለሁ፣`);
      window.open(`mailto:${job.application_email}?subject=${subject}&body=${body}`);
    } else {
      // URL application
      window.open(job.application_email, '_blank');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('am-ET', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const isDeadlineClose = () => {
    const deadline = new Date(job.deadline);
    const now = new Date();
    const diffTime = deadline.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays <= 3;
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto p-4">
        <Button 
          variant="ghost" 
          onClick={onBack}
          className="mb-6 hover:bg-muted"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          {t("job.backToJobs")}
        </Button>

        <Card className="shadow-card">
          <CardHeader className="pb-6">
            <div className="flex flex-col space-y-4">
              <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                <div className="flex-1">
                  <h1 className="text-3xl font-bold text-foreground mb-3">{job.title}</h1>
                  <div className="flex items-center gap-2 text-muted-foreground mb-4">
                    {job.employers?.company_logo_url ? (
                      <img 
                        src={job.employers.company_logo_url} 
                        alt={`${job.employers.company_name} logo`}
                        className="h-6 w-6 rounded object-cover"
                      />
                    ) : (
                      <Building className="h-5 w-5" />
                    )}
                    <span className="text-lg">{job.employers?.company_name || 'ድርጅት'}</span>
                    {job.employers?.company_name && (
                      <span className="text-sm">✅</span>
                    )}
                  </div>
                  
                  {/* Key Information Tags */}
                  <div className="flex flex-wrap gap-2 mb-4">
                    {job.job_type && (
                      <Badge variant="outline" className="bg-muted text-muted-foreground border-border/30">
                        👨‍💼 {job.job_type}
                      </Badge>
                    )}
                    {job.experience_level && (
                      <Badge variant="outline" className="bg-muted text-muted-foreground border-border/30">
                        ⭐ {job.experience_level}
                      </Badge>
                    )}
                    {job.salary_range && (
                      <Badge variant="outline" className="bg-muted text-muted-foreground border-border/30">
                        💵 {job.salary_range.includes('ETB') || job.salary_range.includes('ብር') ? job.salary_range : `ETB ${job.salary_range}/Month`}
                      </Badge>
                    )}
                    <Badge variant="outline" className="bg-muted text-muted-foreground border-border/30">
                      🏢 {getCategoryTranslation(job.category, t)}
                    </Badge>
                  </div>
                </div>
                <div className="flex flex-col gap-3">
                  <div className="flex items-center gap-2">
                    <FavoriteButton jobId={job.id} variant="icon-only" size="lg" />
                  </div>
                </div>
              </div>

              {/* Consolidated Information Line */}
              <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground border-t pt-4">
                <div className="flex items-center gap-1">
                  <MapPin className="h-4 w-4" />
                  <span>{job.city}</span>
                </div>
                <span>•</span>
                <div className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  <span>{t("job.postedOn")} {formatDate(job.posted_date)}</span>
                </div>
                <span>•</span>
                <div className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  <span>{t("job.applicationDeadline")} {formatDate(job.deadline)}</span>
                </div>
              </div>
            </div>
          </CardHeader>

          <CardContent className="space-y-6">
            <div>
              <h2 className="text-xl font-semibold mb-3 text-foreground">{t("job.description")}</h2>
              <div className="prose prose-sm max-w-none text-muted-foreground">
                {job.description.split('\n').map((paragraph, index) => (
                  <p key={index} className="mb-3">{paragraph}</p>
                ))}
              </div>
            </div>

            <Separator />

            <div>
              <h2 className="text-xl font-semibold mb-3 text-foreground">{t("job.requirements")}</h2>
              <div className="space-y-2">
                {job.requirements.split('\n').filter(req => req.trim()).map((requirement, index) => (
                  <div key={index} className="flex items-start gap-2 text-muted-foreground">
                    <span className="text-primary mt-1 text-sm">•</span>
                    <span className="flex-1 text-sm leading-relaxed">{requirement.trim()}</span>
                  </div>
                ))}
              </div>
            </div>

            <Separator />

            {/* Company Information Section */}
            {job.employers?.company_name && (
              <>
                <div>
                  <h2 className="text-xl font-semibold mb-3 text-foreground">{t("job.aboutCompany")}</h2>
                  <div className="flex items-start gap-3 p-4 bg-muted/30 rounded-lg">
                    {job.employers?.company_logo_url ? (
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
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-semibold text-foreground">{job.employers.company_name}</h3>
                        <span className="text-sm">✅</span>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {t("job.verifiedCompany")} • {getCategoryTranslation(job.category, t)} {t("job.field")} • {job.city}
                      </p>
                    </div>
                  </div>
                </div>

                <Separator />
              </>
            )}

            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <Button 
                onClick={handleApply}
                className="flex-1 sm:flex-none bg-primary hover:bg-primary/90"
                size="lg"
              >
                {job.application_email.includes('@') ? (
                  <>
                    <Mail className="h-5 w-5 mr-2" />
                    {t("job.applyNowBtn")}
                  </>
                ) : (
                  <>
                    <ExternalLink className="h-5 w-5 mr-2" />
                    {t("job.goToApplication")}
                  </>
                )}
              </Button>
              <TelegramShareButton job={job} />
              <Button variant="outline" size="lg" onClick={onBack}>
                {t("job.back")}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}