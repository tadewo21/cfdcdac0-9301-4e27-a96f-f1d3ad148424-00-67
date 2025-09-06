import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/contexts/LanguageContext";
import { useCache } from "./useCache";
import { Job } from "./useJobs";

export function useFreelanceJobs() {
  const [freelanceJobs, setFreelanceJobs] = useState<Job[]>([]);
  const [displayedFreelanceJobs, setDisplayedFreelanceJobs] = useState<Job[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const { toast } = useToast();
  const { t } = useLanguage();

  const JOBS_PER_PAGE = 6;

  // Cache freelance jobs data for better performance
  const { 
    data: cachedFreelanceJobs, 
    isLoading: loading, 
    error: cacheError,
    refresh
  } = useCache('freelance-jobs-list', fetchFreelanceJobsData, { ttl: 2 * 60 * 1000 });

  async function fetchFreelanceJobsData(): Promise<Job[]> {
    const { data, error } = await supabase
      .from("jobs")
      .select(`
        *,
        employers (
          company_name,
          company_logo_url,
          email
        )
      `)
      .eq("is_freelance", true)
      .in("status", ["active", "featured"])
      .gte("deadline", new Date().toISOString())
      .order("is_featured", { ascending: false })
      .order("posted_date", { ascending: false });

    if (error) {
      console.error("Error fetching freelance jobs:", error);
      throw error;
    }

    return data || [];
  }

  useEffect(() => {
    if (cachedFreelanceJobs) {
      setFreelanceJobs(cachedFreelanceJobs);
      // Reset to first page when jobs change
      setCurrentPage(1);
      const initialJobs = cachedFreelanceJobs.slice(0, JOBS_PER_PAGE);
      setDisplayedFreelanceJobs(initialJobs);
      setHasMore(cachedFreelanceJobs.length > JOBS_PER_PAGE);
    }
  }, [cachedFreelanceJobs]);

  useEffect(() => {
    if (cacheError) {
      toast({
        title: t("messages.error"),
        description: t("hooks.jobsFetchError"),
        variant: "destructive",
      });
    }
  }, [cacheError, toast, t]);

  const loadMore = () => {
    if (!hasMore || loading) return;
    
    const nextPage = currentPage + 1;
    const startIndex = 0;
    const endIndex = nextPage * JOBS_PER_PAGE;
    const newDisplayedJobs = freelanceJobs.slice(startIndex, endIndex);
    
    setDisplayedFreelanceJobs(newDisplayedJobs);
    setCurrentPage(nextPage);
    setHasMore(endIndex < freelanceJobs.length);
  };

  return { 
    freelanceJobs: displayedFreelanceJobs, 
    allFreelanceJobs: freelanceJobs,
    loading, 
    hasMore,
    loadMore,
    refetch: refresh 
  };
}