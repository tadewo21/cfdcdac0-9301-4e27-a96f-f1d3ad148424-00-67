import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Star, MapPin, Calendar, FileText, Heart, Share2, ChevronLeft, ChevronRight, User, DollarSign, Building, Zap } from "lucide-react";
import { Job } from "@/hooks/useJobs";
import { useLanguage } from "@/contexts/LanguageContext";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { FavoriteButton } from "./FavoriteButton";
import { SocialShare } from "./SocialShare";
import { getCategoryTranslation } from "@/lib/categoryTranslation";
import Autoplay from "embla-carousel-autoplay";

interface FeaturedJobsSectionProps {
  jobs: Job[];
  onJobClick: (jobId: string) => void;
  onViewAll?: () => void;
}

const FeaturedJobCard = ({ job, onJobClick }: { job: Job; onJobClick: (jobId: string) => void }) => {
  const { t } = useLanguage();
  
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`;
  };

  return (
    <Card className="bg-white rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 relative overflow-hidden border-0">
      {/* Featured badge */}
      <div className="absolute top-4 right-4 z-10">
        <Badge className="bg-gradient-to-r from-orange-400 to-orange-500 text-white px-3 py-1 rounded-full font-semibold">
          <Star className="h-3 w-3 mr-1 fill-white" />
          Featured
        </Badge>
      </div>

      <CardContent className="p-6">
        {/* Header with company logo and job title */}
        <div className="flex items-start gap-4 mb-4">
          <div className="w-16 h-16 rounded-full bg-blue-500 flex items-center justify-center flex-shrink-0">
            {job.employers?.company_logo_url ? (
              <img 
                src={job.employers.company_logo_url} 
                alt={`${job.employers.company_name} logo`}
                className="w-full h-full object-contain rounded-full"
              />
            ) : (
              <Building className="h-8 w-8 text-white" />
            )}
          </div>
          
          <div className="flex-1">
            <h3 className="text-xl font-bold text-gray-900 mb-2">{job.title}</h3>
            <div className="flex items-center gap-2">
              <span className="text-gray-600 font-medium">{job.employers?.company_name || 'Company'}</span>
              {job.employers?.company_name && (
                <span className="text-green-500 text-sm">✓</span>
              )}
            </div>
          </div>
          
          <FavoriteButton jobId={job.id} variant="icon-only" />
        </div>

        {/* Job details badges */}
        <div className="flex flex-wrap gap-2 mb-4">
          <Badge variant="outline" className="bg-gray-100 text-gray-700 border-gray-200">
            <User className="h-3 w-3 mr-1" />
            {job.job_type || 'Full-time'}
          </Badge>
          <Badge variant="outline" className="bg-gray-100 text-gray-700 border-gray-200">
            <DollarSign className="h-3 w-3 mr-1" />
            {job.salary_range || 'ETB 13000/Month'}
          </Badge>
        </div>

        {/* Category */}
        <div className="flex items-center gap-2 mb-4">
          <Building className="h-4 w-4 text-gray-500" />
          <span className="text-gray-600 text-sm">{getCategoryTranslation(job.category, t)}</span>
        </div>

        {/* Job description */}
        <div className="mb-4">
          <p className="text-gray-600 text-sm leading-relaxed line-clamp-3">
            About the Job Title: {job.title} Company: {job.employers?.company_name || 'Company'} Location: {job.city}...
          </p>
        </div>

        {/* Location and dates */}
        <div className="flex items-center justify-between text-sm text-gray-500 mb-6">
          <div className="flex items-center gap-1">
            <MapPin className="h-4 w-4" />
            <span>{job.city}</span>
          </div>
          <div className="flex items-center gap-1">
            <Calendar className="h-4 w-4" />
            <span>{formatDate(job.posted_date)}</span>
          </div>
          <div className="flex items-center gap-1">
            <FileText className="h-4 w-4" />
            <span>Application Deadline: {formatDate(job.deadline)}</span>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex items-center justify-between">
          <Button 
            onClick={() => onJobClick(job.id)}
            className="bg-green-500 hover:bg-green-600 text-white px-6 py-2 rounded-lg font-semibold flex items-center gap-2"
          >
            <FileText className="h-4 w-4" />
            Apply Now
          </Button>
          
          <SocialShare job={job} variant="icon-only" />
        </div>
      </CardContent>
    </Card>
  );
};

export function FeaturedJobsSection({ jobs, onJobClick, onViewAll }: FeaturedJobsSectionProps) {
  const { t } = useLanguage();
  
  // Filter for featured regular jobs only (not freelance)
  const featuredJobs = jobs.filter(job => 
    (job.is_featured === true || job.status === 'featured') && 
    job.job_type !== 'freelance'
  );
  
  if (featuredJobs.length === 0) {
    return null;
  }

  return (
    <section className="bg-gradient-to-br from-yellow-50 to-orange-50 py-12 relative overflow-hidden">
      <div className="max-w-6xl mx-auto px-4 relative z-10">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Star className="h-8 w-8 text-yellow-500 fill-yellow-500" />
            <h2 className="text-3xl md:text-4xl font-bold text-gray-800">
              Featured Jobs
            </h2>
            <Star className="h-8 w-8 text-yellow-500 fill-yellow-500" />
          </div>
          <Badge className="bg-gradient-to-r from-orange-400 to-orange-500 text-white px-4 py-2 rounded-full text-sm font-semibold">
            <Zap className="h-4 w-4 mr-2" />
            30 Days Featured
          </Badge>
        </div>

        {/* Carousel */}
        <Carousel
          plugins={[
            Autoplay({
              delay: 4000,
              stopOnInteraction: false,
              stopOnMouseEnter: true,
            }),
          ]}
          opts={{
            align: "center",
            loop: true,
          }}
          className="relative"
        >
          <CarouselContent className="px-4">
            {featuredJobs.map((job) => (
              <CarouselItem key={job.id} className="md:basis-1/2 lg:basis-1/3 xl:basis-1/4">
                <div className="p-4">
                  <FeaturedJobCard job={job} onJobClick={onJobClick} />
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
          
          {/* Custom navigation buttons */}
          <CarouselPrevious className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white border-2 border-gray-200 w-12 h-12 rounded-full shadow-lg">
            <ChevronLeft className="h-6 w-6 text-gray-600" />
          </CarouselPrevious>
          <CarouselNext className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white border-2 border-gray-200 w-12 h-12 rounded-full shadow-lg">
            <ChevronRight className="h-6 w-6 text-gray-600" />
          </CarouselNext>
        </Carousel>
      </div>
    </section>
  );
}