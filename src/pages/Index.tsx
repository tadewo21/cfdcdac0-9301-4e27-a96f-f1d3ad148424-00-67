import { useState, useMemo, useEffect, useCallback } from "react";
import { usePerformanceMonitor } from "@/hooks/usePerformanceMonitor";
import { HeroSection } from "@/components/HeroSection";
import { SearchAndFilter } from "@/components/SearchAndFilter";
import { JobTabs } from "@/components/JobTabs";
import { JobDetail } from "@/components/JobDetail";
import { JobCategoryFilter, JobTypeFilter } from "@/components/JobCategoryFilter";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { PlatformStats } from "@/components/PlatformStats";
import { TrustedBy } from "@/components/TrustedBy";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/useAuth";
import { useRoles } from "@/hooks/useRoles";
import { useJobs, Job } from "@/hooks/useJobs";
import { useFreelanceJobs } from "@/hooks/useFreelanceJobs";
import { useFavorites } from "@/hooks/useFavorites";
import { useLanguage } from "@/contexts/LanguageContext";
import { useSettings } from "@/contexts/SettingsContext";
import { useNavigate } from "react-router-dom";
import { User, LogOut, Briefcase, Heart, Settings, Filter } from "lucide-react";
import { NotificationBell } from "@/components/NotificationBell";
import { JobCard } from "@/components/JobCard";
import { FeaturedJobsSection } from "@/components/FeaturedJobsSection";

import { LogoutDialog } from "@/components/LogoutDialog";

interface IndexProps {
  onShowFavorites: () => void;
}

const Index = ({ onShowFavorites }: IndexProps) => {
  // Performance monitoring
  usePerformanceMonitor();
  
  const [selectedJob, setSelectedJob] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    keyword: "",
    city: "",
    category: "",
  });
  const [categoryFilters, setCategoryFilters] = useState<JobTypeFilter>({
    type: "",
    source: "all",
    workType: "all"
  });
  
  const { user, signOut } = useAuth();
  const { userRole } = useRoles();
  const { favoritesCount } = useFavorites();
  const { jobs, allJobs, loading, hasMore, loadMore } = useJobs();
  const { freelanceJobs, allFreelanceJobs, loading: freelanceLoading } = useFreelanceJobs();
  const { t } = useLanguage();
  const { settings } = useSettings();
  const navigate = useNavigate();
  
  // Check if user is admin
  const isAdmin = userRole === 'admin' || (user?.email && [
    'admin@jobboard.et', 
    'admin@zehulu.jobs', 
    'zehulu3@gmail.com'
  ].includes(user.email));

  const filteredJobs = useMemo(() => {
    return allJobs.filter((job) => {
      const matchesKeyword = !filters.keyword || 
        job.title.toLowerCase().includes(filters.keyword.toLowerCase()) ||
        job.employers?.company_name?.toLowerCase().includes(filters.keyword.toLowerCase()) ||
        job.description.toLowerCase().includes(filters.keyword.toLowerCase());
      
      const matchesCity = !filters.city || job.city === filters.city;
      const matchesCategory = !filters.category || job.category === filters.category;
      
      // Apply category filters
      const matchesCategoryType = !categoryFilters.type || job.category === categoryFilters.type;
      
      // Filter out freelance jobs from regular job listings
      const isNotFreelance = job.job_type !== 'freelance' && !job.is_freelance;
      
      const matchesSource = categoryFilters.source === "all";
      const matchesWorkType = categoryFilters.workType === "all";

      return matchesKeyword && matchesCity && matchesCategory && matchesCategoryType && matchesSource && matchesWorkType && isNotFreelance;
    });
  }, [filters, allJobs, categoryFilters]);

  const filteredFreelanceJobs = useMemo(() => {
    return allFreelanceJobs.filter((job) => {
      const matchesKeyword = !filters.keyword || 
        job.title.toLowerCase().includes(filters.keyword.toLowerCase()) ||
        job.employers?.company_name?.toLowerCase().includes(filters.keyword.toLowerCase()) ||
        job.description.toLowerCase().includes(filters.keyword.toLowerCase());
      
      const matchesCity = !filters.city || job.city === filters.city;
      const matchesCategory = !filters.category || job.category === filters.category;
      
      // Apply category filters
      const matchesCategoryType = !categoryFilters.type || job.category === categoryFilters.type;
      
      const matchesSource = categoryFilters.source === "all";
      const matchesWorkType = categoryFilters.workType === "all";

      return matchesKeyword && matchesCity && matchesCategory && matchesCategoryType && matchesSource && matchesWorkType;
    });
  }, [filters, allFreelanceJobs, categoryFilters]);

  const handleJobClick = useCallback((jobId: string) => {
    setSelectedJob(jobId);
  }, []);

  const handleBackToList = useCallback(() => {
    setSelectedJob(null);
  }, []);

  const scrollToJobs = useCallback(() => {
    const jobsSection = document.getElementById('jobs-section');
    jobsSection?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  const [showLogoutDialog, setShowLogoutDialog] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    setShowLogoutDialog(false);
  };


  if (selectedJob) {
    const job = allJobs.find(j => j.id === selectedJob) || allFreelanceJobs.find(j => j.id === selectedJob);
    if (job) {
      return <JobDetail job={job} onBack={handleBackToList} />;
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b border-border bg-card/50 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto p-4 flex justify-between items-center">
          <h1 className="text-lg md:text-xl font-bold text-foreground">{settings.siteName || t("app.title")}</h1>
          
          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-3">
            <LanguageSwitcher />
            <Button 
              variant="outline" 
              size="sm" 
              onClick={onShowFavorites}
              className="relative"
            >
              <Heart className="h-4 w-4 mr-2" />
              {t("nav.favorites")}
              {favoritesCount > 0 && (
                <Badge className="absolute -top-2 -right-2 h-5 w-5 p-0 text-xs">
                  {favoritesCount}
                </Badge>
              )}
            </Button>
            {user ? (
              <div className="flex items-center gap-3">
                <NotificationBell />
                <Button onClick={() => navigate("/post-job")} size="sm">
                  <Briefcase className="h-4 w-4 mr-2" />
                  {t("nav.postJob")}
                </Button>
                <Button 
                  onClick={() => navigate("/manage-jobs")} 
                  size="sm" 
                  variant="outline"
                >
                  {t("nav.manageJobs")}
                </Button>
                {(userRole === 'admin' || isAdmin) && (
                  <Button 
                    onClick={() => navigate("/admin")} 
                    size="sm" 
                    variant="outline"
                    className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200 hover:from-blue-100 hover:to-indigo-100"
                  >
                    <Settings className="h-4 w-4 mr-2" />
                    Admin Panel
                  </Button>
                )}
                <Button 
                  onClick={() => navigate("/profile")} 
                  size="sm" 
                  variant="outline"
                >
                  <Settings className="h-4 w-4 mr-2" />
                  {t("nav.profile")}
                </Button>
                <div className="hidden lg:flex items-center gap-2 text-sm text-muted-foreground">
                  <User className="h-4 w-4" />
                  {user.email?.split('@')[0]}
                </div>
                <Button variant="outline" size="sm" onClick={() => setShowLogoutDialog(true)}>
                  <LogOut className="h-4 w-4 mr-2" />
                  {t("nav.logout")}
                </Button>
              </div>
            ) : (
              <Button onClick={() => navigate("/auth")} size="sm">
                <User className="h-4 w-4 mr-2" />
                {t("nav.login")}
              </Button>
            )}
          </div>

          {/* Mobile Navigation */}
          <div className="md:hidden flex items-center gap-2">
            <LanguageSwitcher />
            {user && (
              <>
                <NotificationBell variant="ghost" size="sm" />
                <Button variant="ghost" size="sm" onClick={() => setShowLogoutDialog(true)}>
                  <LogOut className="h-4 w-4" />
                </Button>
              </>
            )}
          </div>
        </div>
      </div>

      <HeroSection onExploreJobs={scrollToJobs} totalJobs={allJobs.length + allFreelanceJobs.length} />
      
      {/* Featured Jobs Section */}
      <FeaturedJobsSection 
        jobs={allJobs}
        onJobClick={handleJobClick}
        onViewAll={() => {
          setFilters(prev => ({ ...prev, keyword: '', city: '', category: '' }));
          scrollToJobs();
        }}
      />

      
      <div id="jobs-section" className="w-full mx-auto p-4 space-y-8">
        <div className="py-8">
          <SearchAndFilter onSearch={setFilters} />
        </div>

        {/* Advanced Filters Toggle */}
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            onClick={() => setShowFilters(!showFilters)}
            className="gap-2"
          >
            <Filter className="h-4 w-4" />
            {t("advancedFilters")}
          </Button>
          {(categoryFilters.type || categoryFilters.source !== "all" || categoryFilters.workType !== "all") && (
            <Badge variant="secondary">
              {t("ui.filtersActive")}
            </Badge>
          )}
        </div>

        {/* Advanced Category Filters */}
        {showFilters && (
          <div className="animate-fade-in">
            <JobCategoryFilter
              currentFilter={categoryFilters}
              onFilterChange={setCategoryFilters}
            />
          </div>
        )}

        <JobTabs 
          jobs={filteredJobs} 
          freelanceJobs={filteredFreelanceJobs}
          loading={loading || freelanceLoading}
          hasMore={hasMore}
          onJobClick={handleJobClick}
          onLoadMore={loadMore}
        />
        
        {!loading && !freelanceLoading && (filteredJobs.length !== allJobs.length || filteredFreelanceJobs.length !== allFreelanceJobs.length) && (
          <div className="text-center text-muted-foreground">
            Regular: {filteredJobs.length}/{allJobs.length} • Freelance: {filteredFreelanceJobs.length}/{allFreelanceJobs.length}
          </div>
        )}
      </div>
      
      {/* Platform Stats Section */}
      <PlatformStats totalJobs={allJobs.length + allFreelanceJobs.length} />
      
      {/* Trusted By Section */}
      <TrustedBy />
      
      {/* Footer Section */}
      <Footer />
      
      {/* Logout Confirmation Dialog */}
      <LogoutDialog 
        open={showLogoutDialog}
        onOpenChange={setShowLogoutDialog}
        onConfirm={handleSignOut}
      />
    </div>
  );
};

export default Index;