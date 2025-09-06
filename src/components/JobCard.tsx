import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MapPin, Clock, Building, ExternalLink, Star, Briefcase } from "lucide-react";
import { SocialShare } from "./SocialShare";
import { FavoriteButton } from "./FavoriteButton";
import { useLanguage } from "@/contexts/LanguageContext";
import { Job } from "@/hooks/useJobs";
import { getCategoryTranslation } from "@/lib/categoryTranslation";

interface JobCardProps {
  job: Job;
  onViewDetails: (id: string) => void;
}

export function JobCard({ job, onViewDetails }: JobCardProps) {
  const { t } = useLanguage();
  
  // Check if job is featured (only for non-freelance jobs) or freelance
  const isFreelanceJob = job.job_type === 'freelance';
  const isFeatured = !isFreelanceJob && (job.is_featured === true || job.status === 'featured');
  const isFreelance = job.is_freelance === true && job.freelance_until && new Date(job.freelance_until) > new Date();
  
  // Check if it's an international freelance job
  const isInternationalFreelance = isFreelance && (
    job.employers?.company_name?.toLowerCase().includes('international') ||
    job.employers?.company_name?.toLowerCase().includes('global') ||
    job.employers?.company_name?.toLowerCase().includes('worldwide') ||
    job.category?.toLowerCase().includes('international') ||
    job.title?.toLowerCase().includes('remote') ||
    job.title?.toLowerCase().includes('international') ||
    job.description?.toLowerCase().includes('international') ||
    job.description?.toLowerCase().includes('global') ||
    job.description?.toLowerCase().includes('worldwide') ||
    job.title?.toLowerCase().includes('ወርልድ') ||
    job.title?.toLowerCase().includes('አለምአቀፍ') ||
    job.description?.toLowerCase().includes('አለምአቀፍ')
  );
  
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) return t("date.today");
    if (diffDays === 2) return t("date.yesterday");
    if (diffDays <= 7) return t("date.daysAgo", { days: diffDays });
    return date.toLocaleDateString('am-ET');
  };

  const isDeadlineClose = () => {
    const deadline = new Date(job.deadline);
    const now = new Date();
    const diffTime = deadline.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays <= 3;
  };

  return (
    <Card className={`h-full transition-smooth group border-border/50 relative ${
      isFeatured ? 'border-yellow-400 bg-gradient-to-br from-yellow-50/50 to-orange-50/30 shadow-lg hover:shadow-accent' : 
      isInternationalFreelance ? 'border-freelance-international/60 bg-gradient-freelance-international-card shadow-freelance-international hover:shadow-freelance-international' :
      isFreelance ? 'border-freelance/60 bg-gradient-freelance-card shadow-freelance hover:shadow-freelance' : 
      'hover:shadow-card'
    }`} 
          id={`job-${job.id}`}>
      <CardHeader className="pb-4 relative">
        {/* Featured Badge */}
        {isFeatured && (
          <div className="absolute -top-4 -right-4 z-20">
            <Badge className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white font-bold px-4 py-2 shadow-xl border-2 border-white/50 rounded-full transform rotate-12 hover:rotate-0 transition-transform duration-300">
              <Star className="h-4 w-4 mr-1 fill-white" />
              {t("featured.badge")}
            </Badge>
          </div>
        )}
        
        {/* International Freelance Badge */}
        {isInternationalFreelance && !isFeatured && (
          <div className="absolute -top-4 -right-4 z-20">
            <Badge className="bg-gradient-freelance-international text-freelance-international-foreground font-bold px-4 py-2 shadow-freelance-international border-2 border-white/50 rounded-full transform rotate-12 hover:rotate-0 transition-transform duration-300">
              <Briefcase className="h-4 w-4 mr-1 fill-current" />
              🌍 {t("jobType.freelance")}
            </Badge>
          </div>
        )}
        
        {/* Regular Freelance Badge */}
        {isFreelance && !isInternationalFreelance && !isFeatured && (
          <div className="absolute -top-4 -right-4 z-20">
            <Badge className="bg-gradient-freelance text-freelance-foreground font-bold px-4 py-2 shadow-freelance border-2 border-white/50 rounded-full transform rotate-12 hover:rotate-0 transition-transform duration-300">
              <Briefcase className="h-4 w-4 mr-1 fill-current" />
              {t("jobType.freelance")}
            </Badge>
          </div>
        )}
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-start gap-3 flex-1">
            {/* Company Logo */}
            <div className="w-12 h-12 rounded-lg overflow-hidden bg-muted/20 flex items-center justify-center flex-shrink-0 border">
              {job.employers?.company_logo_url ? (
                <img 
                  src={job.employers.company_logo_url} 
                  alt={`${job.employers.company_name} logo`}
                  className="w-full h-full object-contain"
                  onError={(e) => {
                    const target = e.currentTarget;
                    target.style.display = 'none';
                    const nextSibling = target.nextElementSibling as HTMLElement;
                    if (nextSibling) {
                      nextSibling.style.display = 'flex';
                    }
                  }}
                />
              ) : null}
              <Building className={`h-6 w-6 text-muted-foreground ${job.employers?.company_logo_url ? 'hidden' : ''}`} />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-xl text-foreground group-hover:text-primary transition-smooth line-clamp-2 mb-2">
                {job.title}
              </h3>
              <div className="flex items-center gap-1 text-muted-foreground">
                <span className="text-sm font-medium">{job.employers?.company_name || 'ድርጅት'}</span>
                {job.employers?.company_name && (
                  <span className="text-xs ml-1">✅</span>
                )}
              </div>
            </div>
          </div>
          <FavoriteButton jobId={job.id} variant="icon-only" />
        </div>
        
        {/* Key Job Information Badges */}
        <div className="flex flex-wrap gap-2 mb-3">
          {job.job_type && (
            <Badge variant="outline" className="bg-muted text-muted-foreground border-border/30 text-xs">
              👨‍💼 {job.job_type}
            </Badge>
          )}
          {job.salary_range && (
            <Badge variant="outline" className="bg-muted text-muted-foreground border-border/30 text-xs">
              💵 {job.salary_range.includes('ETB') || job.salary_range.includes('ብር') ? job.salary_range : `ETB ${job.salary_range}/Month`}
            </Badge>
          )}
          {job.experience_level && (
            <Badge variant="outline" className="bg-muted text-muted-foreground border-border/30 text-xs">
              ⭐ {job.experience_level}
            </Badge>
          )}
          <Badge variant="outline" className="bg-muted text-muted-foreground border-border/30 text-xs">
            🏢 {getCategoryTranslation(job.category, t)}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="pb-3">
        <p className="text-muted-foreground text-sm line-clamp-3 mb-3">
          {job.description}
        </p>
        
        <div className="flex items-center text-xs text-muted-foreground mb-3">
          <div className="flex items-center gap-1">
            <MapPin className="h-3 w-3" />
            <span>{job.city}</span>
          </div>
          <span className="mx-2">•</span>
          <div className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            <span>{formatDate(job.posted_date)}</span>
          </div>
          <span className="mx-2">•</span>
          <div className="flex items-center gap-1">
            🗓️
            <span>{t("jobs.applyDeadline")} {new Date(job.deadline).toLocaleDateString('am-ET')}</span>
          </div>
        </div>
      </CardContent>

      <CardFooter className="pt-0">
        <div className="flex items-center justify-between w-full">
          <div className="flex gap-2">
            <Button 
              size="sm" 
              onClick={() => onViewDetails(job.id)}
              className="text-xs"
              variant="apply"
            >
              <ExternalLink className="h-3 w-3 mr-1" />
              {t("job.applyNowBtn")}
            </Button>
            <SocialShare job={job} variant="icon-only" />
          </div>
        </div>
      </CardFooter>
    </Card>
  );
}