import { NextResponse } from "next/server"
import { generateServiceWorker } from "@/lib/pwa/pwa-config"
import { metricsService } from "@/lib/observability/metrics"

/**
 * GET /api/pwa/service-worker
 * Generate and serve the service worker
 */
export async function GET(request: Request) {
  try {
    // Define assets to cache
    const assetsToCache = [
      "/favicon.ico",
      "/logo.svg",
      "/images/placeholder.png",
      "/fonts/inter.woff2",
      "/styles/tailwind.css",
      "/scripts/main.js",
      "/offline-api.json",
    ]

    // Generate the service worker
    const serviceWorker = generateServiceWorker("memoright-v1", assetsToCache)

    // Track metrics
    metricsService.incrementCounter("pwa_service_worker_requests_total", 1)

    // Return the service worker with the correct content type
    return new NextResponse(serviceWorker, {
      headers: {
        "Content-Type": "application/javascript",
        "Cache-Control": "no-cache, no-store, must-revalidate",
      },
    })
  } catch (error) {
    console.error("Error generating service worker:", error)

    // Track error metrics
    metricsService.incrementCounter("api_errors_total", 1, {
      endpoint: "/api/pwa/service-worker",
      method: "GET",
      error_type: error instanceof Error ? error.name : "unknown",
    })

    return NextResponse.json({ error: "Failed to generate service worker" }, { status: 500 })
  }
}

