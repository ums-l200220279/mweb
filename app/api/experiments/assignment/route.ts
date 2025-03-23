import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { prisma } from "@/lib/db"
import { AuditLogger, AuditAction, AuditResource } from "@/lib/compliance/audit-logger"
import { z } from "zod"
import { metricsService } from "@/lib/observability/metrics"

// Schema for experiment assignment request
const assignmentRequestSchema = z.object({
  experimentId: z.string(),
  userId: z.string().optional(),
  sessionId: z.string().optional(),
  context: z.record(z.any()).optional(),
  overrideVariantId: z.string().optional(),
})

/**
 * POST /api/experiments/assignment
 * Assign a user to an experiment variant
 */
export async function POST(request: Request) {
  try {
    // Check authentication - allow anonymous assignments with proper API key
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

    // Parse and validate request body
    const body = await request.json()

    const validationResult = assignmentRequestSchema.safeParse(body)
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

    // Ensure either userId or sessionId is provided
    if (!data.userId && !data.sessionId && !userId) {
      return NextResponse.json({ error: "Either userId or sessionId must be provided" }, { status: 400 })
    }

    // Use authenticated userId if not explicitly provided
    const effectiveUserId = data.userId || userId

    // Get the experiment
    const experiment = await prisma.experiment.findUnique({
      where: {
        id: data.experimentId,
        isDeleted: false,
      },
      include: {
        variants: {
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

    if (!experiment) {
      return NextResponse.json({ error: "Experiment not found" }, { status: 404 })
    }

    // Check if experiment is running
    if (experiment.status !== "RUNNING") {
      return NextResponse.json({ error: "Experiment is not running" }, { status: 400 })
    }

    // Check if there are any variants
    if (experiment.variants.length === 0) {
      return NextResponse.json({ error: "Experiment has no variants" }, { status: 400 })
    }

    // Check if user is already assigned to this experiment
    const existingAssignment = await prisma.experimentAssignment.findFirst({
      where: {
        experimentId: data.experimentId,
        OR: [{ userId: effectiveUserId }, { sessionId: data.sessionId }],
      },
    })

    if (existingAssignment) {
      // Get the assigned variant
      const variant = experiment.variants.find((v) => v.id === existingAssignment.variantId)

      if (!variant) {
        // If the assigned variant no longer exists, reassign
        await prisma.experimentAssignment.delete({
          where: { id: existingAssignment.id },
        })
      } else {
        // Track metrics
        metricsService.incrementCounter("experiment_assignments_total", 1, {
          experiment_id: data.experimentId,
          variant_id: existingAssignment.variantId,
          is_new: false,
        })

        return NextResponse.json({
          experimentId: data.experimentId,
          variantId: existingAssignment.variantId,
          variant,
          isNewAssignment: false,
        })
      }
    }

    // If override variant is provided and valid, use it
    if (data.overrideVariantId) {
      const overrideVariant = experiment.variants.find((v) => v.id === data.overrideVariantId)

      if (overrideVariant) {
        // Create assignment
        const assignment = await prisma.experimentAssignment.create({
          data: {
            experimentId: data.experimentId,
            variantId: overrideVariant.id,
            userId: effectiveUserId,
            sessionId: data.sessionId,
            context: data.context || {},
            isOverride: true,
          },
        })

        // Track metrics
        metricsService.incrementCounter("experiment_assignments_total", 1, {
          experiment_id: data.experimentId,
          variant_id: overrideVariant.id,
          is_new: true,
          is_override: true,
        })

        // Log the assignment for audit purposes
        await AuditLogger.log(
          {
            action: AuditAction.CREATE,
            resource: AuditResource.EXPERIMENT_ASSIGNMENT,
            resourceId: assignment.id,
            description: `Assigned user to experiment variant (override): ${experiment.name}`,
            userId: effectiveUserId || "anonymous",
            metadata: {
              experimentId: data.experimentId,
              variantId: overrideVariant.id,
              isOverride: true,
            },
          },
          request,
        )

        return NextResponse.json({
          experimentId: data.experimentId,
          variantId: overrideVariant.id,
          variant: overrideVariant,
          isNewAssignment: true,
          isOverride: true,
        })
      }
    }

    // Check if user is eligible for the experiment based on targeting rules
    let isEligible = true

    if (experiment.targetAudience) {
      // Check percentage rollout
      const percentage = experiment.targetAudience.percentage

      if (percentage < 100) {
        // Generate a consistent hash based on userId or sessionId
        const idForHashing = effectiveUserId || data.sessionId

        if (idForHashing) {
          // Generate a hash value between 0-99
          const hash = generateConsistentHash(idForHashing + data.experimentId) % 100

          // If hash is greater than or equal to percentage, user is not eligible
          if (hash >= percentage) {
            isEligible = false
          }
        }
      }

      // Check audience filters
      if (isEligible && experiment.targetAudience.filters && experiment.targetAudience.filters.length > 0) {
        // User must match all filters to be eligible
        isEligible = experiment.targetAudience.filters.every((filter) => {
          const contextValue = data.context?.[filter.attribute]

          // If the attribute doesn't exist in the context, filter doesn't match
          if (contextValue === undefined) {
            return false
          }

          switch (filter.operator) {
            case "equals":
              return contextValue === filter.value

            case "not_equals":
              return contextValue !== filter.value

            case "contains":
              return String(contextValue).includes(filter.value)

            case "not_contains":
              return !String(contextValue).includes(filter.value)

            case "in":
              return filter.value
                .split(",")
                .map((v) => v.trim())
                .includes(String(contextValue))

            case "not_in":
              return !filter.value
                .split(",")
                .map((v) => v.trim())
                .includes(String(contextValue))

            case "greater_than":
              return Number.parseFloat(contextValue) > Number.parseFloat(filter.value)

            case "less_than":
              return Number.parseFloat(contextValue) < Number.parseFloat(filter.value)

            default:
              return false
          }
        })
      }
    }

    // If user is not eligible, return control variant
    if (!isEligible) {
      // Find control variant (usually the first one)
      const controlVariant = experiment.variants[0]

      // Create assignment
      const assignment = await prisma.experimentAssignment.create({
        data: {
          experimentId: data.experimentId,
          variantId: controlVariant.id,
          userId: effectiveUserId,
          sessionId: data.sessionId,
          context: data.context || {},
          isControl: true,
        },
      })

      // Track metrics
      metricsService.incrementCounter("experiment_assignments_total", 1, {
        experiment_id: data.experimentId,
        variant_id: controlVariant.id,
        is_new: true,
        is_control: true,
        reason: "not_eligible",
      })

      // Log the assignment for audit purposes
      await AuditLogger.log(
        {
          action: AuditAction.CREATE,
          resource: AuditResource.EXPERIMENT_ASSIGNMENT,
          resourceId: assignment.id,
          description: `Assigned user to control variant (not eligible): ${experiment.name}`,
          userId: effectiveUserId || "anonymous",
          metadata: {
            experimentId: data.experimentId,
            variantId: controlVariant.id,
            isControl: true,
            reason: "not_eligible",
          },
        },
        request,
      )

      return NextResponse.json({
        experimentId: data.experimentId,
        variantId: controlVariant.id,
        variant: controlVariant,
        isNewAssignment: true,
        isControl: true,
        reason: "not_eligible",
      })
    }

    // Randomly assign user to a variant based on weights
    const selectedVariant = selectVariantByWeight(experiment.variants)

    // Create assignment
    const assignment = await prisma.experimentAssignment.create({
      data: {
        experimentId: data.experimentId,
        variantId: selectedVariant.id,
        userId: effectiveUserId,
        sessionId: data.sessionId,
        context: data.context || {},
      },
    })

    // Track metrics
    metricsService.incrementCounter("experiment_assignments_total", 1, {
      experiment_id: data.experimentId,
      variant_id: selectedVariant.id,
      is_new: true,
    })

    // Log the assignment for audit purposes
    await AuditLogger.log(
      {
        action: AuditAction.CREATE,
        resource: AuditResource.EXPERIMENT_ASSIGNMENT,
        resourceId: assignment.id,
        description: `Assigned user to experiment variant: ${experiment.name}`,
        userId: effectiveUserId || "anonymous",
        metadata: {
          experimentId: data.experimentId,
          variantId: selectedVariant.id,
        },
      },
      request,
    )

    return NextResponse.json({
      experimentId: data.experimentId,
      variantId: selectedVariant.id,
      variant: selectedVariant,
      isNewAssignment: true,
    })
  } catch (error) {
    console.error("Error assigning experiment variant:", error)

    // Track error metrics
    metricsService.incrementCounter("api_errors_total", 1, {
      endpoint: "/api/experiments/assignment",
      method: "POST",
      error_type: error instanceof Error ? error.name : "unknown",
    })

    return NextResponse.json(
      { error: "Failed to assign experiment variant", message: error instanceof Error ? error.message : String(error) },
      { status: 500 },
    )
  }
}

/**
 * Generate a consistent hash for a string
 */
function generateConsistentHash(input: string): number {
  let hash = 0

  for (let i = 0; i < input.length; i++) {
    const char = input.charCodeAt(i)
    hash = (hash << 5) - hash + char
    hash = hash & hash // Convert to 32bit integer
  }

  // Ensure positive value
  return Math.abs(hash)
}

/**
 * Select a variant based on weights
 */
function selectVariantByWeight(variants: any[]): any {
  // Calculate total weight
  const totalWeight = variants.reduce((sum, variant) => sum + variant.weight, 0)

  // If total weight is 0, return random variant
  if (totalWeight === 0) {
    return variants[Math.floor(Math.random() * variants.length)]
  }

  // Generate random number between 0 and total weight
  const random = Math.random() * totalWeight

  // Select variant based on weight
  let cumulativeWeight = 0

  for (const variant of variants) {
    cumulativeWeight += variant.weight

    if (random < cumulativeWeight) {
      return variant
    }
  }

  // Fallback to last variant
  return variants[variants.length - 1]
}

/**
 * GET /api/experiments/assignment
 * Get all assignments for the current user
 */
export async function GET(request: Request) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const userId = session.user.id

    // Parse query parameters
    const url = new URL(request.url)
    const experimentId = url.searchParams.get("experimentId")
    const sessionId = url.searchParams.get("sessionId")
    const includeInactive = url.searchParams.get("includeInactive") === "true"

    // Build query filters
    const whereClause: any = {
      userId,
    }

    if (experimentId) {
      whereClause.experimentId = experimentId
    }

    if (sessionId) {
      whereClause.sessionId = sessionId
    }

    if (!includeInactive) {
      whereClause.experiment = {
        status: "RUNNING",
        isDeleted: false,
      }
    }

    // Get assignments
    const assignments = await prisma.experimentAssignment.findMany({
      where: whereClause,
      include: {
        experiment: {
          select: {
            id: true,
            name: true,
            description: true,
            status: true,
          },
        },
        variant: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    })

    // Track metrics
    metricsService.incrementCounter("experiment_assignments_views_total", 1, {
      user_id: userId,
    })

    return NextResponse.json(assignments)
  } catch (error) {
    console.error("Error fetching experiment assignments:", error)

    // Track error metrics
    metricsService.incrementCounter("api_errors_total", 1, {
      endpoint: "/api/experiments/assignment",
      method: "GET",
      error_type: error instanceof Error ? error.name : "unknown",
    })

    return NextResponse.json({ error: "Failed to fetch experiment assignments" }, { status: 500 })
  }
}

