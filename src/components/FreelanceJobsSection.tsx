import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Crown, Zap, ArrowRight } from "lucide-react";
import { JobCard } from "./JobCard";
import { Job } from "@/hooks/useJobs";
import { useLanguage } from "@/contexts/LanguageContext";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import Autoplay from "embla-carousel-autoplay";

interface FreelanceJobsSectionProps {
  jobs: Job[];
  onJobClick: (jobId: string) => void;
  onViewAll?: () => void;
}

export function FreelanceJobsSection({ jobs, onJobClick, onViewAll }: FreelanceJobsSectionProps) {
  const { t } = useLanguage();
  
  // Filter for freelance jobs only
  const freelanceJobs = jobs.filter(job => 
    job.job_type === "freelance"
  );
  
  if (freelanceJobs.length === 0) {
    return null;
  }

  return (
    <section className="bg-gradient-to-br from-purple-50 to-blue-50 py-8 relative overflow-hidden">
      <div className="max-w-6xl mx-auto px-4 relative z-10">
        <div className="text-center mb-6">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Crown className="h-6 w-6 text-purple-500" />
            <h2 className="text-2xl md:text-3xl font-bold text-gray-800">
              Freelance Jobs
            </h2>
            <Crown className="h-6 w-6 text-purple-500" />
          </div>
          <Badge className="bg-gradient-to-r from-purple-500 to-blue-500 text-white px-3 py-1">
            <Zap className="h-3 w-3 mr-1" />
            Flexible Work Opportunities
          </Badge>
        </div>

        <Carousel
          plugins={[
            Autoplay({
              delay: 3500,
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
            {freelanceJobs.map((job, index) => (
              <CarouselItem key={job.id} className="pl-2 md:pl-4 basis-full md:basis-1/3 lg:basis-1/4">
                <div className="transform hover:scale-105 transition-all duration-300 px-4 py-2">
                  <div className="relative">
                    <JobCard job={job} onViewDetails={onJobClick} />
                  </div>
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious className="left-2 top-1/2" />
          <CarouselNext className="right-2 top-1/2" />
        </Carousel>

        {freelanceJobs.length > 6 && onViewAll && (
          <div className="text-center">
            <Button 
              onClick={onViewAll}
              className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white px-8 py-3"
            >
              View All Freelance Jobs ({freelanceJobs.length})
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </div>
        )}
      </div>
    </section>
  );
}