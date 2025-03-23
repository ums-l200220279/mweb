/**
 * Rate Limiter untuk Memoright
 *
 * Implementasi rate limiter untuk membatasi jumlah request
 * dari pengguna atau IP tertentu dalam periode waktu tertentu.
 */

import { logger } from "@/lib/logger"
import { Redis } from "@upstash/redis"

export class RateLimiter {
  private redis: Redis
  private namespace: string
  private maxRequests: number
  private windowSizeInSeconds: number

  constructor(namespace: string, maxRequests: number, windowSizeInSeconds: number) {
    // Inisialisasi Redis client
    this.redis = new Redis({
      url: process.env.REDIS_URL || "",
      token: process.env.REDIS_TOKEN || "",
    })

    this.namespace = namespace
    this.maxRequests = maxRequests
    this.windowSizeInSeconds = windowSizeInSeconds
  }

  /**
   * Memeriksa apakah pengguna atau IP telah melebihi batas rate
   */
  public async isRateLimited(identifier: string): Promise<boolean> {
    const key = `rate-limit:${this.namespace}:${identifier}`

    try {
      // Implementasi sliding window dengan Redis
      const now = Math.floor(Date.now() / 1000)
      const windowStart = now - this.windowSizeInSeconds

      // Hapus entri yang sudah kedaluwarsa
      await this.redis.zremrangebyscore(key, 0, windowStart)

      // Dapatkan jumlah request dalam window saat ini
      const requestCount = await this.redis.zcard(key)

      // Periksa apakah melebihi batas
      if (requestCount >= this.maxRequests) {
        logger.warn(`Rate limit exceeded for ${identifier} in namespace ${this.namespace}`)
        return true
      }

      // Tambahkan request baru
      await this.redis.zadd(key, { score: now, member: `${now}-${Math.random()}` })

      // Set expiry pada key
      await this.redis.expire(key, this.windowSizeInSeconds * 2)

      return false
    } catch (error) {
      logger.error(`Error in rate limiter for ${identifier}`, error instanceof Error ? error : new Error(String(error)))

      // Fallback: izinkan request jika terjadi error
      return false
    }
  }

  /**
   * Mendapatkan jumlah request yang tersisa
   */
  public async getRemainingRequests(identifier: string): Promise<number> {
    const key = `rate-limit:${this.namespace}:${identifier}`

    try {
      // Hapus entri yang sudah kedaluwarsa
      const now = Math.floor(Date.now() / 1000)
      const windowStart = now - this.windowSizeInSeconds
      await this.redis.zremrangebyscore(key, 0, windowStart)

      // Dapatkan jumlah request dalam window saat ini
      const requestCount = await this.redis.zcard(key)

      return Math.max(0, this.maxRequests - requestCount)
    } catch (error) {
      logger.error(
        `Error getting remaining requests for ${identifier}`,
        error instanceof Error ? error : new Error(String(error)),
      )

      // Fallback: kembalikan nilai default
      return this.maxRequests
    }
  }

  /**
   * Reset rate limit untuk pengguna atau IP tertentu
   */
  public async resetRateLimit(identifier: string): Promise<void> {
    const key = `rate-limit:${this.namespace}:${identifier}`

    try {
      await this.redis.del(key)
      logger.info(`Reset rate limit for ${identifier} in namespace ${this.namespace}`)
    } catch (error) {
      logger.error(
        `Error resetting rate limit for ${identifier}`,
        error instanceof Error ? error : new Error(String(error)),
      )
    }
  }
}

