// CDN and Asset Optimization Utilities

interface CDNConfig {
  baseUrl: string;
  enableWebP: boolean;
  enableCompression: boolean;
  cacheTTL: number;
}

const CDN_CONFIG: CDNConfig = {
  baseUrl: import.meta.env.VITE_CDN_URL || '',
  enableWebP: true,
  enableCompression: true,
  cacheTTL: 86400 // 24 hours
};

export class CDNOptimizer {
  private static instance: CDNOptimizer;
  private cache = new Map<string, string>();

  static getInstance(): CDNOptimizer {
    if (!CDNOptimizer.instance) {
      CDNOptimizer.instance = new CDNOptimizer();
    }
    return CDNOptimizer.instance;
  }

  // Optimize image URLs for CDN delivery
  optimizeImageUrl(originalUrl: string, options: {
    width?: number;
    height?: number;
    quality?: number;
    format?: 'webp' | 'jpg' | 'png';
  } = {}): string {
    if (!CDN_CONFIG.baseUrl) return originalUrl;

    const { width, height, quality = 80, format = 'webp' } = options;
    
    // Check cache first
    const cacheKey = `${originalUrl}_${width}_${height}_${quality}_${format}`;
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey)!;
    }

    let optimizedUrl = originalUrl;
    
    // If using a CDN, construct optimized URL
    if (CDN_CONFIG.baseUrl && !originalUrl.startsWith('data:')) {
      const params = new URLSearchParams();
      
      if (width) params.set('w', width.toString());
      if (height) params.set('h', height.toString());
      if (quality) params.set('q', quality.toString());
      if (CDN_CONFIG.enableWebP && format === 'webp') params.set('f', 'webp');
      
      optimizedUrl = `${CDN_CONFIG.baseUrl}/${encodeURIComponent(originalUrl)}?${params.toString()}`;
    }

    // Cache the result
    this.cache.set(cacheKey, optimizedUrl);
    
    return optimizedUrl;
  }

  // Preload critical assets
  preloadAssets(urls: string[]): void {
    urls.forEach(url => {
      const link = document.createElement('link');
      link.rel = 'preload';
      link.as = 'image';
      link.href = url;
      document.head.appendChild(link);
    });
  }

  // Generate responsive image URLs
  generateResponsiveUrls(originalUrl: string): {
    small: string;
    medium: string;
    large: string;
  } {
    return {
      small: this.optimizeImageUrl(originalUrl, { width: 400, quality: 70 }),
      medium: this.optimizeImageUrl(originalUrl, { width: 800, quality: 80 }),
      large: this.optimizeImageUrl(originalUrl, { width: 1200, quality: 85 })
    };
  }

  // Optimize for different device types
  getOptimalImageUrl(originalUrl: string, deviceType: 'mobile' | 'tablet' | 'desktop' = 'desktop'): string {
    const dimensions = {
      mobile: { width: 400, quality: 70 },
      tablet: { width: 800, quality: 80 },
      desktop: { width: 1200, quality: 85 }
    };

    return this.optimizeImageUrl(originalUrl, dimensions[deviceType]);
  }

  // Clear cache
  clearCache(): void {
    this.cache.clear();
  }
}

// Progressive image loading with CDN optimization
export function useProgressiveImage(src: string, placeholder?: string) {
  const cdn = CDNOptimizer.getInstance();
  
  return {
    placeholder: placeholder || cdn.optimizeImageUrl(src, { width: 50, quality: 30 }),
    lowRes: cdn.optimizeImageUrl(src, { width: 400, quality: 50 }),
    highRes: cdn.optimizeImageUrl(src, { quality: 90 }),
    responsive: cdn.generateResponsiveUrls(src)
  };
}

// Asset bundling and minification helpers
export const AssetOptimizer = {
  // Compress JSON data
  compressJSON(data: any): string {
    return JSON.stringify(data, null, 0);
  },

  // Generate efficient cache keys
  generateCacheKey(url: string, params: Record<string, any>): string {
    const sortedParams = Object.keys(params)
      .sort()
      .map(key => `${key}=${params[key]}`)
      .join('&');
    return btoa(`${url}?${sortedParams}`);
  },

  // Batch asset loading
  loadAssetsInBatches<T>(
    assets: T[],
    batchSize: number = 5,
    loader: (asset: T) => Promise<any>
  ): Promise<any[]> {
    const batches: T[][] = [];
    for (let i = 0; i < assets.length; i += batchSize) {
      batches.push(assets.slice(i, i + batchSize));
    }

    return batches.reduce(async (acc, batch) => {
      const results = await acc;
      const batchResults = await Promise.all(batch.map(loader));
      return [...results, ...batchResults];
    }, Promise.resolve([] as any[]));
  }
};

// Service Worker registration for caching
export function registerServiceWorker(): void {
  if ('serviceWorker' in navigator && import.meta.env.PROD) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('/sw.js')
        .then(registration => {
          console.log('SW registered: ', registration);
        })
        .catch(registrationError => {
          console.log('SW registration failed: ', registrationError);
        });
    });
  }
}