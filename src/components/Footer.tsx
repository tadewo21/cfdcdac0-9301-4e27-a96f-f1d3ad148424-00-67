import { useLanguage } from "@/contexts/LanguageContext";
import { useSettings } from "@/contexts/SettingsContext";
import { Facebook, Twitter, Linkedin, Send } from "lucide-react";

export const Footer = () => {
  const { t } = useLanguage();
  const { settings } = useSettings();

  // Show all social media icons, even if URLs are empty (they'll link to # as placeholder)
  const socialLinks = [
    { 
      icon: Facebook, 
      href: settings.socialMedia?.facebook || "#", 
      label: "Facebook",
      show: true // Always show icons
    },
    { 
      icon: Twitter, 
      href: settings.socialMedia?.twitter || "#", 
      label: "Twitter", 
      show: true
    },
    { 
      icon: Linkedin, 
      href: settings.socialMedia?.linkedin || "#", 
      label: "LinkedIn",
      show: true
    },
    { 
      icon: Send, 
      href: settings.socialMedia?.telegram || "#", 
      label: "Telegram",
      show: true
    }
  ];

  const footerLinks = [
    { key: "footer.aboutUs" as const, href: "/about" },
    { key: "footer.contact" as const, href: "/contact" },
    { key: "footer.privacy" as const, href: "/privacy" },
    { key: "footer.terms" as const, href: "/terms" },
    { key: "footer.support" as const, href: "/support" }
  ];

  return (
    <footer className="bg-card border-t border-border">
      <div className="container mx-auto px-4 py-5 md:py-7">
        {/* Mobile Layout */}
        <div className="md:hidden space-y-4">
          <div className="text-center">
            <h3 className="text-sm font-semibold text-card-foreground mb-2">
              {settings.siteName || t("app.title")}
            </h3>
            <div className="flex justify-center space-x-4 mb-3">
              {socialLinks.map(({ icon: Icon, href, label }) => (
                <a
                  key={label}
                  href={href}
                  target={href !== "#" ? "_blank" : undefined}
                  rel={href !== "#" ? "noopener noreferrer" : undefined}
                  className="w-8 h-8 bg-muted rounded-full flex items-center justify-center hover:bg-primary hover:text-primary-foreground transition-colors"
                  aria-label={label}
                  onClick={href === "#" ? (e) => e.preventDefault() : undefined}
                >
                  <Icon className="w-4 h-4" />
                </a>
              ))}
            </div>
            <div className="flex flex-wrap justify-center gap-3 text-xs text-muted-foreground mb-2">
              {footerLinks.map(({ key, href }) => (
                <a
                  key={key}
                  href={href}
                  className="hover:text-foreground transition-colors"
                >
                  {t(key)}
                </a>
              ))}
            </div>
            <p className="text-xs text-muted-foreground">
              {t("footer.copyright")}
            </p>
          </div>
        </div>

        {/* Desktop Layout */}
        <div className="hidden md:grid grid-cols-3 gap-6">
          <div className="space-y-3">
            <h3 className="text-base font-semibold text-card-foreground">
              {settings.siteName || t("app.title")}
            </h3>
            <p className="text-sm text-muted-foreground">
              {settings.siteDescription || t("hero.description")}
            </p>
          </div>

          <div className="space-y-3">
            <h3 className="text-base font-semibold text-card-foreground">Quick Links</h3>
            <div className="grid grid-cols-2 gap-1">
              {footerLinks.map(({ key, href }) => (
                <a
                  key={key}
                  href={href}
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  {t(key)}
                </a>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            <h3 className="text-base font-semibold text-card-foreground">{t("footer.followUs")}</h3>
            <div className="flex space-x-2">
              {socialLinks.map(({ icon: Icon, href, label }) => (
                <a
                  key={label}
                  href={href}
                  target={href !== "#" ? "_blank" : undefined}
                  rel={href !== "#" ? "noopener noreferrer" : undefined}
                  className="w-8 h-8 bg-muted rounded-full flex items-center justify-center hover:bg-primary hover:text-primary-foreground transition-colors"
                  aria-label={label}
                  onClick={href === "#" ? (e) => e.preventDefault() : undefined}
                >
                  <Icon className="w-4 h-4" />
                </a>
              ))}
            </div>
            <p className="text-xs text-muted-foreground">
              {t("footer.copyright")}
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};