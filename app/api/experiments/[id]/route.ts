import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { prisma } from "@/lib/db"
import { AuditLogger, AuditAction, AuditResource } from "@/lib/compliance/audit-logger"
import { z } from "zod"
import { metricsService } from "@/lib/observability/metrics"

// Schema for experiment update
const experimentUpdateSchema = z.object({
  name: z.string().min(3).max(100).optional(),
  description: z.string().optional(),
  status: z.enum(["DRAFT", "RUNNING", "PAUSED", "COMPLETED", "ARCHIVED"]).optional(),
  startDate: z.string().optional().nullable(),
  endDate: z.string().optional().nullable(),
  isPublic: z.boolean().optional(),
  variants: z
    .array(
      z.object({
        id: z.string().optional(), // Existing variant ID
        name: z.string().min(1).max(50),
        description: z.string().optional(),
        weight: z.number().min(0).max(100),
        config: z.record(z.any()).optional(),
        isDeleted: z.boolean().optional(),
      }),
    )
    .optional(),
  targetAudience: z
    .object({
      id: z.string().optional(), // Existing audience ID
      percentage: z.number().min(0).max(100),
      filters: z
        .array(
          z.object({
            id: z.string().optional(), // Existing filter ID
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
            isDeleted: z.boolean().optional(),
          }),
        )
        .optional(),
    })
    .optional(),
  metrics: z
    .array(
      z.object({
        id: z.string().optional(), // Existing metric ID
        name: z.string(),
        description: z.string().optional(),
        type: z.enum(["CONVERSION", "NUMERIC", "DURATION", "COUNT"]),
        goal: z.enum(["MAXIMIZE", "MINIMIZE"]).optional(),
        primary: z.boolean().optional(),
        isDeleted: z.boolean().optional(),
      }),
    )
    .optional(),
})

/**
 * GET /api/experiments/[id]
 * Get a specific experiment by ID
 */
export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const id = params.id

    // Check authentication
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get the experiment from database
    const experiment = await prisma.experiment.findUnique({
      where: { id },
      include: {
        variants: {
          where: { isDeleted: false },
        },
        metrics: {
          where: { isDeleted: false },
        },
        targetAudience: {
          include: {
            filters: {
              where: { isDeleted: false },
            },
          },
        },
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
      },
    })

    // Check if experiment exists
    if (!experiment) {
      return NextResponse.json({ error: "Experiment not found" }, { status: 404 })
    }

    // Check permissions
    const isAdmin = session.user.role === "ADMIN"
    const isOwner = experiment.createdById === session.user.id
    const isPublic = experiment.isPublic

    if (!isAdmin && !isOwner && !isPublic) {
      return NextResponse.json(
        { error: "Forbidden: You do not have permission to access this experiment" },
        { status: 403 },
      )
    }

    // Get experiment results if available
    const results = await prisma.experimentResult.findMany({
      where: {
        experimentId: id,
        isDeleted: false,
      },
      orderBy: {
        createdAt: "desc",
      },
    })

    // Track metrics
    metricsService.incrementCounter("experiment_views_total", 1, {
      experiment_id: id,
      user_role: session.user.role,
    })

    // Log the access for audit purposes
    await AuditLogger.log(
      {
        action: AuditAction.READ,
        resource: AuditResource.EXPERIMENT,
        resourceId: id,
        description: `User accessed experiment: ${experiment.name}`,
        userId: session.user.id,
      },
      request,
    )

    return NextResponse.json({
      ...experiment,
      results,
    })
  } catch (error) {
    console.error(`Error fetching experiment:`, error)

    // Track error metrics
    metricsService.incrementCounter("api_errors_total", 1, {
      endpoint: "/api/experiments/[id]",
      method: "GET",
      error_type: error instanceof Error ? error.name : "unknown",
    })

    return NextResponse.json({ error: "Failed to fetch experiment" }, { status: 500 })
  }
}

/**
 * PATCH /api/experiments/[id]
 * Update a specific experiment
 */
export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  try {
    const id = params.id

    // Check authentication
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get the experiment to check permissions
    const existingExperiment = await prisma.experiment.findUnique({
      where: { id },
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

    if (!existingExperiment) {
      return NextResponse.json({ error: "Experiment not found" }, { status: 404 })
    }

    // Check permissions
    const isAdmin = session.user.role === "ADMIN"
    const isOwner = existingExperiment.createdById === session.user.id
    const isResearcher = session.user.role === "RESEARCHER"

    if (!isAdmin && !isOwner && !isResearcher) {
      return NextResponse.json(
        { error: "Forbidden: You do not have permission to update this experiment" },
        { status: 403 },
      )
    }

    // Parse and validate request body
    const body = await request.json()

    const validationResult = experimentUpdateSchema.safeParse(body)
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

    // Check if experiment is in a state that can be updated
    if (existingExperiment.status === "COMPLETED" || existingExperiment.status === "ARCHIVED") {
      // Only admins can update completed or archived experiments
      if (!isAdmin) {
        return NextResponse.json(
          { error: "Forbidden: Cannot update completed or archived experiments" },
          { status: 403 },
        )
      }
    }

    // Update the experiment in a transaction
    const updatedExperiment = await prisma.$transaction(async (tx) => {
      // Update the experiment
      const experimentUpdate: any = {}

      if (data.name !== undefined) experimentUpdate.name = data.name
      if (data.description !== undefined) experimentUpdate.description = data.description
      if (data.status !== undefined) experimentUpdate.status = data.status
      if (data.isPublic !== undefined) experimentUpdate.isPublic = data.isPublic

      // Handle date fields
      if (data.startDate !== undefined) {
        experimentUpdate.startDate = data.startDate ? new Date(data.startDate) : null
      }

      if (data.endDate !== undefined) {
        experimentUpdate.endDate = data.endDate ? new Date(data.endDate) : null
      }

      // Only update if there are changes
      if (Object.keys(experimentUpdate).length > 0) {
        experimentUpdate.updatedAt = new Date()

        await tx.experiment.update({
          where: { id },
          data: experimentUpdate,
        })
      }

      // Update variants if provided
      if (data.variants && data.variants.length > 0) {
        for (const variant of data.variants) {
          if (variant.id) {
            // Update existing variant
            if (variant.isDeleted) {
              // Soft delete the variant
              await tx.experimentVariant.update({
                where: { id: variant.id },
                data: {
                  isDeleted: true,
                  updatedAt: new Date(),
                },
              })
            } else {
              // Update the variant
              await tx.experimentVariant.update({
                where: { id: variant.id },
                data: {
                  name: variant.name,
                  description: variant.description || "",
                  weight: variant.weight,
                  config: variant.config || {},
                  updatedAt: new Date(),
                },
              })
            }
          } else {
            // Create new variant
            await tx.experimentVariant.create({
              data: {
                experimentId: id,
                name: variant.name,
                description: variant.description || "",
                weight: variant.weight,
                config: variant.config || {},
              },
            })
          }
        }
      }

      // Update target audience if provided
      if (data.targetAudience) {
        let audienceId = data.targetAudience.id

        if (audienceId) {
          // Update existing audience
          await tx.experimentTargetAudience.update({
            where: { id: audienceId },
            data: {
              percentage: data.targetAudience.percentage,
              updatedAt: new Date(),
            },
          })
        } else if (existingExperiment.targetAudience) {
          // Update existing audience that wasn't explicitly referenced
          audienceId = existingExperiment.targetAudience.id

          await tx.experimentTargetAudience.update({
            where: { id: audienceId },
            data: {
              percentage: data.targetAudience.percentage,
              updatedAt: new Date(),
            },
          })
        } else {
          // Create new audience
          const audience = await tx.experimentTargetAudience.create({
            data: {
              experimentId: id,
              percentage: data.targetAudience.percentage,
            },
          })

          audienceId = audience.id
        }

        // Update audience filters if provided
        if (data.targetAudience.filters && data.targetAudience.filters.length > 0) {
          for (const filter of data.targetAudience.filters) {
            if (filter.id) {
              // Update existing filter
              if (filter.isDeleted) {
                // Soft delete the filter
                await tx.experimentAudienceFilter.update({
                  where: { id: filter.id },
                  data: {
                    isDeleted: true,
                    updatedAt: new Date(),
                  },
                })
              } else {
                // Update the filter
                await tx.experimentAudienceFilter.update({
                  where: { id: filter.id },
                  data: {
                    attribute: filter.attribute,
                    operator: filter.operator,
                    value: filter.value,
                    updatedAt: new Date(),
                  },
                })
              }
            } else {
              // Create new filter
              await tx.experimentAudienceFilter.create({
                data: {
                  targetAudienceId: audienceId,
                  attribute: filter.attribute,
                  operator: filter.operator,
                  value: filter.value,
                },
              })
            }
          }
        }
      }

      // Update metrics if provided
      if (data.metrics && data.metrics.length > 0) {
        for (const metric of data.metrics) {
          if (metric.id) {
            // Update existing metric
            if (metric.isDeleted) {
              // Soft delete the metric
              await tx.experimentMetric.update({
                where: { id: metric.id },
                data: {
                  isDeleted: true,
                  updatedAt: new Date(),
                },
              })
            } else {
              // Update the metric
              await tx.experimentMetric.update({
                where: { id: metric.id },
                data: {
                  name: metric.name,
                  description: metric.description || "",
                  type: metric.type,
                  goal: metric.goal || "MAXIMIZE",
                  primary: metric.primary || false,
                  updatedAt: new Date(),
                },
              })
            }
          } else {
            // Create new metric
            await tx.experimentMetric.create({
              data: {
                experimentId: id,
                name: metric.name,
                description: metric.description || "",
                type: metric.type,
                goal: metric.goal || "MAXIMIZE",
                primary: metric.primary || false,
              },
            })
          }
        }
      }

      // Return the updated experiment with all relations
      return tx.experiment.findUnique({
        where: { id },
        include: {
          variants: {
            where: { isDeleted: false },
          },
          metrics: {
            where: { isDeleted: false },
          },
          targetAudience: {
            include: {
              filters: {
                where: { isDeleted: false },
              },
            },
          },
        },
      })
    })

    // Track metrics
    metricsService.incrementCounter("experiments_updated_total", 1, {
      experiment_id: id,
      user_role: session.user.role,
      status: data.status || existingExperiment.status,
    })

    // Log the update for audit purposes
    await AuditLogger.log(
      {
        action: AuditAction.UPDATE,
        resource: AuditResource.EXPERIMENT,
        resourceId: id,
        description: `Updated experiment: ${existingExperiment.name}`,
        userId: session.user.id,
        metadata: {
          experimentName: existingExperiment.name,
          updatedFields: Object.keys(data),
        },
      },
      request,
    )

    return NextResponse.json(updatedExperiment)
  } catch (error) {
    console.error(`Error updating experiment:`, error)

    // Track error metrics
    metricsService.incrementCounter("api_errors_total", 1, {
      endpoint: "/api/experiments/[id]",
      method: "PATCH",
      error_type: error instanceof Error ? error.name : "unknown",
    })

    return NextResponse.json(
      { error: "Failed to update experiment", message: error instanceof Error ? error.message : String(error) },
      { status: 500 },
    )
  }
}

/**
 * DELETE /api/experiments/[id]
 * Delete a specific experiment
 */
export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    const id = params.id

    // Check authentication
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get the experiment to check permissions
    const experiment = await prisma.experiment.findUnique({
      where: { id },
    })

    if (!experiment) {
      return NextResponse.json({ error: "Experiment not found" }, { status: 404 })
    }

    // Check permissions
    const isAdmin = session.user.role === "ADMIN"
    const isOwner = experiment.createdById === session.user.id

    if (!isAdmin && !isOwner) {
      return NextResponse.json(
        { error: "Forbidden: You do not have permission to delete this experiment" },
        { status: 403 },
      )
    }

    // Parse query parameters
    const url = new URL(request.url)
    const hardDelete = url.searchParams.get("hardDelete") === "true"

    // Only admins can perform hard deletes
    if (hardDelete && !isAdmin) {
      return NextResponse.json({ error: "Forbidden: Only administrators can perform hard deletes" }, { status: 403 })
    }

    if (hardDelete) {
      // Hard delete - actually remove the data
      await prisma.$transaction([
        // Delete experiment metrics
        prisma.experimentMetric.deleteMany({
          where: { experimentId: id },
        }),

        // Delete audience filters
        prisma.experimentAudienceFilter.deleteMany({
          where: {
            targetAudience: {
              experimentId: id,
            },
          },
        }),

        // Delete target audience
        prisma.experimentTargetAudience.deleteMany({
          where: { experimentId: id },
        }),

        // Delete variants
        prisma.experimentVariant.deleteMany({
          where: { experimentId: id },
        }),

        // Delete experiment results
        prisma.experimentResult.deleteMany({
          where: { experimentId: id },
        }),

        // Finally delete the experiment
        prisma.experiment.delete({
          where: { id },
        }),
      ])
    } else {
      // Soft delete - just mark as deleted
      await prisma.experiment.update({
        where: { id },
        data: {
          status: "ARCHIVED",
          isDeleted: true,
          updatedAt: new Date(),
        },
      })
    }

    // Track metrics
    metricsService.incrementCounter("experiments_deleted_total", 1, {
      experiment_id: id,
      hard_delete: hardDelete,
      user_role: session.user.role,
    })

    // Log the deletion for audit purposes
    await AuditLogger.log(
      {
        action: hardDelete ? AuditAction.DELETE : AuditAction.UPDATE,
        resource: AuditResource.EXPERIMENT,
        resourceId: id,
        description: `${hardDelete ? "Hard" : "Soft"} deleted experiment: ${experiment.name}`,
        userId: session.user.id,
        metadata: {
          experimentName: experiment.name,
          hardDelete,
        },
      },
      request,
    )

    return NextResponse.json({
      success: true,
      message: `Experiment ${hardDelete ? "permanently deleted" : "archived"}`,
    })
  } catch (error) {
    console.error(`Error deleting experiment:`, error)

    // Track error metrics
    metricsService.incrementCounter("api_errors_total", 1, {
      endpoint: "/api/experiments/[id]",
      method: "DELETE",
      error_type: error instanceof Error ? error.name : "unknown",
    })

    return NextResponse.json(
      { error: "Failed to delete experiment", message: error instanceof Error ? error.message : String(error) },
      { status: 500 },
    )
  }
}

