/**
 * Health Check API untuk Memoright
 *
 * Endpoint untuk memeriksa kesehatan aplikasi dan dependensinya.
 *
 * @description Memeriksa kesehatan aplikasi dan dependensinya
 * @tags System
 * @response {200} Health check berhasil
 * @response {500} Health check gagal
 */

import { type NextRequest, NextResponse } from "next/server"
import { logger } from "@/lib/logger"
import { container } from "@/lib/architecture/dependency-injection"
import type { ObservabilityService } from "@/lib/monitoring/observability-service"

interface HealthCheckResult {
  status: "ok" | "degraded" | "down"
  version: string
  timestamp: string
  uptime: number
  checks: {
    name: string
    status: "ok" | "degraded" | "down"
    message?: string
    latency?: number
  }[]
}

export async function GET(req: NextRequest) {
  const startTime = Date.now()

  // Dapatkan observability service
  const observabilityService = container.resolve<ObservabilityService>("observabilityService")

  // Mulai tracing
  const traceContext = observabilityService.startSpan("health_check", {
    attributes: {
      "http.method": "GET",
      "http.url": req.url,
    },
  })

  try {
    // Lakukan health check
    const healthCheck = await checkHealth()

    // Catat metrik
    observabilityService.recordHistogram("health_check.latency", Date.now() - startTime, {
      "health.status": healthCheck.status,
    })

    // End tracing
    traceContext.setAttribute("health.status", healthCheck.status)
    traceContext.setStatus("ok")
    traceContext.end()

    // Kembalikan hasil
    return NextResponse.json(healthCheck, {
      status: healthCheck.status === "down" ? 500 : 200,
    })
  } catch (error) {
    logger.error("Health check failed", error instanceof Error ? error : new Error(String(error)))

    // End tracing dengan error
    traceContext.setAttribute("error", true)
    traceContext.setAttribute("error.message", error instanceof Error ? error.message : String(error))
    traceContext.setStatus("error", error instanceof Error ? error.message : String(error))
    traceContext.end()

    // Catat metrik
    observabilityService.recordHistogram("health_check.latency", Date.now() - startTime, {
      "health.status": "down",
      error: true,
    })

    // Kembalikan error
    return NextResponse.json(
      {
        status: "down",
        version: process.env.APP_VERSION || "0.0.0",
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        checks: [
          {
            name: "overall",
            status: "down",
            message: error instanceof Error ? error.message : String(error),
          },
        ],
      } as HealthCheckResult,
      { status: 500 },
    )
  }
}

/**
 * Memeriksa kesehatan aplikasi dan dependensinya
 */
async function checkHealth(): Promise<HealthCheckResult> {
  const checks = []
  let overallStatus: "ok" | "degraded" | "down" = "ok"

  // Periksa database
  try {
    const dbStartTime = Date.now()
    // Dalam implementasi nyata, ini akan melakukan query ke database
    // await db.raw('SELECT 1');
    await new Promise((resolve) => setTimeout(resolve, 10)) // Simulasi query

    checks.push({
      name: "database",
      status: "ok",
      latency: Date.now() - dbStartTime,
    })
  } catch (error) {
    logger.error("Database health check failed", error instanceof Error ? error : new Error(String(error)))

    checks.push({
      name: "database",
      status: "down",
      message: error instanceof Error ? error.message : String(error),
    })

    overallStatus = "down"
  }

  // Periksa Redis
  try {
    const redisStartTime = Date.now()
    // Dalam implementasi nyata, ini akan melakukan ping ke Redis
    // await redis.ping();
    await new Promise((resolve) => setTimeout(resolve, 5)) // Simulasi ping

    checks.push({
      name: "redis",
      status: "ok",
      latency: Date.now() - redisStartTime,
    })
  } catch (error) {
    logger.error("Redis health check failed", error instanceof Error ? error : new Error(String(error)))

    checks.push({
      name: "redis",
      status: "down",
      message: error instanceof Error ? error.message : String(error),
    })

    // Redis tidak kritis, jadi status menjadi degraded
    if (overallStatus === "ok") {
      overallStatus = "degraded"
    }
  }

  // Periksa API eksternal
  try {
    const apiStartTime = Date.now()
    // Dalam implementasi nyata, ini akan melakukan request ke API eksternal
    // await fetch('https://api.example.com/health');
    await new Promise((resolve) => setTimeout(resolve, 20)) // Simulasi request

    checks.push({
      name: "external_api",
      status: "ok",
      latency: Date.now() - apiStartTime,
    })
  } catch (error) {
    logger.error("External API health check failed", error instanceof Error ? error : new Error(String(error)))

    checks.push({
      name: "external_api",
      status: "down",
      message: error instanceof Error ? error.message : String(error),
    })

    // API eksternal tidak kritis, jadi status menjadi degraded
    if (overallStatus === "ok") {
      overallStatus = "degraded"
    }
  }

  // Periksa disk space
  try {
    const diskStartTime = Date.now()
    // Dalam implementasi nyata, ini akan memeriksa ruang disk
    // const diskInfo = await fs.promises.statfs('/');
    await new Promise((resolve) => setTimeout(resolve, 5)) // Simulasi pemeriksaan

    checks.push({
      name: "disk_space",
      status: "ok",
      latency: Date.now() - diskStartTime,
    })
  } catch (error) {
    logger.error("Disk space health check failed", error instanceof Error ? error : new Error(String(error)))

    checks.push({
      name: "disk_space",
      status: "down",
      message: error instanceof Error ? error.message : String(error),
    })

    // Disk space kritis, jadi status menjadi down
    overallStatus = "down"
  }

  // Periksa memory usage
  const memoryUsage = process.memoryUsage()
  const memoryUsagePercent = (memoryUsage.heapUsed / memoryUsage.heapTotal) * 100

  if (memoryUsagePercent > 90) {
    checks.push({
      name: "memory",
      status: "down",
      message: `Memory usage is too high: ${memoryUsagePercent.toFixed(2)}%`,
    })

    overallStatus = "down"
  } else if (memoryUsagePercent > 75) {
    checks.push({
      name: "memory",
      status: "degraded",
      message: `Memory usage is high: ${memoryUsagePercent.toFixed(2)}%`,
    })

    if (overallStatus === "ok") {
      overallStatus = "degraded"
    }
  } else {
    checks.push({
      name: "memory",
      status: "ok",
      message: `Memory usage: ${memoryUsagePercent.toFixed(2)}%`,
    })
  }

  return {
    status: overallStatus,
    version: process.env.APP_VERSION || "0.0.0",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    checks,
  }
}

