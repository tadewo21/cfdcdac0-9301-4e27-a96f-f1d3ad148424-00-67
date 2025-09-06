import { Language, TranslationKey, TranslationKeys } from "./types";
import { amharicTranslations } from "./amharic";
import { englishTranslations } from "./english";

const translations: Record<Language, TranslationKeys> = {
  am: amharicTranslations,
  en: englishTranslations,
};

export const getTranslation = (language: Language, key: TranslationKey): string => {
  const translation = translations[language]?.[key];
  if (!translation) {
    console.warn(`Missing translation for key: ${key} in language: ${language}`);
    return key;
  }
  return translation;
};

export const interpolateTranslation = (
  text: string, 
  variables: Record<string, string | number>
): string => {
  return text.replace(/{(\w+)}/g, (match, key) => {
    return variables[key]?.toString() || match;
  });
};

export * from "./types";