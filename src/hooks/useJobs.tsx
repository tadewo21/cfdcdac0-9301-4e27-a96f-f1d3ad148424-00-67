import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/contexts/LanguageContext";
import { useCache } from "./useCache";

export interface Job {
  id: string;
  title: string;
  description: string;
  requirements: string;
  city: string;
  category: string;
  application_email: string;
  deadline: string;
  posted_date: string;
  created_at: string;
  updated_at: string;
  status: string;
  employer_id: string | null;
  job_type?: string;
  experience_level?: string;
  salary_range?: string;
  education_level?: string;
  benefits?: string;
  company_culture?: string;
  is_featured?: boolean;
  featured_until?: string;
  is_freelance?: boolean;
  freelance_until?: string;
  employers?: {
    company_name: string;
    company_logo_url?: string;
    email?: string;
  };
}

export function useJobs() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [displayedJobs, setDisplayedJobs] = useState<Job[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const { toast } = useToast();
  const { t } = useLanguage();

  const JOBS_PER_PAGE = 6;

  // Cache jobs data for better performance
  const { 
    data: cachedJobs, 
    isLoading: loading, 
    error: cacheError,
    refresh
  } = useCache('jobs-list', fetchJobsData, { ttl: 2 * 60 * 1000 });

  async function fetchJobsData(): Promise<Job[]> {
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
      console.error("Error fetching jobs:", error);
      throw error;
    }

    return data || [];
  }

  useEffect(() => {
    if (cachedJobs) {
      setJobs(cachedJobs);
      // Reset to first page when jobs change
      setCurrentPage(1);
      const initialJobs = cachedJobs.slice(0, JOBS_PER_PAGE);
      setDisplayedJobs(initialJobs);
      setHasMore(cachedJobs.length > JOBS_PER_PAGE);
    }
  }, [cachedJobs]);

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
    const newDisplayedJobs = jobs.slice(startIndex, endIndex);
    
    setDisplayedJobs(newDisplayedJobs);
    setCurrentPage(nextPage);
    setHasMore(endIndex < jobs.length);
  };

  return { 
    jobs: displayedJobs, 
    allJobs: jobs,
    loading, 
    hasMore,
    loadMore,
    refetch: refresh 
  };
}