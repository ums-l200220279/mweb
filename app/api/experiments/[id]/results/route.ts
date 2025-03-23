import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { prisma } from "@/lib/db"
import { AuditLogger, AuditAction, AuditResource } from "@/lib/compliance/audit-logger"
import { z } from "zod"
import { metricsService } from "@/lib/observability/metrics"

// Schema for experiment result creation
const experimentResultSchema = z.object({
  variantId: z.string(),
  metricId: z.string().optional(),
  metricName: z.string().optional(),
  value: z.number().or(z.boolean()),
  userId: z.string().optional(),
  sessionId: z.string().optional(),
  metadata: z.record(z.any()).optional(),
})

/**
 * GET /api/experiments/[id]/results
 * Get results for a specific experiment
 */
export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const experimentId = params.id

    // Check authentication
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get the experiment to check permissions
    const experiment = await prisma.experiment.findUnique({
      where: { id: experimentId },
    })

    if (!experiment) {
      return NextResponse.json({ error: "Experiment not found" }, { status: 404 })
    }

    // Check permissions
    const isAdmin = session.user.role === "ADMIN"
    const isOwner = experiment.createdById === session.user.id
    const isResearcher = session.user.role === "RESEARCHER"
    const isPublic = experiment.isPublic

    if (!isAdmin && !isOwner && !isResearcher && !isPublic) {
      return NextResponse.json(
        { error: "Forbidden: You do not have permission to access this experiment" },
        { status: 403 },
      )
    }

    // Parse query parameters
    const url = new URL(request.url)
    const limit = Number.parseInt(url.searchParams.get("limit") || "1000", 10)
    const offset = Number.parseInt(url.searchParams.get("offset") || "0", 10)
    const variantId = url.searchParams.get("variantId")
    const metricId = url.searchParams.get("metricId")
    const metricName = url.searchParams.get("metricName")
    const userId = url.searchParams.get("userId")
    const sessionId = url.searchParams.get("sessionId")
    const startDate = url.searchParams.get("startDate")
    const endDate = url.searchParams.get("endDate")
    const format = url.searchParams.get("format") || "detailed"

    // Build query filters
    const whereClause: any = {
      experimentId,
      isDeleted: false,
    }

    if (variantId) whereClause.variantId = variantId
    if (metricId) whereClause.metricId = metricId
    if (metricName) whereClause.metricName = metricName
    if (userId) whereClause.userId = userId
    if (sessionId) whereClause.sessionId = sessionId

    if (startDate) {
      whereClause.createdAt = {
        ...whereClause.createdAt,
        gte: new Date(startDate),
      }
    }

    if (endDate) {
      whereClause.createdAt = {
        ...whereClause.createdAt,
        lte: new Date(endDate),
      }
    }

    // Get experiment results
    const results = await prisma.experimentResult.findMany({
      where: whereClause,
      orderBy: {
        createdAt: "desc",
      },
      skip: offset,
      take: limit,
    })

    // Get total count for pagination
    const totalCount = await prisma.experimentResult.count({
      where: whereClause,
    })

    // If summary format is requested, aggregate the results
    if (format === "summary") {
      // Get experiment variants and metrics
      const variants = await prisma.experimentVariant.findMany({
        where: {
          experimentId,
          isDeleted: false,
        },
      })

      const metrics = await prisma.experimentMetric.findMany({
        where: {
          experimentId,
          isDeleted: false,
        },
      })

      // Aggregate results by variant and metric
      const aggregatedResults = await prisma.$queryRaw`
        SELECT 
          "variantId", 
          COALESCE("metricId", '') as "metricId", 
          COALESCE("metricName", '') as "metricName", 
          COUNT(*) as "count",
          AVG(CASE WHEN "value" ~ '^[0-9]+(\.[0-9]+)?$' THEN CAST("value" AS FLOAT) ELSE NULL END) as "average",
          MIN(CASE WHEN "value" ~ '^[0-9]+(\.[0-9]+)?$' THEN CAST("value" AS FLOAT) ELSE NULL END) as "min",
          MAX(CASE WHEN "value" ~ '^[0-9]+(\.[0-9]+)?$' THEN CAST("value" AS FLOAT) ELSE NULL END) as "max",
          SUM(CASE WHEN "value" = 'true' THEN 1 WHEN "value" = '1' THEN 1 ELSE 0 END) as "trueCount",
          SUM(CASE WHEN "value" = 'false' THEN 1 WHEN "value" = '0' THEN 1 ELSE 0 END) as "falseCount"
        FROM 
          "ExperimentResult"
        WHERE 
          "experimentId" = ${experimentId}
          AND "isDeleted" = false
          ${variantId ? prisma.$raw`AND "variantId" = ${variantId}` : prisma.$raw``}
          ${metricId ? prisma.$raw`AND "metricId" = ${metricId}` : prisma.$raw``}
          ${metricName ? prisma.$raw`AND "metricName" = ${metricName}` : prisma.$raw``}
          ${startDate ? prisma.$raw`AND "createdAt" >= ${new Date(startDate)}` : prisma.$raw``}
          ${endDate ? prisma.$raw`AND "createdAt" <= ${new Date(endDate)}` : prisma.$raw``}
        GROUP BY 
          "variantId", "metricId", "metricName"
        ORDER BY 
          "variantId", "metricName"
      `

      // Track metrics
      metricsService.incrementCounter("experiment_results_views_total", 1, {
        experiment_id: experimentId,
        user_role: session.user.role,
        format: "summary",
      })

      // Log the access for audit purposes
      await AuditLogger.log(
        {
          action: AuditAction.READ,
          resource: AuditResource.EXPERIMENT_RESULTS,
          resourceId: experimentId,
          description: `User accessed experiment results summary: ${experiment.name}`,
          userId: session.user.id,
          metadata: {
            experimentName: experiment.name,
            format: "summary",
          },
        },
        request,
      )

      return NextResponse.json({
        experiment,
        variants,
        metrics,
        results: aggregatedResults,
        pagination: {
          total: totalCount,
          limit,
          offset,
        },
      })
    }

    // Track metrics
    metricsService.incrementCounter("experiment_results_views_total", 1, {
      experiment_id: experimentId,
      user_role: session.user.role,
      format: "detailed",
    })

    // Log the access for audit purposes
    await AuditLogger.log(
      {
        action: AuditAction.READ,
        resource: AuditResource.EXPERIMENT_RESULTS,
        resourceId: experimentId,
        description: `User accessed experiment results: ${experiment.name}`,
        userId: session.user.id,
        metadata: {
          experimentName: experiment.name,
          format: "detailed",
        },
      },
      request,
    )

    return NextResponse.json({
      results,
      pagination: {
        total: totalCount,
        limit,
        offset,
      },
    })
  } catch (error) {
    console.error(`Error fetching experiment results:`, error)

    // Track error metrics
    metricsService.incrementCounter("api_errors_total", 1, {
      endpoint: "/api/experiments/[id]/results",
      method: "GET",
      error_type: error instanceof Error ? error.name : "unknown",
    })

    return NextResponse.json({ error: "Failed to fetch experiment results" }, { status: 500 })
  }
}

/**
 * POST /api/experiments/[id]/results
 * Record a result for a specific experiment
 */
export async function POST(request: Request, { params }: { params: { id: string } }) {
  try {
    const experimentId = params.id

    // Check authentication - allow anonymous results with proper API key
    const apiKey = request.headers.get("x-api-key")
    let userId = null

    if (!apiKey) {
      const session = await getServerSession(authOptions)
      if (!session?.user) {
        return NextResponse.json({ error: "Unauthorized: API key or session required" }, { status: 401 })
      }
      userId = session.user.id
    } else {
      // Validate API key
      const validApiKey = await prisma.apiKey.findFirst({
        where: {
          key: apiKey,
          isActive: true,
          expiresAt: {
            gt: new Date(),
          },
        },
      })

      if (!validApiKey) {
        return NextResponse.json({ error: "Unauthorized: Invalid or expired API key" }, { status: 401 })
      }
    }

    // Get the experiment
    const experiment = await prisma.experiment.findUnique({
      where: { id: experimentId },
    })

    if (!experiment) {
      return NextResponse.json({ error: "Experiment not found" }, { status: 404 })
    }

    // Check if experiment is running
    if (experiment.status !== "RUNNING") {
      return NextResponse.json({ error: "Experiment is not running" }, { status: 400 })
    }

    // Parse and validate request body
    const body = await request.json()

    const validationResult = experimentResultSchema.safeParse(body)
    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: "Invalid request data",
          details: validationResult.error.format(),
        },
        { status: 400 },
      )
    }

    const data = validationResult.data

    // Validate variant exists
    const variant = await prisma.experimentVariant.findFirst({
      where: {
        id: data.variantId,
        experimentId,
        isDeleted: false,
      },
    })

    if (!variant) {
      return NextResponse.json({ error: "Variant not found" }, { status: 404 })
    }

    // Validate metric if provided
    if (data.metricId) {
      const metric = await prisma.experimentMetric.findFirst({
        where: {
          id: data.metricId,
          experimentId,
          isDeleted: false,
        },
      })

      if (!metric) {
        return NextResponse.json({ error: "Metric not found" }, { status: 404 })
      }
    }

    // Create the result
    const result = await prisma.experimentResult.create({
      data: {
        experimentId,
        variantId: data.variantId,
        metricId: data.metricId,
        metricName: data.metricName || (data.metricId ? undefined : "custom"),
        value: typeof data.value === "boolean" ? data.value.toString() : data.value.toString(),
        userId: data.userId || userId,
        sessionId: data.sessionId,
        metadata: data.metadata || {},
      },
    })

    // Track metrics
    metricsService.incrementCounter("experiment_results_recorded_total", 1, {
      experiment_id: experimentId,
      variant_id: data.variantId,
      metric_id: data.metricId || "none",
      metric_name: data.metricName || "none",
    })

    // Log the result for audit purposes
    await AuditLogger.log(
      {
        action: AuditAction.CREATE,
        resource: AuditResource.EXPERIMENT_RESULT,
        resourceId: result.id,
        description: `Recorded experiment result for: ${experiment.name}`,
        userId: userId || "anonymous",
        metadata: {
          experimentId,
          variantId: data.variantId,
          metricId: data.metricId,
          metricName: data.metricName,
          value: data.value.toString(),
        },
      },
      request,
    )

    return NextResponse.json(result, { status: 201 })
  } catch (error) {
    console.error(`Error recording experiment result:`, error)

    // Track error metrics
    metricsService.incrementCounter("api_errors_total", 1, {
      endpoint: "/api/experiments/[id]/results",
      method: "POST",
      error_type: error instanceof Error ? error.name : "unknown",
    })

    return NextResponse.json(
      { error: "Failed to record experiment result", message: error instanceof Error ? error.message : String(error) },
      { status: 500 },
    )
  }
}

/**
 * DELETE /api/experiments/[id]/results
 * Delete results for a specific experiment
 */
export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    const experimentId = params.id

    // Check authentication
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get the experiment to check permissions
    const experiment = await prisma.experiment.findUnique({
      where: { id: experimentId },
    })

    if (!experiment) {
      return NextResponse.json({ error: "Experiment not found" }, { status: 404 })
    }

    // Check permissions - only admins and experiment owners can delete results
    const isAdmin = session.user.role === "ADMIN"
    const isOwner = experiment.createdById === session.user.id

    if (!isAdmin && !isOwner) {
      return NextResponse.json(
        { error: "Forbidden: You do not have permission to delete experiment results" },
        { status: 403 },
      )
    }

    // Parse query parameters
    const url = new URL(request.url)
    const hardDelete = url.searchParams.get("hardDelete") === "true"
    const variantId = url.searchParams.get("variantId")
    const metricId = url.searchParams.get("metricId")
    const metricName = url.searchParams.get("metricName")
    const startDate = url.searchParams.get("startDate")
    const endDate = url.searchParams.get("endDate")

    // Only admins can perform hard deletes
    if (hardDelete && !isAdmin) {
      return NextResponse.json({ error: "Forbidden: Only administrators can perform hard deletes" }, { status: 403 })
    }

    // Build query filters
    const whereClause: any = {
      experimentId,
    }

    if (variantId) whereClause.variantId = variantId
    if (metricId) whereClause.metricId = metricId
    if (metricName) whereClause.metricName = metricName

    if (startDate) {
      whereClause.createdAt = {
        ...whereClause.createdAt,
        gte: new Date(startDate),
      }
    }

    if (endDate) {
      whereClause.createdAt = {
        ...whereClause.createdAt,
        lte: new Date(endDate),
      }
    }

    let result

    if (hardDelete) {
      // Hard delete - actually remove the data
      result = await prisma.experimentResult.deleteMany({
        where: whereClause,
      })
    } else {
      // Soft delete - just mark as deleted
      result = await prisma.experimentResult.updateMany({
        where: whereClause,
        data: {
          isDeleted: true,
          updatedAt: new Date(),
        },
      })
    }

    // Track metrics
    metricsService.incrementCounter("experiment_results_deleted_total", result.count, {
      experiment_id: experimentId,
      hard_delete: hardDelete,
      user_role: session.user.role,
    })

    // Log the deletion for audit purposes
    await AuditLogger.log(
      {
        action: hardDelete ? AuditAction.DELETE : AuditAction.UPDATE,
        resource: AuditResource.EXPERIMENT_RESULTS,
        resourceId: experimentId,
        description: `${hardDelete ? "Hard" : "Soft"} deleted ${result.count} experiment results for: ${experiment.name}`,
        userId: session.user.id,
        metadata: {
          experimentName: experiment.name,
          hardDelete,
          count: result.count,
          filters: {
            variantId,
            metricId,
            metricName,
            startDate,
            endDate,
          },
        },
      },
      request,
    )

    return NextResponse.json({
      success: true,
      message: `${result.count} experiment results ${hardDelete ? "permanently deleted" : "marked as deleted"}`,
      count: result.count,
    })
  } catch (error) {
    console.error(`Error deleting experiment results:`, error)

    // Track error metrics
    metricsService.incrementCounter("api_errors_total", 1, {
      endpoint: "/api/experiments/[id]/results",
      method: "DELETE",
      error_type: error instanceof Error ? error.name : "unknown",
    })

    return NextResponse.json(
      { error: "Failed to delete experiment results", message: error instanceof Error ? error.message : String(error) },
      { status: 500 },
    )
  }
}

