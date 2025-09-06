import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { safelyInitializeTelegram } from './utils/telegramCompatibility'
import { SettingsProvider } from './contexts/SettingsContext'
import { initPerformanceOptimizations } from './utils/performance'

// Initialize performance optimizations first
initPerformanceOptimizations();

// Initialize Telegram Web App safely with comprehensive error handling
safelyInitializeTelegram();

// Optimize root rendering with concurrent features
const rootElement = document.getElementById("root")!;
const root = createRoot(rootElement, {
  // Enable concurrent features for better performance
  onRecoverableError: (error) => {
    console.error('Recoverable error:', error);
  }
});

root.render(
  <SettingsProvider>
    <App />
  </SettingsProvider>
)
