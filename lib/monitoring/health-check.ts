import { logger, systemLogger } from "./logger"
import { createClient } from "@/lib/supabase/client"
import { cache } from "@/lib/cache/redis"

/**
 * Health check utilities for Memoright
 */

// Interface for health check result
interface HealthCheckResult {
  status: "healthy" | "degraded" | "unhealthy"
  checks: {
    [key: string]: {
      status: "healthy" | "degraded" | "unhealthy"
      message?: string
      latency?: number
      error?: string
    }
  }
  timestamp: string
}

/**
 * Perform a health check of all system components
 * @returns Health check result
 */
export async function performHealthCheck(): Promise<HealthCheckResult> {
  const startTime = Date.now()

  // Initialize result
  const result: HealthCheckResult = {
    status: "healthy",
    checks: {},
    timestamp: new Date().toISOString(),
  }

  // Check database
  try {
    const dbStartTime = Date.now()
    const supabase = createClient()
    const { data, error } = await supabase.from("health_check").select("*").limit(1)

    if (error) {
      result.checks.database = {
        status: "unhealthy",
        message: "Database query failed",
        error: error.message,
        latency: Date.now() - dbStartTime,
      }
      result.status = "unhealthy"
    } else {
      result.checks.database = {
        status: "healthy",
        message: "Database is responding",
        latency: Date.now() - dbStartTime,
      }
    }
  } catch (error) {
    result.checks.database = {
      status: "unhealthy",
      message: "Database connection failed",
      error: error.message,
      latency: Date.now() - startTime,
    }
    result.status = "unhealthy"
  }

  // Check Redis cache
  try {
    const cacheStartTime = Date.now()
    const cacheKey = `health_check_${Date.now()}`
    const cacheValue = "ok"

    await cache.set(cacheKey, cacheValue, 10) // 10 seconds TTL
    const retrievedValue = await cache.get(cacheKey)

    if (retrievedValue === cacheValue) {
      result.checks.cache = {
        status: "healthy",
        message: "Cache is responding",
        latency: Date.now() - cacheStartTime,
      }
    } else {
      result.checks.cache = {
        status: "degraded",
        message: "Cache returned unexpected value",
        latency: Date.now() - cacheStartTime,
      }

      if (result.status === "healthy") {
        result.status = "degraded"
      }
    }
  } catch (error) {
    result.checks.cache = {
      status: "unhealthy",
      message: "Cache operation failed",
      error: error.message,
      latency: Date.now() - startTime,
    }

    if (result.status === "healthy") {
      result.status = "degraded"
    }
  }

  // Check external APIs if needed
  if (process.env.EXTERNAL_API_URL) {
    try {
      const apiStartTime = Date.now()
      const response = await fetch(process.env.EXTERNAL_API_URL, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        // Short timeout to avoid blocking the health check
        signal: AbortSignal.timeout(5000),
      })

      if (response.ok) {
        result.checks.externalApi = {
          status: "healthy",
          message: "External API is responding",
          latency: Date.now() - apiStartTime,
        }
      } else {
        result.checks.externalApi = {
          status: "degraded",
          message: `External API returned status ${response.status}`,
          latency: Date.now() - apiStartTime,
        }

        if (result.status === "healthy") {
          result.status = "degraded"
        }
      }
    } catch (error) {
      result.checks.externalApi = {
        status: "unhealthy",
        message: "External API request failed",
        error: error.message,
        latency: Date.now() - startTime,
      }

      if (result.status === "healthy") {
        result.status = "degraded"
      }
    }
  }

  // Check disk space (only in Node.js environment, not in browser)
  if (typeof window === "undefined" && process.env.CHECK_DISK_SPACE === "true") {
    try {
      const diskStartTime = Date.now()

      // This would typically use a library like 'diskusage' or 'check-disk-space'
      // For simplicity, we're just checking if we can write a file
      const fs = require("fs")
      const os = require("os")
      const path = require("path")

      const testFile = path.join(os.tmpdir(), `health_check_${Date.now()}.txt`)
      fs.writeFileSync(testFile, "test")
      fs.unlinkSync(testFile)

      result.checks.diskSpace = {
        status: "healthy",
        message: "Disk is writable",
        latency: Date.now() - diskStartTime,
      }
    } catch (error) {
      result.checks.diskSpace = {
        status: "unhealthy",
        message: "Disk space check failed",
        error: error.message,
        latency: Date.now() - startTime,
      }

      if (result.status === "healthy") {
        result.status = "degraded"
      }
    }
  }

  // Check memory usage
  try {
    const memoryStartTime = Date.now()

    if (typeof window === "undefined") {
      // Node.js environment
      const memoryUsage = process.memoryUsage()
      const memoryUsagePercent = (memoryUsage.heapUsed / memoryUsage.heapTotal) * 100

      if (memoryUsagePercent > 90) {
        result.checks.memory = {
          status: "degraded",
          message: `Memory usage is high: ${memoryUsagePercent.toFixed(2)}%`,
          latency: Date.now() - memoryStartTime,
        }

        if (result.status === "healthy") {
          result.status = "degraded"
        }
      } else {
        result.checks.memory = {
          status: "healthy",
          message: `Memory usage: ${memoryUsagePercent.toFixed(2)}%`,
          latency: Date.now() - memoryStartTime,
        }
      }
    } else {
      // Browser environment
      if (window.performance && window.performance.memory) {
        const memoryInfo = (window.performance as any).memory
        const memoryUsagePercent = (memoryInfo.usedJSHeapSize / memoryInfo.jsHeapSizeLimit) * 100

        if (memoryUsagePercent > 90) {
          result.checks.memory = {
            status: "degraded",
            message: `Memory usage is high: ${memoryUsagePercent.toFixed(2)}%`,
            latency: Date.now() - memoryStartTime,
          }

          if (result.status === "healthy") {
            result.status = "degraded"
          }
        } else {
          result.checks.memory = {
            status: "healthy",
            message: `Memory usage: ${memoryUsagePercent.toFixed(2)}%`,
            latency: Date.now() - memoryStartTime,
          }
        }
      }
    }
  } catch (error) {
    result.checks.memory = {
      status: "degraded",
      message: "Memory check failed",
      error: error.message,
      latency: Date.now() - startTime,
    }

    if (result.status === "healthy") {
      result.status = "degraded"
    }
  }

  // Log health check result
  systemLogger.info("Health check completed", {
    healthCheck: {
      status: result.status,
      duration: Date.now() - startTime,
      checks: result.checks,
    },
  })

  return result
}

/**
 * Schedule regular health checks
 * @param interval Interval in milliseconds
 */
export function scheduleHealthChecks(interval = 60000) {
  if (typeof window !== "undefined") {
    // Don't run scheduled health checks in the browser
    return
  }

  // Perform initial health check
  performHealthCheck().catch((error) => {
    logger.error("Failed to perform initial health check", { error })
  })

  // Schedule regular health checks
  setInterval(async () => {
    try {
      await performHealthCheck()
    } catch (error) {
      logger.error("Failed to perform scheduled health check", { error })
    }
  }, interval)

  logger.info(`Scheduled health checks every ${interval}ms`)
}

