import prisma from "@/lib/db-client"
import { logger } from "@/lib/logger"

/**
 * Performance monitoring service
 */
export class PerformanceMonitor {
  /**
   * Record API request performance metrics
   */
  static async recordMetric(params: {
    endpoint: string
    method: string
    statusCode: number
    duration: number
  }): Promise<void> {
    const { endpoint, method, statusCode, duration } = params

    try {
      // Log to database
      await prisma.performanceMetric.create({
        data: {
          endpoint,
          method,
          statusCode,
          duration,
        },
      })

      // Log slow requests (over 500ms)
      if (duration > 500) {
        logger.warn(`Slow API request: ${method} ${endpoint}`, {
          method,
          endpoint,
          statusCode,
          duration: `${duration}ms`,
        })
      }
    } catch (error) {
      // Don't let performance monitoring failures affect the application
      logger.error("Failed to record performance metric", {
        error: error instanceof Error ? error.message : String(error),
        params,
      })
    }
  }

  /**
   * Middleware to measure API request performance
   */
  static async measure<T>(
    endpoint: string,
    method: string,
    fn: () => Promise<{ statusCode: number; result: T }>,
  ): Promise<{ statusCode: number; result: T }> {
    const startTime = performance.now()

    try {
      const { statusCode, result } = await fn()

      const endTime = performance.now()
      const duration = Math.round(endTime - startTime)

      // Record metric asynchronously (don't await)
      this.recordMetric({
        endpoint,
        method,
        statusCode,
        duration,
      }).catch((error) => {
        logger.error("Error recording performance metric", { error })
      })

      return { statusCode, result }
    } catch (error) {
      const endTime = performance.now()
      const duration = Math.round(endTime - startTime)

      // Record error metric asynchronously (don't await)
      this.recordMetric({
        endpoint,
        method,
        statusCode: error.statusCode || 500,
        duration,
      }).catch((err) => {
        logger.error("Error recording performance metric", { error: err })
      })

      throw error
    }
  }
}

