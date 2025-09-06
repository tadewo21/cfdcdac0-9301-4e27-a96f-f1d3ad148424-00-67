import { useEffect } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useTelegramWebApp } from '@/hooks/useTelegramWebApp';

export function TelegramLanguageDetector() {
  const { setLanguage } = useLanguage();
  const { webAppData, isReady } = useTelegramWebApp();

  useEffect(() => {
    if (!isReady) return;

    // Telegram rules compliance: Default to English, with secondary language support
    let detectedLanguage = 'en'; // Always default to English (Telegram requirement)
    
    // Check Telegram user language preference
    if (webAppData?.user?.language_code) {
      const telegramLang = webAppData.user.language_code;
      
      // Only switch to Amharic if specifically requested and supported
      if (telegramLang === 'am' || telegramLang.startsWith('am')) {
        detectedLanguage = 'am';
      }
      // For all other languages, stay with English (compliance requirement)
    }

    // Check browser language as fallback
    if (detectedLanguage === 'en') {
      const browserLang = navigator.language || navigator.languages?.[0] || 'en';
      if (browserLang.startsWith('am')) {
        detectedLanguage = 'am';
      }
    }

    setLanguage(detectedLanguage as 'en' | 'am');
  }, [isReady, webAppData, setLanguage]);

  return null;
}