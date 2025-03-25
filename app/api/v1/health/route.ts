import { type NextRequest, NextResponse } from "next/server"
import { withErrorHandling } from "@/lib/middleware/error-handler"
import { createApiResponse } from "@/lib/api-config"
import prisma from "@/lib/db-client"
import { Redis } from "@upstash/redis"

/**
 * Health check endpoint to verify system status
 * GET /api/v1/health
 */
async function handler(request: NextRequest) {
  const startTime = performance.now()

  // Check database connection
  let dbStatus = "healthy"
  try {
    await prisma.$queryRaw`SELECT 1`
  } catch (error) {
    dbStatus = "unhealthy"
  }

  // Check Redis connection
  let redisStatus = "healthy"
  try {
    const redis = new Redis({
      url: process.env.REDIS_URL || "",
      token: process.env.REDIS_TOKEN || "",
    })
    await redis.ping()
  } catch (error) {
    redisStatus = "unhealthy"
  }

  // Calculate response time
  const endTime = performance.now()
  const responseTime = Math.round(endTime - startTime)

  // Get system info
  const uptime = process.uptime()
  const memoryUsage = process.memoryUsage()

  const healthData = {
    status: dbStatus === "healthy" && redisStatus === "healthy" ? "healthy" : "degraded",
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    version: process.env.NEXT_PUBLIC_APP_VERSION || "unknown",
    services: {
      database: dbStatus,
      redis: redisStatus,
    },
    performance: {
      responseTime: `${responseTime}ms`,
      uptime: `${Math.floor(uptime)}s`,
      memory: {
        rss: `${Math.round(memoryUsage.rss / 1024 / 1024)}MB`,
        heapTotal: `${Math.round(memoryUsage.heapTotal / 1024 / 1024)}MB`,
        heapUsed: `${Math.round(memoryUsage.heapUsed / 1024 / 1024)}MB`,
      },
    },
  }

  return NextResponse.json(createApiResponse(true, healthData), {
    status: healthData.status === "healthy" ? 200 : 503,
    headers: {
      "Cache-Control": "no-store, max-age=0",
    },
  })
}

export const GET = (request: NextRequest) => withErrorHandling(request, handler)

