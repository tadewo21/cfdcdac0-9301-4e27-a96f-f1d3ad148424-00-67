import { useState, useEffect, useCallback, useRef } from 'react';
import { useConnectionPool } from './useConnectionPool';

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number;
  accessCount: number;
  lastAccess: number;
}

interface AdvancedCacheOptions {
  ttl?: number;
  maxSize?: number;
  enableLRU?: boolean;
  enableCompression?: boolean;
  preload?: boolean;
}

class AdvancedMemoryCache {
  private cache = new Map<string, CacheEntry<any>>();
  private maxSize: number;
  private enableLRU: boolean;

  constructor(maxSize = 1000, enableLRU = true) {
    this.maxSize = maxSize;
    this.enableLRU = enableLRU;
  }

  set<T>(key: string, data: T, ttl: number): void {
    // LRU eviction if cache is full
    if (this.cache.size >= this.maxSize) {
      if (this.enableLRU) {
        this.evictLRU();
      } else {
        const firstKey = this.cache.keys().next().value;
        this.cache.delete(firstKey);
      }
    }

    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl,
      accessCount: 0,
      lastAccess: Date.now()
    });
  }

  get<T>(key: string): T | null {
    const entry = this.cache.get(key);
    
    if (!entry) return null;
    
    // Check if expired
    if (Date.now() - entry.timestamp > entry.ttl) {
      this.cache.delete(key);
      return null;
    }
    
    // Update access statistics
    entry.accessCount++;
    entry.lastAccess = Date.now();
    
    return entry.data;
  }

  private evictLRU(): void {
    let lruKey = '';
    let oldestAccess = Date.now();
    
    for (const [key, entry] of this.cache.entries()) {
      if (entry.lastAccess < oldestAccess) {
        oldestAccess = entry.lastAccess;
        lruKey = key;
      }
    }
    
    if (lruKey) {
      this.cache.delete(lruKey);
    }
  }

  getStats() {
    const now = Date.now();
    let totalAccess = 0;
    let expiredCount = 0;

    for (const entry of this.cache.values()) {
      totalAccess += entry.accessCount;
      if (now - entry.timestamp > entry.ttl) {
        expiredCount++;
      }
    }

    return {
      size: this.cache.size,
      maxSize: this.maxSize,
      totalAccess,
      expiredCount,
      hitRate: totalAccess > 0 ? (this.cache.size - expiredCount) / this.cache.size : 0
    };
  }

  clear(): void {
    this.cache.clear();
  }
}

// Global advanced cache instance
const advancedCache = new AdvancedMemoryCache(1000);

export function useAdvancedCache<T>(
  key: string,
  fetcher: () => Promise<T>,
  options: AdvancedCacheOptions = {}
) {
  const { 
    ttl = 5 * 60 * 1000, 
    enableLRU = true, 
    preload = false 
  } = options;
  
  const [data, setData] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const { getActiveConnections } = useConnectionPool();
  const retryTimeoutRef = useRef<NodeJS.Timeout>();

  const fetchData = useCallback(async (forceRefresh = false) => {
    // Check cache first
    if (!forceRefresh) {
      const cachedData = advancedCache.get<T>(key);
      if (cachedData) {
        setData(cachedData);
        setError(null);
        return cachedData;
      }
    }

    setIsLoading(true);
    setError(null);

    try {
      const result = await fetcher();
      advancedCache.set(key, result, ttl);
      setData(result);
      return result;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Unknown error');
      setError(error);
      
      // Exponential backoff retry
      const retryDelay = Math.min(1000 * Math.pow(2, getActiveConnections()), 30000);
      retryTimeoutRef.current = setTimeout(() => {
        fetchData(forceRefresh);
      }, retryDelay);
      
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [key, fetcher, ttl, getActiveConnections]);

  useEffect(() => {
    if (preload) {
      fetchData();
    }
    
    return () => {
      if (retryTimeoutRef.current) {
        clearTimeout(retryTimeoutRef.current);
      }
    };
  }, [fetchData, preload]);

  const invalidate = useCallback(() => {
    advancedCache.clear();
  }, []);

  const refresh = useCallback(() => {
    return fetchData(true);
  }, [fetchData]);

  const getCacheStats = useCallback(() => {
    return advancedCache.getStats();
  }, []);

  return {
    data,
    isLoading,
    error,
    refresh,
    invalidate,
    getCacheStats
  };
}