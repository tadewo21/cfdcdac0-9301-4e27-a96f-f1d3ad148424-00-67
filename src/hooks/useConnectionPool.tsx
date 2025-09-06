import { useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface ConnectionPoolConfig {
  maxConnections: number;
  idleTimeout: number;
  retryAttempts: number;
}

class ConnectionPool {
  private static instance: ConnectionPool;
  private connections: Set<string> = new Set();
  private config: ConnectionPoolConfig;

  private constructor(config: ConnectionPoolConfig) {
    this.config = config;
  }

  static getInstance(config?: ConnectionPoolConfig): ConnectionPool {
    if (!ConnectionPool.instance) {
      ConnectionPool.instance = new ConnectionPool(config || {
        maxConnections: 100,
        idleTimeout: 300000, // 5 minutes
        retryAttempts: 3
      });
    }
    return ConnectionPool.instance;
  }

  async acquireConnection(connectionId: string): Promise<boolean> {
    if (this.connections.size >= this.config.maxConnections) {
      console.warn('Connection pool limit reached');
      return false;
    }

    this.connections.add(connectionId);
    
    // Set idle timeout
    setTimeout(() => {
      this.releaseConnection(connectionId);
    }, this.config.idleTimeout);

    return true;
  }

  releaseConnection(connectionId: string): void {
    this.connections.delete(connectionId);
  }

  getActiveConnections(): number {
    return this.connections.size;
  }

  getAvailableConnections(): number {
    return this.config.maxConnections - this.connections.size;
  }
}

export function useConnectionPool() {
  const poolRef = useRef<ConnectionPool>();
  const connectionIdRef = useRef<string>();

  useEffect(() => {
    poolRef.current = ConnectionPool.getInstance();
    connectionIdRef.current = `conn_${Date.now()}_${Math.random()}`;

    const acquireConnection = async () => {
      if (poolRef.current && connectionIdRef.current) {
        await poolRef.current.acquireConnection(connectionIdRef.current);
      }
    };

    acquireConnection();

    return () => {
      if (poolRef.current && connectionIdRef.current) {
        poolRef.current.releaseConnection(connectionIdRef.current);
      }
    };
  }, []);

  return {
    getActiveConnections: () => poolRef.current?.getActiveConnections() || 0,
    getAvailableConnections: () => poolRef.current?.getAvailableConnections() || 0,
  };
}