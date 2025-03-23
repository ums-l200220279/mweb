import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { rollbackManager, RollbackTrigger } from "@/lib/deployment/rollback-manager"
import { AuditLogger, AuditAction, AuditResource } from "@/lib/compliance/audit-logger"
import { z } from "zod"
import { metricsService } from "@/lib/observability/metrics"

// Schema for deployment rollback
const deploymentRollbackSchema = z.object({
  deploymentId: z.string(),
  trigger: z.enum([RollbackTrigger.MANUAL, RollbackTrigger.AUTOMATIC, RollbackTrigger.SCHEDULED]),
  triggeredBy: z.string().optional(),
})

/**
 * POST /api/deployments/rollback
 * Rollback a deployment
 */
export async function POST(request: Request) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Only admins and operators can rollback deployments
    if (session.user.role !== "ADMIN" && session.user.role !== "OPERATOR") {
      return NextResponse.json({ error: "Forbidden: Insufficient permissions" }, { status: 403 })
    }

    // Parse and validate request body
    const body = await request.json()

    const validationResult = deploymentRollbackSchema.safeParse(body)
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

    // Get the deployment
    const deployment = await rollbackManager.getDeployment(data.deploymentId)
    if (!deployment) {
      return NextResponse.json({ error: "Deployment not found" }, { status: 404 })
    }

    // Rollback the deployment
    try {
      const rolledBackDeployment = await rollbackManager.rollbackDeployment(
        data.deploymentId,
        data.trigger,
        data.triggeredBy || session.user.id,
      )

      // Track metrics
      metricsService.incrementCounter("deployment_rollbacks_api_total", 1, {
        deployment_id: data.deploymentId,
        trigger: data.trigger,
        user_role: session.user.role,
      })

      // Log the rollback for audit purposes
      await AuditLogger.log(
        {
          action: AuditAction.ROLLBACK,
          resource: AuditResource.DEPLOYMENT,
          resourceId: data.deploymentId,
          description: `User initiated deployment rollback: ${deployment.version}`,
          userId: session.user.id,
          metadata: {
            deploymentId: data.deploymentId,
            version: deployment.version,
            environment: deployment.environment,
            trigger: data.trigger,
            triggeredBy: data.triggeredBy || session.user.id,
          },
        },
        request,
      )

      return NextResponse.json(rolledBackDeployment)
    } catch (error) {
      console.error(`Error rolling back deployment:`, error)

      // Track error metrics
      metricsService.incrementCounter("deployment_rollback_errors_total", 1, {
        deployment_id: data.deploymentId,
        trigger: data.trigger,
        user_role: session.user.role,
        error_type: error instanceof Error ? error.name : "unknown",
      })

      return NextResponse.json(
        { error: "Failed to rollback deployment", message: error instanceof Error ? error.message : String(error) },
        { status: 500 },
      )
    }
  } catch (error) {
    console.error("Error in deployment rollback API:", error)

    // Track error metrics
    metricsService.incrementCounter("api_errors_total", 1, {
      endpoint: "/api/deployments/rollback",
      method: "POST",
      error_type: error instanceof Error ? error.name : "unknown",
    })

    return NextResponse.json({ error: "Failed to process deployment rollback request" }, { status: 500 })
  }
}

/**
 * GET /api/deployments/rollback/health
 * Check deployment health
 */
export async function GET(request: Request) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Only admins and operators can check deployment health
    if (session.user.role !== "ADMIN" && session.user.role !== "OPERATOR") {
      return NextResponse.json({ error: "Forbidden: Insufficient permissions" }, { status: 403 })
    }

    // Parse query parameters
    const url = new URL(request.url)
    const deploymentId = url.searchParams.get("deploymentId")

    if (!deploymentId) {
      return NextResponse.json({ error: "Deployment ID is required" }, { status: 400 })
    }

    // Get the deployment
    const deployment = await rollbackManager.getDeployment(deploymentId)
    if (!deployment) {
      return NextResponse.json({ error: "Deployment not found" }, { status: 404 })
    }

    // Check deployment health
    try {
      const isHealthy = await rollbackManager.checkDeploymentHealth(deploymentId)

      // Track metrics
      metricsService.incrementCounter("deployment_health_checks_api_total", 1, {
        deployment_id: deploymentId,
        is_healthy: isHealthy,
        user_role: session.user.role,
      })

      // Log the health check for audit purposes
      await AuditLogger.log(
        {
          action: AuditAction.READ,
          resource: AuditResource.DEPLOYMENT,
          resourceId: deploymentId,
          description: `User checked deployment health: ${deployment.version}`,
          userId: session.user.id,
          metadata: {
            deploymentId,
            version: deployment.version,
            environment: deployment.environment,
            isHealthy,
          },
        },
        request,
      )

      return NextResponse.json({
        deploymentId,
        version: deployment.version,
        environment: deployment.environment,
        status: deployment.status,
        isHealthy,
        checkedAt: new Date(),
      })
    } catch (error) {
      console.error(`Error checking deployment health:`, error)

      // Track error metrics
      metricsService.incrementCounter("deployment_health_check_errors_total", 1, {
        deployment_id: deploymentId,
        user_role: session.user.role,
        error_type: error instanceof Error ? error.name : "unknown",
      })

      return NextResponse.json(
        { error: "Failed to check deployment health", message: error instanceof Error ? error.message : String(error) },
        { status: 500 },
      )
    }
  } catch (error) {
    console.error("Error in deployment health check API:", error)

    // Track error metrics
    metricsService.incrementCounter("api_errors_total", 1, {
      endpoint: "/api/deployments/rollback/health",
      method: "GET",
      error_type: error instanceof Error ? error.name : "unknown",
    })

    return NextResponse.json({ error: "Failed to process deployment health check request" }, { status: 500 })
  }
}

