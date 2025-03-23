import { NextResponse } from "next/server"
import { generatePwaInstallScript } from "@/lib/pwa/pwa-config"
import { metricsService } from "@/lib/observability/metrics"

/**
 * GET /api/pwa/install-script
 * Generate and serve the PWA installation script
 */
export async function GET(request: Request) {
  try {
    // Generate the PWA installation script
    const installScript = generatePwaInstallScript()

    // Track metrics
    metricsService.incrementCounter("pwa_install_script_requests_total", 1)

    // Return the script with the correct content type
    return new NextResponse(installScript, {
      headers: {
        "Content-Type": "application/javascript",
        "Cache-Control": "public, max-age=86400, stale-while-revalidate=604800",
      },
    })
  } catch (error) {
    console.error("Error generating PWA installation script:", error)

    // Track error metrics
    metricsService.incrementCounter("api_errors_total", 1, {
      endpoint: "/api/pwa/install-script",
      method: "GET",
      error_type: error instanceof Error ? error.name : "unknown",
    })

    return NextResponse.json({ error: "Failed to generate PWA installation script" }, { status: 500 })
  }
}

