import Redis, { RedisOptions } from 'ioredis';
import { config, isDevelopment } from '../config/env';

/**
 * Redis client singleton for caching and session management
 */
class RedisClient {
  private static instance: Redis | null = null;

  /**
   * Get or create the Redis client instance
   */
  static getInstance(): Redis {
    if (!RedisClient.instance) {
      const options: RedisOptions = {
        host: config.redis.host,
        port: config.redis.port,
        password: config.redis.password,
        retryStrategy: (times: number) => {
          const delay = Math.min(times * 50, 2000);
          return delay;
        },
        maxRetriesPerRequest: 3,
        enableReadyCheck: true,
        lazyConnect: false,
      };

      RedisClient.instance = new Redis(options);

      // Event listeners
      RedisClient.instance.on('connect', () => {
        if (isDevelopment()) {
          console.log('Redis: Connected');
        }
      });

      RedisClient.instance.on('ready', () => {
        if (isDevelopment()) {
          console.log('Redis: Ready');
        }
      });

      RedisClient.instance.on('error', (error) => {
        console.error('Redis: Error', error);
      });

      RedisClient.instance.on('close', () => {
        if (isDevelopment()) {
          console.log('Redis: Connection closed');
        }
      });

      RedisClient.instance.on('reconnecting', () => {
        if (isDevelopment()) {
          console.log('Redis: Reconnecting...');
        }
      });

      // Handle shutdown gracefully
      process.on('beforeExit', async () => {
        await RedisClient.disconnect();
      });
    }

    return RedisClient.instance;
  }

  /**
   * Disconnect from Redis
   */
  static async disconnect(): Promise<void> {
    if (RedisClient.instance) {
      await RedisClient.instance.quit();
      RedisClient.instance = null;
    }
  }

  /**
   * Connect to Redis (alias for getInstance)
   */
  static async connect(): Promise<Redis> {
    return RedisClient.getInstance();
  }

  /**
   * Test Redis connection
   */
  static async testConnection(): Promise<boolean> {
    try {
      const client = RedisClient.getInstance();
      const result = await client.ping();
      return result === 'PONG';
    } catch (error) {
      console.error('Redis connection test failed:', error);
      return false;
    }
  }

  /**
   * Get Redis info
   */
  static async getInfo(): Promise<{
    connected: boolean;
    version?: string;
    usedMemory?: string;
    connectedClients?: number;
  }> {
    try {
      const client = RedisClient.getInstance();
      const info = await client.info();

      const parseInfo = (infoString: string): Record<string, string> => {
        const lines = infoString.split('\r\n');
        const result: Record<string, string> = {};

        for (const line of lines) {
          if (line && !line.startsWith('#')) {
            const [key, value] = line.split(':');
            if (key && value) {
              result[key] = value;
            }
          }
        }

        return result;
      };

      const parsed = parseInfo(info);

      return {
        connected: true,
        version: parsed['redis_version'],
        usedMemory: parsed['used_memory_human'],
        connectedClients: parseInt(parsed['connected_clients'] || '0', 10),
      };
    } catch {
      return {
        connected: false,
      };
    }
  }

  /**
   * Cache helper methods
   */
  static async setCache(
    key: string,

    value: any,
    expirySeconds?: number,
  ): Promise<void> {
    const client = RedisClient.getInstance();
    const serialized = JSON.stringify(value);

    if (expirySeconds) {
      await client.setex(key, expirySeconds, serialized);
    } else {
      await client.set(key, serialized);
    }
  }

  static async getCache<T>(key: string): Promise<T | null> {
    const client = RedisClient.getInstance();
    const value = await client.get(key);

    if (!value) {
      return null;
    }

    try {
      return JSON.parse(value) as T;
    } catch (error) {
      console.error('Failed to parse cached value:', error);
      return null;
    }
  }

  static async deleteCache(key: string): Promise<void> {
    const client = RedisClient.getInstance();
    await client.del(key);
  }

  static async deleteCachePattern(pattern: string): Promise<number> {
    const client = RedisClient.getInstance();
    const keys = await client.keys(pattern);

    if (keys.length === 0) {
      return 0;
    }

    return await client.del(...keys);
  }

  /**
   * Session helper methods
   */
  static async setSession(
    sessionId: string,

    data: any,
    expirySeconds: number = 86400, // 24 hours default
  ): Promise<void> {
    const key = `session:${sessionId}`;
    await RedisClient.setCache(key, data, expirySeconds);
  }

  static async getSession<T>(sessionId: string): Promise<T | null> {
    const key = `session:${sessionId}`;
    return await RedisClient.getCache<T>(key);
  }

  static async deleteSession(sessionId: string): Promise<void> {
    const key = `session:${sessionId}`;
    await RedisClient.deleteCache(key);
  }

  static async refreshSessionExpiry(
    sessionId: string,
    expirySeconds: number,
  ): Promise<void> {
    const key = `session:${sessionId}`;
    const client = RedisClient.getInstance();
    await client.expire(key, expirySeconds);
  }
}

// Export singleton instance
export const redis = RedisClient.getInstance();

// Export utility functions
export const connectRedis = RedisClient.connect;
export const disconnectRedis = RedisClient.disconnect;
export const testRedisConnection = RedisClient.testConnection;
export const getRedisInfo = RedisClient.getInfo;

// Export cache helpers
export const setCache = RedisClient.setCache;
export const getCache = RedisClient.getCache;
export const deleteCache = RedisClient.deleteCache;
export const deleteCachePattern = RedisClient.deleteCachePattern;

// Export session helpers
export const setSession = RedisClient.setSession;
export const getSession = RedisClient.getSession;
export const deleteSession = RedisClient.deleteSession;
export const refreshSessionExpiry = RedisClient.refreshSessionExpiry;
