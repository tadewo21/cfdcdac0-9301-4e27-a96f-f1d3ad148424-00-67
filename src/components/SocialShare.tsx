import { useState } from "react";
import { Button } from "@/components/ui/button";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { 
  Share2, 
  MessageCircle, 
  Facebook, 
  Twitter, 
  Linkedin, 
  Copy, 
  Check 
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Job } from "@/hooks/useJobs";
import { useLanguage } from "@/contexts/LanguageContext";

interface SocialShareProps {
  job: Job;
  variant?: "default" | "icon-only";
}

export function SocialShare({ job, variant = "default" }: SocialShareProps) {
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();
  const { t } = useLanguage();

  const jobUrl = `${window.location.origin}/jobs/${job.id}`;
  const shareText = `${job.title} at ${job.employers?.company_name || 'Company'} in ${job.city}`;

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(jobUrl);
      setCopied(true);
      toast({
        title: "Link Copied",
        description: "Job link has been copied to clipboard",
      });
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to copy link",
        variant: "destructive",
      });
    }
  };

  const shareOnTelegram = () => {
    const telegramUrl = `https://t.me/share/url?url=${encodeURIComponent(jobUrl)}&text=${encodeURIComponent(shareText)}`;
    window.open(telegramUrl, '_blank', 'noopener,noreferrer');
  };

  const shareOnFacebook = () => {
    const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(jobUrl)}`;
    window.open(facebookUrl, '_blank', 'noopener,noreferrer');
  };

  const shareOnTwitter = () => {
    const twitterUrl = `https://twitter.com/intent/tweet?url=${encodeURIComponent(jobUrl)}&text=${encodeURIComponent(shareText)}`;
    window.open(twitterUrl, '_blank', 'noopener,noreferrer');
  };

  const shareOnLinkedIn = () => {
    const linkedinUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(jobUrl)}`;
    window.open(linkedinUrl, '_blank', 'noopener,noreferrer');
  };

  if (variant === "icon-only") {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="sm">
            <Share2 className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="bg-background border border-border">
          <DropdownMenuItem onClick={shareOnTelegram} className="cursor-pointer gap-2">
            <MessageCircle className="h-4 w-4" />
            {t("share.telegram")}
          </DropdownMenuItem>
          <DropdownMenuItem onClick={shareOnFacebook} className="cursor-pointer gap-2">
            <Facebook className="h-4 w-4" />
            {t("share.facebook")}
          </DropdownMenuItem>
          <DropdownMenuItem onClick={shareOnTwitter} className="cursor-pointer gap-2">
            <Twitter className="h-4 w-4" />
            {t("share.twitter")}
          </DropdownMenuItem>
          <DropdownMenuItem onClick={shareOnLinkedIn} className="cursor-pointer gap-2">
            <Linkedin className="h-4 w-4" />
            {t("share.linkedin")}
          </DropdownMenuItem>
          <DropdownMenuItem onClick={copyToClipboard} className="cursor-pointer gap-2">
            {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            {t("share.copy")}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  return (
    <div className="flex gap-2 flex-wrap">
      <Button onClick={shareOnTelegram} variant="outline" size="sm" className="gap-2">
        <MessageCircle className="h-4 w-4" />
        Telegram
      </Button>
      <Button onClick={shareOnFacebook} variant="outline" size="sm" className="gap-2">
        <Facebook className="h-4 w-4" />
        Facebook
      </Button>
      <Button onClick={shareOnTwitter} variant="outline" size="sm" className="gap-2">
        <Twitter className="h-4 w-4" />
        Twitter
      </Button>
      <Button onClick={shareOnLinkedIn} variant="outline" size="sm" className="gap-2">
        <Linkedin className="h-4 w-4" />
        LinkedIn
      </Button>
      <Button onClick={copyToClipboard} variant="outline" size="sm" className="gap-2">
        {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
        Copy Link
      </Button>
    </div>
  );
}