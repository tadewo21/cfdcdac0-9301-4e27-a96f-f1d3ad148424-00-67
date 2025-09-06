import { useEffect, useRef } from 'react';

interface PerformanceMetrics {
  fcp?: number;
  lcp?: number;
  fid?: number;
  cls?: number;
  ttfb?: number;
}

interface PerformanceEntryWithProcessing extends PerformanceEntry {
  processingStart?: number;
  hadRecentInput?: boolean;
  value?: number;
}

export const usePerformanceMonitor = () => {
  const metrics = useRef<PerformanceMetrics>({});

  useEffect(() => {
    // Performance Observer for Core Web Vitals
    const observer = new PerformanceObserver((entryList) => {
      const entries = entryList.getEntries();
      
      entries.forEach((entry) => {
        const extendedEntry = entry as PerformanceEntryWithProcessing;
        
        switch (entry.entryType) {
          case 'paint':
            if (entry.name === 'first-contentful-paint') {
              metrics.current.fcp = entry.startTime;
            }
            break;
          case 'largest-contentful-paint':
            metrics.current.lcp = entry.startTime;
            break;
          case 'first-input':
            if (extendedEntry.processingStart) {
              metrics.current.fid = extendedEntry.processingStart - entry.startTime;
            }
            break;
          case 'layout-shift':
            if (!extendedEntry.hadRecentInput && extendedEntry.value) {
              metrics.current.cls = (metrics.current.cls || 0) + extendedEntry.value;
            }
            break;
        }
      });
    });

    // Observe different entry types
    try {
      observer.observe({ entryTypes: ['paint', 'largest-contentful-paint', 'first-input', 'layout-shift'] });
    } catch (e) {
      // Fallback for browsers that don't support all entry types
      console.warn('Some performance metrics unavailable:', e);
    }

    // Measure TTFB
    const measureTTFB = () => {
      const navEntry = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      if (navEntry) {
        metrics.current.ttfb = navEntry.responseStart - navEntry.requestStart;
      }
    };

    // Report metrics when page is about to unload
    const reportMetrics = () => {
      measureTTFB();
      
      // Log metrics for monitoring (in production, send to analytics)
      console.log('Performance Metrics:', metrics.current);
      
      // Grade performance
      const grade = getPerformanceGrade(metrics.current);
      console.log('Performance Grade:', grade);
    };

    window.addEventListener('beforeunload', reportMetrics);
    
    // Report after 5 seconds for initial metrics
    setTimeout(reportMetrics, 5000);

    return () => {
      observer.disconnect();
      window.removeEventListener('beforeunload', reportMetrics);
    };
  }, []);

  const getPerformanceGrade = (metrics: PerformanceMetrics): string => {
    let score = 100;
    
    // FCP scoring (0-2.5s = good)
    if (metrics.fcp) {
      if (metrics.fcp > 2500) score -= 20;
      else if (metrics.fcp > 1500) score -= 10;
    }
    
    // LCP scoring (0-2.5s = good)
    if (metrics.lcp) {
      if (metrics.lcp > 2500) score -= 25;
      else if (metrics.lcp > 1500) score -= 15;
    }
    
    // FID scoring (0-100ms = good)
    if (metrics.fid) {
      if (metrics.fid > 300) score -= 20;
      else if (metrics.fid > 100) score -= 10;
    }
    
    // CLS scoring (0-0.1 = good)
    if (metrics.cls) {
      if (metrics.cls > 0.25) score -= 20;
      else if (metrics.cls > 0.1) score -= 10;
    }
    
    // TTFB scoring (0-600ms = good)
    if (metrics.ttfb) {
      if (metrics.ttfb > 600) score -= 15;
      else if (metrics.ttfb > 300) score -= 5;
    }
    
    if (score >= 90) return 'A+ (Excellent)';
    if (score >= 80) return 'A (Very Good)';
    if (score >= 70) return 'B (Good)';
    if (score >= 60) return 'C (Average)';
    return 'D (Needs Improvement)';
  };

  return {
    metrics: metrics.current,
    getPerformanceGrade: () => getPerformanceGrade(metrics.current)
  };
};