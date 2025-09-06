import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Job } from "@/hooks/useJobs";
import { Edit, Save } from "lucide-react";

const cities = [
  "አዲስ አበባ",
  "አዲስ አበባ - ቦሌ",
  "አዲስ አበባ - ሜርካቶ",
  "አዲስ አበባ - ፒያሳ",
  "ባህር ዳር",
  "ድሬ ዳዋ",
  "ሐረር",
  "ሐወሳ",
  "ጅማ",
  "መቀሌ",
  "ናዝሬት/አዳማ",
];

const categories = [
  "መረጃ ቴክኖሎጂ (IT)",
  "ትምህርት",
  "ጤና",
  "ፋይናንስ እና ባንክ",
  "ንግድ እና ሽያጭ",
  "ማርኬቲንግ",
  "ኢንጂነሪንግ",
  "ህግ",
  "ሰብአዊ ሀብት (HR)",
  "ግንባታ",
  "መጓጓዣ",
  "ሆቴል እና ቱሪዝም",
  "አግሪክልቸር",
  "ሌላ"
];

const jobTypes = [
  "ሙሉ ሰዓት (Full-time)",
  "ሐፋሽ ሰዓት (Part-time)",
  "ለጊዜው (Contract)",
  "ሀውልተኛ (Freelance)",
  "ስልጠና (Internship)",
  "ርቀት (Remote)"
];

interface JobEditDialogProps {
  isOpen: boolean;
  onClose: () => void;
  job: Job | null;
  onSuccess: () => void;
}

export function JobEditDialog({ isOpen, onClose, job, onSuccess }: JobEditDialogProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    requirements: "",
    city: "",
    category: "",
    job_type: "",
    salary_range: "",
    benefits: "",
    company_culture: "",
    application_email: "",
    deadline: "",
    status: "active"
  });
  const { toast } = useToast();

  useEffect(() => {
    if (job && isOpen) {
      // Format deadline for datetime-local input
      const deadline = job.deadline ? new Date(job.deadline).toISOString().slice(0, 16) : "";
      
      setFormData({
        title: job.title || "",
        description: job.description || "",
        requirements: job.requirements || "",
        city: job.city || "",
        category: job.category || "",
        job_type: job.job_type || "",
        salary_range: job.salary_range || "",
        benefits: job.benefits || "",
        company_culture: job.company_culture || "",
        application_email: job.application_email || "",
        deadline: deadline,
        status: job.status || "active"
      });
    }
  }, [job, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!job) return;

    setLoading(true);
    try {
      const { error } = await supabase
        .from("jobs")
        .update({
          title: formData.title,
          description: formData.description,
          requirements: formData.requirements,
          city: formData.city,
          category: formData.category,
          job_type: formData.job_type,
          salary_range: formData.salary_range,
          benefits: formData.benefits,
          company_culture: formData.company_culture,
          application_email: formData.application_email,
          deadline: formData.deadline,
          status: formData.status,
          updated_at: new Date().toISOString()
        })
        .eq("id", job.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Job updated successfully",
      });

      onSuccess();
      onClose();
    } catch (error: any) {
      console.error("Error updating job:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to update job",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    onClose();
  };

  if (!job) return null;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="bg-blue-100 dark:bg-blue-900/20 p-2 rounded-full">
              <Edit className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <DialogTitle>Edit Job</DialogTitle>
              <DialogDescription>
                Update job information for: {job.title}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Basic Information */}
          <div className="space-y-4">
            <div>
              <Label htmlFor="title">Job Title *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
              />
            </div>

            <div>
              <Label htmlFor="description">Job Description *</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={4}
                required
              />
            </div>

            <div>
              <Label htmlFor="requirements">Requirements *</Label>
              <Textarea
                id="requirements"
                value={formData.requirements}
                onChange={(e) => setFormData({ ...formData, requirements: e.target.value })}
                rows={3}
                required
              />
            </div>
          </div>

          {/* Location and Category */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="city">City *</Label>
              <Select
                value={formData.city}
                onValueChange={(value) => setFormData({ ...formData, city: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select city" />
                </SelectTrigger>
                <SelectContent>
                  {cities.map((city) => (
                    <SelectItem key={city} value={city}>
                      {city}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="category">Category *</Label>
              <Select
                value={formData.category}
                onValueChange={(value) => setFormData({ ...formData, category: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Job Type and Salary */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="job_type">Job Type</Label>
              <Select
                value={formData.job_type}
                onValueChange={(value) => setFormData({ ...formData, job_type: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select job type" />
                </SelectTrigger>
                <SelectContent>
                  {jobTypes.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="salary_range">Salary Range</Label>
              <Input
                id="salary_range"
                value={formData.salary_range}
                onChange={(e) => setFormData({ ...formData, salary_range: e.target.value })}
                placeholder="e.g., 10,000 - 15,000 ብር"
              />
            </div>
          </div>

          {/* Additional Information */}
          <div>
            <Label htmlFor="benefits">Benefits</Label>
            <Textarea
              id="benefits"
              value={formData.benefits}
              onChange={(e) => setFormData({ ...formData, benefits: e.target.value })}
              rows={2}
              placeholder="Health insurance, transportation allowance, etc."
            />
          </div>

          <div>
            <Label htmlFor="company_culture">Company Culture</Label>
            <Textarea
              id="company_culture"
              value={formData.company_culture}
              onChange={(e) => setFormData({ ...formData, company_culture: e.target.value })}
              rows={2}
              placeholder="Work environment, team culture, etc."
            />
          </div>

          {/* Application and Deadline */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="application_email">Application Email/URL *</Label>
              <Input
                id="application_email"
                type="email"
                value={formData.application_email}
                onChange={(e) => setFormData({ ...formData, application_email: e.target.value })}
                required
              />
            </div>

            <div>
              <Label htmlFor="deadline">Application Deadline *</Label>
              <Input
                id="deadline"
                type="datetime-local"
                value={formData.deadline}
                onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                required
              />
            </div>
          </div>

          {/* Status */}
          <div>
            <Label htmlFor="status">Job Status</Label>
            <Select
              value={formData.status}
              onValueChange={(value) => setFormData({ ...formData, status: value })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="featured">Featured</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <DialogFooter className="gap-2">
            <Button type="button" variant="outline" onClick={handleClose} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Saving...' : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Save Changes
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}