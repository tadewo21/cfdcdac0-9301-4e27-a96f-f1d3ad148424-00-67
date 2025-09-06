import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { SupportTickets } from "./SupportTickets";
import { AnnouncementSystem } from "./AnnouncementSystem";
import { MessageSquare, Megaphone, Headphones } from "lucide-react";

export function SupportManagement() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Headphones className="h-6 w-6 text-primary" />
        <div>
          <h2 className="text-2xl font-bold">የድጋፍ እና ግንኙነት ስርዓት</h2>
          <p className="text-muted-foreground">Support & Communication System</p>
        </div>
      </div>

      <Tabs defaultValue="tickets" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="tickets" className="flex items-center gap-2">
            <MessageSquare className="h-4 w-4" />
            የድጋፍ ጥያቄዎች (Support Tickets)
          </TabsTrigger>
          <TabsTrigger value="announcements" className="flex items-center gap-2">
            <Megaphone className="h-4 w-4" />
            ማስታወቂያዎች (Announcements)
          </TabsTrigger>
        </TabsList>

        <TabsContent value="tickets" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>የድጋፍ ጥያቄዎች አስተዳደር</CardTitle>
              <CardDescription>
                ተጠቃሚዎች የሚልኳቸውን የድጋፍ ጥያቄዎች ያስተዳድሩ እና ምላሽ ይስጡ
              </CardDescription>
            </CardHeader>
            <CardContent>
              <SupportTickets />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="announcements" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>ማስታወቂያዎች አስተዳደር</CardTitle>
              <CardDescription>
                ለሁሉም ወይም ለተወሰኑ የተጠቃሚ አይነቶች ማስታወቂያዎችን ይላኩ
              </CardDescription>
            </CardHeader>
            <CardContent>
              <AnnouncementSystem />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}