import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { HIPAACompliance } from "@/lib/compliance/hipaa-compliance"
import { AuditLogger } from "@/lib/audit/audit-logger"

export async function GET(req: Request) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Only admins can access compliance reports
    if (session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    // Parse query parameters
    const url = new URL(req.url)
    const startDateParam = url.searchParams.get("startDate")
    const endDateParam = url.searchParams.get("endDate")

    // Validate parameters
    if (!startDateParam || !endDateParam) {
      return NextResponse.json({ error: "Missing required parameters: startDate and endDate" }, { status: 400 })
    }

    const startDate = new Date(startDateParam)
    const endDate = new Date(endDateParam)

    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
      return NextResponse.json({ error: "Invalid date format" }, { status: 400 })
    }

    // Generate compliance report
    const report = await HIPAACompliance.generateComplianceReport(startDate, endDate)

    // Log this access
    await AuditLogger.log({
      userId: session.user.id,
      action: "READ",
      resource: "COMPLIANCE_REPORT",
      details: {
        startDate,
        endDate,
      },
      ip: req.headers.get("x-forwarded-for") || undefined,
      userAgent: req.headers.get("user-agent") || undefined,
    })

    return NextResponse.json(report)
  } catch (error) {
    console.error("Error generating compliance report:", error)
    return NextResponse.json({ error: "Failed to generate compliance report" }, { status: 500 })
  }
}

