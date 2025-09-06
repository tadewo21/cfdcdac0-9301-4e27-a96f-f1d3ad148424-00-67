import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Tag, MapPin, Briefcase, Plus, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/contexts/LanguageContext";

interface Category {
  id: string;
  name: string;
  isActive: boolean;
}

export function CategoryLocationSettings() {
  const [categories, setCategories] = useState<Category[]>([
    { id: "1", name: "መረጃ ቴክኖሎጂ (IT)", isActive: true },
    { id: "2", name: "ትምህርት", isActive: true },
    { id: "3", name: "ጤና", isActive: true },
    { id: "4", name: "ፋይናንስ እና ባንክ", isActive: true },
    { id: "5", name: "ንግድ እና ሽያጭ", isActive: true },
    { id: "6", name: "ማርኬቲንግ", isActive: true },
    { id: "7", name: "ኢንጂነሪንግ", isActive: true },
    { id: "8", name: "ህግ", isActive: true },
    { id: "9", name: "ሰብአዊ ሀብት (HR)", isActive: true },
    { id: "10", name: "ግንባታ", isActive: true },
    { id: "11", name: "መጓጓዣ", isActive: true },
    { id: "12", name: "ሆቴል እና ቱሪዝም", isActive: true },
    { id: "13", name: "አግሪክልቸር", isActive: true },
    { id: "14", name: "ሌላ", isActive: true }
  ]);

  const [jobTypes, setJobTypes] = useState<Category[]>([
    { id: "1", name: "ሙሉ ጊዜ", isActive: true },
    { id: "2", name: "ከፊል ጊዜ", isActive: true },
    { id: "3", name: "ኮንትራክት", isActive: true },
    { id: "4", name: "ፍሪላንስ", isActive: true },
    { id: "5", name: "ኢንተርንሺፕ", isActive: true },
    { id: "6", name: "ሪሞት", isActive: true }
  ]);

  const [locations, setLocations] = useState<Category[]>([
    { id: "1", name: "አዲስ አበባ", isActive: true },
    { id: "2", name: "አዲግራት", isActive: true },
    { id: "3", name: "አክሱም", isActive: true },
    { id: "4", name: "አዋሳ", isActive: true },
    { id: "5", name: "ባህር ዳር", isActive: true },
    { id: "6", name: "ድሬዳዋ", isActive: true },
    { id: "7", name: "ጎንደር", isActive: true },
    { id: "8", name: "ሐረር", isActive: true },
    { id: "9", name: "ጅማ", isActive: true },
    { id: "10", name: "መቀሌ", isActive: true },
    { id: "11", name: "ሪሞት", isActive: true }
  ]);

  const [newCategory, setNewCategory] = useState("");
  const [newJobType, setNewJobType] = useState("");
  const [newLocation, setNewLocation] = useState("");

  const { toast } = useToast();
  const { t } = useLanguage();

  const handleAdd = (
    type: 'category' | 'jobType' | 'location',
    value: string,
    setter: React.Dispatch<React.SetStateAction<Category[]>>,
    items: Category[],
    clearValue: () => void
  ) => {
    if (value.trim()) {
      const newItem: Category = {
        id: Date.now().toString(),
        name: value.trim(),
        isActive: true
      };
      setter([...items, newItem]);
      clearValue();
      toast({
        title: t("messages.success"),
        description: `${type === 'category' ? 'ዘርፍ' : type === 'jobType' ? 'የስራ አይነት' : 'ቦታ'} ተጨምሯል`
      });
    }
  };

  const handleDelete = (
    id: string,
    setter: React.Dispatch<React.SetStateAction<Category[]>>,
    items: Category[],
    type: string
  ) => {
    setter(items.filter(item => item.id !== id));
    toast({
      title: t("messages.success"),
      description: `${type} ተሰርዟል`
    });
  };

  const handleToggle = (
    id: string,
    setter: React.Dispatch<React.SetStateAction<Category[]>>,
    items: Category[]
  ) => {
    setter(items.map(item => 
      item.id === id ? { ...item, isActive: !item.isActive } : item
    ));
  };

  const renderItemsList = (
    items: Category[],
    setter: React.Dispatch<React.SetStateAction<Category[]>>,
    newValue: string,
    setNewValue: React.Dispatch<React.SetStateAction<string>>,
    placeholder: string,
    addLabel: string,
    type: 'category' | 'jobType' | 'location'
  ) => (
    <div className="space-y-4">
      <div className="flex gap-2">
        <Input
          placeholder={placeholder}
          value={newValue}
          onChange={(e) => setNewValue(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleAdd(type, newValue, setter, items, () => setNewValue(""))}
        />
        <Button onClick={() => handleAdd(type, newValue, setter, items, () => setNewValue(""))}>
          <Plus className="h-4 w-4 mr-2" />
          {addLabel}
        </Button>
      </div>

      <div className="space-y-2">
        {items.map((item) => (
          <div key={item.id} className="flex items-center justify-between p-3 border rounded-lg">
            <div className="flex items-center gap-3">
              <Switch
                checked={item.isActive}
                onCheckedChange={() => handleToggle(item.id, setter, items)}
              />
              <span className={item.isActive ? "" : "text-muted-foreground line-through"}>
                {item.name}
              </span>
              {item.isActive && <Badge variant="secondary">ንቁ</Badge>}
            </div>
            
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="ghost" size="sm" className="text-red-600">
                  <Trash2 className="h-4 w-4" />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>ስረዛውን ያረጋግጡ</AlertDialogTitle>
                  <AlertDialogDescription>
                    ይህንን እርምጃ መመለስ አይቻልም።
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>ይቅር</AlertDialogCancel>
                  <AlertDialogAction onClick={() => handleDelete(item.id, setter, items, type === 'category' ? 'ዘርፍ' : type === 'jobType' ? 'የስራ አይነት' : 'ቦታ')}>
                    ሰርዝ
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Tag className="h-5 w-5" />
          የስራ ዘርፎች እና ቦታዎች አስተዳደር
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="categories" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="categories" className="flex items-center gap-2">
              <Tag className="h-4 w-4" />
              የስራ ዘርፎች
            </TabsTrigger>
            <TabsTrigger value="job-types" className="flex items-center gap-2">
              <Briefcase className="h-4 w-4" />
              የስራ አይነቶች
            </TabsTrigger>
            <TabsTrigger value="locations" className="flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              ቦታዎች
            </TabsTrigger>
          </TabsList>

          <TabsContent value="categories" className="mt-6">
            {renderItemsList(
              categories,
              setCategories,
              newCategory,
              setNewCategory,
              "አዲስ የስራ ዘርፍ ያስገቡ",
              "ዘርፍ ጨምር",
              'category'
            )}
          </TabsContent>

          <TabsContent value="job-types" className="mt-6">
            {renderItemsList(
              jobTypes,
              setJobTypes,
              newJobType,
              setNewJobType,
              "አዲስ የስራ አይነት ያስገቡ",
              "አይነት ጨምር",
              'jobType'
            )}
          </TabsContent>

          <TabsContent value="locations" className="mt-6">
            {renderItemsList(
              locations,
              setLocations,
              newLocation,
              setNewLocation,
              "አዲስ ቦታ ያስገቡ",
              "ቦታ ጨምር",
              'location'
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}