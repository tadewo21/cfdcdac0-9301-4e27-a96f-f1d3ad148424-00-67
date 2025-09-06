import { useLanguage } from "@/contexts/LanguageContext";

export const getCategoryTranslation = (category: string, t: ReturnType<typeof useLanguage>['t']) => {
  // Map common categories to translation keys
  const categoryMap: Record<string, string> = {
    'information technology': 'category.it',
    'information technology (it)': 'category.it',
    'it': 'category.it',
    'education': 'category.education',
    'health': 'category.health',
    'finance': 'category.finance',
    'finance & banking': 'category.finance',
    'business': 'category.business',
    'business & sales': 'category.business',
    'marketing': 'category.marketing',
    'engineering': 'category.engineering',
    'legal': 'category.legal',
    'human resources': 'category.hr',
    'human resources (hr)': 'category.hr',
    'hr': 'category.hr',
    'construction': 'category.construction',
    'transport': 'category.transport',
    'transportation': 'category.transport',
    'hotel': 'category.hotel',
    'hotel & tourism': 'category.hotel',
    'agriculture': 'category.agriculture',
    'other': 'category.other'
  };
  
  const normalizedCategory = category.toLowerCase().trim();
  const translationKey = categoryMap[normalizedCategory];
  
  if (translationKey) {
    try {
      return t(translationKey as any);
    } catch {
      return category;
    }
  }
  
  return category;
};