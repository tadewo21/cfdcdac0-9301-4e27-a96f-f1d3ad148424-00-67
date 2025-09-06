import { useState, useEffect } from "react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { useLanguage } from "@/contexts/LanguageContext";
import Autoplay from "embla-carousel-autoplay";

interface TrustedCompany {
  id: string;
  company_name: string;
  company_logo_url: string | null;
}

// Verified companies data - these will be dynamically loaded from database when available
const trustedCompaniesData: TrustedCompany[] = [
  {
    id: "1",
    company_name: "CARE International",
    company_logo_url: "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=200&h=100&fit=crop&crop=center",
  },
  {
    id: "2", 
    company_name: "Catholic Relief Services",
    company_logo_url: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=200&h=100&fit=crop&crop=center",
  },
  {
    id: "3",
    company_name: "World Vision",
    company_logo_url: "https://images.unsplash.com/photo-1497366216548-37526070297c?w=200&h=100&fit=crop&crop=center",
  },
  {
    id: "4",
    company_name: "UNICEF",
    company_logo_url: "https://images.unsplash.com/photo-1497366754035-f200968a6e72?w=200&h=100&fit=crop&crop=center",
  },
  {
    id: "5",
    company_name: "Ethiopian Airlines",
    company_logo_url: "https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=200&h=100&fit=crop&crop=center",
  },
  {
    id: "6",
    company_name: "Commercial Bank of Ethiopia",
    company_logo_url: "https://images.unsplash.com/photo-1541354329998-f4d9a9f9297f?w=200&h=100&fit=crop&crop=center",
  },
  {
    id: "7",
    company_name: "Ethio Telecom",
    company_logo_url: "https://images.unsplash.com/photo-1560472355-536de3962603?w=200&h=100&fit=crop&crop=center",
  },
  {
    id: "8",
    company_name: "Ethiopian Electric Power",
    company_logo_url: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=200&h=100&fit=crop&crop=center",
  },
];

export const TrustedBy = () => {
  const { t } = useLanguage();
  const [trustedCompanies] = useState<TrustedCompany[]>(trustedCompaniesData);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate loading time and potentially fetch from database in the future
    const timer = setTimeout(() => {
      setLoading(false);
    }, 500);

    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return (
      <div className="bg-muted/30 py-7 md:py-10">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">
              {t("trustedBy.title")}
            </h2>
            <div className="animate-pulse">
              <div className="h-6 bg-muted rounded mx-auto max-w-md"></div>
            </div>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="bg-card rounded-lg p-6 shadow-card h-24 flex items-center justify-center">
                  <div className="w-20 h-12 bg-muted rounded"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (trustedCompanies.length === 0) {
    return null;
  }

  return (
    <div className="bg-muted/30 py-7 md:py-10">
      <div className="max-w-6xl mx-auto px-4">
        <div className="text-center mb-12 animate-fade-in">
          <h2 className="text-3xl font-bold text-foreground mb-4">
            {t("trustedBy.title")}
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            {t("trustedBy.subtitle")}
          </p>
        </div>

        <div className="relative">
          <Carousel
            plugins={[
              Autoplay({
                delay: 2000,
                stopOnInteraction: false,
                stopOnMouseEnter: true,
              }),
            ]}
            opts={{
              align: "start",
              loop: true,
              direction: "ltr", // Left to right movement for sliding left effect
            }}
            className="w-full"
          >
            <CarouselContent className="-ml-2 md:-ml-4 animate-slide-in-right">
              {trustedCompanies.map((company, index) => (
                <CarouselItem 
                  key={company.id} 
                  className="pl-2 md:pl-4 basis-1/2 sm:basis-1/3 md:basis-1/4 lg:basis-1/5 xl:basis-1/6"
                >
                  <div 
                    className="bg-card rounded-lg p-6 shadow-card hover:shadow-lg transition-all duration-300 h-24 flex items-center justify-center hover-scale group"
                    style={{
                      animationDelay: `${index * 0.1}s`,
                    }}
                  >
                    <img
                      src={company.company_logo_url || ''}
                      alt={`${company.company_name} logo`}
                      className="w-20 h-12 object-contain opacity-70 group-hover:opacity-100 transition-all duration-300 grayscale group-hover:grayscale-0 transform group-hover:scale-110"
                      loading="lazy"
                      onError={(e) => {
                        // Hide broken images gracefully
                        const target = e.target as HTMLImageElement;
                        target.style.display = 'none';
                      }}
                    />
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious className="hidden md:flex -left-6" />
            <CarouselNext className="hidden md:flex -right-6" />
          </Carousel>
        </div>
        
        <div className="text-center mt-8 animate-fade-in">
          <p className="text-sm text-muted-foreground">
            {trustedCompanies.length}+ የተረጋገጡ ኩባንያዎች • {trustedCompanies.length}+ Verified Companies
          </p>
        </div>
      </div>
    </div>
  );
};