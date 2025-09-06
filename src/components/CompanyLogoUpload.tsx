
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Upload, X, Building } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/contexts/LanguageContext";

interface CompanyLogoUploadProps {
  companyName: string;
  existingLogoUrl?: string;
  onLogoUploaded: (url: string) => void;
}

export const CompanyLogoUpload = ({ 
  companyName, 
  existingLogoUrl,
  onLogoUploaded 
}: CompanyLogoUploadProps) => {
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>(existingLogoUrl || "");
  const [uploading, setUploading] = useState(false);
  const { toast } = useToast();
  const { t } = useLanguage();

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast({
          title: t("messages.error"),
          description: t("postJob.invalidImageType"),
          variant: "destructive",
        });
        return;
      }

      // Validate file size (max 2MB)
      if (file.size > 2 * 1024 * 1024) {
        toast({
          title: t("messages.error"),
          description: t("postJob.imageTooLarge"),
          variant: "destructive",
        });
        return;
      }

      setLogoFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const uploadLogo = async (): Promise<string | null> => {
    if (!logoFile || !companyName) return existingLogoUrl || null;

    setUploading(true);
    try {
      // Create a unique file name with proper path
      const fileExt = logoFile.name.split('.').pop();
      const timestamp = Date.now();
      const sanitizedCompanyName = companyName.replace(/[^a-zA-Z0-9]/g, '_');
      const fileName = `company-logos/${sanitizedCompanyName}_${timestamp}.${fileExt}`;

      console.log('Uploading file:', fileName);

      // Upload to Supabase storage
      const { data, error } = await supabase.storage
        .from('company-logos')
        .upload(fileName, logoFile, {
          cacheControl: '3600',
          upsert: false
        });

      if (error) {
        console.error('Upload error:', error);
        throw error;
      }

      console.log('Upload successful:', data);

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('company-logos')
        .getPublicUrl(data.path);

      console.log('Public URL:', publicUrl);

      onLogoUploaded(publicUrl);
      setLogoFile(null); // Clear file after successful upload
      
      toast({
        title: "Success",
        description: "Company logo uploaded successfully!",
      });

      return publicUrl;
    } catch (error: any) {
      console.error('Logo upload error:', error);
      toast({
        title: t("messages.error"),
        description: error.message || "Failed to upload logo. Please try again.",
        variant: "destructive",
      });
      return null;
    } finally {
      setUploading(false);
    }
  };

  // Auto-upload when file is selected
  useEffect(() => {
    if (logoFile && companyName) {
      uploadLogo();
    }
  }, [logoFile, companyName]);

  // Update preview when existing logo changes
  useEffect(() => {
    if (existingLogoUrl && !logoFile) {
      setPreviewUrl(existingLogoUrl);
    }
  }, [existingLogoUrl, logoFile]);

  const removeLogo = () => {
    setLogoFile(null);
    setPreviewUrl("");
    onLogoUploaded("");
  };

  return (
    <div className="space-y-4">
      <Label htmlFor="company-logo">
        {t("postJob.companyLogo")} ({t("postJob.optional")})
      </Label>
      
      {previewUrl ? (
        <div className="relative w-32 h-32 border-2 border-border rounded-lg overflow-hidden">
          <img 
            src={previewUrl} 
            alt="Company logo preview" 
            className="w-full h-full object-contain"
          />
          <Button
            type="button"
            variant="destructive"
            size="icon"
            className="absolute top-1 right-1 h-6 w-6"
            onClick={removeLogo}
          >
            <X className="h-3 w-3" />
          </Button>
        </div>
      ) : (
        <div className="flex items-center gap-4">
          <div className="w-32 h-32 border-2 border-dashed border-border rounded-lg flex items-center justify-center bg-muted/10">
            <Building className="h-12 w-12 text-muted-foreground" />
          </div>
          <div>
            <Input
              id="company-logo"
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              className="max-w-xs"
              disabled={uploading}
            />
            <p className="text-sm text-muted-foreground mt-1">
              {t("postJob.logoHint")}
            </p>
          </div>
        </div>
      )}

      {uploading && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Upload className="h-4 w-4 animate-spin" />
          {t("postJob.uploading")}
        </div>
      )}
    </div>
  );
};
