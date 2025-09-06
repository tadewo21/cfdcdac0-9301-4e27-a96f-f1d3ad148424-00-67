import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider, useAuth } from "./hooks/useAuth";
import { RoleProvider, useRoles } from "./hooks/useRoles";
import { LanguageProvider } from "./contexts/LanguageContext";
import { SettingsProvider } from "./contexts/SettingsContext";
import { useTelegramWebApp } from "./hooks/useTelegramWebApp";
import { MaintenanceProvider, useMaintenanceMode } from "./contexts/MaintenanceContext";
import { MaintenanceMode } from "./components/MaintenanceMode";
import { ErrorBoundary } from "./components/ErrorBoundary";
import { BottomNavigation } from "./components/BottomNavigation";
import { TelegramOptimizedApp } from "./components/TelegramOptimizedApp";
import { TelegramLanguageDetector } from "./components/TelegramLanguageDetector";
import { TelegramAgeRestriction } from "./components/TelegramAgeRestriction";
import { useEffect, useState, Suspense, lazy } from "react";

// Lazy load pages for better performance
const Index = lazy(() => import("./pages/Index"));
const Auth = lazy(() => import("./pages/Auth"));
const PostJob = lazy(() => import("./pages/PostJob"));
const ManageJobs = lazy(() => import("./pages/ManageJobs"));
const AdminPanel = lazy(() => import("./pages/AdminPanel"));
const EditJob = lazy(() => import("./pages/EditJob"));
const CompanyProfile = lazy(() => import("./pages/CompanyProfile"));
const Profile = lazy(() => import("./pages/Profile"));
const Notifications = lazy(() => import("./pages/Notifications"));
const AboutUs = lazy(() => import("./pages/AboutUs"));
const Contact = lazy(() => import("./pages/Contact"));
const PrivacyPolicy = lazy(() => import("./pages/PrivacyPolicy"));
const TermsOfService = lazy(() => import("./pages/TermsOfService"));
const Support = lazy(() => import("./pages/Support"));
const Favorites = lazy(() => import("./pages/Favorites").then(module => ({ default: module.Favorites })));
const NotFound = lazy(() => import("./pages/NotFound"));

// Optimized loading component
const PageLoader = () => (
  <div className="flex items-center justify-center min-h-screen bg-background">
    <div className="flex flex-col items-center gap-4">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      <p className="text-sm text-muted-foreground animate-pulse">Loading...</p>
    </div>
  </div>
);

// Optimized query client with performance settings
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes
      refetchOnWindowFocus: false,
      refetchOnReconnect: true,
      retry: 2,
      retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000),
    },
    mutations: {
      retry: 1,
    }
  }
});

const AppContent = () => {
  const { webAppData, isReady } = useTelegramWebApp();
  const { isMaintenanceMode } = useMaintenanceMode();
  const { user } = useAuth();
  const [currentView, setCurrentView] = useState<"main" | "favorites">("main");
  
  // Use consistent role checking through RoleProvider
  const { userRole } = useRoles();
  const isAdmin = userRole === 'admin';

  useEffect(() => {
    // Apply viewport height for proper mobile display
    const setVH = () => {
      const vh = window.innerHeight * 0.01;
      document.documentElement.style.setProperty('--vh', `${vh}px`);
    };
    
    setVH();
    window.addEventListener('resize', setVH);
    
    return () => window.removeEventListener('resize', setVH);
  }, []);

  if (!isReady) {
    return <PageLoader />;
  }

  // Show maintenance mode if enabled (admins get special view)
  if (isMaintenanceMode) {
    return <MaintenanceMode isAdmin={isAdmin} />;
  }

  return (
    <TelegramOptimizedApp>
      <TelegramLanguageDetector />
      <TelegramAgeRestriction />
      <div className="relative min-h-screen pb-16 md:pb-0">
        <Suspense fallback={<PageLoader />}>
          <Routes>
            <Route path="/" element={
              currentView === "favorites" ? 
                <Favorites onBack={() => setCurrentView("main")} /> :
                <Index onShowFavorites={() => setCurrentView("favorites")} />
            } />
            <Route path="/auth" element={<Auth />} />
            <Route path="/post-job" element={<PostJob />} />
            <Route path="/manage-jobs" element={<ManageJobs />} />
            <Route path="/edit-job/:jobId" element={<EditJob />} />
            <Route path="/company/:companyId" element={<CompanyProfile />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/notifications" element={<Notifications />} />
            <Route path="/admin" element={<AdminPanel />} />
            <Route path="/about" element={<AboutUs />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/privacy" element={<PrivacyPolicy />} />
            <Route path="/terms" element={<TermsOfService />} />
            <Route path="/support" element={<Support />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
        
        <BottomNavigation 
          onShowFavorites={() => setCurrentView("favorites")}
          currentView={currentView}
        />
      </div>
    </TelegramOptimizedApp>
  );
};

const App = () => {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <MaintenanceProvider>
          <LanguageProvider>
            <SettingsProvider>
              <AuthProvider>
                <RoleProvider>
                  <TooltipProvider>
                  <Toaster />
                  <Sonner />
                  <BrowserRouter
                    future={{
                      v7_startTransition: true,
                      v7_relativeSplatPath: true
                    }}
                  >
                    <AppContent />
                  </BrowserRouter>
                  </TooltipProvider>
                </RoleProvider>
              </AuthProvider>
            </SettingsProvider>
          </LanguageProvider>
        </MaintenanceProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
};

export default App;
