import { logger, performanceLogger } from "./logger"
import * as Sentry from "@sentry/nextjs"

/**
 * Performance monitoring utilities for Memoright
 */

// Interface for performance metrics
interface PerformanceMetrics {
  name: string
  startTime: number
  duration: number
  tags?: Record<string, string>
  data?: Record<string, any>
}

// Interface for resource timing
interface ResourceTiming {
  name: string
  initiatorType: string
  startTime: number
  responseEnd: number
  transferSize?: number
  decodedBodySize?: number
  duration: number
}

/**
 * Measure the execution time of a function
 * @param name Name of the measurement
 * @param fn Function to measure
 * @param tags Additional tags for the measurement
 * @returns Result of the function
 */
export async function measureAsync<T>(name: string, fn: () => Promise<T>, tags?: Record<string, string>): Promise<T> {
  const startTime = performance.now()

  try {
    // Start Sentry transaction if available
    const transaction = Sentry.startTransaction({
      name,
      op: "function",
    })

    // Execute the function
    const result = await fn()

    // Calculate duration
    const duration = performance.now() - startTime

    // Log performance metrics
    logPerformanceMetrics({
      name,
      startTime,
      duration,
      tags,
    })

    // Finish Sentry transaction
    transaction?.finish()

    return result
  } catch (error) {
    // Calculate duration even if there's an error
    const duration = performance.now() - startTime

    // Log performance metrics with error
    logPerformanceMetrics({
      name,
      startTime,
      duration,
      tags: {
        ...tags,
        error: "true",
      },
      data: {
        error: {
          message: error.message,
          stack: error.stack,
        },
      },
    })

    throw error
  }
}

/**
 * Measure the execution time of a synchronous function
 * @param name Name of the measurement
 * @param fn Function to measure
 * @param tags Additional tags for the measurement
 * @returns Result of the function
 */
export function measure<T>(name: string, fn: () => T, tags?: Record<string, string>): T {
  const startTime = performance.now()

  try {
    // Start Sentry transaction if available
    const transaction = Sentry.startTransaction({
      name,
      op: "function",
    })

    // Execute the function
    const result = fn()

    // Calculate duration
    const duration = performance.now() - startTime

    // Log performance metrics
    logPerformanceMetrics({
      name,
      startTime,
      duration,
      tags,
    })

    // Finish Sentry transaction
    transaction?.finish()

    return result
  } catch (error) {
    // Calculate duration even if there's an error
    const duration = performance.now() - startTime

    // Log performance metrics with error
    logPerformanceMetrics({
      name,
      startTime,
      duration,
      tags: {
        ...tags,
        error: "true",
      },
      data: {
        error: {
          message: error.message,
          stack: error.stack,
        },
      },
    })

    throw error
  }
}

/**
 * Create a performance measurement span
 * @param name Name of the span
 * @param tags Additional tags for the span
 * @returns Object with start and end methods
 */
export function createSpan(name: string, tags?: Record<string, string>) {
  const startTime = performance.now()
  let span: Sentry.Span | undefined

  // Start Sentry span if available
  if (Sentry.getCurrentHub().getScope()?.getTransaction()) {
    span = Sentry.getCurrentHub().getScope()?.getTransaction()?.startChild({
      op: "span",
      description: name,
    })
  }

  return {
    start: () => {
      // This is a no-op since we already started the span
      return
    },
    end: (data?: Record<string, any>) => {
      const duration = performance.now() - startTime

      // Log performance metrics
      logPerformanceMetrics({
        name,
        startTime,
        duration,
        tags,
        data,
      })

      // Finish Sentry span
      span?.finish()
    },
  }
}

/**
 * Log performance metrics
 * @param metrics Performance metrics to log
 */
function logPerformanceMetrics(metrics: PerformanceMetrics) {
  performanceLogger.info(`Performance measurement: ${metrics.name}`, {
    performance: {
      name: metrics.name,
      duration: metrics.duration,
      startTime: metrics.startTime,
      ...metrics.tags,
    },
    data: metrics.data,
  })

  // Send metrics to monitoring service if in production
  if (process.env.NODE_ENV === "production") {
    try {
      // This would typically send metrics to a monitoring service
      // For example, Datadog, New Relic, etc.
      sendMetricsToMonitoringService(metrics)
    } catch (error) {
      logger.error("Failed to send metrics to monitoring service", { error })
    }
  }
}

/**
 * Send metrics to monitoring service
 * @param metrics Performance metrics to send
 */
async function sendMetricsToMonitoringService(metrics: PerformanceMetrics) {
  // This is a placeholder for sending metrics to a monitoring service
  // In a real implementation, this would send metrics to a service like Datadog, New Relic, etc.
  if (process.env.METRICS_ENDPOINT) {
    try {
      await fetch(process.env.METRICS_ENDPOINT, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.METRICS_API_KEY || ""}`,
        },
        body: JSON.stringify({
          name: metrics.name,
          value: metrics.duration,
          timestamp: Date.now(),
          tags: metrics.tags,
        }),
      })
    } catch (error) {
      logger.error("Failed to send metrics to monitoring service", { error })
    }
  }
}

/**
 * Collect browser performance metrics
 * @returns Object with performance metrics
 */
export function collectBrowserPerformanceMetrics() {
  if (typeof window === "undefined" || !window.performance) {
    return null
  }

  try {
    // Get navigation timing
    const navigationTiming = window.performance.timing
    const navigationStart = navigationTiming.navigationStart

    // Calculate timing metrics
    const metrics = {
      // Page load metrics
      pageLoad: navigationTiming.loadEventEnd - navigationStart,
      domReady: navigationTiming.domContentLoadedEventEnd - navigationStart,
      firstPaint: 0,
      firstContentfulPaint: 0,

      // Network metrics
      dns: navigationTiming.domainLookupEnd - navigationTiming.domainLookupStart,
      tcp: navigationTiming.connectEnd - navigationTiming.connectStart,
      ttfb: navigationTiming.responseStart - navigationTiming.requestStart,
      download: navigationTiming.responseEnd - navigationTiming.responseStart,

      // Processing metrics
      domProcessing: navigationTiming.domComplete - navigationTiming.domLoading,
      resourceLoad: navigationTiming.loadEventEnd - navigationTiming.domContentLoadedEventEnd,
    }

    // Get paint timing if available
    if (window.performance.getEntriesByType) {
      const paintMetrics = window.performance.getEntriesByType("paint")

      for (const paint of paintMetrics) {
        if (paint.name === "first-paint") {
          metrics.firstPaint = paint.startTime
        } else if (paint.name === "first-contentful-paint") {
          metrics.firstContentfulPaint = paint.startTime
        }
      }
    }

    // Get resource timing
    const resourceTimings: ResourceTiming[] = []

    if (window.performance.getEntriesByType) {
      const resources = window.performance.getEntriesByType("resource")

      for (const resource of resources) {
        resourceTimings.push({
          name: resource.name,
          initiatorType: resource.initiatorType,
          startTime: resource.startTime,
          responseEnd: resource.responseEnd,
          transferSize: resource.transferSize,
          decodedBodySize: resource.decodedBodySize,
          duration: resource.duration,
        })
      }
    }

    return {
      metrics,
      resourceTimings,
      userAgent: window.navigator.userAgent,
      timestamp: Date.now(),
    }
  } catch (error) {
    logger.error("Failed to collect browser performance metrics", { error })
    return null
  }
}

/**
 * Report browser performance metrics
 */
export function reportBrowserPerformanceMetrics() {
  if (typeof window === "undefined") {
    return
  }

  // Wait for the page to fully load
  window.addEventListener("load", () => {
    // Wait a bit to ensure all metrics are available
    setTimeout(() => {
      const metrics = collectBrowserPerformanceMetrics()

      if (metrics) {
        // Log metrics locally
        performanceLogger.info("Browser performance metrics", { metrics })

        // Send metrics to server
        if (process.env.NEXT_PUBLIC_METRICS_ENDPOINT) {
          try {
            fetch(process.env.NEXT_PUBLIC_METRICS_ENDPOINT, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify(metrics),
              // Use keepalive to ensure the request completes even if the page is unloaded
              keepalive: true,
            })
          } catch (error) {
            logger.error("Failed to send browser performance metrics", { error })
          }
        }
      }
    }, 0)
  })
}

