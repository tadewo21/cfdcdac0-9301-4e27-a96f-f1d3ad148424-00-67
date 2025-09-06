import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";
import { Job } from "@/hooks/useJobs";
import { JobCard } from "./JobCard";

interface JobsListProps {
  jobs: Job[];
  loading: boolean;
  onStatusToggle: (jobId: string, currentStatus: string) => void;
  onDelete: (jobId: string) => void;
}

export function JobsList({ jobs, loading, onStatusToggle, onDelete }: JobsListProps) {
  const { t } = useLanguage();
  const navigate = useNavigate();

  const handleEdit = (jobId: string) => {
    navigate(`/edit-job/${jobId}`);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("manageJobs.title")} ({jobs.length})</CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <p>{t("manageJobs.loading")}</p>
        ) : jobs.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground">
              {t("manageJobs.noJobs")}
            </p>
            <Button 
              onClick={() => navigate("/post-job")} 
              className="mt-4"
            >
              {t("manageJobs.postFirstJob")}
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {jobs.map((job) => (
              <JobCard
                key={job.id}
                job={job}
                onStatusToggle={onStatusToggle}
                onDelete={onDelete}
                onEdit={handleEdit}
              />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}