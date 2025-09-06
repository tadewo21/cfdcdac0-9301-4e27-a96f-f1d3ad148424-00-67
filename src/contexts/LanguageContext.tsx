import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { Language, TranslationKey, getTranslation, interpolateTranslation } from "@/lib/translations";

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: TranslationKey, variables?: Record<string, string | number>) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  // Default to English as required by Telegram Apps Center Rules (Rule 3.1.1)
  const [language, setLanguage] = useState<Language>("en");

  useEffect(() => {
    // Check if user has a saved preference
    const saved = localStorage.getItem("preferred-language") as Language;
    if (saved && (saved === "am" || saved === "en")) {
      setLanguage(saved);
      return;
    }
    
    // Auto-detect from Telegram user language if available
    const tgUser = window.Telegram?.WebApp?.initDataUnsafe?.user;
    if (tgUser?.language_code) {
      // If user's Telegram is in Amharic, use Amharic
      if (tgUser.language_code === "am" || tgUser.language_code === "am-ET") {
        setLanguage("am");
        localStorage.setItem("preferred-language", "am");
      } else {
        // Default to English for all other languages (Rule 3.1.1)
        setLanguage("en");
        localStorage.setItem("preferred-language", "en");
      }
    } else {
      // Fallback to English if no Telegram data (Rule 3.1.1)
      setLanguage("en");
      localStorage.setItem("preferred-language", "en");
    }
  }, []);

  const handleSetLanguage = useCallback((lang: Language) => {
    setLanguage(lang);
    localStorage.setItem("preferred-language", lang);
  }, []);

  const t = useCallback((key: TranslationKey, variables?: Record<string, string | number>): string => {
    try {
      const translation = getTranslation(language, key);
      
      if (variables && Object.keys(variables).length > 0) {
        return interpolateTranslation(translation, variables);
      }
      
      return translation;
    } catch (error) {
      console.warn(`Translation error for key: ${key}`, error);
      return key; // Return the key as fallback
    }
  }, [language]);

  const contextValue = React.useMemo(() => ({
    language,
    setLanguage: handleSetLanguage,
    t
  }), [language, handleSetLanguage, t]);

  return (
    <LanguageContext.Provider value={contextValue}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
}