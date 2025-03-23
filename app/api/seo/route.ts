import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { seoOptimizer } from "@/lib/seo/seo-optimizer"
import { AuditLogger, AuditAction, AuditResource } from "@/lib/compliance/audit-logger"
import { z } from "zod"
import { metricsService } from "@/lib/observability/metrics"

// Schema for SEO check request
const seoCheckSchema = z.object({
  url: z.string().url(),
  includeHtml: z.boolean().optional(),
})

// Schema for HTML content check request
const htmlCheckSchema = z.object({
  html: z.string(),
  path: z.string(),
})

/**
 * POST /api/seo
 * Check SEO for a URL or HTML content
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
      validationResult = seoCheckSchema.safeParse(body)
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

    // Perform the SEO check
    try {
      let result

      if (isHtmlCheck) {
        result = await seoOptimizer.checkHtml(data.html, data.path)
      } else {
        result = await seoOptimizer.checkUrl(data.url)
      }

      // Track metrics
      metricsService.incrementCounter("seo_checks_api_total", 1, {
        passed: result.passed.toString(),
        score_range:
          result.score >= 90
            ? "90-100"
            : result.score >= 80
              ? "80-89"
              : result.score >= 70
                ? "70-79"
                : result.score >= 60
                  ? "60-69"
                  : "0-59",
        user_role: session.user.role,
      })

      // Log the check for audit purposes
      await AuditLogger.log(
        {
          action: AuditAction.CHECK,
          resource: AuditResource.SEO,
          description: `User performed SEO check: ${isHtmlCheck ? data.path : data.url}`,
          userId: session.user.id,
          metadata: {
            url: isHtmlCheck ? data.path : data.url,
            score: result.score,
            passed: result.passed,
            issueCount: result.summary.total,
          },
        },
        request,
      )

      return NextResponse.json(result)
    } catch (error) {
      console.error(`Error performing SEO check:`, error)

      // Track error metrics
      metricsService.incrementCounter("seo_check_errors_api_total", 1, {
        user_role: session.user.role,
        error_type: error instanceof Error ? error.name : "unknown",
      })

      return NextResponse.json(
        { error: "Failed to perform SEO check", message: error instanceof Error ? error.message : String(error) },
        { status: 500 },
      )
    }
  } catch (error) {
    console.error("Error in SEO check API:", error)

    // Track error metrics
    metricsService.incrementCounter("api_errors_total", 1, {
      endpoint: "/api/seo",
      method: "POST",
      error_type: error instanceof Error ? error.name : "unknown",
    })

    return NextResponse.json({ error: "Failed to process SEO check request" }, { status: 500 })
  }
}

/**
 * GET /api/seo
 * Get SEO report for a URL
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

    if (!reportUrl) {
      return NextResponse.json({ error: "URL parameter is required" }, { status: 400 })
    }

    // Perform the SEO check
    try {
      const result = await seoOptimizer.checkUrl(reportUrl)

      // Track metrics
      metricsService.incrementCounter("seo_reports_api_total", 1, {
        passed: result.passed.toString(),
        score_range:
          result.score >= 90
            ? "90-100"
            : result.score >= 80
              ? "80-89"
              : result.score >= 70
                ? "70-79"
                : result.score >= 60
                  ? "60-69"
                  : "0-59",
        user_role: session.user.role,
      })

      // Log the report for audit purposes
      await AuditLogger.log(
        {
          action: AuditAction.READ,
          resource: AuditResource.SEO,
          description: `User generated SEO report: ${reportUrl}`,
          userId: session.user.id,
          metadata: {
            url: reportUrl,
            score: result.score,
            passed: result.passed,
            issueCount: result.summary.total,
          },
        },
        request,
      )

      return NextResponse.json(result)
    } catch (error) {
      console.error(`Error generating SEO report:`, error)

      // Track error metrics
      metricsService.incrementCounter("seo_report_errors_api_total", 1, {
        user_role: session.user.role,
        error_type: error instanceof Error ? error.name : "unknown",
      })

      return NextResponse.json(
        { error: "Failed to generate SEO report", message: error instanceof Error ? error.message : String(error) },
        { status: 500 },
      )
    }
  } catch (error) {
    console.error("Error in SEO report API:", error)

    // Track error metrics
    metricsService.incrementCounter("api_errors_total", 1, {
      endpoint: "/api/seo",
      method: "GET",
      error_type: error instanceof Error ? error.name : "unknown",
    })

    return NextResponse.json({ error: "Failed to process SEO report request" }, { status: 500 })
  }
}

