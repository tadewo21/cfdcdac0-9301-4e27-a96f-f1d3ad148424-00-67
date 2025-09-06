import { useState, useEffect, useCallback } from 'react';

interface UseImageOptimizationOptions {
  src: string;
  fallback?: string;
  quality?: number;
  lazy?: boolean;
}

export function useImageOptimization({
  src,
  fallback = '/placeholder.svg',
  quality = 80,
  lazy = true
}: UseImageOptimizationOptions) {
  const [imageSrc, setImageSrc] = useState<string>(lazy ? fallback : src);
  const [isLoading, setIsLoading] = useState(lazy);
  const [hasError, setHasError] = useState(false);

  const loadImage = useCallback(() => {
    if (!lazy || imageSrc === src) return;

    setIsLoading(true);
    const img = new Image();
    
    img.onload = () => {
      setImageSrc(src);
      setIsLoading(false);
      setHasError(false);
    };
    
    img.onerror = () => {
      setImageSrc(fallback);
      setIsLoading(false);
      setHasError(true);
    };
    
    img.src = src;
  }, [src, fallback, lazy, imageSrc]);

  useEffect(() => {
    if (!lazy) {
      loadImage();
    }
  }, [loadImage, lazy]);

  const triggerLoad = useCallback(() => {
    if (lazy && imageSrc === fallback) {
      loadImage();
    }
  }, [lazy, imageSrc, fallback, loadImage]);

  return {
    src: imageSrc,
    isLoading,
    hasError,
    triggerLoad
  };
}

// Optimized Image Component with lazy loading
interface OptimizedImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  fallback?: string;
  quality?: number;
  lazy?: boolean;
}

export function OptimizedImage({
  src,
  fallback,
  quality = 80,
  lazy = true,
  className = '',
  ...props
}: OptimizedImageProps) {
  const { src: optimizedSrc, isLoading, triggerLoad } = useImageOptimization({
    src,
    fallback,
    quality,
    lazy
  });

  useEffect(() => {
    if (!lazy) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            triggerLoad();
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1 }
    );

    const imgElement = document.querySelector(`[data-src="${src}"]`);
    if (imgElement) {
      observer.observe(imgElement);
    }

    return () => observer.disconnect();
  }, [src, lazy, triggerLoad]);

  return (
    <img
      {...props}
      src={optimizedSrc}
      data-src={src}
      className={`${className} ${isLoading ? 'animate-pulse bg-muted' : ''}`}
      loading={lazy ? 'lazy' : 'eager'}
      decoding="async"
    />
  );
}