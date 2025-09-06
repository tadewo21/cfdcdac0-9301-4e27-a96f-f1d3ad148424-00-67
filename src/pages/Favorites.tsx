import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { JobCard } from "@/components/JobCard";
import { JobDetail } from "@/components/JobDetail";
import { useFavorites } from "@/hooks/useFavorites";
import { useJobs } from "@/hooks/useJobs";
import { useFreelanceJobs } from "@/hooks/useFreelanceJobs";
import { ArrowLeft, Heart, Trash2, RefreshCw, LogIn } from "lucide-react";
import { Job } from "@/hooks/useJobs";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/hooks/useAuth";

interface FavoritesProps {
  onBack: () => void;
  onLogin?: () => void;
}

export function Favorites({ onBack, onLogin }: FavoritesProps) {
  const [selectedJob, setSelectedJob] = useState<string | null>(null);
  const { favorites, clearAllFavorites, favoritesCount, requiresAuth } = useFavorites();
  const { jobs, loading: regularJobsLoading, refetch: refetchRegular } = useJobs();
  const { allFreelanceJobs, loading: freelanceJobsLoading, refetch: refetchFreelance } = useFreelanceJobs();
  const { t } = useLanguage();
  const { user } = useAuth();

  const loading = regularJobsLoading || freelanceJobsLoading;
  
  // Combine both regular and freelance jobs, then filter by favorites
  const allJobs = [...jobs, ...allFreelanceJobs];
  const favoriteJobs = allJobs.filter(job => favorites.includes(job.id));

  const refetch = () => {
    refetchRegular();
    refetchFreelance();
  };

  const handleJobClick = (jobId: string) => {
    setSelectedJob(jobId);
  };

  const handleBackToList = () => {
    setSelectedJob(null);
  };

  // Show job detail if selected
  if (selectedJob) {
    const job = favoriteJobs.find(j => j.id === selectedJob);
    if (job) {
      return <JobDetail job={job} onBack={handleBackToList} />;
    }
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-background/80 backdrop-blur-md border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <Button 
                variant="ghost" 
                size="sm"
                onClick={onBack}
                className="hover:bg-muted"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                {t("common.back")}
              </Button>
              <div className="flex items-center gap-2">
                <Heart className="h-5 w-5 text-destructive fill-current" />
                <h1 className="text-xl font-semibold text-foreground">
                  {t("favorites.title")}
                </h1>
                <Badge variant="secondary" className="ml-2">
                  {favoritesCount}
                </Badge>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={refetch}
                disabled={loading}
              >
                <RefreshCw className={`h-4 w-4 mr-1 ${loading ? 'animate-spin' : ''}`} />
                {t("favorites.refresh")}
              </Button>
              
              {favoritesCount > 0 && (
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={clearAllFavorites}
                >
                  <Trash2 className="h-4 w-4 mr-1" />
                  {t("favorites.clearAll")}
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {!user ? (
          <Card className="text-center py-12">
            <CardContent className="pt-6">
              <LogIn className="h-16 w-16 mx-auto text-muted-foreground/30 mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-2">
                Login Required
              </h3>
              <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                Please login to view and manage your favorite jobs.
              </p>
              <div className="flex gap-3 justify-center">
                {onLogin && (
                  <Button onClick={onLogin}>
                    <LogIn className="h-4 w-4 mr-2" />
                    Login
                  </Button>
                )}
                <Button onClick={onBack} variant="outline">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  {t("common.back")}
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            <span className="ml-3 text-muted-foreground">{t("favorites.loading")}</span>
          </div>
        ) : favoritesCount === 0 ? (
          <Card className="text-center py-12">
            <CardContent className="pt-6">
              <Heart className="h-16 w-16 mx-auto text-muted-foreground/30 mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-2">
                {t("favorites.noJobs")}
              </h3>
              <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                {t("favorites.noJobsDesc")}
              </p>
              <Button onClick={onBack} className="inline-flex items-center">
                <ArrowLeft className="h-4 w-4 mr-2" />
                {t("favorites.backToJobs")}
              </Button>
            </CardContent>
          </Card>
        ) : favoriteJobs.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent className="pt-6">
              <RefreshCw className="h-16 w-16 mx-auto text-muted-foreground/30 mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-2">
                {t("favorites.notFound")}
              </h3>
              <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                {t("favorites.notFoundDesc")}
              </p>
              <div className="flex gap-3 justify-center">
                <Button onClick={refetch} variant="outline">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  {t("favorites.tryAgain")}
                </Button>
                <Button onClick={onBack}>
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  {t("favorites.backToJobs")}
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <>
            {/* Summary */}
            <div className="mb-6">
              <p className="text-muted-foreground">
                {t("favorites.foundJobs", { count: favoritesCount })}
              </p>
            </div>

            {/* Jobs Grid */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {favoriteJobs.map((job) => (
                <JobCard 
                  key={job.id} 
                  job={job} 
                  onViewDetails={() => handleJobClick(job.id)}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}