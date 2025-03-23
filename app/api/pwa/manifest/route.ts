import { NextResponse } from "next/server"
import { generateWebManifest, defaultPwaConfig } from "@/lib/pwa/pwa-config"
import { metricsService } from "@/lib/observability/metrics"

/**
 * GET /api/pwa/manifest
 * Generate and serve the web manifest
 */
export async function GET(request: Request) {
  try {
    // Generate the web manifest
    const manifest = generateWebManifest(defaultPwaConfig)

    // Track metrics
    metricsService.incrementCounter("pwa_manifest_requests_total", 1)

    // Return the manifest with the correct content type
    return new NextResponse(manifest, {
      headers: {
        "Content-Type": "application/manifest+json",
        "Cache-Control": "public, max-age=86400, stale-while-revalidate=604800",
      },
    })
  } catch (error) {
    console.error("Error generating web manifest:", error)

    // Track error metrics
    metricsService.incrementCounter("api_errors_total", 1, {
      endpoint: "/api/pwa/manifest",
      method: "GET",
      error_type: error instanceof Error ? error.name : "unknown",
    })

    return NextResponse.json({ error: "Failed to generate web manifest" }, { status: 500 })
  }
}

