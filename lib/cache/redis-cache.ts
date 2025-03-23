import { Redis } from "ioredis"
import type { CacheOptions } from "@/types/cache"

// Initialize Redis client
const redis = new Redis(process.env.REDIS_URL || "redis://localhost:6379")

export class RedisCache {
  /**
   * Set a value in the cache
   */
  static async set(key: string, value: any, options: CacheOptions = {}): Promise<void> {
    const serializedValue = JSON.stringify(value)

    if (options.ttl) {
      await redis.set(key, serializedValue, "EX", options.ttl)
    } else {
      await redis.set(key, serializedValue)
    }
  }

  /**
   * Get a value from the cache
   */
  static async get<T>(key: string): Promise<T | null> {
    const value = await redis.get(key)

    if (!value) {
      return null
    }

    try {
      return JSON.parse(value) as T
    } catch (error) {
      console.error(`Error parsing cached value for key ${key}:`, error)
      return null
    }
  }

  /**
   * Delete a value from the cache
   */
  static async delete(key: string): Promise<void> {
    await redis.del(key)
  }

  /**
   * Clear all values with a specific prefix
   */
  static async clearWithPrefix(prefix: string): Promise<void> {
    const keys = await redis.keys(`${prefix}:*`)

    if (keys.length > 0) {
      await redis.del(...keys)
    }
  }

  /**
   * Cache the result of a function
   */
  static async cached<T>(key: string, fn: () => Promise<T>, options: CacheOptions = {}): Promise<T> {
    // Try to get from cache first
    const cachedValue = await RedisCache.get<T>(key)

    if (cachedValue !== null) {
      return cachedValue
    }

    // If not in cache, execute the function
    const result = await fn()

    // Store in cache
    await RedisCache.set(key, result, options)

    return result
  }

  /**
   * Increment a counter
   */
  static async increment(key: string): Promise<number> {
    return redis.incr(key)
  }

  /**
   * Check if rate limit is exceeded
   */
  static async checkRateLimit(
    key: string,
    limit: number,
    windowSeconds: number,
  ): Promise<{ limited: boolean; current: number; reset: number }> {
    const current = await redis.incr(key)

    // Set expiry on first request
    if (current === 1) {
      await redis.expire(key, windowSeconds)
    }

    const ttl = await redis.ttl(key)

    return {
      limited: current > limit,
      current,
      reset: Math.max(ttl, 0),
    }
  }
}

