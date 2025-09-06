import { Button } from "@/components/ui/button";
import { ArrowRight, Users, Briefcase, TrendingUp } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useSettings } from "@/contexts/SettingsContext";
import { useNavigate } from "react-router-dom";

interface HeroSectionProps {
  onExploreJobs: () => void;
  totalJobs: number;
}

export function HeroSection({ onExploreJobs, totalJobs }: HeroSectionProps) {
  const { t } = useLanguage();
  const { settings } = useSettings();
  const navigate = useNavigate();

  return (
    <section className="relative min-h-[300px] bg-gradient-hero overflow-hidden shadow-primary">
      {/* Professional overlay pattern */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-accent/5"></div>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_40%,_rgba(255,255,255,0.1)_0%,_transparent_50%)]"></div>
      
      {/* Animated background elements */}
      <div className="absolute top-20 left-10 w-32 h-32 bg-primary-glow/20 rounded-full blur-xl animate-pulse"></div>
      <div className="absolute bottom-20 right-10 w-24 h-24 bg-accent/30 rounded-full blur-lg animate-pulse delay-1000"></div>
      {/* Content */}
      <div className="relative z-10 max-w-6xl mx-auto px-4 py-12 md:py-15">
        <div className="text-center space-y-6">
          {/* Title Section */}
          <div className="space-y-3">
            <h1 className="text-3xl md:text-4xl font-bold text-white leading-tight">
              {t("hero.title")}
            </h1>
            <h2 className="text-2xl md:text-3xl font-bold text-yellow-200">
              {t("hero.subtitle")}
            </h2>
            <p className="text-base md:text-lg text-white/90 leading-relaxed max-w-2xl mx-auto mt-4">
              {settings.siteDescription || t("hero.description")}
            </p>
          </div>

          {/* Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center items-center max-w-md mx-auto">
            <Button 
              onClick={onExploreJobs}
              className="w-full sm:w-auto bg-green-800/80 hover:bg-green-800 text-white border-0 py-3 px-6 rounded-lg font-medium group"
            >
              {t("hero.exploreJobs")}
              <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
            <Button 
              variant="outline" 
              onClick={() => navigate("/about")}
              className="w-full sm:w-auto bg-white/10 border-white/30 text-white hover:bg-white/20 py-3 px-6 rounded-lg font-medium"
            >
              {t("hero.aboutUs")}
            </Button>
          </div>

        </div>
      </div>
    </section>
  );
}