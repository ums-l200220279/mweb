import { NextResponse } from "next/server"
import { generateOfflinePage } from "@/lib/pwa/pwa-config"
import { metricsService } from "@/lib/observability/metrics"

/**
 * GET /api/pwa/offline
 * Generate and serve the offline page
 */
export async function GET(request: Request) {
  try {
    // Generate the offline page
    const offlinePage = generateOfflinePage("Memoright")

    // Track metrics
    metricsService.incrementCounter("pwa_offline_page_requests_total", 1)

    // Return the offline page with the correct content type
    return new NextResponse(offlinePage, {
      headers: {
        "Content-Type": "text/html",
        "Cache-Control": "public, max-age=86400, stale-while-revalidate=604800",
      },
    })
  } catch (error) {
    console.error("Error generating offline page:", error)

    // Track error metrics
    metricsService.incrementCounter("api_errors_total", 1, {
      endpoint: "/api/pwa/offline",
      method: "GET",
      error_type: error instanceof Error ? error.name : "unknown",
    })

    return NextResponse.json({ error: "Failed to generate offline page" }, { status: 500 })
  }
}

