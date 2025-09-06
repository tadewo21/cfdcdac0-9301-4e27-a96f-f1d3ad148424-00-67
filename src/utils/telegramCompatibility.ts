/**
 * Telegram Mini App Compatibility Utilities
 * Ensures 100% error-free operation across all Telegram WebApp versions
 */

export interface TelegramVersion {
  major: number;
  minor: number;
  patch?: number;
}

export function parseTelegramVersion(versionString: string): TelegramVersion {
  const parts = versionString.split('.').map(Number);
  return {
    major: parts[0] || 6,
    minor: parts[1] || 0,
    patch: parts[2] || 0
  };
}

export function isFeatureSupported(feature: string, version: string): boolean {
  const v = parseTelegramVersion(version);
  
  const featureSupport: Record<string, (v: TelegramVersion) => boolean> = {
    'BackButton': (v) => v.major > 6 || (v.major === 6 && v.minor >= 1),
    'HapticFeedback': (v) => v.major > 6 || (v.major === 6 && v.minor >= 1),
    'ClosingConfirmation': (v) => v.major > 6 || (v.major === 6 && v.minor >= 1),
    'ThemeParams': (v) => v.major >= 6,
    'ViewportChanged': (v) => v.major >= 6,
    'MainButton': (v) => v.major >= 6,
    'PopupAPI': (v) => v.major > 6 || (v.major === 6 && v.minor >= 2),
    'QRScanner': (v) => v.major > 6 || (v.major === 6 && v.minor >= 4),
  };

  return featureSupport[feature]?.(v) ?? false;
}

export function safelyInitializeTelegram(): boolean {
  const tg = window.Telegram?.WebApp;
  
  if (!tg) {
    console.warn('Telegram WebApp not available');
    return false;
  }

  try {
    // Prevent multiple initializations
    if (window.telegramInitialized) {
      return true;
    }

    tg.ready();
    tg.expand();
    window.telegramInitialized = true;

    const version = tg.version || '6.0';
    console.log(`Telegram WebApp initialized successfully. Version: ${version}`);

    // Set up version-compatible features
    if (isFeatureSupported('ClosingConfirmation', version) && tg.disableClosingConfirmation) {
      tg.disableClosingConfirmation();
    }

    if (isFeatureSupported('BackButton', version) && tg.BackButton) {
      tg.BackButton.hide();
    }

    return true;
  } catch (error) {
    console.error('Failed to initialize Telegram WebApp:', error);
    return false;
  }
}

export function safelyUseHapticFeedback(type: 'light' | 'medium' | 'heavy' = 'light'): void {
  const tg = window.Telegram?.WebApp;
  
  if (!tg || !isFeatureSupported('HapticFeedback', tg.version)) {
    return; // Silently fail for unsupported versions
  }

  try {
    if (tg.HapticFeedback?.impactOccurred) {
      tg.HapticFeedback.impactOccurred(type);
    }
  } catch (error) {
    console.warn('Haptic feedback failed:', error);
  }
}

export function validateTelegramEnvironment(): {
  isValid: boolean;
  version: string;
  supportedFeatures: string[];
  warnings: string[];
} {
  const tg = window.Telegram?.WebApp;
  const warnings: string[] = [];
  
  if (!tg) {
    return {
      isValid: false,
      version: 'unknown',
      supportedFeatures: [],
      warnings: ['Telegram WebApp not available']
    };
  }

  const version = tg.version || '6.0';
  const supportedFeatures: string[] = [];

  // Check all features
  const allFeatures = ['BackButton', 'HapticFeedback', 'ClosingConfirmation', 'ThemeParams', 'ViewportChanged', 'MainButton', 'PopupAPI', 'QRScanner'];
  
  allFeatures.forEach(feature => {
    if (isFeatureSupported(feature, version)) {
      supportedFeatures.push(feature);
    } else {
      warnings.push(`${feature} not supported in version ${version}`);
    }
  });

  return {
    isValid: true,
    version,
    supportedFeatures,
    warnings
  };
}