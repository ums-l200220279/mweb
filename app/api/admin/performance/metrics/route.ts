import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { prisma } from "@/lib/db"
import { AuditLogger, AuditAction, AuditResource } from "@/lib/compliance/audit-logger"

export async function GET(request: Request) {
  try {
    // Check authentication for admin access
    const session = await getServerSession(authOptions)
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    // Get query parameters
    const url = new URL(request.url)
    const timeRange = url.searchParams.get("timeRange") || "24h"
    const endpoint = url.searchParams.get("endpoint") || "all"

    // Calculate start time based on time range
    const now = new Date()
    let startTime: Date

    switch (timeRange) {
      case "1h":
        startTime = new Date(now.getTime() - 60 * 60 * 1000)
        break
      case "7d":
        startTime = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
        break
      case "30d":
        startTime = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
        break
      case "24h":
      default:
        startTime = new Date(now.getTime() - 24 * 60 * 60 * 1000)
        break
    }

    // Build query filters
    const whereClause: any = {
      timestamp: {
        gte: startTime,
      },
    }

    if (endpoint !== "all") {
      whereClause.endpoint = endpoint
    }

    // Fetch performance metrics from database
    const latencyMetrics = await prisma.performanceMetric.findMany({
      where: {
        ...whereClause,
        metricType: "latency",
      },
      orderBy: {
        timestamp: "asc",
      },
    })

    const throughputMetrics = await prisma.performanceMetric.findMany({
      where: {
        ...whereClause,
        metricType: "throughput",
      },
      orderBy: {
        timestamp: "asc",
      },
    })

    const errorMetrics = await prisma.performanceMetric.findMany({
      where: {
        ...whereClause,
        metricType: "error",
      },
      orderBy: {
        timestamp: "asc",
      },
    })

    const resourceMetrics = await prisma.performanceMetric.findMany({
      where: {
        ...whereClause,
        metricType: {
          in: ["cpu", "memory", "disk"],
        },
      },
      orderBy: {
        timestamp: "asc",
      },
    })

    // Process metrics data
    const p50Latency = latencyMetrics
      .filter((metric) => metric.metricName === "p50")
      .map((metric) => ({
        timestamp: metric.timestamp.toISOString(),
        value: Number.parseFloat(metric.value),
      }))

    const p95Latency = latencyMetrics
      .filter((metric) => metric.metricName === "p95")
      .map((metric) => ({
        timestamp: metric.timestamp.toISOString(),
        value: Number.parseFloat(metric.value),
      }))

    const p99Latency = latencyMetrics
      .filter((metric) => metric.metricName === "p99")
      .map((metric) => ({
        timestamp: metric.timestamp.toISOString(),
        value: Number.parseFloat(metric.value),
      }))

    const requestThroughput = throughputMetrics
      .filter((metric) => metric.metricName === "requests_per_second")
      .map((metric) => ({
        timestamp: metric.timestamp.toISOString(),
        value: Number.parseFloat(metric.value),
      }))

    const successRate = throughputMetrics
      .filter((metric) => metric.metricName === "success_rate")
      .map((metric) => ({
        timestamp: metric.timestamp.toISOString(),
        value: Number.parseFloat(metric.value) * 100, // Convert to percentage
      }))

    const errorCount = errorMetrics
      .filter((metric) => metric.metricName === "error_count")
      .map((metric) => ({
        timestamp: metric.timestamp.toISOString(),
        value: Number.parseFloat(metric.value),
      }))

    // Get error distribution
    const errorDistribution = await prisma.$queryRaw`
      SELECT 
        error_type as type, 
        COUNT(*) as count,
        COUNT(*) * 100.0 / (SELECT COUNT(*) FROM error_log WHERE timestamp >= ${startTime}) as percentage
      FROM 
        error_log
      WHERE 
        timestamp >= ${startTime}
        ${endpoint !== "all" ? prisma.$raw`AND endpoint = ${endpoint}` : prisma.$raw``}
      GROUP BY 
        error_type
      ORDER BY 
        count DESC
      LIMIT 5
    `

    // Process resource metrics
    const cpuUsage = resourceMetrics
      .filter((metric) => metric.metricType === "cpu")
      .map((metric) => ({
        timestamp: metric.timestamp.toISOString(),
        value: Number.parseFloat(metric.value),
      }))

    const memoryUsage = resourceMetrics
      .filter((metric) => metric.metricType === "memory")
      .map((metric) => ({
        timestamp: metric.timestamp.toISOString(),
        value: Number.parseFloat(metric.value),
      }))

    const diskUsage = resourceMetrics
      .filter((metric) => metric.metricType === "disk")
      .map((metric) => ({
        timestamp: metric.timestamp.toISOString(),
        value: Number.parseFloat(metric.value),
      }))

    // Log the access for audit purposes
    await AuditLogger.log(
      {
        action: AuditAction.READ,
        resource: AuditResource.PERFORMANCE_DATA,
        description: `Admin user accessed performance metrics (${timeRange}, ${endpoint})`,
        userId: session.user.id,
        metadata: {
          timeRange,
          endpoint,
        },
      },
      request,
    )

    // Return the processed metrics
    return NextResponse.json({
      latency: {
        p50: p50Latency,
        p95: p95Latency,
        p99: p99Latency,
      },
      throughput: {
        requests: requestThroughput,
        successRate: successRate,
      },
      errors: {
        count: errorCount,
        distribution: errorDistribution,
      },
      resources: {
        cpu: cpuUsage,
        memory: memoryUsage,
        disk: diskUsage,
      },
    })
  } catch (error) {
    console.error("Error fetching performance metrics:", error)
    return NextResponse.json({ error: "Failed to fetch performance metrics" }, { status: 500 })
  }
}

