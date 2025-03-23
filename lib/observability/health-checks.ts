/**
 * Health Check System
 *
 * This module implements a health check system for monitoring application health.
 * It provides endpoints for liveness and readiness probes, as well as detailed health status.
 */

import { logger } from "@/lib/monitoring/logger"
import { metrics } from "./metrics"

export type HealthStatus = "healthy" | "degraded" | "unhealthy"

export interface HealthCheckResult {
  status: HealthStatus
  details?: Record<string, any>
  message?: string
  timestamp: number
}

export interface HealthCheck {
  name: string
  check: () => Promise<HealthCheckResult>
  timeout?: number
  critical?: boolean
}

class HealthCheckRegistry {
  private static instance: HealthCheckRegistry
  private checks: Map<string, HealthCheck> = new Map()
  private lastResults: Map<string, HealthCheckResult> = new Map()
  private isRunning = false
  private checkInterval = 60000 // 1 minute
  private intervalId?: NodeJS.Timeout

  private constructor() {}

  public static getInstance(): HealthCheckRegistry {
    if (!HealthCheckRegistry.instance) {
      HealthCheckRegistry.instance = new HealthCheckRegistry()
    }

    return HealthCheckRegistry.instance
  }

  public registerCheck(check: HealthCheck): void {
    if (this.checks.has(check.name)) {
      throw new Error(`Health check with name '${check.name}' already exists`)
    }

    this.checks.set(check.name, check)
    logger.info(`Registered health check: ${check.name}`)
  }

  public unregisterCheck(name: string): void {
    if (!this.checks.has(name)) {
      logger.warn(`Health check with name '${name}' does not exist`)
      return
    }

    this.checks.delete(name)
    this.lastResults.delete(name)
    logger.info(`Unregistered health check: ${name}`)
  }

  public async runChecks(): Promise<Record<string, HealthCheckResult>> {
    if (this.isRunning) {
      logger.debug("Health checks already running, skipping")
      return Object.fromEntries(this.lastResults)
    }

    this.isRunning = true
    logger.debug("Running health checks")

    const results: Record<string, HealthCheckResult> = {}
    const startTime = performance.now()

    try {
      const checkPromises = Array.from(this.checks.entries()).map(async ([name, check]) => {
        const checkStartTime = performance.now()

        try {
          // Run check with timeout
          const timeoutMs = check.timeout || 5000
          const result = await Promise.race([
            check.check(),
            new Promise<HealthCheckResult>((_, reject) =>
              setTimeout(() => reject(new Error(`Health check '${name}' timed out after ${timeoutMs}ms`)), timeoutMs),
            ),
          ])

          const duration = performance.now() - checkStartTime

          // Record metrics
          metrics
            .createHistogram({
              name: "health_check_duration_seconds",
              help: "Duration of health checks in seconds",
              labelNames: ["check_name", "status"],
            })
            .observe(duration / 1000, { check_name: name, status: result.status })

          // Store result
          results[name] = result
          this.lastResults.set(name, result)

          logger.debug(`Health check '${name}' completed in ${duration.toFixed(2)}ms: ${result.status}`)

          return { name, result }
        } catch (error) {
          const errorResult: HealthCheckResult = {
            status: "unhealthy",
            message: (error as Error).message,
            details: { error: (error as Error).stack },
            timestamp: Date.now(),
          }

          results[name] = errorResult
          this.lastResults.set(name, errorResult)

          logger.error(`Health check '${name}' failed:`, error)

          return { name, result: errorResult }
        }
      })

      await Promise.all(checkPromises)
    } finally {
      const totalDuration = performance.now() - startTime

      logger.debug(`All health checks completed in ${totalDuration.toFixed(2)}ms`)
      this.isRunning = false

      // Record overall metrics
      metrics
        .createHistogram({
          name: "health_checks_total_duration_seconds",
          help: "Total duration of all health checks in seconds",
          labelNames: [],
        })
        .observe(totalDuration / 1000)
    }

    return results
  }

  public getOverallStatus(): HealthStatus {
    if (this.lastResults.size === 0) {
      return "healthy" // Assume healthy if no checks have run yet
    }

    let hasUnhealthy = false
    let hasDegraded = false

    for (const [name, result] of this.lastResults.entries()) {
      const check = this.checks.get(name)

      if (result.status === "unhealthy" && check?.critical) {
        return "unhealthy" // Critical check is unhealthy
      } else if (result.status === "unhealthy") {
        hasUnhealthy = true
      } else if (result.status === "degraded") {
        hasDegraded = true
      }
    }

    if (hasUnhealthy) {
      return "degraded" // Non-critical checks are unhealthy
    } else if (hasDegraded) {
      return "degraded"
    } else {
      return "healthy"
    }
  }

  public getLastResults(): Record<string, HealthCheckResult> {
    return Object.fromEntries(this.lastResults)
  }

  public startPeriodicChecks(interval = 60000): void {
    if (this.intervalId) {
      clearInterval(this.intervalId)
    }

    this.checkInterval = interval
    this.intervalId = setInterval(() => this.runChecks(), interval)
    logger.info(`Started periodic health checks with interval ${interval}ms`)
  }

  public stopPeriodicChecks(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId)
      this.intervalId = undefined
      logger.info("Stopped periodic health checks")
    }
  }
}

// Create and export singleton instance
export const healthChecks = HealthCheckRegistry.getInstance()

// Register common health checks
healthChecks.registerCheck({
  name: "database",
  check: async () => {
    try {
      // In a real implementation, this would check database connectivity
      await new Promise((resolve) => setTimeout(resolve, 100))

      return {
        status: "healthy",
        details: { latency: 100 },
        timestamp: Date.now(),
      }
    } catch (error) {
      return {
        status: "unhealthy",
        message: (error as Error).message,
        details: { error: (error as Error).stack },
        timestamp: Date.now(),
      }
    }
  },
  timeout: 2000,
  critical: true,
})

healthChecks.registerCheck({
  name: "redis",
  check: async () => {
    try {
      // In a real implementation, this would check Redis connectivity
      await new Promise((resolve) => setTimeout(resolve, 50))

      return {
        status: "healthy",
        details: { latency: 50 },
        timestamp: Date.now(),
      }
    } catch (error) {
      return {
        status: "unhealthy",
        message: (error as Error).message,
        details: { error: (error as Error).stack },
        timestamp: Date.now(),
      }
    }
  },
  timeout: 1000,
  critical: false,
})

// Start periodic health checks
if (process.env.NODE_ENV === "production") {
  healthChecks.startPeriodicChecks()
}

// API route handler for health checks
export async function handleHealthCheck(req: Request): Promise<Response> {
  const url = new URL(req.url)
  const path = url.pathname

  // Liveness probe - just returns 200 if the app is running
  if (path.endsWith("/health/live")) {
    return new Response(JSON.stringify({ status: "ok" }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    })
  }

  // Readiness probe - returns 200 if the app is ready to serve traffic
  if (path.endsWith("/health/ready")) {
    const status = healthChecks.getOverallStatus()

    return new Response(JSON.stringify({ status }), {
      status: status === "healthy" ? 200 : status === "degraded" ? 200 : 503,
      headers: { "Content-Type": "application/json" },
    })
  }

  // Detailed health check
  if (path.endsWith("/health/detail")) {
    const results = await healthChecks.runChecks()
    const status = healthChecks.getOverallStatus()

    return new Response(
      JSON.stringify({
        status,
        checks: results,
        timestamp: Date.now(),
      }),
      {
        status: status === "healthy" ? 200 : status === "degraded" ? 200 : 503,
        headers: { "Content-Type": "application/json" },
      },
    )
  }

  return new Response("Not found", { status: 404 })
}

