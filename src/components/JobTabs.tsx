import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { JobCard } from "@/components/JobCard";
import { Job } from "@/hooks/useJobs";
import { useLanguage } from "@/contexts/LanguageContext";

interface JobTabsProps {
  jobs: Job[];
  freelanceJobs?: Job[];
  loading: boolean;
  hasMore: boolean;
  onJobClick: (jobId: string) => void;
  onLoadMore: () => void;
}

export const JobTabs = ({ jobs, freelanceJobs: freelanceJobsProp = [], loading, hasMore, onJobClick, onLoadMore }: JobTabsProps) => {
  const { t } = useLanguage();
  
  // Get all regular jobs (non-freelance only)
  const getAllJobs = () => {
    if (!jobs.length) return [];
    
    // Return only non-freelance jobs
    return jobs.filter(job => job.job_type !== 'freelance');
  };
  
  // Get only featured regular jobs (non-freelance)
  const getFeaturedJobs = () => {
    if (!jobs.length) return [];
    
    // Only return jobs that are featured AND not freelance
    return jobs.filter(job => {
      try {
        const isFeatured = (job as any)?.is_featured === true || job.status === 'featured';
        const isNotFreelance = job.job_type !== 'freelance';
        return isFeatured && isNotFreelance;
      } catch {
        return false;
      }
    });
  };
  
  // Get freelance jobs from props
  const getFreelanceJobs = () => {
    return freelanceJobsProp || [];
  };
  
  const calculateJobScore = (job: Job) => {
    let score = 0;
    const now = new Date();
    const threeDaysAgo = new Date();
    threeDaysAgo.setDate(now.getDate() - 3);
    const weekAgo = new Date();
    weekAgo.setDate(now.getDate() - 7);
    
    const postedDate = new Date(job.posted_date);
    const deadlineDate = new Date(job.deadline);
    
    // Recent jobs get higher score (0-30 points)
    if (postedDate >= threeDaysAgo) {
      score += 30;
    } else if (postedDate >= weekAgo) {
      score += 20;
    }
    
    // Jobs with longer deadlines get bonus (0-15 points)
    const daysUntilDeadline = Math.ceil((deadlineDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    if (daysUntilDeadline > 30) {
      score += 15;
    } else if (daysUntilDeadline > 14) {
      score += 10;
    } else if (daysUntilDeadline > 7) {
      score += 5;
    }
    
    // Jobs from companies with logos get bonus (5 points)
    if (job.employers?.company_logo_url) {
      score += 5;
    }
    
    // Popular cities get slight bonus (0-10 points)
    const popularCities = ['አዲስ አበባ', 'Addis Ababa', 'ባህር ዳር', 'Bahir Dar', 'መቀሌ', 'Mekelle', 'አዋሳ', 'Awassa'];
    if (popularCities.some(city => job.city.toLowerCase().includes(city.toLowerCase()))) {
      score += 10;
    }
    
    // High-demand categories get bonus (0-15 points)
    const highDemandCategories = ['ቴክኖሎጂ', 'Technology', 'ጤና', 'Health', 'ትምህርት', 'Education', 'ፋይናንስ', 'Finance'];
    if (highDemandCategories.some(cat => job.category.toLowerCase().includes(cat.toLowerCase()))) {
      score += 15;
    }
    
    // Jobs with detailed requirements get small bonus (5 points)
    if (job.requirements && job.requirements.length > 100) {
      score += 5;
    }
    
    return score;
  };
  
  const featuredJobs = getFeaturedJobs();
  const freelanceJobs = getFreelanceJobs();
  const allJobs = getAllJobs();

  if (loading) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground text-lg">{t("jobs.loading")}</p>
      </div>
    );
  }

  return (
    <Tabs defaultValue="all" className="w-full">
      <TabsList className="grid w-full grid-cols-3 max-w-lg mx-auto mb-8">
          <TabsTrigger 
            value="all" 
            className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
          >
            {t("jobs.allJobs")}
          </TabsTrigger>
          <TabsTrigger 
            value="featured"
            className="data-[state=active]:bg-featured data-[state=active]:text-featured-foreground data-[state=active]:shadow-featured"
          >
            {t("jobs.featuredJobs")}
          </TabsTrigger>
          <TabsTrigger 
            value="freelance"
            className="data-[state=active]:bg-freelance data-[state=active]:text-freelance-foreground data-[state=active]:shadow-freelance"
          >
            {t("freelance.title")}
          </TabsTrigger>
      </TabsList>
      
      <TabsContent value="all" className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-foreground">
            {t("jobs.allJobs")} ({allJobs.length})
          </h2>
        </div>
        
        {allJobs.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground text-lg">
              {t("jobs.noResults")}
            </p>
            <p className="text-muted-foreground mt-2">
              {t("jobs.changeFilters")}
            </p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {allJobs.map((job, index) => (
                <div
                  key={job.id}
                  className="animate-fade-in hover-scale"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <JobCard 
                    job={job} 
                    onViewDetails={() => onJobClick(job.id)}
                  />
                </div>
              ))}
            </div>
            {hasMore && (
              <div className="text-center mt-8">
                <Button 
                  onClick={onLoadMore} 
                  variant="outline" 
                  className="px-8"
                  disabled={loading}
                >
                  {loading ? t("jobs.loading") : t("jobs.loadMore")}
                </Button>
              </div>
            )}
          </>
        )}
      </TabsContent>
      
      <TabsContent value="featured" className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-foreground">
            {t("jobs.featuredJobs")} ({featuredJobs.length})
          </h2>
        </div>
        
        {featuredJobs.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground text-lg">
              {t("jobs.noResults")}
            </p>
            <p className="text-muted-foreground mt-2">
              {t("jobs.changeFilters")}
            </p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredJobs.map((job, index) => (
                <div
                  key={job.id}
                  className="animate-fade-in hover-scale"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <JobCard 
                    job={job} 
                    onViewDetails={() => onJobClick(job.id)}
                  />
                </div>
              ))}
            </div>
            {hasMore && (
              <div className="text-center mt-8">
                <Button 
                  onClick={onLoadMore} 
                  variant="outline" 
                  className="px-8"
                  disabled={loading}
                >
                  {loading ? t("jobs.loading") : t("jobs.loadMore")}
                </Button>
              </div>
            )}
          </>
        )}
      </TabsContent>
      
      <TabsContent value="freelance" className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-foreground">
            {t("freelance.title")} ({freelanceJobs.length})
          </h2>
        </div>
        
        {freelanceJobs.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground text-lg">
              {t("freelance.noJobs")}
            </p>
            <p className="text-muted-foreground mt-2">
              {t("jobs.changeFilters")}
            </p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {freelanceJobs.map((job, index) => (
                <div
                  key={job.id}
                  className="animate-fade-in hover-scale"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <JobCard 
                    job={job} 
                    onViewDetails={() => onJobClick(job.id)}
                  />
                </div>
              ))}
            </div>
            {hasMore && (
              <div className="text-center mt-8">
                <Button 
                  onClick={onLoadMore} 
                  variant="outline" 
                  className="px-8"
                  disabled={loading}
                >
                  {loading ? t("jobs.loading") : t("jobs.loadMore")}
                </Button>
              </div>
            )}
          </>
        )}
      </TabsContent>
    </Tabs>
  );
};