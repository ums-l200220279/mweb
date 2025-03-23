import type { NextRequest, NextResponse } from "next/server"
import { metricsService } from "./metrics"

export async function httpMetricsMiddleware(
  req: NextRequest,
  next: () => Promise<NextResponse>,
): Promise<NextResponse> {
  const startTime = Date.now()
  const method = req.method
  const url = new URL(req.url)
  const path = url.pathname

  try {
    // Process the request
    const response = await next()

    // Record metrics
    const duration = (Date.now() - startTime) / 1000 // Convert to seconds
    const status = response.status

    // Increment request counter
    metricsService.incrementCounter("http_requests_total", 1, {
      method,
      path,
      status: status.toString(),
    })

    // Record request duration
    metricsService.observeHistogram("http_request_duration_seconds", duration, {
      method,
      path,
      status: status.toString(),
    })

    return response
  } catch (error) {
    // Record error metrics
    metricsService.incrementCounter("errors_total", 1, {
      type: "http",
      code: error instanceof Error ? error.name : "unknown",
    })

    // Re-throw the error
    throw error
  }
}

