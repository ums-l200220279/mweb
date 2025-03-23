/**
 * Deployment API untuk Memoright
 *
 * Endpoint untuk mengelola deployment aplikasi.
 *
 * @description Mengelola deployment aplikasi
 * @tags System
 * @security bearerAuth
 * @response {200} Operasi berhasil
 * @response {401} Tidak terautentikasi
 * @response {403} Tidak memiliki izin
 * @response {500} Terjadi kesalahan
 */

import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { logger } from "@/lib/logger"
import { z } from "zod"
import { validateRequest } from "@/app/api/validate"
import { deploymentPipeline, type DeploymentConfig } from "@/lib/devops/deployment-pipeline"
import { container } from "@/lib/architecture/dependency-injection"
import type { AuditService } from "@/lib/security/audit-service"

// Schema untuk deployment
const deploymentSchema = z.object({
  version: z.string(),
  environment: z.enum(["development", "staging", "production"]),
  releaseType: z.enum(["standard", "canary", "blue-green"]),
  canaryPercentage: z.number().min(1).max(100).optional(),
  features: z.array(z.string()),
  rollbackThreshold: z
    .object({
      errorRate: z.number().min(0).max(100).optional(),
      responseTime: z.number().min(0).optional(),
    })
    .optional(),
  approvers: z.array(z.string()).optional(),
})

// Schema untuk approval
const approvalSchema = z.object({
  deploymentId: z.string(),
  approved: z.boolean(),
  comments: z.string().optional(),
})

/**
 * Mendapatkan status deployment
 * GET /api/deployment
 */
export async function GET(req: NextRequest) {
  try {
    // Periksa autentikasi
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Periksa otorisasi
    if (session.user.role !== "admin" && session.user.role !== "devops") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    // Dapatkan status deployment
    const currentDeployment = deploymentPipeline.getCurrentDeployment()
    const deploymentHistory = deploymentPipeline.getDeploymentHistory()

    return NextResponse.json({
      current: currentDeployment,
      history: deploymentHistory,
    })
  } catch (error) {
    logger.error("Failed to get deployment status", error instanceof Error ? error : new Error(String(error)))

    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

/**
 * Memulai deployment baru
 * POST /api/deployment
 */
export async function POST(req: NextRequest) {
  try {
    // Periksa autentikasi
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Periksa otorisasi
    if (session.user.role !== "admin" && session.user.role !== "devops") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    // Validasi request body
    const validation = await validateRequest(req, deploymentSchema)

    if (!validation.success) {
      return validation.error
    }

    // Mulai deployment
    const deploymentConfig: DeploymentConfig = validation.data
    const deployment = await deploymentPipeline.startDeployment(deploymentConfig)

    // Catat audit event
    const auditService = container.resolve<AuditService>("auditService")
    await auditService.log({
      userId: session.user.id,
      action: "deployment_initiated",
      resource: "deployment",
      resourceId: deployment.id,
      details: {
        version: deploymentConfig.version,
        environment: deploymentConfig.environment,
        releaseType: deploymentConfig.releaseType,
      },
      status: "success",
    })

    return NextResponse.json(deployment)
  } catch (error) {
    logger.error("Failed to start deployment", error instanceof Error ? error : new Error(String(error)))

    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

/**
 * Menyetujui atau menolak deployment
 * PUT /api/deployment/approve
 */
export async function PUT(req: NextRequest) {
  try {
    // Periksa autentikasi
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Periksa otorisasi
    if (session.user.role !== "admin" && session.user.role !== "devops") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    // Validasi request body
    const validation = await validateRequest(req, approvalSchema)

    if (!validation.success) {
      return validation.error
    }

    const { deploymentId, approved, comments } = validation.data

    // Setujui atau tolak deployment
    const deployment = await deploymentPipeline.approveDeployment(session.user.id, deploymentId, approved, comments)

    return NextResponse.json(deployment)
  } catch (error) {
    logger.error("Failed to approve deployment", error instanceof Error ? error : new Error(String(error)))

    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

