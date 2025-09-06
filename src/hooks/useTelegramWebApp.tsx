import { useEffect, useState } from "react";

// Declare Telegram types
declare global {
  interface Window {
    telegramInitialized?: boolean;
    Telegram?: {
      WebApp: {
        ready: () => void;
        expand: () => void;
        close: () => void;
        MainButton: {
          text: string;
          color: string;
          textColor: string;
          isVisible: boolean;
          isProgressVisible: boolean;
          isActive: boolean;
          setText: (text: string) => void;
          onClick: (callback: () => void) => void;
          offClick: (callback: () => void) => void;
          show: () => void;
          hide: () => void;
          enable: () => void;
          disable: () => void;
          showProgress: (leaveActive?: boolean) => void;
          hideProgress: () => void;
          setParams: (params: {
            text?: string;
            color?: string;
            text_color?: string;
            is_active?: boolean;
            is_visible?: boolean;
          }) => void;
        };
        BackButton: {
          isVisible: boolean;
          onClick: (callback: () => void) => void;
          offClick: (callback: () => void) => void;
          show: () => void;
          hide: () => void;
        };
        HapticFeedback: {
          impactOccurred: (style: 'light' | 'medium' | 'heavy' | 'rigid' | 'soft') => void;
          notificationOccurred: (type: 'error' | 'success' | 'warning') => void;
          selectionChanged: () => void;
        };
        initData: string;
        initDataUnsafe: {
          query_id?: string;
          user?: {
            id: number;
            is_bot?: boolean;
            first_name: string;
            last_name?: string;
            username?: string;
            language_code?: string;
            allows_write_to_pm?: boolean;
          };
          auth_date: number;
          hash: string;
        };
        colorScheme: 'light' | 'dark';
        themeParams: {
          bg_color?: string;
          text_color?: string;
          hint_color?: string;
          link_color?: string;
          button_color?: string;
          button_text_color?: string;
          secondary_bg_color?: string;
        };
        isExpanded: boolean;
        viewportHeight: number;
        viewportStableHeight: number;
        isClosingConfirmationEnabled: boolean;
        headerColor: string;
        backgroundColor: string;
        isVerticalSwipesEnabled: boolean;
        platform: string;
        version: string;
        showPopup: (params: {
          title?: string;
          message: string;
          buttons?: Array<{ id?: string; type?: string; text?: string }>;
        }, callback?: (button_id: string) => void) => void;
        showAlert: (message: string, callback?: () => void) => void;
        showConfirm: (message: string, callback?: (confirmed: boolean) => void) => void;
        showScanQrPopup: (params: { text?: string }, callback?: (qr_text: string) => void) => boolean;
        closeScanQrPopup: () => void;
        readTextFromClipboard: (callback?: (clipboard_text: string) => void) => void;
        requestWriteAccess: (callback?: (access_granted: boolean) => void) => void;
        requestContact: (callback?: (contact_shared: boolean) => void) => void;
        setHeaderColor: (color: 'bg_color' | 'secondary_bg_color' | string) => void;
        setBackgroundColor: (color: 'bg_color' | 'secondary_bg_color' | string) => void;
        enableClosingConfirmation: () => void;
        disableClosingConfirmation: () => void;
        onEvent: (eventType: string, eventHandler: () => void) => void;
        offEvent: (eventType: string, eventHandler: () => void) => void;
        sendData: (data: string) => void;
        switchInlineQuery: (query: string, choose_chat_types?: string[]) => void;
        openLink: (url: string, options?: { try_instant_view?: boolean }) => void;
        openTelegramLink: (url: string) => void;
        openInvoice: (url: string, callback?: (status: string) => void) => void;
        shareToStory: (media_url: string, params?: {
          text?: string;
          widget_link?: {
            url: string;
            name?: string;
          };
        }) => void;
      };
    };
  }
}

export interface TelegramUser {
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
  language_code?: string;
  allows_write_to_pm?: boolean;
}

export interface TelegramWebAppData {
  user: TelegramUser | null;
  colorScheme: 'light' | 'dark';
  themeParams: any;
  isExpanded: boolean;
  viewportHeight: number;
  platform: string;
  version: string;
}

export function useTelegramWebApp() {
  const [webAppData, setWebAppData] = useState<TelegramWebAppData>({
    user: null,
    colorScheme: 'light',
    themeParams: {},
    isExpanded: false,
    viewportHeight: 0,
    platform: 'unknown',
    version: '6.0',
  });

  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const tg = window.Telegram?.WebApp;

    if (tg && !window.telegramInitialized) {
      // Only initialize if not already done globally
      try {
        tg.ready();
        tg.expand();
        window.telegramInitialized = true;
      } catch (error) {
        console.warn('Telegram WebApp initialization failed:', error);
      }
    }

    if (tg) {
      const version = parseFloat(tg.version) || 6.0;

      setWebAppData({
        user: tg.initDataUnsafe.user || null,
        colorScheme: tg.colorScheme || 'light',
        themeParams: tg.themeParams || {},
        isExpanded: tg.isExpanded || false,
        viewportHeight: tg.viewportHeight || 0,
        platform: tg.platform || 'unknown',
        version: tg.version || '6.0',
      });

      setIsReady(true);

      // Apply Telegram theme to CSS variables with better integration
      if (tg.themeParams) {
        const root = document.documentElement;
        
        // Set color scheme
        if (tg.colorScheme === 'dark') {
          root.classList.add('dark');
        } else {
          root.classList.remove('dark');
        }

        // Apply Telegram theme colors with CSS variable mapping
        if (tg.themeParams.bg_color) {
          root.style.setProperty('--background', tg.themeParams.bg_color);
        }
        if (tg.themeParams.text_color) {
          root.style.setProperty('--foreground', tg.themeParams.text_color);
        }
        if (tg.themeParams.button_color) {
          root.style.setProperty('--primary', tg.themeParams.button_color);
        }
        if (tg.themeParams.button_text_color) {
          root.style.setProperty('--primary-foreground', tg.themeParams.button_text_color);
        }
        if (tg.themeParams.secondary_bg_color) {
          root.style.setProperty('--card', tg.themeParams.secondary_bg_color);
        }
        if (tg.themeParams.hint_color) {
          root.style.setProperty('--muted-foreground', tg.themeParams.hint_color);
        }
        if (tg.themeParams.link_color) {
          root.style.setProperty('--accent', tg.themeParams.link_color);
        }
      }

      // Listen for theme changes (only if supported)
      const handleThemeChanged = () => {
        setWebAppData(prev => ({
          ...prev,
          colorScheme: tg.colorScheme || 'light',
          themeParams: tg.themeParams || {},
        }));
      };

      if (tg.onEvent && version >= 6.0) {
        tg.onEvent('themeChanged', handleThemeChanged);

        return () => {
          if (tg.offEvent) {
            tg.offEvent('themeChanged', handleThemeChanged);
          }
        };
      }
    } else {
      // Not running in Telegram, set defaults
      setIsReady(true);
    }
  }, []); // Empty dependency array to prevent multiple executions

  const webApp = window.Telegram?.WebApp;

  return {
    webApp,
    webAppData,
    isReady,
    // Helper functions with version compatibility checks
    showAlert: (message: string) => {
      if (webApp?.showAlert) {
        webApp.showAlert(message);
      } else {
        alert(message); // Fallback for older versions
      }
    },
    showConfirm: (message: string, callback: (confirmed: boolean) => void) => {
      if (webApp?.showConfirm) {
        webApp.showConfirm(message, callback);
      } else {
        callback(confirm(message)); // Fallback for older versions
      }
    },
    hapticFeedback: {
      impact: (style: 'light' | 'medium' | 'heavy' | 'rigid' | 'soft' = 'medium') => {
        const version = parseFloat(webApp?.version || '6.0');
        if (webApp?.HapticFeedback?.impactOccurred && version >= 6.1) {
          webApp.HapticFeedback.impactOccurred(style);
        }
      },
      notification: (type: 'error' | 'success' | 'warning') => {
        const version = parseFloat(webApp?.version || '6.0');
        if (webApp?.HapticFeedback?.notificationOccurred && version >= 6.1) {
          webApp.HapticFeedback.notificationOccurred(type);
        }
      },
      selection: () => {
        const version = parseFloat(webApp?.version || '6.0');
        if (webApp?.HapticFeedback?.selectionChanged && version >= 6.1) {
          webApp.HapticFeedback.selectionChanged();
        }
      },
    },
    close: () => {
      if (webApp?.close) {
        webApp.close();
      }
    },
    openLink: (url: string) => {
      if (webApp?.openLink) {
        webApp.openLink(url);
      } else {
        window.open(url, '_blank');
      }
    },
    shareToStory: (mediaUrl: string, params?: { text?: string; widget_link?: { url: string; name?: string } }) => {
      if (webApp?.shareToStory) {
        webApp.shareToStory(mediaUrl, params);
      } else {
        // Fallback sharing
        if (navigator.share) {
          navigator.share({
            title: params?.text || 'Job Opportunity',
            url: params?.widget_link?.url || mediaUrl
          });
        }
      }
    },
  };
}