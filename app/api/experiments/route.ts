import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { prisma } from "@/lib/db"
import { AuditLogger, AuditAction, AuditResource } from "@/lib/compliance/audit-logger"
import { z } from "zod"
import { metricsService } from "@/lib/observability/metrics"

// Schema for experiment creation/update
const experimentSchema = z.object({
  name: z.string().min(3).max(100),
  description: z.string().optional(),
  status: z.enum(["DRAFT", "RUNNING", "PAUSED", "COMPLETED", "ARCHIVED"]).optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  variants: z
    .array(
      z.object({
        name: z.string().min(1).max(50),
        description: z.string().optional(),
        weight: z.number().min(0).max(100),
        config: z.record(z.any()).optional(),
      }),
    )
    .min(2),
  targetAudience: z
    .object({
      percentage: z.number().min(0).max(100),
      filters: z
        .array(
          z.object({
            attribute: z.string(),
            operator: z.enum([
              "equals",
              "not_equals",
              "contains",
              "not_contains",
              "in",
              "not_in",
              "greater_than",
              "less_than",
            ]),
            value: z.string(),
          }),
        )
        .optional(),
    })
    .optional(),
  metrics: z
    .array(
      z.object({
        name: z.string(),
        description: z.string().optional(),
        type: z.enum(["CONVERSION", "NUMERIC", "DURATION", "COUNT"]),
        goal: z.enum(["MAXIMIZE", "MINIMIZE"]).optional(),
        primary: z.boolean().optional(),
      }),
    )
    .optional(),
})

/**
 * GET /api/experiments
 * Get all experiments
 */
export async function GET(request: Request) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Parse query parameters
    const url = new URL(request.url)
    const status = url.searchParams.get("status")
    const limit = Number.parseInt(url.searchParams.get("limit") || "50", 10)
    const offset = Number.parseInt(url.searchParams.get("offset") || "0", 10)

    // Build query filters
    const whereClause: any = {}

    if (status) {
      whereClause.status = status
    }

    // Only admins can see all experiments
    if (session.user.role !== "ADMIN") {
      whereClause.OR = [{ createdById: session.user.id }, { isPublic: true }]
    }

    // Get experiments from database
    const experiments = await prisma.experiment.findMany({
      where: whereClause,
      include: {
        variants: true,
        metrics: true,
        targetAudience: {
          include: {
            filters: true,
          },
        },
      },
      orderBy: {
        updatedAt: "desc",
      },
      skip: offset,
      take: limit,
    })

    // Get total count for pagination
    const totalCount = await prisma.experiment.count({
      where: whereClause,
    })

    // Track metrics
    metricsService.incrementCounter("api_requests_total", 1, {
      endpoint: "/api/experiments",
      method: "GET",
      user_role: session.user.role,
    })

    // Log the access for audit purposes
    await AuditLogger.log(
      {
        action: AuditAction.READ,
        resource: AuditResource.EXPERIMENT,
        description: "User accessed experiments list",
        userId: session.user.id,
        metadata: {
          status,
          limit,
          offset,
        },
      },
      request,
    )

    return NextResponse.json({
      experiments,
      pagination: {
        total: totalCount,
        limit,
        offset,
      },
    })
  } catch (error) {
    console.error("Error fetching experiments:", error)

    // Track error metrics
    metricsService.incrementCounter("api_errors_total", 1, {
      endpoint: "/api/experiments",
      method: "GET",
      error_type: error instanceof Error ? error.name : "unknown",
    })

    return NextResponse.json({ error: "Failed to fetch experiments" }, { status: 500 })
  }
}

/**
 * POST /api/experiments
 * Create a new experiment
 */
export async function POST(request: Request) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Check permissions for creating experiments
    if (session.user.role !== "ADMIN" && session.user.role !== "RESEARCHER") {
      return NextResponse.json({ error: "Forbidden: Insufficient permissions to create experiments" }, { status: 403 })
    }

    // Parse and validate request body
    const body = await request.json()

    const validationResult = experimentSchema.safeParse(body)
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

    // Create the experiment in a transaction
    const experiment = await prisma.$transaction(async (tx) => {
      // Create the experiment
      const newExperiment = await tx.experiment.create({
        data: {
          name: data.name,
          description: data.description || "",
          status: data.status || "DRAFT",
          startDate: data.startDate ? new Date(data.startDate) : null,
          endDate: data.endDate ? new Date(data.endDate) : null,
          createdById: session.user.id,
          isPublic: false, // Default to private
        },
      })

      // Create variants
      for (const variant of data.variants) {
        await tx.experimentVariant.create({
          data: {
            experimentId: newExperiment.id,
            name: variant.name,
            description: variant.description || "",
            weight: variant.weight,
            config: variant.config || {},
          },
        })
      }

      // Create target audience if provided
      if (data.targetAudience) {
        const audience = await tx.experimentTargetAudience.create({
          data: {
            experimentId: newExperiment.id,
            percentage: data.targetAudience.percentage,
          },
        })

        // Create audience filters if provided
        if (data.targetAudience.filters && data.targetAudience.filters.length > 0) {
          for (const filter of data.targetAudience.filters) {
            await tx.experimentAudienceFilter.create({
              data: {
                targetAudienceId: audience.id,
                attribute: filter.attribute,
                operator: filter.operator,
                value: filter.value,
              },
            })
          }
        }
      }

      // Create metrics if provided
      if (data.metrics && data.metrics.length > 0) {
        for (const metric of data.metrics) {
          await tx.experimentMetric.create({
            data: {
              experimentId: newExperiment.id,
              name: metric.name,
              description: metric.description || "",
              type: metric.type,
              goal: metric.goal || "MAXIMIZE",
              primary: metric.primary || false,
            },
          })
        }
      }

      // Return the created experiment with all relations
      return tx.experiment.findUnique({
        where: { id: newExperiment.id },
        include: {
          variants: true,
          metrics: true,
          targetAudience: {
            include: {
              filters: true,
            },
          },
        },
      })
    })

    // Track metrics
    metricsService.incrementCounter("experiments_created_total", 1, {
      user_role: session.user.role,
    })

    // Log the creation for audit purposes
    await AuditLogger.log(
      {
        action: AuditAction.CREATE,
        resource: AuditResource.EXPERIMENT,
        resourceId: experiment?.id,
        description: `Created new experiment: ${data.name}`,
        userId: session.user.id,
        metadata: {
          experimentName: data.name,
          variantCount: data.variants.length,
          status: data.status || "DRAFT",
        },
      },
      request,
    )

    return NextResponse.json(experiment, { status: 201 })
  } catch (error) {
    console.error("Error creating experiment:", error)

    // Track error metrics
    metricsService.incrementCounter("api_errors_total", 1, {
      endpoint: "/api/experiments",
      method: "POST",
      error_type: error instanceof Error ? error.name : "unknown",
    })

    return NextResponse.json(
      { error: "Failed to create experiment", message: error instanceof Error ? error.message : String(error) },
      { status: 500 },
    )
  }
}

/**
 * PUT /api/experiments
 * Bulk update experiments (e.g., for batch operations)
 */
export async function PUT(request: Request) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Only admins can perform bulk updates
    if (session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden: Only administrators can perform bulk updates" }, { status: 403 })
    }

    // Parse request body
    const body = await request.json()

    if (!body.experiments || !Array.isArray(body.experiments) || body.experiments.length === 0) {
      return NextResponse.json({ error: "Invalid request: experiments array is required" }, { status: 400 })
    }

    // Validate operation type
    const operation = body.operation
    if (!["update_status", "archive", "delete"].includes(operation)) {
      return NextResponse.json({ error: "Invalid operation type" }, { status: 400 })
    }

    const experimentIds = body.experiments.map((exp: any) => exp.id)

    // Perform the bulk operation
    let result
    switch (operation) {
      case "update_status":
        if (!body.status) {
          return NextResponse.json({ error: "Status is required for status update operation" }, { status: 400 })
        }

        result = await prisma.experiment.updateMany({
          where: {
            id: { in: experimentIds },
          },
          data: {
            status: body.status,
            updatedAt: new Date(),
          },
        })
        break

      case "archive":
        result = await prisma.experiment.updateMany({
          where: {
            id: { in: experimentIds },
          },
          data: {
            status: "ARCHIVED",
            updatedAt: new Date(),
          },
        })
        break

      case "delete":
        // This is a soft delete - we don't actually delete the data
        result = await prisma.experiment.updateMany({
          where: {
            id: { in: experimentIds },
          },
          data: {
            status: "ARCHIVED",
            isDeleted: true,
            updatedAt: new Date(),
          },
        })
        break
    }

    // Track metrics
    metricsService.incrementCounter("experiments_bulk_updated_total", experimentIds.length, {
      operation,
      user_role: session.user.role,
    })

    // Log the bulk update for audit purposes
    await AuditLogger.log(
      {
        action: AuditAction.UPDATE,
        resource: AuditResource.EXPERIMENT,
        description: `Bulk ${operation} operation on ${experimentIds.length} experiments`,
        userId: session.user.id,
        metadata: {
          operation,
          experimentCount: experimentIds.length,
          experimentIds,
        },
      },
      request,
    )

    return NextResponse.json({
      success: true,
      operation,
      affected: result.count,
    })
  } catch (error) {
    console.error("Error performing bulk experiment update:", error)

    // Track error metrics
    metricsService.incrementCounter("api_errors_total", 1, {
      endpoint: "/api/experiments",
      method: "PUT",
      error_type: error instanceof Error ? error.name : "unknown",
    })

    return NextResponse.json(
      { error: "Failed to update experiments", message: error instanceof Error ? error.message : String(error) },
      { status: 500 },
    )
  }
}

/**
 * DELETE /api/experiments
 * Bulk delete experiments (admin only)
 */
export async function DELETE(request: Request) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions)
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Unauthorized: Only administrators can perform bulk deletions" },
        { status: 403 },
      )
    }

    // Parse request body
    const body = await request.json()

    if (!body.experimentIds || !Array.isArray(body.experimentIds) || body.experimentIds.length === 0) {
      return NextResponse.json({ error: "Invalid request: experimentIds array is required" }, { status: 400 })
    }

    const experimentIds = body.experimentIds
    const hardDelete = body.hardDelete === true

    // Confirm this is a dangerous operation
    if (hardDelete && !body.confirmation === "CONFIRM_HARD_DELETE") {
      return NextResponse.json({ error: "Hard delete requires confirmation" }, { status: 400 })
    }

    let result

    if (hardDelete) {
      // Hard delete - actually remove the data (dangerous, should be used with caution)
      // First delete related records
      await prisma.$transaction([
        // Delete experiment metrics
        prisma.experimentMetric.deleteMany({
          where: {
            experimentId: { in: experimentIds },
          },
        }),

        // Delete audience filters
        prisma.experimentAudienceFilter.deleteMany({
          where: {
            targetAudience: {
              experimentId: { in: experimentIds },
            },
          },
        }),

        // Delete target audiences
        prisma.experimentTargetAudience.deleteMany({
          where: {
            experimentId: { in: experimentIds },
          },
        }),

        // Delete variants
        prisma.experimentVariant.deleteMany({
          where: {
            experimentId: { in: experimentIds },
          },
        }),

        // Delete experiment results
        prisma.experimentResult.deleteMany({
          where: {
            experimentId: { in: experimentIds },
          },
        }),

        // Finally delete the experiments
        prisma.experiment.deleteMany({
          where: {
            id: { in: experimentIds },
          },
        }),
      ])

      result = { count: experimentIds.length }
    } else {
      // Soft delete - just mark as deleted
      result = await prisma.experiment.updateMany({
        where: {
          id: { in: experimentIds },
        },
        data: {
          status: "ARCHIVED",
          isDeleted: true,
          updatedAt: new Date(),
        },
      })
    }

    // Track metrics
    metricsService.incrementCounter("experiments_deleted_total", experimentIds.length, {
      hard_delete: hardDelete,
      user_role: session.user.role,
    })

    // Log the deletion for audit purposes
    await AuditLogger.log(
      {
        action: hardDelete ? AuditAction.DELETE : AuditAction.UPDATE,
        resource: AuditResource.EXPERIMENT,
        description: `${hardDelete ? "Hard" : "Soft"} deleted ${experimentIds.length} experiments`,
        userId: session.user.id,
        metadata: {
          hardDelete,
          experimentCount: experimentIds.length,
          experimentIds,
        },
      },
      request,
    )

    return NextResponse.json({
      success: true,
      deleted: result.count,
      hardDelete,
    })
  } catch (error) {
    console.error("Error deleting experiments:", error)

    // Track error metrics
    metricsService.incrementCounter("api_errors_total", 1, {
      endpoint: "/api/experiments",
      method: "DELETE",
      error_type: error instanceof Error ? error.name : "unknown",
    })

    return NextResponse.json(
      { error: "Failed to delete experiments", message: error instanceof Error ? error.message : String(error) },
      { status: 500 },
    )
  }
}

