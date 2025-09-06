import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/contexts/LanguageContext";
import { useCache } from "./useCache";
import { Job } from "./useJobs";

export function useRegularJobs() {
  const [regularJobs, setRegularJobs] = useState<Job[]>([]);
  const [displayedRegularJobs, setDisplayedRegularJobs] = useState<Job[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const { toast } = useToast();
  const { t } = useLanguage();

  const JOBS_PER_PAGE = 6;

  // Cache regular jobs data for better performance
  const { 
    data: cachedRegularJobs, 
    isLoading: loading, 
    error: cacheError,
    refresh
  } = useCache('regular-jobs-list', fetchRegularJobsData, { ttl: 2 * 60 * 1000 });

  async function fetchRegularJobsData(): Promise<Job[]> {
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
      .neq("job_type", "freelance")
      .in("status", ["active", "featured"])
      .gte("deadline", new Date().toISOString())
      .order("is_featured", { ascending: false })
      .order("posted_date", { ascending: false });

    if (error) {
      console.error("Error fetching regular jobs:", error);
      throw error;
    }

    return data || [];
  }

  useEffect(() => {
    if (cachedRegularJobs) {
      setRegularJobs(cachedRegularJobs);
      // Reset to first page when jobs change
      setCurrentPage(1);
      const initialJobs = cachedRegularJobs.slice(0, JOBS_PER_PAGE);
      setDisplayedRegularJobs(initialJobs);
      setHasMore(cachedRegularJobs.length > JOBS_PER_PAGE);
    }
  }, [cachedRegularJobs]);

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
    const newDisplayedJobs = regularJobs.slice(startIndex, endIndex);
    
    setDisplayedRegularJobs(newDisplayedJobs);
    setCurrentPage(nextPage);
    setHasMore(endIndex < regularJobs.length);
  };

  return { 
    regularJobs: displayedRegularJobs, 
    allRegularJobs: regularJobs,
    loading, 
    hasMore,
    loadMore,
    refetch: refresh 
  };
}