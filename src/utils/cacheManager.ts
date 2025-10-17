/**
 * Enhanced cache management utility
 * Provides time-based caching with TTL support
 */
import AsyncStorage from '@react-native-async-storage/async-storage';
import { logger } from './logger';

// Default TTL in milliseconds (30 minutes)
const DEFAULT_TTL = 30 * 60 * 1000;

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number;
}

interface CacheOptions {
  ttl?: number; // Time to live in milliseconds
  prefix?: string; // Key prefix for storage
}

class CacheManager {
  private keyPrefix: string;

  constructor(keyPrefix: string = 'fadeup_cache:') {
    this.keyPrefix = keyPrefix;
  }

  /**
   * Set a value in the cache with TTL
   */
  async set<T>(key: string, data: T, options?: CacheOptions): Promise<void> {
    try {
      const fullKey = this.getFullKey(key, options?.prefix);
      const entry: CacheEntry<T> = {
        data,
        timestamp: Date.now(),
        ttl: options?.ttl ?? DEFAULT_TTL,
      };

      await AsyncStorage.setItem(fullKey, JSON.stringify(entry));
      logger.debug(`Cache set: ${fullKey}`);
    } catch (error) {
      logger.error('Failed to set cache value', { key, error });
    }
  }

  /**
   * Get a value from the cache, checking TTL
   * Returns null if expired or not found
   */
  async get<T>(key: string, options?: CacheOptions): Promise<T | null> {
    try {
      const fullKey = this.getFullKey(key, options?.prefix);
      const rawData = await AsyncStorage.getItem(fullKey);

      if (!rawData) {
        logger.debug(`Cache miss: ${fullKey}`);
        return null;
      }

      const entry = JSON.parse(rawData) as CacheEntry<T>;
      const now = Date.now();
      const expiryTime = entry.timestamp + entry.ttl;

      // Check if the entry is expired
      if (now > expiryTime) {
        logger.debug(`Cache expired: ${fullKey}`);
        // Clean up expired entry
        await this.remove(key, options);
        return null;
      }

      logger.debug(`Cache hit: ${fullKey}`);
      return entry.data;
    } catch (error) {
      logger.error('Failed to get cache value', { key, error });
      return null;
    }
  }

  /**
   * Get a value if in cache, or call a function to fetch it
   * If fetched, store in cache with provided TTL
   */
  async getOrFetch<T>(
    key: string, 
    fetchFn: () => Promise<T>, 
    options?: CacheOptions
  ): Promise<T> {
    const cachedData = await this.get<T>(key, options);

    if (cachedData !== null) {
      return cachedData;
    }

    try {
      // Fetch fresh data
      const freshData = await fetchFn();
      
      // Store in cache
      await this.set<T>(key, freshData, options);
      
      return freshData;
    } catch (error) {
      logger.error('Error fetching data for cache', { key, error });
      throw error;
    }
  }

  /**
   * Remove a specific key from cache
   */
  async remove(key: string, options?: CacheOptions): Promise<void> {
    try {
      const fullKey = this.getFullKey(key, options?.prefix);
      await AsyncStorage.removeItem(fullKey);
      logger.debug(`Cache removed: ${fullKey}`);
    } catch (error) {
      logger.error('Failed to remove cache value', { key, error });
    }
  }

  /**
   * Check if a key exists in cache and is not expired
   */
  async has(key: string, options?: CacheOptions): Promise<boolean> {
    const value = await this.get(key, options);
    return value !== null;
  }

  /**
   * Remove all keys with the specified prefix
   */
  async clearByPrefix(prefix: string): Promise<void> {
    try {
      const allKeys = await AsyncStorage.getAllKeys();
      const targetPrefix = this.keyPrefix + (prefix || '');
      
      const keysToRemove = allKeys.filter(key => 
        key.startsWith(targetPrefix)
      );

      if (keysToRemove.length > 0) {
        await AsyncStorage.multiRemove(keysToRemove);
        logger.debug(`Cleared ${keysToRemove.length} cached items with prefix: ${targetPrefix}`);
      }
    } catch (error) {
      logger.error('Failed to clear cache by prefix', { prefix, error });
    }
  }

  /**
   * Clear all cached data
   */
  async clear(): Promise<void> {
    try {
      const allKeys = await AsyncStorage.getAllKeys();
      const cacheKeys = allKeys.filter(key => 
        key.startsWith(this.keyPrefix)
      );

      if (cacheKeys.length > 0) {
        await AsyncStorage.multiRemove(cacheKeys);
        logger.debug(`Cleared all ${cacheKeys.length} cached items`);
      }
    } catch (error) {
      logger.error('Failed to clear cache', { error });
    }
  }

  /**
   * Remove all expired entries
   */
  async purgeExpired(): Promise<void> {
    try {
      const allKeys = await AsyncStorage.getAllKeys();
      const cacheKeys = allKeys.filter(key => 
        key.startsWith(this.keyPrefix)
      );
      
      let purgedCount = 0;

      for (const key of cacheKeys) {
        try {
          const rawData = await AsyncStorage.getItem(key);
          
          if (!rawData) continue;

          const entry = JSON.parse(rawData) as CacheEntry<any>;
          const now = Date.now();
          
          if (now > (entry.timestamp + entry.ttl)) {
            await AsyncStorage.removeItem(key);
            purgedCount++;
          }
        } catch (error) {
          logger.warn(`Failed to process cache entry: ${key}`, error);
        }
      }

      if (purgedCount > 0) {
        logger.debug(`Purged ${purgedCount} expired cache entries`);
      }
    } catch (error) {
      logger.error('Failed to purge expired cache entries', { error });
    }
  }

  /**
   * Get the full storage key including prefix
   */
  private getFullKey(key: string, customPrefix?: string): string {
    return `${customPrefix || this.keyPrefix}${key}`;
  }
}

// Create a default instance with app-wide prefix
const cache = new CacheManager();

export { cache, CacheManager };
export type { CacheOptions };
