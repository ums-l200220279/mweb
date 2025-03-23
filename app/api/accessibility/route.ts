import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { accessibilityChecker, AccessibilityLevel } from "@/lib/accessibility/accessibility-checker"
import { AuditLogger, AuditAction, AuditResource } from "@/lib/compliance/audit-logger"
import { z } from "zod"
import { metricsService } from "@/lib/observability/metrics"

// Schema for accessibility check request
const accessibilityCheckSchema = z.object({
  url: z.string().url(),
  level: z.enum([AccessibilityLevel.A, AccessibilityLevel.AA, AccessibilityLevel.AAA]).optional(),
  includeHtml: z.boolean().optional(),
})

// Schema for HTML content check request
const htmlCheckSchema = z.object({
  html: z.string(),
  path: z.string(),
  level: z.enum([AccessibilityLevel.A, AccessibilityLevel.AA, AccessibilityLevel.AAA]).optional(),
})

/**
 * POST /api/accessibility
 * Check accessibility compliance for a URL
 */
export async function POST(request: Request) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Parse and validate request body
    const body = await request.json()

    // Check if this is a URL check or HTML content check
    let validationResult
    let isHtmlCheck = false

    if (body.html) {
      validationResult = htmlCheckSchema.safeParse(body)
      isHtmlCheck = true
    } else {
      validationResult = accessibilityCheckSchema.safeParse(body)
    }

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
    const level = data.level || AccessibilityLevel.AA

    // Perform the accessibility check
    try {
      let result

      if (isHtmlCheck) {
        result = await accessibilityChecker.checkHtml(data.html, data.path, level)
      } else {
        result = await accessibilityChecker.checkUrl(data.url, level)
      }

      // Track metrics
      metricsService.incrementCounter("accessibility_checks_api_total", 1, {
        level,
        passed: result.passed.toString(),
        user_role: session.user.role,
      })

      // Log the check for audit purposes
      await AuditLogger.log(
        {
          action: AuditAction.CHECK,
          resource: AuditResource.ACCESSIBILITY,
          description: `User performed accessibility check: ${isHtmlCheck ? data.path : data.url}`,
          userId: session.user.id,
          metadata: {
            url: isHtmlCheck ? data.path : data.url,
            level,
            passed: result.passed,
            issueCount: result.summary.total,
          },
        },
        request,
      )

      return NextResponse.json(result)
    } catch (error) {
      console.error(`Error performing accessibility check:`, error)

      // Track error metrics
      metricsService.incrementCounter("accessibility_check_errors_api_total", 1, {
        level,
        user_role: session.user.role,
        error_type: error instanceof Error ? error.name : "unknown",
      })

      return NextResponse.json(
        {
          error: "Failed to perform accessibility check",
          message: error instanceof Error ? error.message : String(error),
        },
        { status: 500 },
      )
    }
  } catch (error) {
    console.error("Error in accessibility check API:", error)

    // Track error metrics
    metricsService.incrementCounter("api_errors_total", 1, {
      endpoint: "/api/accessibility",
      method: "POST",
      error_type: error instanceof Error ? error.name : "unknown",
    })

    return NextResponse.json({ error: "Failed to process accessibility check request" }, { status: 500 })
  }
}

/**
 * GET /api/accessibility
 * Get accessibility compliance report
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
    const reportUrl = url.searchParams.get("url")
    const level = (url.searchParams.get("level") as AccessibilityLevel) || AccessibilityLevel.AA

    if (!reportUrl) {
      return NextResponse.json({ error: "URL parameter is required" }, { status: 400 })
    }

    // Perform the accessibility check
    try {
      const result = await accessibilityChecker.checkUrl(reportUrl, level)

      // Track metrics
      metricsService.incrementCounter("accessibility_reports_api_total", 1, {
        level,
        passed: result.passed.toString(),
        user_role: session.user.role,
      })

      // Log the report for audit purposes
      await AuditLogger.log(
        {
          action: AuditAction.READ,
          resource: AuditResource.ACCESSIBILITY,
          description: `User generated accessibility report: ${reportUrl}`,
          userId: session.user.id,
          metadata: {
            url: reportUrl,
            level,
            passed: result.passed,
            issueCount: result.summary.total,
          },
        },
        request,
      )

      return NextResponse.json(result)
    } catch (error) {
      console.error(`Error generating accessibility report:`, error)

      // Track error metrics
      metricsService.incrementCounter("accessibility_report_errors_api_total", 1, {
        level,
        user_role: session.user.role,
        error_type: error instanceof Error ? error.name : "unknown",
      })

      return NextResponse.json(
        {
          error: "Failed to generate accessibility report",
          message: error instanceof Error ? error.message : String(error),
        },
        { status: 500 },
      )
    }
  } catch (error) {
    console.error("Error in accessibility report API:", error)

    // Track error metrics
    metricsService.incrementCounter("api_errors_total", 1, {
      endpoint: "/api/accessibility",
      method: "GET",
      error_type: error instanceof Error ? error.name : "unknown",
    })

    return NextResponse.json({ error: "Failed to process accessibility report request" }, { status: 500 })
  }
}

