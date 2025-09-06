import { Home, User, Briefcase, Heart, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/useAuth";
import { useFavorites } from "@/hooks/useFavorites";
import { useNotifications } from "@/hooks/useNotifications";
import { useLanguage } from "@/contexts/LanguageContext";
import { useNavigate, useLocation } from "react-router-dom";

interface BottomNavigationProps {
  onShowFavorites: () => void;
  currentView: "main" | "favorites";
}

export const BottomNavigation = ({ onShowFavorites, currentView }: BottomNavigationProps) => {
  const { user } = useAuth();
  const { favoritesCount } = useFavorites();
  const { unreadCount } = useNotifications();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const location = useLocation();

  const handleHomeClick = () => {
    if (currentView === "favorites") {
      onShowFavorites(); // This will reset to main view
    } else if (location.pathname !== "/") {
      navigate("/");
    }
  };

  const handleAccountClick = () => {
    if (user) {
      navigate("/profile");
    } else {
      navigate("/auth");
    }
  };

  const handlePostJobClick = () => {
    if (user) {
      navigate("/post-job");
    } else {
      navigate("/auth");
    }
  };

  const handleManageJobsClick = () => {
    if (user) {
      navigate("/manage-jobs");
    } else {
      navigate("/auth");
    }
  };

  const isHomeActive = location.pathname === "/" && currentView === "main";
  const isFavoritesActive = currentView === "favorites" || location.pathname === "/favorites";
  const isAccountActive = location.pathname === "/profile" || location.pathname === "/auth";
  const isPostJobActive = location.pathname === "/post-job";
  const isManageJobsActive = location.pathname === "/manage-jobs";

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-card/95 backdrop-blur-sm border-t border-border md:hidden z-50">
      <div className="flex items-center justify-around py-2 px-2 max-w-lg mx-auto">
        {/* Home */}
        <Button
          variant="ghost"
          size="sm"
          onClick={handleHomeClick}
          className={`flex flex-col items-center gap-1 p-1 h-auto ${
            isHomeActive ? "text-primary" : "text-muted-foreground"
          }`}
        >
          <Home className="h-4 w-4" />
          <span className="text-xs">{t("navigation.home")}</span>
        </Button>

        {/* Favorites */}
        <Button
          variant="ghost"
          size="sm"
          onClick={onShowFavorites}
          className={`flex flex-col items-center gap-1 p-1 h-auto relative ${
            isFavoritesActive ? "text-primary" : "text-muted-foreground"
          }`}
        >
          <Heart className="h-4 w-4" />
          <span className="text-xs">{t("navigation.favorites")}</span>
          {favoritesCount > 0 && (
            <Badge className="absolute -top-1 -right-1 h-4 w-4 p-0 text-xs">
              {favoritesCount}
            </Badge>
          )}
        </Button>

        {/* Post Job */}
        <Button
          variant="ghost"
          size="sm"
          onClick={handlePostJobClick}
          className={`flex flex-col items-center gap-1 p-1 h-auto ${
            isPostJobActive ? "text-primary" : "text-muted-foreground"
          }`}
        >
          <Briefcase className="h-4 w-4" />
          <span className="text-xs">{t("navigation.postJob")}</span>
        </Button>

        {/* Manage Jobs */}
        {user && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleManageJobsClick}
            className={`flex flex-col items-center gap-1 p-1 h-auto ${
              isManageJobsActive ? "text-primary" : "text-muted-foreground"
            }`}
          >
            <Settings className="h-4 w-4" />
            <span className="text-xs">{t("navigation.manageJobs")}</span>
          </Button>
        )}

        {/* Account */}
        <Button
          variant="ghost"
          size="sm"
          onClick={handleAccountClick}
          className={`flex flex-col items-center gap-1 p-1 h-auto ${
            isAccountActive ? "text-primary" : "text-muted-foreground"
          }`}
        >
          <User className="h-4 w-4" />
          <span className="text-xs">{user ? t("navigation.profile") : t("navigation.login")}</span>
        </Button>
      </div>
    </div>
  );
};