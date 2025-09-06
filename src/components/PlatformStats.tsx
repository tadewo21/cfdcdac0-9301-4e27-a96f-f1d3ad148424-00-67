import { Briefcase, Users, TrendingUp } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

interface PlatformStatsProps {
  totalJobs: number;
}

export function PlatformStats({ totalJobs }: PlatformStatsProps) {
  const { t } = useLanguage();

  return (
    <section className="py-3 md:py-4 bg-muted/50">
      <div className="max-w-6xl mx-auto px-4">
        <div className="grid grid-cols-3 gap-4 md:gap-6 max-w-xl mx-auto">
          <div className="text-center">
            <div className="flex items-center justify-center w-10 h-10 md:w-12 md:h-12 bg-primary/10 rounded-xl mb-2 mx-auto">
              <Briefcase className="h-5 w-5 md:h-6 md:w-6 text-primary" />
            </div>
            <div className="text-xl md:text-2xl font-bold text-foreground">{totalJobs}</div>
            <div className="text-muted-foreground text-xs md:text-sm">{t("hero.availableJobs")}</div>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center w-10 h-10 md:w-12 md:h-12 bg-primary/10 rounded-xl mb-2 mx-auto">
              <Users className="h-5 w-5 md:h-6 md:w-6 text-primary" />
            </div>
            <div className="text-xl md:text-2xl font-bold text-foreground">500+</div>
            <div className="text-muted-foreground text-xs md:text-sm">{t("hero.companies")}</div>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center w-10 h-10 md:w-12 md:h-12 bg-primary/10 rounded-xl mb-2 mx-auto">
              <TrendingUp className="h-5 w-5 md:h-6 md:w-6 text-primary" />
            </div>
            <div className="text-xl md:text-2xl font-bold text-foreground">2K+</div>
            <div className="text-muted-foreground text-xs md:text-sm">Job Placements</div>
          </div>
        </div>
      </div>
    </section>
  );
}