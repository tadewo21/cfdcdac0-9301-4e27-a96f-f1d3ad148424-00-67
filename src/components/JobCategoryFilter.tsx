import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Briefcase, 
  Code, 
  GraduationCap, 
  Heart, 
  DollarSign, 
  ShoppingCart, 
  Megaphone, 
  Settings, 
  Scale, 
  Users, 
  Hammer, 
  Truck, 
  Hotel, 
  Wheat,
  Building,
  Clock,
  UserCheck,
  Globe
} from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

export interface JobTypeFilter {
  type: string;
  source: "government" | "private" | "ngo" | "international" | "all";
  workType: "permanent" | "contract" | "partTime" | "internship" | "freelance" | "all";
}

interface JobCategoryFilterProps {
  onFilterChange: (filters: JobTypeFilter) => void;
  currentFilter: JobTypeFilter;
}

export function JobCategoryFilter({ onFilterChange, currentFilter }: JobCategoryFilterProps) {
  const { t } = useLanguage();

  const jobSources = [
    { key: "all", label: "All Sources", labelAm: "ሁሉም ምንጮች", icon: Building },
    { key: "government", label: "Government", labelAm: "መንግስት", icon: Building },
    { key: "private", label: "Private Sector", labelAm: "የግል ሴክተር", icon: Briefcase },
    { key: "ngo", label: "NGO/NPO", labelAm: "መንግስታዊ ያልሆኑ ድርጅቶች", icon: Heart },
    { key: "international", label: "International Orgs", labelAm: "አለም አቀፍ ድርጅቶች", icon: Globe }
  ];

  const workTypes = [
    { key: "all", label: "All Types", labelAm: "ሁሉም ዓይነቶች", icon: Briefcase },
    { key: "permanent", label: t("jobType.permanent"), icon: UserCheck },
    { key: "contract", label: t("jobType.contract"), icon: Clock },
    { key: "partTime", label: t("jobType.partTime"), icon: Clock },
    { key: "internship", label: t("jobType.internship"), icon: GraduationCap },
    { key: "freelance", label: t("jobType.freelance"), icon: Settings }
  ];

  const jobCategories = [
    { key: "መረጃ ቴክኖሎጂ (IT)", label: t("category.it"), icon: Code },
    { key: "ትምህርት", label: t("category.education"), icon: GraduationCap },
    { key: "ጤና", label: t("category.health"), icon: Heart },
    { key: "ፋይናንስ እና ባንክ", label: t("category.finance"), icon: DollarSign },
    { key: "ንግድ እና ሽያጭ", label: t("category.business"), icon: ShoppingCart },
    { key: "ማርኬቲንግ", label: t("category.marketing"), icon: Megaphone },
    { key: "ኢንጂነሪንግ", label: t("category.engineering"), icon: Settings },
    { key: "ህግ", label: t("category.legal"), icon: Scale },
    { key: "ሰብአዊ ሀብት (HR)", label: t("category.hr"), icon: Users },
    { key: "ግንባታ", label: t("category.construction"), icon: Hammer },
    { key: "መጓጓዣ", label: t("category.transport"), icon: Truck },
    { key: "ሆቴል እና ቱሪዝም", label: t("category.hotel"), icon: Hotel },
    { key: "አግሪክልቸር", label: t("category.agriculture"), icon: Wheat },
    { key: "ሌላ", label: t("category.other"), icon: Briefcase }
  ];

  return (
    <div className="space-y-6">
      {/* Job Source Filter */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Job Source</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {jobSources.map(source => {
              const IconComponent = source.icon;
              const isSelected = currentFilter.source === source.key;
              
              return (
                <Button
                  key={source.key}
                  variant={isSelected ? "default" : "outline"}
                  size="sm"
                  onClick={() => onFilterChange({ 
                    ...currentFilter, 
                    source: source.key as any 
                  })}
                  className="gap-2"
                >
                  <IconComponent className="h-4 w-4" />
                  {source.label}
                </Button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Work Type Filter */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Work Type</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {workTypes.map(type => {
              const IconComponent = type.icon;
              const isSelected = currentFilter.workType === type.key;
              
              return (
                <Button
                  key={type.key}
                  variant={isSelected ? "default" : "outline"}
                  size="sm"
                  onClick={() => onFilterChange({ 
                    ...currentFilter, 
                    workType: type.key as any 
                  })}
                  className="gap-2"
                >
                  <IconComponent className="h-4 w-4" />
                  {type.label}
                </Button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Category Tags */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Categories</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {jobCategories.map(category => {
              const IconComponent = category.icon;
              const isSelected = currentFilter.type === category.key;
              
              return (
                <Badge
                  key={category.key}
                  variant={isSelected ? "default" : "secondary"}
                  className="cursor-pointer gap-1 px-3 py-1 hover:bg-primary/20"
                  onClick={() => onFilterChange({ 
                    ...currentFilter, 
                    type: isSelected ? "" : category.key 
                  })}
                >
                  <IconComponent className="h-3 w-3" />
                  {category.label}
                </Badge>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}