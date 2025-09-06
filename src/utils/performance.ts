// Performance optimization utilities

// Image lazy loading observer
export const createImageObserver = () => {
  if ('IntersectionObserver' in window) {
    return new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const img = entry.target as HTMLImageElement;
          const src = img.dataset.src;
          if (src) {
            img.src = src;
            img.removeAttribute('data-src');
          }
          img.classList.remove('lazy');
        }
      });
    }, {
      rootMargin: '50px 0px',
      threshold: 0.01
    });
  }
  return null;
};

// Preload critical resources
export const preloadCriticalResources = () => {
  // Preload hero image
  const heroImage = new Image();
  heroImage.src = '/assets/hero-optimized.webp';
  
  // Preload critical CSS
  const criticalCSS = document.createElement('link');
  criticalCSS.rel = 'preload';
  criticalCSS.as = 'style';
  criticalCSS.href = '/src/index.css';
  document.head.appendChild(criticalCSS);
};

// Optimize bundle loading
export const optimizeBundleLoading = () => {
  // Prefetch important chunks
  const prefetchScript = (src: string) => {
    const link = document.createElement('link');
    link.rel = 'prefetch';
    link.href = src;
    document.head.appendChild(link);
  };

  // Prefetch vendor chunks (after main bundle loads)
  setTimeout(() => {
    prefetchScript('/js/vendor-[hash].js');
    prefetchScript('/js/ui-[hash].js');
  }, 1000);
};

// Performance monitoring
export const measurePerformance = () => {
  if ('performance' in window) {
    // Measure First Contentful Paint
    const observer = new PerformanceObserver((entryList) => {
      const entries = entryList.getEntries();
      entries.forEach((entry) => {
        if (entry.name === 'first-contentful-paint') {
          console.log('FCP:', entry.startTime);
        }
        if (entry.name === 'largest-contentful-paint') {
          console.log('LCP:', entry.startTime);
        }
      });
    });
    
    observer.observe({ entryTypes: ['paint', 'largest-contentful-paint'] });
    
    // Measure page load time
    window.addEventListener('load', () => {
      const loadTime = performance.now();
      console.log('Page Load Time:', loadTime);
    });
  }
};

// Service Worker registration for caching
export const registerServiceWorker = async () => {
  if ('serviceWorker' in navigator) {
    try {
      const registration = await navigator.serviceWorker.register('/sw.js');
      console.log('SW registered:', registration);
      return registration;
    } catch (error) {
      console.log('SW registration failed:', error);
    }
  }
};

// Memory management
export const optimizeMemoryUsage = () => {
  // Clean up unused event listeners
  const cleanupEventListeners = () => {
    // Remove inactive listeners
    document.removeEventListener('scroll', () => {});
    window.removeEventListener('resize', () => {});
  };
  
  // Cleanup on page unload
  window.addEventListener('beforeunload', cleanupEventListeners);
  
  // Garbage collection hints
  if ('gc' in window) {
    setInterval(() => {
      (window as any).gc();
    }, 30000); // Every 30 seconds
  }
};

// Critical resource hints
export const addResourceHints = () => {
  const head = document.head;
  
  // DNS prefetch for external domains
  const dnsPrefetch = (domain: string) => {
    const link = document.createElement('link');
    link.rel = 'dns-prefetch';
    link.href = domain;
    head.appendChild(link);
  };
  
  // Preconnect to Supabase
  const preconnect = (domain: string) => {
    const link = document.createElement('link');
    link.rel = 'preconnect';
    link.href = domain;
    head.appendChild(link);
  };
  
  dnsPrefetch('//zipdagizsbhalclcxnqm.supabase.co');
  preconnect('https://zipdagizsbhalclcxnqm.supabase.co');
};

// Initialize all performance optimizations
export const initPerformanceOptimizations = () => {
  // Run immediately
  addResourceHints();
  preloadCriticalResources();
  
  // Run after DOM is ready
  document.addEventListener('DOMContentLoaded', () => {
    measurePerformance();
    optimizeMemoryUsage();
    createImageObserver();
  });
  
  // Run after load
  window.addEventListener('load', () => {
    optimizeBundleLoading();
    registerServiceWorker();
  });
};