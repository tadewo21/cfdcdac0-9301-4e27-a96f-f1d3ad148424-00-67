import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useLanguage } from '@/contexts/LanguageContext';

export function TelegramAgeRestriction() {
  const [showAgeRestriction, setShowAgeRestriction] = useState(false);
  const { language } = useLanguage();

  useEffect(() => {
    // Check if user has already acknowledged age restriction
    const hasAcknowledged = localStorage.getItem('age_restriction_acknowledged');
    
    // Show age restriction on first launch (Telegram compliance requirement)
    if (!hasAcknowledged && window.Telegram?.WebApp) {
      setShowAgeRestriction(true);
    }
  }, []);

  const handleAcknowledge = () => {
    localStorage.setItem('age_restriction_acknowledged', 'true');
    setShowAgeRestriction(false);
  };

  if (!showAgeRestriction) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-center">
            {language === 'am' ? 'የእድሜ ገደብ ማሳወቂያ' : 'Age Restriction Notice'}
          </CardTitle>
          <CardDescription className="text-center">
            {language === 'am' 
              ? 'ይህ መተግበሪያ ለ13 ዓመት እና ከዚያ በላይ ዓመት ዕድሜ ያላቸው ለተጠቃሚዎች ነው።'
              : 'This app is intended for users aged 13 and above.'
            }
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground text-center">
            {language === 'am'
              ? 'በመቀጠል፣ እርስዎ 13 ዓመት ወይም ከዚያ በላይ እንደሆኑ እና የሀገሩን ሕጎች እንደሚያከብሩ ያረጋግጣሉ።'
              : 'By continuing, you confirm that you are 13 years of age or older and comply with your local laws.'
            }
          </p>
        </CardContent>
        <CardFooter>
          <Button onClick={handleAcknowledge} className="w-full">
            {language === 'am' ? 'ተገቢ ነኝ እና መቀጠል እፈልጋለሁ' : 'I understand and wish to continue'}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}