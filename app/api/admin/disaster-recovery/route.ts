import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { disasterRecoveryService, DisasterType } from "@/lib/disaster-recovery/recovery-plan"
import { AuditLogger, AuditAction, AuditResource } from "@/lib/compliance/audit-logger"
import prisma from "@/lib/prisma"

export async function GET(request: Request) {
  try {
    // Check authentication for admin access
    const session = await getServerSession(authOptions)
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    // Get recovery plans from database
    const plans = await prisma.recoveryPlan.findMany({
      include: {
        steps: {
          orderBy: {
            order: "asc",
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    })

    // Log the access for audit purposes
    await AuditLogger.log(
      {
        action: AuditAction.READ,
        resource: AuditResource.RECOVERY_PLAN,
        description: "Admin user accessed disaster recovery plans",
        userId: session.user.id,
      },
      request,
    )

    return NextResponse.json(plans)
  } catch (error) {
    console.error("Error fetching recovery plans:", error)
    return NextResponse.json({ error: "Failed to fetch recovery plans" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    // Check authentication for admin access
    const session = await getServerSession(authOptions)
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    // Parse request body
    const body = await request.json()

    // Validate required fields
    if (!body.disasterType || !body.description) {
      return NextResponse.json({ error: "Missing required fields: disasterType, description" }, { status: 400 })
    }

    // Validate disaster type
    if (!Object.values(DisasterType).includes(body.disasterType)) {
      return NextResponse.json({ error: "Invalid disaster type" }, { status: 400 })
    }

    // Create recovery plan
    const plan = await disasterRecoveryService.createRecoveryPlan(
      body.disasterType,
      body.description,
      session.user.id,
      body.backupId,
    )

    // Log the creation for audit purposes
    await AuditLogger.log(
      {
        action: AuditAction.CREATE,
        resource: AuditResource.RECOVERY_PLAN,
        resourceId: plan.id,
        description: `Created disaster recovery plan for ${body.disasterType}`,
        userId: session.user.id,
        metadata: {
          disasterType: body.disasterType,
          backupId: body.backupId,
        },
      },
      request,
    )

    return NextResponse.json(plan)
  } catch (error) {
    console.error("Error creating recovery plan:", error)
    return NextResponse.json({ error: "Failed to create recovery plan" }, { status: 500 })
  }
}

