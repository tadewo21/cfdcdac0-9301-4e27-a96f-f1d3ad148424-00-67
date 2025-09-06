import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Star, Zap, ArrowRight } from "lucide-react";
import { JobCard } from "./JobCard";
import { Job } from "@/hooks/useJobs";
import { useLanguage } from "@/contexts/LanguageContext";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import Autoplay from "embla-carousel-autoplay";

interface FeaturedJobsSectionProps {
  jobs: Job[];
  onJobClick: (jobId: string) => void;
  onViewAll?: () => void;
}

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
    <section className="bg-gradient-to-br from-yellow-50 to-orange-50 py-8 relative overflow-hidden">
      <div className="max-w-6xl mx-auto px-4 relative z-10">
        <div className="text-center mb-6">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Star className="h-6 w-6 text-yellow-500" />
            <h2 className="text-2xl md:text-3xl font-bold text-gray-800">
              {t("featured.title")}
            </h2>
            <Star className="h-6 w-6 text-yellow-500" />
          </div>
          <Badge className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white px-3 py-1">
            <Zap className="h-3 w-3 mr-1" />
            {t("featured.durationBadge")}
          </Badge>
        </div>

        <Carousel
          plugins={[
            Autoplay({
              delay: 3000,
              stopOnInteraction: false,
              stopOnMouseEnter: true,
            }),
          ]}
          opts={{
            align: "start",
            loop: true,
            breakpoints: {
              '(min-width: 768px)': { slidesToScroll: 3 },
              '(min-width: 1024px)': { slidesToScroll: 4 },
            }
          }}
          className="mb-8"
        >
          <CarouselContent className="-ml-2 md:-ml-4 py-4">
            {featuredJobs.map((job, index) => (
              <CarouselItem key={job.id} className="pl-2 md:pl-4 basis-full md:basis-1/3 lg:basis-1/4">
                <div className="transform hover:scale-105 transition-all duration-300 px-4 py-2">
                  <JobCard job={job} onViewDetails={onJobClick} />
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious className="left-2 top-1/2" />
          <CarouselNext className="right-2 top-1/2" />
        </Carousel>

        {featuredJobs.length > 6 && onViewAll && (
          <div className="text-center">
            <Button 
              onClick={onViewAll}
              className="bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white px-8 py-3"
            >
              {t("featured.viewAll", { count: featuredJobs.length })}
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </div>
        )}
      </div>
    </section>
  );
}