import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Edit, Eye, EyeOff, Trash2 } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { Job } from "@/hooks/useJobs";
import { getCategoryTranslation } from "@/lib/categoryTranslation";

interface ManageJobCardProps {
  job: Job;
  onStatusToggle: (jobId: string, currentStatus: string) => void;
  onDelete: (jobId: string) => void;
  onEdit: (jobId: string) => void;
}

export function JobCard({ job, onStatusToggle, onDelete, onEdit }: ManageJobCardProps) {
  const { t } = useLanguage();

  return (
    <Card className="p-4">
      <div className="flex justify-between items-start mb-2">
        <div className="flex-1">
          <h3 className="font-semibold text-lg">{job.title}</h3>
          <p className="text-sm text-muted-foreground mb-2">
            {job.city} • {getCategoryTranslation(job.category, t)}
          </p>
          <p className="text-sm line-clamp-2">{job.description}</p>
        </div>
        
        <div className="flex items-center gap-2 ml-4">
          {job.is_featured && job.status === "featured" && (
            <Badge variant="default" className="bg-yellow-500 text-yellow-900">
              Featured
            </Badge>
          )}
          <Badge 
            variant={
              job.status === "active" || job.status === "featured" 
                ? "default" 
                : job.status === "pending" 
                  ? "secondary" 
                  : "outline"
            }
            className={job.status === "pending" ? "bg-yellow-100 text-yellow-800" : ""}
          >
            {job.status === "active" || job.status === "featured" 
              ? t("manageJobs.active") 
              : job.status === "pending" 
                ? "ማጽደቅ ይጠበቃል / Pending" 
                : t("manageJobs.hidden")}
          </Badge>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onStatusToggle(job.id, job.status)}
            disabled={job.status === "pending"}
          >
            {job.status === "active" || job.status === "featured" ? (
              <EyeOff className="h-4 w-4" />
            ) : (
              <Eye className="h-4 w-4" />
            )}
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onEdit(job.id)}
          >
            <Edit className="h-4 w-4" />
          </Button>
          
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="ghost" size="sm">
                <Trash2 className="h-4 w-4" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>{t("manageJobs.confirmDelete")}</AlertDialogTitle>
                <AlertDialogDescription>
                  {t("manageJobs.confirmDeleteDesc")}
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>{t("manageJobs.cancel")}</AlertDialogCancel>
                <AlertDialogAction 
                  onClick={() => onDelete(job.id)}
                >
                  {t("manageJobs.delete")}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>
      
      <div className="text-xs text-muted-foreground mt-2">
        {t("manageJobs.postedOn")} {new Date(job.posted_date).toLocaleDateString("am-ET")} • 
        {t("manageJobs.deadline")} {new Date(job.deadline).toLocaleDateString("am-ET")}
      </div>
    </Card>
  );
}