// Image optimization utilities for better loading performance

export const optimizeImageUrl = (url: string, options?: {
  width?: number;
  height?: number;
  quality?: number;
  format?: 'webp' | 'avif' | 'jpeg' | 'png';
}) => {
  if (!url) return url;
  
  // For Supabase Storage URLs, we can add transformation parameters
  if (url.includes('supabase.co/storage')) {
    const urlObj = new URL(url);
    const params = new URLSearchParams();
    
    if (options?.width) params.set('width', options.width.toString());
    if (options?.height) params.set('height', options.height.toString());
    if (options?.quality) params.set('quality', options.quality.toString());
    if (options?.format) params.set('format', options.format);
    
    // Add resize parameter for Supabase
    if (options?.width || options?.height) {
      params.set('resize', 'contain');
    }
    
    if (params.toString()) {
      urlObj.search = params.toString();
      return urlObj.toString();
    }
  }
  
  return url;
};

export const generateSrcSet = (url: string, sizes: number[] = [400, 800, 1200]) => {
  return sizes
    .map(size => `${optimizeImageUrl(url, { width: size, format: 'webp' })} ${size}w`)
    .join(', ');
};

export const generateSizes = (breakpoints: string[] = ['(max-width: 768px) 100vw', '50vw']) => {
  return breakpoints.join(', ');
};

// Preload critical images
export const preloadImage = (src: string, priority: 'high' | 'low' = 'low') => {
  const link = document.createElement('link');
  link.rel = 'preload';
  link.as = 'image';
  link.href = src;
  if (priority === 'high') {
    link.fetchPriority = 'high';
  }
  document.head.appendChild(link);
};

// WebP support detection
export const supportsWebP = (): Promise<boolean> => {
  return new Promise((resolve) => {
    const webP = new Image();
    webP.onload = webP.onerror = () => {
      resolve(webP.height === 2);
    };
    webP.src = 'data:image/webp;base64,UklGRjoAAABXRUJQVlA4IC4AAACyAgCdASoCAAIALmk0mk0iIiIiIgBoSygABc6WWgAA/veff/0PP8bA//LwYAAA';
  });
};

// AVIF support detection
export const supportsAVIF = (): Promise<boolean> => {
  return new Promise((resolve) => {
    const avif = new Image();
    avif.onload = avif.onerror = () => {
      resolve(avif.height === 2);
    };
    avif.src = 'data:image/avif;base64,AAAAIGZ0eXBhdmlmAAAAAGF2aWZtaWYxbWlhZk1BMUIAAADybWV0YQAAAAAAAAAoaGRscgAAAAAAAAAAcGljdAAAAAAAAAAAAAAAAGxpYmF2aWYAAAAADnBpdG0AAAAAAAEAAAAeaWxvYwAAAABEAAABAAEAAAABAAABGgAAAB0AAAAoaWluZgAAAAAAAQAAABppbmZlAgAAAAABAABhdjAxQ29sb3IAAAAAamlwcnAAAABLaXBjbwAAABRpc3BlAAAAAAAAAAIAAAACAAAAEHBpeGkAAAAAAwgICAAAAAxhdjFDgQ0MAAAAABNjb2xybmNseAACAAIAAYAAAAAXaXBtYQAAAAAAAAABAAEEAQKDBAAAACVtZGF0EgAKCBgABogQEAwgMg8f8D///8WfhwB8+ErK42A=';
  });
};

// Get best supported format
export const getBestFormat = async (originalUrl: string): Promise<string> => {
  if (await supportsAVIF()) {
    return optimizeImageUrl(originalUrl, { format: 'avif', quality: 80 });
  } else if (await supportsWebP()) {
    return optimizeImageUrl(originalUrl, { format: 'webp', quality: 85 });
  }
  return originalUrl;
};

// Lazy loading intersection observer
export const createImageObserver = (callback: (entries: IntersectionObserverEntry[]) => void) => {
  const options = {
    root: null,
    rootMargin: '50px 0px',
    threshold: 0.01
  };

  return new IntersectionObserver(callback, options);
};

// Placeholder generation
export const generatePlaceholder = (width: number = 400, height: number = 300, color: string = '#f3f4f6') => {
  const svg = `
    <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
      <rect width="100%" height="100%" fill="${color}"/>
      <text x="50%" y="50%" text-anchor="middle" dy=".3em" fill="#9ca3af" font-family="system-ui, sans-serif" font-size="14">
        Loading...
      </text>
    </svg>
  `;
  
  return `data:image/svg+xml;base64,${btoa(svg)}`;
};

// LQIP (Low Quality Image Placeholder) generation
export const generateLQIP = (originalUrl: string) => {
  // For production, you'd generate actual low-quality versions
  // Here's a simple blur effect for existing images
  return optimizeImageUrl(originalUrl, { width: 20, quality: 20 });
};