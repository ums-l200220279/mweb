import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { rollbackManager, DeploymentStatus, RollbackTrigger } from "@/lib/deployment/rollback-manager"
import { AuditLogger, AuditAction, AuditResource } from "@/lib/compliance/audit-logger"
import { z } from "zod"
import { metricsService } from "@/lib/observability/metrics"

// Schema for deployment registration
const deploymentSchema = z.object({
  id: z.string(),
  version: z.string(),
  commitSha: z.string(),
  environment: z.string(),
  status: z.enum([
    DeploymentStatus.PENDING,
    DeploymentStatus.IN_PROGRESS,
    DeploymentStatus.COMPLETED,
    DeploymentStatus.FAILED,
    DeploymentStatus.ROLLED_BACK,
  ]),
  startTime: z.string().transform((str) => new Date(str)),
  endTime: z
    .string()
    .optional()
    .transform((str) => (str ? new Date(str) : undefined)),
  features: z.array(z.string()),
  metadata: z.record(z.any()),
})

// Schema for deployment status update
const deploymentStatusSchema = z.object({
  deploymentId: z.string(),
  status: z.enum([
    DeploymentStatus.PENDING,
    DeploymentStatus.IN_PROGRESS,
    DeploymentStatus.COMPLETED,
    DeploymentStatus.FAILED,
    DeploymentStatus.ROLLED_BACK,
  ]),
})

// Schema for deployment rollback
const deploymentRollbackSchema = z.object({
  deploymentId: z.string(),
  trigger: z.enum([RollbackTrigger.MANUAL, RollbackTrigger.AUTOMATIC, RollbackTrigger.SCHEDULED]),
  triggeredBy: z.string().optional(),
})

/**
 * GET /api/deployments
 * Get all deployments
 */
export async function GET(request: Request) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Only admins and operators can access deployments
    if (session.user.role !== "ADMIN" && session.user.role !== "OPERATOR") {
      return NextResponse.json({ error: "Forbidden: Insufficient permissions" }, { status: 403 })
    }

    // Parse query parameters
    const url = new URL(request.url)
    const environment = url.searchParams.get("environment")
    const status = url.searchParams.get("status")

    // Get all deployments
    const deployments = await rollbackManager.getAllDeployments()

    // Filter deployments if needed
    let filteredDeployments = deployments

    if (environment) {
      filteredDeployments = filteredDeployments.filter((deployment) => deployment.environment === environment)
    }

    if (status) {
      filteredDeployments = filteredDeployments.filter((deployment) => deployment.status === status)
    }

    // Sort deployments by start time (newest first)
    filteredDeployments.sort((a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime())

    // Track metrics
    metricsService.incrementCounter("api_requests_total", 1, {
      endpoint: "/api/deployments",
      method: "GET",
      user_role: session.user.role,
    })

    // Log the access for audit purposes
    await AuditLogger.log(
      {
        action: AuditAction.READ,
        resource: AuditResource.DEPLOYMENT,
        description: "User accessed deployments list",
        userId: session.user.id,
        metadata: {
          environment,
          status,
        },
      },
      request,
    )

    return NextResponse.json(filteredDeployments)
  } catch (error) {
    console.error("Error fetching deployments:", error)

    // Track error metrics
    metricsService.incrementCounter("api_errors_total", 1, {
      endpoint: "/api/deployments",
      method: "GET",
      error_type: error instanceof Error ? error.name : "unknown",
    })

    return NextResponse.json({ error: "Failed to fetch deployments" }, { status: 500 })
  }
}

/**
 * POST /api/deployments
 * Register a new deployment
 */
export async function POST(request: Request) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Only admins and operators can register deployments
    if (session.user.role !== "ADMIN" && session.user.role !== "OPERATOR") {
      return NextResponse.json({ error: "Forbidden: Insufficient permissions" }, { status: 403 })
    }

    // Parse and validate request body
    const body = await request.json()

    const validationResult = deploymentSchema.safeParse(body)
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

    // Register the deployment
    try {
      const deployment = await rollbackManager.registerDeployment(data)

      // Track metrics
      metricsService.incrementCounter("deployments_registered_api_total", 1, {
        environment: data.environment,
        status: data.status,
        user_role: session.user.role,
      })

      // Log the registration for audit purposes
      await AuditLogger.log(
        {
          action: AuditAction.CREATE,
          resource: AuditResource.DEPLOYMENT,
          resourceId: data.id,
          description: `User registered deployment: ${data.version}`,
          userId: session.user.id,
          metadata: {
            deploymentId: data.id,
            version: data.version,
            commitSha: data.commitSha,
            environment: data.environment,
            status: data.status,
          },
        },
        request,
      )

      return NextResponse.json(deployment, { status: 201 })
    } catch (error) {
      console.error(`Error registering deployment:`, error)

      // Track error metrics
      metricsService.incrementCounter("deployment_registration_errors_total", 1, {
        user_role: session.user.role,
        error_type: error instanceof Error ? error.name : "unknown",
      })

      return NextResponse.json(
        { error: "Failed to register deployment", message: error instanceof Error ? error.message : String(error) },
        { status: 500 },
      )
    }
  } catch (error) {
    console.error("Error in deployment registration API:", error)

    // Track error metrics
    metricsService.incrementCounter("api_errors_total", 1, {
      endpoint: "/api/deployments",
      method: "POST",
      error_type: error instanceof Error ? error.name : "unknown",
    })

    return NextResponse.json({ error: "Failed to process deployment registration request" }, { status: 500 })
  }
}

/**
 * PUT /api/deployments
 * Update deployment status
 */
export async function PUT(request: Request) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Only admins and operators can update deployments
    if (session.user.role !== "ADMIN" && session.user.role !== "OPERATOR") {
      return NextResponse.json({ error: "Forbidden: Insufficient permissions" }, { status: 403 })
    }

    // Parse and validate request body
    const body = await request.json()

    const validationResult = deploymentStatusSchema.safeParse(body)
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

    // Update the deployment status
    try {
      const updatedDeployment = await rollbackManager.updateDeploymentStatus(data.deploymentId, data.status)

      // Track metrics
      metricsService.incrementCounter("deployment_status_updates_api_total", 1, {
        deployment_id: data.deploymentId,
        status: data.status,
        user_role: session.user.role,
      })

      // Log the update for audit purposes
      await AuditLogger.log(
        {
          action: AuditAction.UPDATE,
          resource: AuditResource.DEPLOYMENT,
          resourceId: data.deploymentId,
          description: `User updated deployment status: ${deployment.version} -> ${data.status}`,
          userId: session.user.id,
          metadata: {
            deploymentId: data.deploymentId,
            version: deployment.version,
            oldStatus: deployment.status,
            newStatus: data.status,
          },
        },
        request,
      )

      return NextResponse.json(updatedDeployment)
    } catch (error) {
      console.error(`Error updating deployment status:`, error)

      // Track error metrics
      metricsService.incrementCounter("deployment_status_update_errors_total", 1, {
        deployment_id: data.deploymentId,
        status: data.status,
        user_role: session.user.role,
        error_type: error instanceof Error ? error.name : "unknown",
      })

      return NextResponse.json(
        {
          error: "Failed to update deployment status",
          message: error instanceof Error ? error.message : String(error),
        },
        { status: 500 },
      )
    }
  } catch (error) {
    console.error("Error in deployment status update API:", error)

    // Track error metrics
    metricsService.incrementCounter("api_errors_total", 1, {
      endpoint: "/api/deployments",
      method: "PUT",
      error_type: error instanceof Error ? error.name : "unknown",
    })

    return NextResponse.json({ error: "Failed to process deployment status update request" }, { status: 500 })
  }
}

