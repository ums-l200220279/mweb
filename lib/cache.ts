import { Redis } from "@upstash/redis"

// Initialize Redis client
const redis = new Redis({
  url: process.env.REDIS_URL || "",
  token: process.env.REDIS_TOKEN || "",
})

/**
 * Cache service for efficient data retrieval
 */
export class CacheService {
  private readonly redis: Redis
  private readonly prefix: string
  private readonly defaultTtl: number

  constructor(prefix = "cache:", defaultTtl = 3600) {
    this.redis = redis
    this.prefix = prefix
    this.defaultTtl = defaultTtl // Default TTL in seconds (1 hour)
  }

  /**
   * Generate a cache key with prefix
   */
  private getKey(key: string): string {
    return `${this.prefix}${key}`
  }

  /**
   * Get a value from cache
   */
  async get<T>(key: string): Promise<T | null> {
    try {
      const data = await this.redis.get(this.getKey(key))
      return data as T
    } catch (error) {
      console.error("Cache get error:", error)
      return null
    }
  }

  /**
   * Set a value in cache with optional TTL
   */
  async set<T>(key: string, value: T, ttl = this.defaultTtl): Promise<void> {
    try {
      await this.redis.set(this.getKey(key), value, { ex: ttl })
    } catch (error) {
      console.error("Cache set error:", error)
    }
  }

  /**
   * Delete a value from cache
   */
  async delete(key: string): Promise<void> {
    try {
      await this.redis.del(this.getKey(key))
    } catch (error) {
      console.error("Cache delete error:", error)
    }
  }

  /**
   * Clear all cache entries with this prefix
   */
  async clear(): Promise<void> {
    try {
      const keys = await this.redis.keys(`${this.prefix}*`)
      if (keys.length > 0) {
        await this.redis.del(...keys)
      }
    } catch (error) {
      console.error("Cache clear error:", error)
    }
  }

  /**
   * Get or set cache (wrapper function)
   */
  async getOrSet<T>(key: string, fetchFn: () => Promise<T>, ttl = this.defaultTtl): Promise<T> {
    const cachedData = await this.get<T>(key)
    if (cachedData !== null) {
      return cachedData
    }

    const freshData = await fetchFn()
    await this.set(key, freshData, ttl)
    return freshData
  }
}

// Export default instance
export const cache = new CacheService()

