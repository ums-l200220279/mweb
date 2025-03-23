import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { bcpManager } from "@/lib/continuity/business-continuity-plan"
import { AuditLogger, AuditAction, AuditResource } from "@/lib/compliance/audit-logger"
import { z } from "zod"
import { metricsService } from "@/lib/observability/metrics"

// Schema for BCP plan execution request
const executePlanSchema = z.object({
  planId: z.string(),
  triggeredBy: z.string().optional(),
  metadata: z.record(z.any()).optional(),
})

// Schema for BCP plan cancellation request
const cancelPlanSchema = z.object({
  planId: z.string(),
  reason: z.string().optional(),
})

/**
 * GET /api/continuity/bcp
 * Get all BCP plans
 */
export async function GET(request: Request) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Only admins and operators can access BCP plans
    if (session.user.role !== "ADMIN" && session.user.role !== "OPERATOR") {
      return NextResponse.json({ error: "Forbidden: Insufficient permissions" }, { status: 403 })
    }

    // Parse query parameters
    const url = new URL(request.url)
    const status = url.searchParams.get("status")
    const priority = url.searchParams.get("priority")

    // Get all plans
    const plans = await bcpManager.getAllPlans()

    // Filter plans if needed
    let filteredPlans = plans

    if (status) {
      filteredPlans = filteredPlans.filter((plan) => plan.status === status)
    }

    if (priority) {
      filteredPlans = filteredPlans.filter((plan) => plan.priority === priority)
    }

    // Track metrics
    metricsService.incrementCounter("api_requests_total", 1, {
      endpoint: "/api/continuity/bcp",
      method: "GET",
      user_role: session.user.role,
    })

    // Log the access for audit purposes
    await AuditLogger.log(
      {
        action: AuditAction.READ,
        resource: AuditResource.BCP,
        description: "User accessed BCP plans",
        userId: session.user.id,
        metadata: {
          status,
          priority,
        },
      },
      request,
    )

    return NextResponse.json(filteredPlans)
  } catch (error) {
    console.error("Error fetching BCP plans:", error)

    // Track error metrics
    metricsService.incrementCounter("api_errors_total", 1, {
      endpoint: "/api/continuity/bcp",
      method: "GET",
      error_type: error instanceof Error ? error.name : "unknown",
    })

    return NextResponse.json({ error: "Failed to fetch BCP plans" }, { status: 500 })
  }
}

/**
 * POST /api/continuity/bcp
 * Execute a BCP plan
 */
export async function POST(request: Request) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Only admins and operators can execute BCP plans
    if (session.user.role !== "ADMIN" && session.user.role !== "OPERATOR") {
      return NextResponse.json({ error: "Forbidden: Insufficient permissions" }, { status: 403 })
    }

    // Parse and validate request body
    const body = await request.json()

    const validationResult = executePlanSchema.safeParse(body)
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

    // Get the plan
    const plan = await bcpManager.getPlan(data.planId)
    if (!plan) {
      return NextResponse.json({ error: "BCP plan not found" }, { status: 404 })
    }

    // Execute the plan
    try {
      const executedPlan = await bcpManager.executePlan(data.planId, data.triggeredBy || session.user.id)

      // Track metrics
      metricsService.incrementCounter("bcp_plan_executions_api_total", 1, {
        plan_id: data.planId,
        user_role: session.user.role,
      })

      // Log the execution for audit purposes
      await AuditLogger.log(
        {
          action: AuditAction.EXECUTE,
          resource: AuditResource.BCP,
          resourceId: data.planId,
          description: `User executed BCP plan: ${plan.name}`,
          userId: session.user.id,
          metadata: {
            planId: data.planId,
            planName: plan.name,
            triggeredBy: data.triggeredBy || session.user.id,
            metadata: data.metadata,
          },
        },
        request,
      )

      return NextResponse.json(executedPlan)
    } catch (error) {
      console.error(`Error executing BCP plan ${data.planId}:`, error)

      // Track error metrics
      metricsService.incrementCounter("bcp_plan_execution_errors_total", 1, {
        plan_id: data.planId,
        user_role: session.user.role,
        error_type: error instanceof Error ? error.name : "unknown",
      })

      return NextResponse.json(
        { error: "Failed to execute BCP plan", message: error instanceof Error ? error.message : String(error) },
        { status: 500 },
      )
    }
  } catch (error) {
    console.error("Error in BCP plan execution API:", error)

    // Track error metrics
    metricsService.incrementCounter("api_errors_total", 1, {
      endpoint: "/api/continuity/bcp",
      method: "POST",
      error_type: error instanceof Error ? error.name : "unknown",
    })

    return NextResponse.json({ error: "Failed to process BCP plan execution request" }, { status: 500 })
  }
}

/**
 * PUT /api/continuity/bcp
 * Cancel a BCP plan execution
 */
export async function PUT(request: Request) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Only admins and operators can cancel BCP plans
    if (session.user.role !== "ADMIN" && session.user.role !== "OPERATOR") {
      return NextResponse.json({ error: "Forbidden: Insufficient permissions" }, { status: 403 })
    }

    // Parse and validate request body
    const body = await request.json()

    const validationResult = cancelPlanSchema.safeParse(body)
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

    // Get the plan
    const plan = await bcpManager.getPlan(data.planId)
    if (!plan) {
      return NextResponse.json({ error: "BCP plan not found" }, { status: 404 })
    }

    // Cancel the plan
    try {
      const cancelledPlan = await bcpManager.cancelPlan(
        data.planId,
        data.reason || `Cancelled by ${session.user.name || session.user.id}`,
      )

      // Track metrics
      metricsService.incrementCounter("bcp_plan_cancellations_api_total", 1, {
        plan_id: data.planId,
        user_role: session.user.role,
      })

      // Log the cancellation for audit purposes
      await AuditLogger.log(
        {
          action: AuditAction.CANCEL,
          resource: AuditResource.BCP,
          resourceId: data.planId,
          description: `User cancelled BCP plan: ${plan.name}`,
          userId: session.user.id,
          metadata: {
            planId: data.planId,
            planName: plan.name,
            reason: data.reason,
          },
        },
        request,
      )

      return NextResponse.json(cancelledPlan)
    } catch (error) {
      console.error(`Error cancelling BCP plan ${data.planId}:`, error)

      // Track error metrics
      metricsService.incrementCounter("bcp_plan_cancellation_errors_total", 1, {
        plan_id: data.planId,
        user_role: session.user.role,
        error_type: error instanceof Error ? error.name : "unknown",
      })

      return NextResponse.json(
        { error: "Failed to cancel BCP plan", message: error instanceof Error ? error.message : String(error) },
        { status: 500 },
      )
    }
  } catch (error) {
    console.error("Error in BCP plan cancellation API:", error)

    // Track error metrics
    metricsService.incrementCounter("api_errors_total", 1, {
      endpoint: "/api/continuity/bcp",
      method: "PUT",
      error_type: error instanceof Error ? error.name : "unknown",
    })

    return NextResponse.json({ error: "Failed to process BCP plan cancellation request" }, { status: 500 })
  }
}

