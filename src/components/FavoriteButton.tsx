import { Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useFavorites } from "@/hooks/useFavorites";
import { useLanguage } from "@/contexts/LanguageContext";
import { cn } from "@/lib/utils";

interface FavoriteButtonProps {
  jobId: string;
  variant?: "default" | "icon-only";
  size?: "sm" | "lg";
  className?: string;
}

export function FavoriteButton({ 
  jobId, 
  variant = "default", 
  size = "sm",
  className 
}: FavoriteButtonProps) {
  const { isFavorite, toggleFavorite } = useFavorites();
  const { t } = useLanguage();
  const isFav = isFavorite(jobId);

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent triggering parent click events
    toggleFavorite(jobId);
  };

  if (variant === "icon-only") {
    return (
      <Button
        variant="ghost"
        size="sm"
        onClick={handleClick}
        className={cn(
          "p-2 h-auto hover:bg-muted transition-all duration-200",
          className
        )}
        aria-label={isFav ? t("favorites.removeFromFavorites") : t("favorites.addToFavorites")}
      >
        <Heart 
          className={cn(
            "transition-all duration-200",
            size === "sm" && "h-4 w-4",
            size === "lg" && "h-6 w-6",
            isFav 
              ? "fill-red-500 text-red-500 scale-110" 
              : "text-muted-foreground hover:text-red-400"
          )}
        />
      </Button>
    );
  }

  return (
    <Button
      variant={isFav ? "default" : "outline"}
      size={size}
      onClick={handleClick}
      className={cn(
        "transition-all duration-200",
        isFav && "bg-red-500 hover:bg-red-600 text-white border-red-500",
        className
      )}
    >
      <Heart 
        className={cn(
          "mr-1 transition-all duration-200",
          size === "sm" && "h-3 w-3",
          size === "lg" && "h-5 w-5",
          isFav ? "fill-current" : ""
        )}
      />
      {isFav ? t("favorites.favorite") : t("favorites.save")}
    </Button>
  );
}