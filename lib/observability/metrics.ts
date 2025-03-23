/**
 * Metrics Collection System
 *
 * This module implements a metrics collection system for observability.
 * It allows for tracking application performance, business metrics, and system health.
 */

import { logger } from "@/lib/monitoring/logger"

export type MetricType = "counter" | "gauge" | "histogram"

export interface MetricOptions {
  name: string
  help: string
  type: MetricType
  labelNames?: string[]
}

export interface MetricValue {
  value: number
  labels?: Record<string, string>
  timestamp?: number
}

class Metric {
  public readonly name: string
  public readonly help: string
  public readonly type: MetricType
  public readonly labelNames: string[]
  private values: MetricValue[] = []

  constructor(options: MetricOptions) {
    this.name = options.name
    this.help = options.help
    this.type = options.type
    this.labelNames = options.labelNames || []
  }

  public observe(value: number, labels: Record<string, string> = {}): void {
    // Validate labels
    for (const labelName of Object.keys(labels)) {
      if (!this.labelNames.includes(labelName)) {
        logger.warn(`Unknown label '${labelName}' for metric '${this.name}'`)
      }
    }

    // For missing labels, use empty string
    const normalizedLabels: Record<string, string> = {}
    for (const labelName of this.labelNames) {
      normalizedLabels[labelName] = labels[labelName] || ""
    }

    this.values.push({
      value,
      labels: normalizedLabels,
      timestamp: Date.now(),
    })

    // In a real implementation, this would be buffered and periodically flushed
    // to a metrics backend. For simplicity, we'll flush immediately.
    this.flush()
  }

  private flush(): void {
    if (this.values.length === 0) {
      return
    }

    // In a real implementation, this would send metrics to a metrics backend
    if (process.env.ENABLE_METRICS_EXPORT === "true") {
      logger.debug(`Flushing ${this.values.length} values for metric '${this.name}'`)

      // Export to metrics backend would happen here
      exportMetrics(this.name, this.type, this.values)
    }

    // Clear the values after flushing
    this.values = []
  }
}

class Counter extends Metric {
  constructor(options: Omit<MetricOptions, "type">) {
    super({ ...options, type: "counter" })
  }

  public inc(value = 1, labels: Record<string, string> = {}): void {
    if (value < 0) {
      throw new Error("Counter cannot be decreased")
    }

    this.observe(value, labels)
  }
}

class Gauge extends Metric {
  constructor(options: Omit<MetricOptions, "type">) {
    super({ ...options, type: "gauge" })
  }

  public set(value: number, labels: Record<string, string> = {}): void {
    this.observe(value, labels)
  }

  public inc(value = 1, labels: Record<string, string> = {}): void {
    this.observe(value, labels)
  }

  public dec(value = 1, labels: Record<string, string> = {}): void {
    this.observe(-value, labels)
  }
}

class Histogram extends Metric {
  private readonly buckets: number[]

  constructor(options: Omit<MetricOptions, "type"> & { buckets?: number[] }) {
    super({ ...options, type: "histogram" })
    this.buckets = options.buckets || [0.005, 0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1, 2.5, 5, 10]
  }

  public observe(value: number, labels: Record<string, string> = {}): void {
    super.observe(value, labels)

    // In a real implementation, we would also update bucket counters
  }
}

class MetricsRegistry {
  private static instance: MetricsRegistry
  private metrics: Map<string, Metric> = new Map()

  private constructor() {}

  public static getInstance(): MetricsRegistry {
    if (!MetricsRegistry.instance) {
      MetricsRegistry.instance = new MetricsRegistry()
    }

    return MetricsRegistry.instance
  }

  public createCounter(options: Omit<MetricOptions, "type">): Counter {
    const counter = new Counter(options)
    this.registerMetric(counter)
    return counter
  }

  public createGauge(options: Omit<MetricOptions, "type">): Gauge {
    const gauge = new Gauge(options)
    this.registerMetric(gauge)
    return gauge
  }

  public createHistogram(options: Omit<MetricOptions, "type"> & { buckets?: number[] }): Histogram {
    const histogram = new Histogram(options)
    this.registerMetric(histogram)
    return histogram
  }

  private registerMetric(metric: Metric): void {
    if (this.metrics.has(metric.name)) {
      throw new Error(`Metric with name '${metric.name}' already exists`)
    }

    this.metrics.set(metric.name, metric)
  }

  public getMetric(name: string): Metric | undefined {
    return this.metrics.get(name)
  }

  public getAllMetrics(): Metric[] {
    return Array.from(this.metrics.values())
  }
}

// Helper function to export metrics to a backend
function exportMetrics(name: string, type: MetricType, values: MetricValue[]): void {
  // In a real implementation, this would send metrics to a metrics backend
  // For now, we'll just log them
  if (process.env.METRICS_ENDPOINT && process.env.METRICS_API_KEY) {
    // Export to metrics backend
    console.log(`Exporting metrics: ${name} (${type})`, values)
  }
}

// Create and export singleton instance
export const metrics = MetricsRegistry.getInstance()

// Common metrics
export const httpRequestDuration = metrics.createHistogram({
  name: "http_request_duration_seconds",
  help: "Duration of HTTP requests in seconds",
  labelNames: ["method", "route", "status_code"],
})

export const httpRequestTotal = metrics.createCounter({
  name: "http_requests_total",
  help: "Total number of HTTP requests",
  labelNames: ["method", "route", "status_code"],
})

export const activeUsers = metrics.createGauge({
  name: "active_users",
  help: "Number of active users",
  labelNames: ["type"],
})

// React hook for using metrics in components
export function useMetrics() {
  return {
    metrics,
    httpRequestDuration,
    httpRequestTotal,
    activeUsers,
  }
}

