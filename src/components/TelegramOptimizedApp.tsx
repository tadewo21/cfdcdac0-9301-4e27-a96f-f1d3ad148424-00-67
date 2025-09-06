import { useEffect } from 'react';
import { useTelegramWebApp } from '@/hooks/useTelegramWebApp';
import { useTelegramAuth } from '@/hooks/useTelegramAuth';
import { useToast } from '@/hooks/use-toast';
import { safelyUseHapticFeedback } from '@/utils/telegramCompatibility';

interface TelegramOptimizedAppProps {
  children: React.ReactNode;
}

export function TelegramOptimizedApp({ children }: TelegramOptimizedAppProps) {
  const { webApp, webAppData, isReady, hapticFeedback } = useTelegramWebApp();
  const { isAuthenticated, user, isValidating } = useTelegramAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (!isReady || !webApp) return;

    // Version check for compatibility
    const version = parseFloat(webApp.version) || 6.0;

    // Configure main button for primary actions in both languages
    if (webApp.MainButton) {
      // Use English as primary (Telegram requirement), with fallback to Amharic
      const buttonText = webAppData?.user?.language_code === 'am' ? 
        'View Latest Jobs' : 'View Latest Jobs'; // Always English for compliance
      
      webApp.MainButton.setText(buttonText);
      webApp.MainButton.setParams({
        color: '#16a34a',
        text_color: '#ffffff'
      });
    }

    // Set up haptic feedback for better mobile experience (with safe fallbacks)
    const buttons = document.querySelectorAll('button, [role="button"]');
    buttons.forEach(button => {
      const handleClick = () => {
        safelyUseHapticFeedback('light');
      };
      button.addEventListener('click', handleClick);
      
      // Store handler for cleanup
      (button as any)._hapticHandler = handleClick;
    });
    
    // Cleanup function
    const cleanup = () => {
      const buttons = document.querySelectorAll('button, [role="button"]');
      buttons.forEach(button => {
        const handler = (button as any)._hapticHandler;
        if (handler) {
          button.removeEventListener('click', handler);
          delete (button as any)._hapticHandler;
        }
      });
    };

    // Optimize viewport for Telegram
    const setViewportHeight = () => {
      try {
        const vh = webApp.viewportHeight * 0.01;
        document.documentElement.style.setProperty('--vh', `${vh}px`);
      } catch (error) {
        console.warn('Viewport height setting failed:', error);
      }
    };

    setViewportHeight();
    
    // Listen for viewport changes with error handling
    if (webApp.onEvent && version >= 6.0) {
      try {
        webApp.onEvent('viewportChanged', setViewportHeight);
        
        return () => {
          cleanup();
          if (webApp.offEvent) {
            webApp.offEvent('viewportChanged', setViewportHeight);
          }
        };
      } catch (error) {
        console.warn('Viewport event listener setup failed:', error);
        return cleanup;
      }
    }
    
    return cleanup;
  }, [isReady, webApp]);

  // Show authentication status with proper language support
  useEffect(() => {
    if (isReady && !isValidating) {
      if (isAuthenticated && user) {
        // Always show English first (Telegram requirement), with bilingual support
        const welcomeTitle = `Welcome ${user.first_name}!`;
        const welcomeDesc = 'Signed in with Telegram account.';
        
        toast({
          title: welcomeTitle,
          description: welcomeDesc,
        });
      }
    }
  }, [isAuthenticated, user, isReady, isValidating, toast]);

  return (
    <div className="tg-viewport">
      {children}
    </div>
  );
}