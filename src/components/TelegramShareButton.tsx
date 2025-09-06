import { Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTelegramWebApp } from "@/hooks/useTelegramWebApp";
import { useToast } from "@/hooks/use-toast";

interface TelegramShareButtonProps {
  job: {
    id: string;
    title: string;
    employers?: {
      company_name: string;
    };
  };
  className?: string;
}

export function TelegramShareButton({ job, className }: TelegramShareButtonProps) {
  const { webApp, hapticFeedback, shareToStory } = useTelegramWebApp();
  const { toast } = useToast();

  const handleShare = () => {
    hapticFeedback.impact('light');

    const shareText = `🔥 የስራ እድል: ${job.title}\n🏢 ድርጅት: ${job.employers?.company_name || 'N/A'}\n\n📱 በአፕ ውስጥ ለመመልከት:`;
    const shareUrl = `${window.location.origin}#job-${job.id}`;

    if (webApp) {
      try {
        // Try to share to Telegram story if available
        const heroImageUrl = `${window.location.origin}/assets/hero-image.jpg`;
        
        shareToStory?.(heroImageUrl, {
          text: shareText,
          widget_link: {
            url: shareUrl,
            name: "ስራ አመልክት"
          }
        });

        toast({
          title: "ተሳክቷል",
          description: "ስራው በስቶሪ ላይ ተጋርቷል።",
        });
      } catch (error) {
        // Fallback to regular sharing
        const fullShareText = `${shareText}\n${shareUrl}`;
        
        if (navigator.share) {
          navigator.share({
            title: job.title,
            text: shareText,
            url: shareUrl,
          });
        } else {
          // Copy to clipboard as fallback
          navigator.clipboard?.writeText(fullShareText);
          toast({
            title: "ተቀዳ",
            description: "ይዘቱ ተቀድቷል። አሁን ማጋራት ይችላሉ።",
          });
        }
      }
    } else {
      // Not in Telegram, use regular web sharing
      const fullShareText = `${shareText}\n${shareUrl}`;
      
      if (navigator.share) {
        navigator.share({
          title: job.title,
          text: shareText,
          url: shareUrl,
        });
      } else {
        navigator.clipboard?.writeText(fullShareText);
        toast({
          title: "ተቀዳ",
          description: "ይዘቱ ተቀድቷል። አሁን ማጋራት ይችላሉ።",
        });
      }
    }
  };

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleShare}
      className={className}
    >
      <Share2 className="h-4 w-4 mr-1" />
      አጋራ
    </Button>
  );
}