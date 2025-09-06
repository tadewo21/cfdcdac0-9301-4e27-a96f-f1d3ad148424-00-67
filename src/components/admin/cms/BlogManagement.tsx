import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Save, Eye, Edit2, Plus, Trash2, Calendar } from "lucide-react";
import { toast } from "sonner";

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  featured_image?: string;
  status: "published" | "draft" | "scheduled";
  category: string;
  tags: string[];
  author_id: string;
  author_name: string;
  published_at?: string;
  created_at: string;
  updated_at: string;
}

const categories = [
  "ስራ ምክሮች (Job Tips)",
  "የስራ ገበያ (Job Market)",
  "ሙያዊ እድገት (Career Development)",
  "ቃለ መጠይቅ (Interview)",
  "የሲቪ ጽሁፍ (CV Writing)",
  "ሌላ (Other)"
];

export function BlogManagement() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [selectedPost, setSelectedPost] = useState<BlogPost | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    slug: "",
    excerpt: "",
    content: "",
    category: "",
    tags: "",
    status: "draft" as "published" | "draft" | "scheduled",
    published_at: ""
  });

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    // TODO: Implement API call to fetch blog posts
    // Example mock data
    const mockPosts: BlogPost[] = [
      {
        id: "1",
        title: "የስራ ቃለ መጠይቅ ዝግጅት ትምህርቶች",
        slug: "job-interview-preparation-tips",
        excerpt: "ስኬታማ የስራ ቃለ መጠይቅ ለማድረግ የሚያስፈልጉ ዝግጅቶች",
        content: "የስራ ቃለ መጠይቅ ስኬታማ ለማድረግ...",
        status: "published",
        category: "ቃለ መጠይቅ (Interview)",
        tags: ["ቃለ መጠይቅ", "ዝግጅት", "ምክሮች"],
        author_id: "admin",
        author_name: "Admin",
        published_at: "2024-01-15",
        created_at: "2024-01-10",
        updated_at: "2024-01-15"
      }
    ];
    setPosts(mockPosts);
  };

  const handleSave = async () => {
    try {
      const tagsArray = formData.tags.split(',').map(tag => tag.trim()).filter(Boolean);
      
      if (selectedPost) {
        // Update existing post
        console.log("Updating post:", { id: selectedPost.id, ...formData, tags: tagsArray });
      } else {
        // Create new post
        console.log("Creating new post:", { ...formData, tags: tagsArray });
      }
      
      toast.success(selectedPost ? "ጽሁፉ ተሻሽሏል" : "አዲስ ጽሁፍ ተፈጥሯል");
      setIsEditing(false);
      setSelectedPost(null);
      fetchPosts();
    } catch (error) {
      toast.error("ስህተት ተፈጥሯል");
    }
  };

  const handleDelete = async (postId: string) => {
    if (confirm("እርግጠኛ ነዎት ይህን ጽሁፍ መሰረዝ ይፈልጋሉ?")) {
      try {
        // TODO: Implement API call to delete post
        console.log("Deleting post:", postId);
        toast.success("ጽሁፉ ተሰርዟል");
        fetchPosts();
      } catch (error) {
        toast.error("ስህተት ተፈጥሯል");
      }
    }
  };

  const startEditing = (post?: BlogPost) => {
    if (post) {
      setSelectedPost(post);
      setFormData({
        title: post.title,
        slug: post.slug,
        excerpt: post.excerpt,
        content: post.content,
        category: post.category,
        tags: post.tags.join(", "),
        status: post.status,
        published_at: post.published_at || ""
      });
    } else {
      setSelectedPost(null);
      setFormData({
        title: "",
        slug: "",
        excerpt: "",
        content: "",
        category: "",
        tags: "",
        status: "draft",
        published_at: ""
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

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "published":
        return <Badge className="bg-green-500">ታትሟል</Badge>;
      case "draft":
        return <Badge variant="secondary">ረቂቅ</Badge>;
      case "scheduled":
        return <Badge className="bg-blue-500">ታቅዷል</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {!isEditing ? (
        <>
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">የብሎግ ጽሁፎች</h3>
            <Button onClick={() => startEditing()} className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              አዲስ ጽሁፍ
            </Button>
          </div>

          <div className="grid gap-4">
            {posts.map((post) => (
              <Card key={post.id}>
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <CardTitle className="text-base">{post.title}</CardTitle>
                      <p className="text-sm text-muted-foreground">/{post.slug}</p>
                      <p className="text-sm text-muted-foreground mt-1">{post.excerpt}</p>
                    </div>
                    <div className="flex items-center gap-2 ml-4">
                      {getStatusBadge(post.status)}
                      <Button size="sm" variant="outline" onClick={() => startEditing(post)}>
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline" 
                        onClick={() => handleDelete(post.id)}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <div className="flex items-center gap-4">
                      <span>ምድብ: {post.category}</span>
                      <span>ባለቤት: {post.author_name}</span>
                    </div>
                    {post.published_at && (
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        {post.published_at}
                      </div>
                    )}
                  </div>
                  <div className="mt-2">
                    {post.tags.map((tag, index) => (
                      <Badge key={index} variant="outline" className="mr-1">
                        {tag}
                      </Badge>
                    ))}
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
              {selectedPost ? "ጽሁፍ አስተካክል" : "አዲስ ጽሁፍ ፍጠር"}
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
                  placeholder="የጽሁፉ ርዕስ"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="slug">URL Slug</Label>
                <Input
                  id="slug"
                  value={formData.slug}
                  onChange={(e) => setFormData(prev => ({ ...prev, slug: e.target.value }))}
                  placeholder="post-url-slug"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="excerpt">አጭር መግለጫ (Excerpt)</Label>
              <Textarea
                id="excerpt"
                value={formData.excerpt}
                onChange={(e) => setFormData(prev => ({ ...prev, excerpt: e.target.value }))}
                placeholder="የጽሁፉ አጭር መግለጫ"
                className="h-20"
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>ምድብ (Category)</Label>
                <Select
                  value={formData.category}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="ምድብ ይምረጡ" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>ሁኔታ (Status)</Label>
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
                    <SelectItem value="scheduled">ታቅዷል (Scheduled)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="published_at">የማተሚያ ቀን</Label>
                <Input
                  id="published_at"
                  type="datetime-local"
                  value={formData.published_at}
                  onChange={(e) => setFormData(prev => ({ ...prev, published_at: e.target.value }))}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="tags">መለያ ቃላት (Tags)</Label>
              <Input
                id="tags"
                value={formData.tags}
                onChange={(e) => setFormData(prev => ({ ...prev, tags: e.target.value }))}
                placeholder="መለያ ቃላት በኮማ ይለዩ (ለምሳሌ: ስራ, ቃለ መጠይቅ, ምክሮች)"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="content">ይዘት (Content)</Label>
              <Textarea
                id="content"
                value={formData.content}
                onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
                placeholder="የጽሁፉ ይዘት እዚህ ይጻፍ..."
                className="min-h-[400px]"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}