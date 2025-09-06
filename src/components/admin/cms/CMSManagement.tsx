import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PagesManagement } from "./PagesManagement";
import { BlogManagement } from "./BlogManagement";
import { FileText, Edit, Globe } from "lucide-react";

export function CMSManagement() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Globe className="h-6 w-6 text-primary" />
        <div>
          <h2 className="text-2xl font-bold">የይዘት አስተዳደር ስርዓት</h2>
          <p className="text-muted-foreground">Content Management System</p>
        </div>
      </div>

      <Tabs defaultValue="pages" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="pages" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            ገጾች (Pages)
          </TabsTrigger>
          <TabsTrigger value="blog" className="flex items-center gap-2">
            <Edit className="h-4 w-4" />
            ብሎግ (Blog)
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pages" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>የገጽ አስተዳደር</CardTitle>
              <CardDescription>
                ስለ እኛ፣ የአጠቃቀም ደንብ፣ እና ተደጋጋሚ ጥያቄዎች ገጾችን ያስተዳድሩ
              </CardDescription>
            </CardHeader>
            <CardContent>
              <PagesManagement />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="blog" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>የብሎግ አስተዳደር</CardTitle>
              <CardDescription>
                ከስራ ጋር የተያያዙ ጽሁፎችን ይፍጠሩ፣ ያስተካክሉ እና ያትሙ
              </CardDescription>
            </CardHeader>
            <CardContent>
              <BlogManagement />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}