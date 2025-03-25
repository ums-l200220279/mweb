import { Redis } from "@upstash/redis"
import { logger } from "@/lib/logger"

// Konfigurasi Redis
const redis = new Redis({
  url: process.env.REDIS_URL!,
  token: process.env.REDIS_TOKEN!,
})

// Tipe kebijakan cache
export interface CachePolicy {
  ttl: number
  staleWhileRevalidate?: boolean
  bypassForRoles?: string[]
  namespace?: string
}

// Kebijakan cache default
export const CACHE_POLICIES = {
  SHORT: { ttl: 60 }, // 1 menit
  MEDIUM: { ttl: 300 }, // 5 menit
  LONG: { ttl: 1800 }, // 30 menit
  VERY_LONG: { ttl: 86400 }, // 1 hari
  NEVER_EXPIRE: { ttl: -1 }, // Tidak pernah kedaluwarsa
}

/**
 * Kelas utama untuk manajemen cache
 */
export class Cache {
  private namespace: string

  constructor(namespace = "memoright") {
    this.namespace = namespace
  }

  /**
   * Membuat kunci cache dengan namespace
   */
  private createKey(key: string): string {
    return `${this.namespace}:${key}`
  }

  /**
   * Mendapatkan data dari cache atau mengeksekusi fungsi jika tidak ada
   */
  async getOrSet<T>(key: string, fetchFn: () => Promise<T>, policy: CachePolicy = CACHE_POLICIES.MEDIUM): Promise<T> {
    const cacheKey = this.createKey(key)

    try {
      // Cek apakah data ada di cache
      const cachedData = await redis.get(cacheKey)

      if (cachedData !== null) {
        logger.debug(`Cache hit for key: ${cacheKey}`)

        // Jika staleWhileRevalidate, refresh cache di background
        if (policy.staleWhileRevalidate) {
          this.refreshCache(cacheKey, fetchFn, policy).catch((err) => {
            logger.error(`Failed to refresh cache for ${cacheKey}:`, err)
          })
        }

        return cachedData as T
      }

      logger.debug(`Cache miss for key: ${cacheKey}`)

      // Eksekusi fungsi untuk mendapatkan data baru
      const data = await fetchFn()

      // Simpan ke cache jika TTL > 0
      if (policy.ttl > 0) {
        await redis.set(cacheKey, data, { ex: policy.ttl })
      } else if (policy.ttl === -1) {
        await redis.set(cacheKey, data)
      }

      return data
    } catch (error) {
      logger.error(`Cache error for key ${cacheKey}:`, error)

      // Fallback ke fungsi asli jika terjadi error
      return fetchFn()
    }
  }

  /**
   * Refresh cache di background
   */
  private async refreshCache<T>(key: string, fetchFn: () => Promise<T>, policy: CachePolicy): Promise<void> {
    try {
      const data = await fetchFn()

      if (policy.ttl > 0) {
        await redis.set(key, data, { ex: policy.ttl })
      } else if (policy.ttl === -1) {
        await redis.set(key, data)
      }

      logger.debug(`Successfully refreshed cache for key: ${key}`)
    } catch (error) {
      logger.error(`Failed to refresh cache for ${key}:`, error)
    }
  }

  /**
   * Invalidasi cache berdasarkan pola
   */
  async invalidate(pattern: string): Promise<number> {
    const fullPattern = this.createKey(pattern)
    const keys = await redis.keys(fullPattern)

    if (keys.length === 0) {
      return 0
    }

    await redis.del(...keys)
    logger.debug(`Invalidated ${keys.length} cache keys matching pattern: ${fullPattern}`)

    return keys.length
  }

  /**
   * Invalidasi semua cache dalam namespace
   */
  async invalidateAll(): Promise<number> {
    return this.invalidate("*")
  }

  /**
   * Menyimpan data ke cache
   */
  async set(key: string, data: any, policy: CachePolicy = CACHE_POLICIES.MEDIUM): Promise<void> {
    const cacheKey = this.createKey(key)

    try {
      if (policy.ttl > 0) {
        await redis.set(cacheKey, data, { ex: policy.ttl })
      } else if (policy.ttl === -1) {
        await redis.set(cacheKey, data)
      }

      logger.debug(`Set cache for key: ${cacheKey}`)
    } catch (error) {
      logger.error(`Failed to set cache for ${cacheKey}:`, error)
    }
  }

  /**
   * Mendapatkan data dari cache
   */
  async get<T>(key: string): Promise<T | null> {
    const cacheKey = this.createKey(key)

    try {
      const data = await redis.get(cacheKey)
      return data as T | null
    } catch (error) {
      logger.error(`Failed to get cache for ${cacheKey}:`, error)
      return null
    }
  }

  /**
   * Menghapus data dari cache
   */
  async delete(key: string): Promise<void> {
    const cacheKey = this.createKey(key)

    try {
      await redis.del(cacheKey)
      logger.debug(`Deleted cache for key: ${cacheKey}`)
    } catch (error) {
      logger.error(`Failed to delete cache for ${cacheKey}:`, error)
    }
  }
}

// Instansiasi cache untuk berbagai domain
export const caches = {
  assessment: new Cache("assessment"),
  patient: new Cache("patient"),
  game: new Cache("game"),
  analytics: new Cache("analytics"),
  user: new Cache("user"),
}

