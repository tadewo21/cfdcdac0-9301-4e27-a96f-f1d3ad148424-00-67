import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Save, Send, Edit2, Plus, Trash2, Megaphone, Users, Briefcase } from "lucide-react";
import { toast } from "sonner";

interface Announcement {
  id: string;
  title: string;
  title_am: string;
  content: string;
  content_am: string;
  target_audience: "all" | "employers" | "job_seekers" | "admins";
  is_active: boolean;
  is_urgent: boolean;
  scheduled_at?: string;
  expires_at?: string;
  created_at: string;
  updated_at: string;
  sent_to_count?: number;
}

const targetAudiences = [
  { value: "all", label: "ሁሉም ተጠቃሚዎች (All Users)", icon: Users },
  { value: "employers", label: "አሰሪዎች (Employers)", icon: Briefcase },
  { value: "job_seekers", label: "ስራ ፈላጊዎች (Job Seekers)", icon: Users },
  { value: "admins", label: "አስተዳዳሪዎች (Admins)", icon: Users }
];

export function AnnouncementSystem() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [selectedAnnouncement, setSelectedAnnouncement] = useState<Announcement | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    title_am: "",
    content: "",
    content_am: "",
    target_audience: "all" as "all" | "employers" | "job_seekers" | "admins",
    is_active: true,
    is_urgent: false,
    scheduled_at: "",
    expires_at: ""
  });

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const fetchAnnouncements = async () => {
    // TODO: Implement API call
    const mockAnnouncements: Announcement[] = [
      {
        id: "ann_001",
        title: "Platform Maintenance Notice",
        title_am: "የመድረክ ጥገና ማሳወቂያ",
        content: "The platform will undergo scheduled maintenance on Sunday...",
        content_am: "መድረኩ በእሁድ ቀን ታቅዶ የተዘጋጀ ጥገና ይደረግበታል...",
        target_audience: "all",
        is_active: true,
        is_urgent: true,
        created_at: "2024-01-15T10:30:00Z",
        updated_at: "2024-01-15T10:30:00Z",
        sent_to_count: 1250
      }
    ];
    setAnnouncements(mockAnnouncements);
  };

  const handleSave = async () => {
    try {
      if (selectedAnnouncement) {
        // Update existing announcement
        console.log("Updating announcement:", { id: selectedAnnouncement.id, ...formData });
      } else {
        // Create new announcement
        console.log("Creating new announcement:", formData);
      }
      
      toast.success(selectedAnnouncement ? "ማስታወቂያው ተሻሽሏል" : "አዲስ ማስታወቂያ ተፈጥሯል");
      setIsEditing(false);
      setSelectedAnnouncement(null);
      fetchAnnouncements();
    } catch (error) {
      toast.error("ስህተት ተፈጥሯል");
    }
  };

  const sendAnnouncement = async (announcementId: string) => {
    if (confirm("እርግጠኛ ነዎት ይህን ማስታወቂያ መላክ ይፈልጋሉ?")) {
      try {
        // TODO: Implement API call to send announcement
        console.log("Sending announcement:", announcementId);
        toast.success("ማስታወቂያው ተልኳል");
        fetchAnnouncements();
      } catch (error) {
        toast.error("ማስታወቂያ መላክ አልተሳካም");
      }
    }
  };

  const handleDelete = async (announcementId: string) => {
    if (confirm("እርግጠኛ ነዎት ይህን ማስታወቂያ መሰረዝ ይፈልጋሉ?")) {
      try {
        console.log("Deleting announcement:", announcementId);
        toast.success("ማስታወቂያው ተሰርዟል");
        fetchAnnouncements();
      } catch (error) {
        toast.error("ስህተት ተፈጥሯል");
      }
    }
  };

  const startEditing = (announcement?: Announcement) => {
    if (announcement) {
      setSelectedAnnouncement(announcement);
      setFormData({
        title: announcement.title,
        title_am: announcement.title_am,
        content: announcement.content,
        content_am: announcement.content_am,
        target_audience: announcement.target_audience,
        is_active: announcement.is_active,
        is_urgent: announcement.is_urgent,
        scheduled_at: announcement.scheduled_at || "",
        expires_at: announcement.expires_at || ""
      });
    } else {
      setSelectedAnnouncement(null);
      setFormData({
        title: "",
        title_am: "",
        content: "",
        content_am: "",
        target_audience: "all",
        is_active: true,
        is_urgent: false,
        scheduled_at: "",
        expires_at: ""
      });
    }
    setIsEditing(true);
  };

  const getAudienceIcon = (audience: string) => {
    const config = targetAudiences.find(a => a.value === audience);
    const Icon = config?.icon || Users;
    return <Icon className="h-4 w-4" />;
  };

  const getAudienceLabel = (audience: string) => {
    const config = targetAudiences.find(a => a.value === audience);
    return config?.label || audience;
  };

  return (
    <div className="space-y-6">
      {!isEditing ? (
        <>
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">ማስታወቂያዎች</h3>
            <Button onClick={() => startEditing()} className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              አዲስ ማስታወቂያ
            </Button>
          </div>

          <div className="grid gap-4">
            {announcements.map((announcement) => (
              <Card key={announcement.id}>
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <CardTitle className="text-base">{announcement.title}</CardTitle>
                        {announcement.is_urgent && (
                          <Badge className="bg-red-500">አስቸኳይ</Badge>
                        )}
                        <Badge variant={announcement.is_active ? "default" : "secondary"}>
                          {announcement.is_active ? "ንቁ" : "ዝግ"}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{announcement.title_am}</p>
                    </div>
                    <div className="flex items-center gap-2 ml-4">
                      <Button size="sm" variant="outline" onClick={() => startEditing(announcement)}>
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => sendAnnouncement(announcement.id)}
                        className="text-blue-600 hover:text-blue-600"
                      >
                        <Send className="h-4 w-4" />
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline" 
                        onClick={() => handleDelete(announcement.id)}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <p className="text-sm line-clamp-2">{announcement.content}</p>
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-1">
                          {getAudienceIcon(announcement.target_audience)}
                          {getAudienceLabel(announcement.target_audience)}
                        </div>
                        {announcement.sent_to_count && (
                          <span>ለ {announcement.sent_to_count} ተጠቃሚዎች ተልኳል</span>
                        )}
                      </div>
                      <span>{new Date(announcement.created_at).toLocaleDateString('am-ET')}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </>
      ) : (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">
              {selectedAnnouncement ? "ማስታወቂያ አስተካክል" : "አዲስ ማስታወቂያ ፍጠር"}
            </h3>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setIsEditing(false)}>
                ተወው
              </Button>
              <Button onClick={handleSave} className="flex items-center gap-2">
                <Save className="h-4 w-4" />
                አስቀምጥ
              </Button>
            </div>
          </div>

          <div className="grid gap-6 max-w-4xl">
            {/* Titles */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="title">ርዕስ (English)</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Announcement title in English"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="title_am">ርዕስ (አማርኛ)</Label>
                <Input
                  id="title_am"
                  value={formData.title_am}
                  onChange={(e) => setFormData(prev => ({ ...prev, title_am: e.target.value }))}
                  placeholder="የማስታወቂያ ርዕስ በአማርኛ"
                />
              </div>
            </div>

            {/* Content */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="content">ይዘት (English)</Label>
                <Textarea
                  id="content"
                  value={formData.content}
                  onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
                  placeholder="Announcement content in English"
                  className="min-h-[150px]"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="content_am">ይዘት (አማርኛ)</Label>
                <Textarea
                  id="content_am"
                  value={formData.content_am}
                  onChange={(e) => setFormData(prev => ({ ...prev, content_am: e.target.value }))}
                  placeholder="የማስታወቂያ ይዘት በአማርኛ"
                  className="min-h-[150px]"
                />
              </div>
            </div>

            {/* Settings */}
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>ዒላማ ተጠቃሚዎች</Label>
                <Select
                  value={formData.target_audience}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, target_audience: value as any }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {targetAudiences.map((audience) => (
                      <SelectItem key={audience.value} value={audience.value}>
                        {audience.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="scheduled_at">የቀጠሮ ጊዜ</Label>
                <Input
                  id="scheduled_at"
                  type="datetime-local"
                  value={formData.scheduled_at}
                  onChange={(e) => setFormData(prev => ({ ...prev, scheduled_at: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="expires_at">የማለቂያ ጊዜ</Label>
                <Input
                  id="expires_at"
                  type="datetime-local"
                  value={formData.expires_at}
                  onChange={(e) => setFormData(prev => ({ ...prev, expires_at: e.target.value }))}
                />
              </div>
            </div>

            {/* Switches */}
            <div className="grid grid-cols-2 gap-6">
              <div className="flex items-center justify-between">
                <Label htmlFor="is_active">ንቁ ማስታወቂያ</Label>
                <Switch
                  id="is_active"
                  checked={formData.is_active}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_active: checked }))}
                />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="is_urgent">አስቸኳይ ማስታወቂያ</Label>
                <Switch
                  id="is_urgent"
                  checked={formData.is_urgent}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_urgent: checked }))}
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}