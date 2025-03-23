import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { disasterRecoveryService } from "@/lib/disaster-recovery/recovery-plan"
import { AuditLogger, AuditAction, AuditResource } from "@/lib/compliance/audit-logger"

export async function POST(request: Request, { params }: { params: { id: string } }) {
  try {
    // Check authentication for admin access
    const session = await getServerSession(authOptions)
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    const planId = params.id

    // Execute the recovery plan
    const plan = await disasterRecoveryService.executeRecoveryPlan(planId, session.user.id)

    // Log the execution for audit purposes
    await AuditLogger.log(
      {
        action: AuditAction.UPDATE,
        resource: AuditResource.RECOVERY_PLAN,
        resourceId: planId,
        description: `Executed disaster recovery plan`,
        userId: session.user.id,
      },
      request,
    )

    return NextResponse.json(plan)
  } catch (error) {
    console.error("Error executing recovery plan:", error)
    return NextResponse.json(
      { error: "Failed to execute recovery plan", message: error instanceof Error ? error.message : String(error) },
      { status: 500 },
    )
  }
}

