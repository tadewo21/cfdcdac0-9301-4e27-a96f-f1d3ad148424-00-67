import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  BarChart3,
  Users,
  Search,
  TrendingUp
} from "lucide-react";
import { JobAnalytics } from "./analytics/JobAnalytics";
import { UserGrowthAnalytics } from "./analytics/UserGrowthAnalytics";
import { SearchAnalytics } from "./analytics/SearchAnalytics";
import { useLanguage } from "@/contexts/LanguageContext";

export function EnhancedAnalyticsReports() {
  const { t } = useLanguage();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">የስራ ትንታኔ እና ሪፖርቶች</h1>
      </div>

      <Tabs defaultValue="jobs" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="jobs" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            የስራ ትንታኔ
          </TabsTrigger>
          <TabsTrigger value="users" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            የተጠቃሚ እድገት
          </TabsTrigger>
          <TabsTrigger value="search" className="flex items-center gap-2">
            <Search className="h-4 w-4" />
            የፍለጋ ትንታኔ
          </TabsTrigger>
        </TabsList>

        <TabsContent value="jobs" className="space-y-6">
          <JobAnalytics />
        </TabsContent>

        <TabsContent value="users" className="space-y-6">
          <UserGrowthAnalytics />
        </TabsContent>

        <TabsContent value="search" className="space-y-6">
          <SearchAnalytics />
        </TabsContent>
      </Tabs>
    </div>
  );
}