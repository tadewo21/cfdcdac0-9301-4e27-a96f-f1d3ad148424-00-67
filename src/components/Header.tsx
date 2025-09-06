import { Button } from "@/components/ui/button";
import { ArrowLeft, Home, Menu, X } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useSettings } from "@/contexts/SettingsContext";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useRoles } from "@/hooks/useRoles";
import { useState } from "react";
import { LogoutDialog } from "./LogoutDialog";

export function Header() {
  const { t } = useLanguage();
  const { settings } = useSettings();
  const navigate = useNavigate();
  const location = useLocation();
  const { user, signOut } = useAuth();
  const { userRole, hasPermission } = useRoles();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);

  const isHomePage = location.pathname === "/";

  // Dynamic navigation items based on role
  const getNavItems = () => {
    const baseItems = [
      { key: "navigation.home", path: "/" },
    ];

    if (!user) return baseItems;

    const userItems = [
      { key: "navigation.profile", path: "/profile" },
    ];

    // Add role-specific items
    if (hasPermission('canPostJobs')) {
      userItems.push({ key: "navigation.postJob", path: "/post-job" });
    }
    
    if (hasPermission('canManageJobs')) {
      userItems.push({ key: "navigation.manageJobs", path: "/manage-jobs" });
    }

    if (hasPermission('canAccessAdmin')) {
      userItems.push({ key: "admin.panel", path: "/admin" });
    }

    return [...baseItems, ...userItems];
  };

  const navItems = getNavItems();

  const handleSignOut = async () => {
    await signOut();
    setShowLogoutDialog(false);
    navigate("/");
  };

  return (
    <header className="bg-card border-b border-border sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Left side - Back button and Logo */}
          <div className="flex items-center space-x-4">
            {!isHomePage && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate("/")}
                className="flex items-center space-x-2"
              >
                <ArrowLeft className="h-4 w-4" />
                <span className="hidden sm:inline">{t("navigation.home")}</span>
              </Button>
            )}
            
            <div className="flex items-center space-x-2">
              {settings.logoUrl ? (
                <img 
                  src={settings.logoUrl} 
                  alt={settings.siteName}
                  className="h-8 w-8 cursor-pointer rounded"
                  onClick={() => navigate("/")}
                  onError={(e) => {
                    // Fallback to Home icon if logo fails to load
                    e.currentTarget.style.display = 'none';
                    e.currentTarget.nextElementSibling?.classList.remove('hidden');
                  }}
                />
              ) : null}
              <Home 
                className={`h-6 w-6 text-primary cursor-pointer ${settings.logoUrl ? 'hidden' : ''}`}
                onClick={() => navigate("/")}
              />
              <h1 className="text-lg font-bold text-foreground hidden sm:block">
                {settings.siteName || t("app.title")}
              </h1>
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-6">
            {navItems.map(({ key, path }) => (
              <Button
                key={key}
                variant="ghost"
                size="sm"
                onClick={() => navigate(path)}
                className={location.pathname === path ? "bg-accent" : ""}
              >
                {t(key as any)}
              </Button>
            ))}
          </nav>

          {/* Right side - Language switcher and auth */}
          <div className="flex items-center space-x-3">
            <LanguageSwitcher />
            
            {user ? (
              <div className="hidden md:flex items-center space-x-3">
                <div className="text-sm text-muted-foreground">
                  <div>{user.email}</div>
                  {userRole && (
                    <div className="text-xs opacity-75">
                      {t(`role.${userRole}` as any)}
                    </div>
                  )}
                </div>
                <Button variant="outline" size="sm" onClick={() => setShowLogoutDialog(true)}>
                  Logout
                </Button>
              </div>
            ) : (
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate("/auth")}
                className="hidden md:inline-flex"
              >
                {t("nav.login")}
              </Button>
            )}

            {/* Mobile logout button - visible on mobile */}
            {user && (
              <Button
                variant="ghost"
                size="sm"
                className="md:hidden flex items-center gap-1 text-xs"
                onClick={() => setShowLogoutDialog(true)}
              >
                Logout
              </Button>
            )}
            
            {/* Mobile menu button */}
            <Button
              variant="ghost"
              size="sm"
              className="md:hidden"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-border py-4">
            <div className="space-y-3">
              {navItems.map(({ key, path }) => (
                <Button
                  key={key}
                  variant="ghost"
                  className={`w-full justify-start ${location.pathname === path ? "bg-accent" : ""}`}
                  onClick={() => {
                    navigate(path);
                    setIsMobileMenuOpen(false);
                  }}
                >
                  {t(key as any)}
                </Button>
              ))}
              
              <div className="border-t border-border pt-3 mt-3">
                {user ? (
                  <div className="space-y-2">
                    <div className="px-3 py-2 text-sm text-muted-foreground">
                      <div>{user.email}</div>
                      {userRole && (
                        <div className="text-xs opacity-75">
                          {t(`role.${userRole}` as any)}
                        </div>
                      )}
                    </div>
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={() => {
                        setShowLogoutDialog(true);
                        setIsMobileMenuOpen(false);
                      }}
                    >
                      Logout
                    </Button>
                  </div>
                ) : (
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => {
                      navigate("/auth");
                      setIsMobileMenuOpen(false);
                    }}
                  >
                    {t("nav.login")}
                  </Button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
      
      {/* Logout Confirmation Dialog */}
      <LogoutDialog 
        open={showLogoutDialog}
        onOpenChange={setShowLogoutDialog}
        onConfirm={handleSignOut}
      />
    </header>
  );
}