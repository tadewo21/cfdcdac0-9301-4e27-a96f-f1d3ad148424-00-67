import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Save, Edit2, Plus, Trash2, Star, Crown } from "lucide-react";
import { toast } from "sonner";

interface PaymentPlan {
  id: string;
  name: string;
  name_am: string;
  description: string;
  description_am: string;
  price: number;
  currency: "ETB" | "USD";
  duration_days: number;
  plan_type: "featured_job" | "company_package" | "premium_listing";
  features: string[];
  features_am: string[];
  is_active: boolean;
  is_popular: boolean;
  max_jobs?: number;
  max_featured_jobs?: number;
  priority_support: boolean;
  analytics_access: boolean;
  created_at: string;
  updated_at: string;
}

const planTypes = [
  { value: "featured_job", label: "ታዋቂ ስራ (Featured Job)", icon: Star },
  { value: "company_package", label: "የኩባንያ ፓኬጅ (Company Package)", icon: Crown },
  { value: "premium_listing", label: "ፕሪሚየም ዝርዝር (Premium Listing)", icon: Star }
];

export function PaymentPlansManagement() {
  const [plans, setPlans] = useState<PaymentPlan[]>([]);
  const [selectedPlan, setSelectedPlan] = useState<PaymentPlan | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    name_am: "",
    description: "",
    description_am: "",
    price: 0,
    currency: "ETB" as "ETB" | "USD",
    duration_days: 30,
    plan_type: "featured_job" as "featured_job" | "company_package" | "premium_listing",
    features: [""],
    features_am: [""],
    is_active: true,
    is_popular: false,
    max_jobs: 0,
    max_featured_jobs: 0,
    priority_support: false,
    analytics_access: false
  });

  useEffect(() => {
    fetchPlans();
  }, []);

  const fetchPlans = async () => {
    // TODO: Implement API call to fetch payment plans
    // Example mock data
    const mockPlans: PaymentPlan[] = [
      {
        id: "1",
        name: "Basic Featured Job",
        name_am: "መሰረታዊ ታዋቂ ስራ",
        description: "Make your job posting stand out for 7 days",
        description_am: "የስራ ማስታወቂያዎ ለ7 ቀናት እንዲታይ ያድርጉ",
        price: 500,
        currency: "ETB",
        duration_days: 7,
        plan_type: "featured_job",
        features: ["Featured badge", "Priority placement", "Highlighted listing"],
        features_am: ["ታዋቂ ምልክት", "የቅድሚያ አቀማመጥ", "የማብራሪያ ዝርዝር"],
        is_active: true,
        is_popular: true,
        priority_support: false,
        analytics_access: false,
        created_at: "2024-01-01",
        updated_at: "2024-01-15"
      }
    ];
    setPlans(mockPlans);
  };

  const handleSave = async () => {
    try {
      const cleanFeatures = formData.features.filter(f => f.trim() !== "");
      const cleanFeaturesAm = formData.features_am.filter(f => f.trim() !== "");
      
      const planData = {
        ...formData,
        features: cleanFeatures,
        features_am: cleanFeaturesAm
      };

      if (selectedPlan) {
        console.log("Updating plan:", { id: selectedPlan.id, ...planData });
      } else {
        console.log("Creating new plan:", planData);
      }
      
      toast.success(selectedPlan ? "እቅዱ ተሻሽሏል" : "አዲስ እቅድ ተፈጥሯል");
      setIsEditing(false);
      setSelectedPlan(null);
      fetchPlans();
    } catch (error) {
      toast.error("ስህተት ተፈጥሯል");
    }
  };

  const handleDelete = async (planId: string) => {
    if (confirm("እርግጠኛ ነዎት ይህን እቅድ መሰረዝ ይፈልጋሉ?")) {
      try {
        console.log("Deleting plan:", planId);
        toast.success("እቅዱ ተሰርዟል");
        fetchPlans();
      } catch (error) {
        toast.error("ስህተት ተፈጥሯል");
      }
    }
  };

  const startEditing = (plan?: PaymentPlan) => {
    if (plan) {
      setSelectedPlan(plan);
      setFormData({
        name: plan.name,
        name_am: plan.name_am,
        description: plan.description,
        description_am: plan.description_am,
        price: plan.price,
        currency: plan.currency,
        duration_days: plan.duration_days,
        plan_type: plan.plan_type,
        features: plan.features.length > 0 ? plan.features : [""],
        features_am: plan.features_am.length > 0 ? plan.features_am : [""],
        is_active: plan.is_active,
        is_popular: plan.is_popular,
        max_jobs: plan.max_jobs || 0,
        max_featured_jobs: plan.max_featured_jobs || 0,
        priority_support: plan.priority_support,
        analytics_access: plan.analytics_access
      });
    } else {
      setSelectedPlan(null);
      setFormData({
        name: "",
        name_am: "",
        description: "",
        description_am: "",
        price: 0,
        currency: "ETB",
        duration_days: 30,
        plan_type: "featured_job",
        features: [""],
        features_am: [""],
        is_active: true,
        is_popular: false,
        max_jobs: 0,
        max_featured_jobs: 0,
        priority_support: false,
        analytics_access: false
      });
    }
    setIsEditing(true);
  };

  const addFeature = () => {
    setFormData(prev => ({
      ...prev,
      features: [...prev.features, ""],
      features_am: [...prev.features_am, ""]
    }));
  };

  const removeFeature = (index: number) => {
    setFormData(prev => ({
      ...prev,
      features: prev.features.filter((_, i) => i !== index),
      features_am: prev.features_am.filter((_, i) => i !== index)
    }));
  };

  const updateFeature = (index: number, value: string, isAmharic = false) => {
    setFormData(prev => ({
      ...prev,
      [isAmharic ? 'features_am' : 'features']: prev[isAmharic ? 'features_am' : 'features'].map((f, i) => 
        i === index ? value : f
      )
    }));
  };

  return (
    <div className="space-y-6">
      {!isEditing ? (
        <>
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">የክፍያ እቅዶች</h3>
            <Button onClick={() => startEditing()} className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              አዲስ እቅድ
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {plans.map((plan) => {
              const TypeIcon = planTypes.find(t => t.value === plan.plan_type)?.icon || Star;
              return (
                <Card key={plan.id} className={plan.is_popular ? "border-primary" : ""}>
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <TypeIcon className="h-5 w-5 text-primary" />
                        <div>
                          <CardTitle className="text-base">{plan.name}</CardTitle>
                          <p className="text-sm text-muted-foreground">{plan.name_am}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        {plan.is_popular && (
                          <Badge className="bg-gradient-primary">ተወዳጅ</Badge>
                        )}
                        <Badge variant={plan.is_active ? "default" : "secondary"}>
                          {plan.is_active ? "ንቁ" : "ዝግ"}
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="text-center">
                        <div className="text-2xl font-bold">
                          {plan.price} {plan.currency}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          ለ{plan.duration_days} ቀናት
                        </p>
                      </div>
                      
                      <div className="space-y-1">
                        {plan.features.map((feature, index) => (
                          <div key={index} className="text-sm flex items-center gap-1">
                            <span className="text-primary">✓</span>
                            {feature}
                          </div>
                        ))}
                      </div>

                      <div className="flex gap-2 pt-3">
                        <Button 
                          size="sm" 
                          variant="outline" 
                          onClick={() => startEditing(plan)}
                          className="flex-1"
                        >
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline" 
                          onClick={() => handleDelete(plan.id)}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </>
      ) : (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">
              {selectedPlan ? "እቅድ አስተካክል" : "አዲስ እቅድ ፍጠር"}
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
            {/* Basic Information */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">የእቅድ ስም (English)</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Plan name in English"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="name_am">የእቅድ ስም (አማርኛ)</Label>
                <Input
                  id="name_am"
                  value={formData.name_am}
                  onChange={(e) => setFormData(prev => ({ ...prev, name_am: e.target.value }))}
                  placeholder="የእቅድ ስም በአማርኛ"
                />
              </div>
            </div>

            {/* Descriptions */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="description">መግለጫ (English)</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Plan description in English"
                  className="h-20"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description_am">መግለጫ (አማርኛ)</Label>
                <Textarea
                  id="description_am"
                  value={formData.description_am}
                  onChange={(e) => setFormData(prev => ({ ...prev, description_am: e.target.value }))}
                  placeholder="የእቅድ መግለጫ በአማርኛ"
                  className="h-20"
                />
              </div>
            </div>

            {/* Pricing and Duration */}
            <div className="grid grid-cols-4 gap-4">
              <div className="space-y-2">
                <Label htmlFor="price">ዋጋ (Price)</Label>
                <Input
                  id="price"
                  type="number"
                  value={formData.price}
                  onChange={(e) => setFormData(prev => ({ ...prev, price: Number(e.target.value) }))}
                  placeholder="0"
                />
              </div>
              <div className="space-y-2">
                <Label>ምንዛሬ (Currency)</Label>
                <Select
                  value={formData.currency}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, currency: value as any }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ETB">ETB (ብር)</SelectItem>
                    <SelectItem value="USD">USD (ዶላር)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="duration">የእቅድ ጊዜ (ቀናት)</Label>
                <Input
                  id="duration"
                  type="number"
                  value={formData.duration_days}
                  onChange={(e) => setFormData(prev => ({ ...prev, duration_days: Number(e.target.value) }))}
                  placeholder="30"
                />
              </div>
              <div className="space-y-2">
                <Label>የእቅድ አይነት</Label>
                <Select
                  value={formData.plan_type}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, plan_type: value as any }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {planTypes.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Plan Features */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label>የእቅድ ባህሪያት (Features)</Label>
                <Button type="button" onClick={addFeature} size="sm">
                  <Plus className="h-4 w-4 mr-1" />
                  አክል
                </Button>
              </div>
              <div className="space-y-3">
                {formData.features.map((feature, index) => (
                  <div key={index} className="grid grid-cols-2 gap-4">
                    <div className="flex gap-2">
                      <Input
                        value={feature}
                        onChange={(e) => updateFeature(index, e.target.value)}
                        placeholder="Feature in English"
                      />
                      {formData.features.length > 1 && (
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => removeFeature(index)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                    <Input
                      value={formData.features_am[index] || ""}
                      onChange={(e) => updateFeature(index, e.target.value, true)}
                      placeholder="ባህሪ በአማርኛ"
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Limits and Features */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="max_jobs">ከፍተኛ የስራ ብዛት</Label>
                <Input
                  id="max_jobs"
                  type="number"
                  value={formData.max_jobs}
                  onChange={(e) => setFormData(prev => ({ ...prev, max_jobs: Number(e.target.value) }))}
                  placeholder="0 (ያልተወሰነ)"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="max_featured_jobs">ከፍተኛ ታዋቂ ስራ ብዛት</Label>
                <Input
                  id="max_featured_jobs"
                  type="number"
                  value={formData.max_featured_jobs}
                  onChange={(e) => setFormData(prev => ({ ...prev, max_featured_jobs: Number(e.target.value) }))}
                  placeholder="0 (ያልተወሰነ)"
                />
              </div>
            </div>

            {/* Switches */}
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label htmlFor="is_active">ንቁ እቅድ</Label>
                  <Switch
                    id="is_active"
                    checked={formData.is_active}
                    onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_active: checked }))}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="is_popular">ተወዳጅ እቅድ</Label>
                  <Switch
                    id="is_popular"
                    checked={formData.is_popular}
                    onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_popular: checked }))}
                  />
                </div>
              </div>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label htmlFor="priority_support">የቅድሚያ ድጋፍ</Label>
                  <Switch
                    id="priority_support"
                    checked={formData.priority_support}
                    onCheckedChange={(checked) => setFormData(prev => ({ ...prev, priority_support: checked }))}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="analytics_access">የትንታኔ መዳረሻ</Label>
                  <Switch
                    id="analytics_access"
                    checked={formData.analytics_access}
                    onCheckedChange={(checked) => setFormData(prev => ({ ...prev, analytics_access: checked }))}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}