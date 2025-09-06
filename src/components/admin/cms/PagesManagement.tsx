import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Save, Eye, Edit2, Plus } from "lucide-react";
import { toast } from "sonner";

interface Page {
  id: string;
  title: string;
  slug: string;
  content: string;
  status: "published" | "draft";
  type: "about" | "terms" | "faq" | "custom";
  created_at: string;
  updated_at: string;
}

const pageTypes = [
  { value: "about", label: "ስለ እኛ (About Us)" },
  { value: "terms", label: "የአጠቃቀም ደንብ (Terms)" },
  { value: "faq", label: "ተደጋጋሚ ጥያቄዎች (FAQ)" },
  { value: "custom", label: "ሌላ (Custom)" }
];

export function PagesManagement() {
  const [pages, setPages] = useState<Page[]>([]);
  const [selectedPage, setSelectedPage] = useState<Page | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    slug: "",
    content: "",
    status: "draft" as "published" | "draft",
    type: "custom" as "about" | "terms" | "faq" | "custom"
  });

  useEffect(() => {
    fetchPages();
  }, []);

  const fetchPages = async () => {
    // TODO: Implement API call to fetch pages
    // Example mock data
    const mockPages: Page[] = [
      {
        id: "1",
        title: "ስለ እኛ",
        slug: "about-us",
        content: "የኛ ድርጅት የኢትዮጵያ ሥራ መፈላለጊያ መድረክ...",
        status: "published",
        type: "about",
        created_at: "2024-01-01",
        updated_at: "2024-01-15"
      }
    ];
    setPages(mockPages);
  };

  const handleSave = async () => {
    try {
      if (selectedPage) {
        // Update existing page
        console.log("Updating page:", { id: selectedPage.id, ...formData });
      } else {
        // Create new page
        console.log("Creating new page:", formData);
      }
      
      toast.success(selectedPage ? "ገጹ ተሻሽሏል" : "አዲስ ገጽ ተፈጥሯል");
      setIsEditing(false);
      setSelectedPage(null);
      fetchPages();
    } catch (error) {
      toast.error("ስህተት ተፈጥሯል");
    }
  };

  const startEditing = (page?: Page) => {
    if (page) {
      setSelectedPage(page);
      setFormData({
        title: page.title,
        slug: page.slug,
        content: page.content,
        status: page.status,
        type: page.type
      });
    } else {
      setSelectedPage(null);
      setFormData({
        title: "",
        slug: "",
        content: "",
        status: "draft",
        type: "custom"
      });
    }
    setIsEditing(true);
  };

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-')
      .trim();
  };

  return (
    <div className="space-y-6">
      {!isEditing ? (
        <>
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">የተዘጋጁ ገጾች</h3>
            <Button onClick={() => startEditing()} className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              አዲስ ገጽ
            </Button>
          </div>

          <div className="grid gap-4">
            {pages.map((page) => (
              <Card key={page.id}>
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-base">{page.title}</CardTitle>
                      <p className="text-sm text-muted-foreground">/{page.slug}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={page.status === "published" ? "default" : "secondary"}>
                        {page.status === "published" ? "ታትሟል" : "ረቂቅ"}
                      </Badge>
                      <Button size="sm" variant="outline" onClick={() => startEditing(page)}>
                        <Edit2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {page.content.substring(0, 150)}...
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </>
      ) : (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">
              {selectedPage ? "ገጽ አስተካክል" : "አዲስ ገጽ ፍጠር"}
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

          <div className="grid gap-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="title">ርዕስ (Title)</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => {
                    const title = e.target.value;
                    setFormData(prev => ({
                      ...prev,
                      title,
                      slug: generateSlug(title)
                    }));
                  }}
                  placeholder="የገጹ ርዕስ"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="slug">URL Slug</Label>
                <Input
                  id="slug"
                  value={formData.slug}
                  onChange={(e) => setFormData(prev => ({ ...prev, slug: e.target.value }))}
                  placeholder="page-url-slug"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>የገጽ አይነት</Label>
                <Select
                  value={formData.type}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, type: value as any }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {pageTypes.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>ሁኔታ</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, status: value as any }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">ረቂቅ (Draft)</SelectItem>
                    <SelectItem value="published">ታትሟል (Published)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="content">ይዘት (Content)</Label>
              <Textarea
                id="content"
                value={formData.content}
                onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
                placeholder="የገጹ ይዘት እዚህ ይጻፍ..."
                className="min-h-[300px]"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}