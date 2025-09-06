import { useState, useEffect } from 'react';
import { useTelegramWebApp } from './useTelegramWebApp';
import { supabase } from '@/integrations/supabase/client';

export interface TelegramAuthUser {
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
  language_code?: string;
}

export function useTelegramAuth() {
  const { webAppData, isReady } = useTelegramWebApp();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<TelegramAuthUser | null>(null);
  const [isValidating, setIsValidating] = useState(false);

  // Validate Telegram initData on server side
  const validateTelegramAuth = async (initData: string) => {
    try {
      setIsValidating(true);
      
      // Call Supabase Edge Function to validate initData
      const { data, error } = await supabase.functions.invoke('validate-telegram-auth', {
        body: { initData }
      });

      if (error) {
        console.error('Telegram auth validation failed:', error);
        return false;
      }

      return data?.isValid || false;
    } catch (error) {
      console.error('Error validating Telegram auth:', error);
      return false;
    } finally {
      setIsValidating(false);
    }
  };

  useEffect(() => {
    if (!isReady) return;

    const authenticateUser = async () => {
      if (webAppData.user && window.Telegram?.WebApp?.initData) {
        // Validate initData server-side for security
        const isValid = await validateTelegramAuth(window.Telegram.WebApp.initData);
        
        if (isValid) {
          setUser(webAppData.user);
          setIsAuthenticated(true);
          
          // Store user in Supabase with proper validation
          await supabase.from('profiles').upsert({
            telegram_user_id: webAppData.user.id,
            full_name: `${webAppData.user.first_name} ${webAppData.user.last_name || ''}`.trim(),
            user_id: `telegram_${webAppData.user.id}`,
            user_type: 'job_seeker'
          }, {
            onConflict: 'telegram_user_id'
          });
        } else {
          console.warn('Telegram authentication validation failed');
          setIsAuthenticated(false);
          setUser(null);
        }
      } else {
        // Not in Telegram environment or no user data
        setIsAuthenticated(false);
        setUser(null);
      }
    };

    authenticateUser();
  }, [isReady, webAppData]);

  return {
    isAuthenticated,
    user,
    isValidating,
    isReady
  };
}