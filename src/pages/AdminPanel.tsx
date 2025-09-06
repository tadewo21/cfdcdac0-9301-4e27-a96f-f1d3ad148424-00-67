import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { RoleGuard } from "@/components/RoleGuard";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, LayoutDashboard, Briefcase, Users, BarChart3, Settings, Star, Crown, FileText, DollarSign, MessageSquare, Menu } from "lucide-react";
import { AdminDashboard } from "@/components/admin/AdminDashboard";
import { JobManagement } from "@/components/admin/JobManagement";
import { UserManagement } from "@/components/admin/UserManagement";
import { UserActivityDashboard } from "@/components/admin/UserActivityDashboard";
import { AnalyticsReports } from "@/components/admin/AnalyticsReports";
import { AdminSettings } from "@/components/admin/AdminSettings";
import { UnifiedJobManagement } from "@/components/admin/UnifiedJobManagement";
import { CMSManagement } from "@/components/admin/cms/CMSManagement";
import { RevenueManagement } from "@/components/admin/revenue/RevenueManagement";
import { SupportManagement } from "@/components/admin/support/SupportManagement";
import { SystemHealthMonitor } from "@/components/admin/SystemHealthMonitor";
import { useLanguage } from "@/contexts/LanguageContext";
import { useIsMobile } from "@/hooks/use-mobile";

const AdminPanel = () => {
  const { user } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [activeTab, setActiveTab] = useState("dashboard");

  const tabItems = [
    { value: "dashboard", label: t("admin.dashboard"), icon: LayoutDashboard },
    { value: "jobs", label: "All Jobs", icon: Briefcase },
    { value: "unified-jobs", label: "Featured & Freelance Jobs", icon: Crown },
    { value: "users", label: t("admin.users"), icon: Users },
    { value: "activity", label: "Activity", icon: BarChart3 },
    { value: "analytics", label: "Analytics", icon: BarChart3 },
    { value: "health", label: "System Health", icon: Menu },
    { value: "cms", label: "CMS", icon: FileText },
    { value: "revenue", label: "Revenue", icon: DollarSign },
    { value: "support", label: "Support", icon: MessageSquare },
    { value: "settings", label: "Settings", icon: Settings },
  ];

  if (!user) {
    navigate("/auth");
    return null;
  }

  return (
    <RoleGuard allowedRoles={["admin"]}>
      <div className="min-h-screen bg-background">
        {/* Modern Header */}
        <div className="sticky top-0 z-40 bg-card border-b border-border">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center space-x-4">
                <Button variant="ghost" size="sm" onClick={() => navigate("/")} className="flex items-center space-x-2">
                  <ArrowLeft className="h-4 w-4" />
                  <span className="hidden sm:inline">{t("navigation.home")}</span>
                </Button>
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <LayoutDashboard className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h1 className="text-xl font-bold text-foreground">{t("admin.panel")}</h1>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="container mx-auto p-4">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            {/* Mobile Dropdown Navigation */}
            {isMobile ? (
              <div className="mb-6">
                <Select value={activeTab} onValueChange={setActiveTab}>
                  <SelectTrigger className="w-full h-12 bg-card border">
                    <div className="flex items-center space-x-3">
                      {(() => {
                        const currentTab = tabItems.find(item => item.value === activeTab);
                        const Icon = currentTab?.icon || LayoutDashboard;
                        return (
                          <>
                            <Icon className="h-5 w-5" />
                            <span className="font-medium">{currentTab?.label}</span>
                          </>
                        );
                      })()}
                    </div>
                  </SelectTrigger>
                  <SelectContent className="bg-popover border">
                    {tabItems.map((item) => {
                      const Icon = item.icon;
                      return (
                        <SelectItem key={item.value} value={item.value} className="h-12">
                          <div className="flex items-center space-x-3">
                            <Icon className="h-5 w-5" />
                            <span>{item.label}</span>
                          </div>
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
              </div>
            ) : (
              /* Desktop Scrollable Tabs */
              <div className="mb-6">
                <ScrollArea className="w-full whitespace-nowrap">
                  <TabsList className="inline-flex h-12 items-center justify-center rounded-lg bg-muted p-1 text-muted-foreground w-max">
                    {tabItems.map((item) => {
                      const Icon = item.icon;
                      return (
                        <TabsTrigger 
                          key={item.value} 
                          value={item.value} 
                          className="inline-flex items-center justify-center whitespace-nowrap rounded-md px-4 py-2 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm gap-2 min-w-[120px] h-10"
                        >
                          <Icon className="h-4 w-4" />
                          <span className="hidden sm:inline">{item.label}</span>
                        </TabsTrigger>
                      );
                    })}
                  </TabsList>
                </ScrollArea>
              </div>
            )}
            
            <TabsContent value="dashboard" className="mt-6">
              <AdminDashboard />
            </TabsContent>
            
          <TabsContent value="jobs" className="mt-6">
            <JobManagement />
          </TabsContent>
            
            <TabsContent value="unified-jobs" className="mt-6">
              <UnifiedJobManagement />
            </TabsContent>
            
            <TabsContent value="users" className="mt-6">
              <UserManagement />
            </TabsContent>
            
            <TabsContent value="activity" className="mt-6">
              <UserActivityDashboard />
            </TabsContent>
            
            <TabsContent value="analytics" className="mt-6">
              <AnalyticsReports />
            </TabsContent>
            
            <TabsContent value="health" className="mt-6">
              <SystemHealthMonitor />
            </TabsContent>
            
            <TabsContent value="cms" className="mt-6">
              <CMSManagement />
            </TabsContent>
            
            <TabsContent value="revenue" className="mt-6">
              <RevenueManagement />
            </TabsContent>
            
            <TabsContent value="support" className="mt-6">
              <SupportManagement />
            </TabsContent>
            
            <TabsContent value="settings" className="mt-6">
              <AdminSettings />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </RoleGuard>
  );
};

export default AdminPanel;