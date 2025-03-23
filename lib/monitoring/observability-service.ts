/**
 * Observability Service untuk Memoright
 *
 * Layanan untuk monitoring, tracing, dan logging terpadu
 * dengan integrasi OpenTelemetry.
 */

import { Service } from "@/lib/architecture/dependency-injection"
import { logger } from "@/lib/logger"

export interface MetricValue {
  value: number
  timestamp: Date
  labels?: Record<string, string>
}

export interface Metric {
  name: string
  description: string
  unit: string
  type: "counter" | "gauge" | "histogram"
  values: MetricValue[]
}

export interface Span {
  id: string
  traceId: string
  parentId?: string
  name: string
  startTime: Date
  endTime?: Date
  status: "ok" | "error" | "unset"
  attributes: Record<string, string | number | boolean>
  events: {
    name: string
    timestamp: Date
    attributes?: Record<string, string | number | boolean>
  }[]
}

export interface TraceContext {
  traceId: string
  spanId: string
  addEvent: (name: string, attributes?: Record<string, string | number | boolean>) => void
  setStatus: (status: "ok" | "error", description?: string) => void
  setAttribute: (key: string, value: string | number | boolean) => void
  end: () => void
}

@Service("observabilityService")
export class ObservabilityService {
  private metrics: Map<string, Metric> = new Map()
  private activeSpans: Map<string, Span> = new Map()
  private initialized = false
  private flushInterval: NodeJS.Timeout | null = null
  private readonly flushIntervalMs: number = 60 * 1000 // 1 menit
  private readonly enableMetricsExport: boolean
  private readonly enableTracingExport: boolean

  constructor() {
    this.enableMetricsExport = process.env.ENABLE_METRICS_EXPORT === "true"
    this.enableTracingExport = process.env.ENABLE_TRACING_EXPORT === "true"
  }

  /**
   * Inisialisasi service
   */
  public async initialize(): Promise<void> {
    if (this.initialized) {
      return
    }

    try {
      // Set interval untuk flush metrics
      this.flushInterval = setInterval(() => {
        this.flushMetrics().catch((error) => {
          logger.error("Failed to flush metrics", error instanceof Error ? error : new Error(String(error)))
        })
      }, this.flushIntervalMs)

      this.initialized = true
      logger.info("Observability service initialized")
    } catch (error) {
      logger.error(
        "Failed to initialize observability service",
        error instanceof Error ? error : new Error(String(error)),
      )
    }
  }

  /**
   * Membuat atau mendapatkan metrik
   */
  public getOrCreateMetric(
    name: string,
    options: {
      description: string
      unit: string
      type: "counter" | "gauge" | "histogram"
    },
  ): Metric {
    if (!this.initialized) {
      this.initialize()
    }

    if (this.metrics.has(name)) {
      return this.metrics.get(name)!
    }

    const metric: Metric = {
      name,
      description: options.description,
      unit: options.unit,
      type: options.type,
      values: [],
    }

    this.metrics.set(name, metric)
    return metric
  }

  /**
   * Menambahkan nilai ke metrik
   */
  public recordMetric(name: string, value: number, labels?: Record<string, string>): void {
    if (!this.initialized) {
      this.initialize()
    }

    const metric = this.metrics.get(name)
    if (!metric) {
      logger.warn(`Metric not found: ${name}`)
      return
    }

    metric.values.push({
      value,
      timestamp: new Date(),
      labels,
    })
  }

  /**
   * Increment counter metric
   */
  public incrementCounter(name: string, increment = 1, labels?: Record<string, string>): void {
    if (!this.initialized) {
      this.initialize()
    }

    const metric = this.metrics.get(name)
    if (!metric) {
      logger.warn(`Counter metric not found: ${name}`)
      return
    }

    if (metric.type !== "counter") {
      logger.warn(`Metric ${name} is not a counter`)
      return
    }

    // Dapatkan nilai terakhir dengan label yang sama
    const lastValue = this.findLastValueWithLabels(metric, labels)
    const newValue = (lastValue?.value || 0) + increment

    metric.values.push({
      value: newValue,
      timestamp: new Date(),
      labels,
    })
  }

  /**
   * Set gauge metric
   */
  public setGauge(name: string, value: number, labels?: Record<string, string>): void {
    if (!this.initialized) {
      this.initialize()
    }

    const metric = this.metrics.get(name)
    if (!metric) {
      logger.warn(`Gauge metric not found: ${name}`)
      return
    }

    if (metric.type !== "gauge") {
      logger.warn(`Metric ${name} is not a gauge`)
      return
    }

    metric.values.push({
      value,
      timestamp: new Date(),
      labels,
    })
  }

  /**
   * Record histogram value
   */
  public recordHistogram(name: string, value: number, labels?: Record<string, string>): void {
    if (!this.initialized) {
      this.initialize()
    }

    const metric = this.metrics.get(name)
    if (!metric) {
      logger.warn(`Histogram metric not found: ${name}`)
      return
    }

    if (metric.type !== "histogram") {
      logger.warn(`Metric ${name} is not a histogram`)
      return
    }

    metric.values.push({
      value,
      timestamp: new Date(),
      labels,
    })
  }

  /**
   * Memulai span baru
   */
  public startSpan(
    name: string,
    options?: {
      parentSpanId?: string
      attributes?: Record<string, string | number | boolean>
    },
  ): TraceContext {
    if (!this.initialized) {
      this.initialize()
    }

    const traceId = options?.parentSpanId ? this.getTraceIdFromSpanId(options.parentSpanId) : this.generateId()

    const spanId = this.generateId()

    const span: Span = {
      id: spanId,
      traceId,
      parentId: options?.parentSpanId,
      name,
      startTime: new Date(),
      status: "unset",
      attributes: options?.attributes || {},
      events: [],
    }

    this.activeSpans.set(spanId, span)

    // Buat trace context
    const traceContext: TraceContext = {
      traceId,
      spanId,
      addEvent: (eventName, attributes) => {
        const activeSpan = this.activeSpans.get(spanId)
        if (activeSpan) {
          activeSpan.events.push({
            name: eventName,
            timestamp: new Date(),
            attributes,
          })
        }
      },
      setStatus: (status, description) => {
        const activeSpan = this.activeSpans.get(spanId)
        if (activeSpan) {
          activeSpan.status = status
          if (description) {
            activeSpan.attributes["status.description"] = description
          }
        }
      },
      setAttribute: (key, value) => {
        const activeSpan = this.activeSpans.get(spanId)
        if (activeSpan) {
          activeSpan.attributes[key] = value
        }
      },
      end: () => {
        const activeSpan = this.activeSpans.get(spanId)
        if (activeSpan) {
          activeSpan.endTime = new Date()
          this.exportSpan(activeSpan)
          this.activeSpans.delete(spanId)
        }
      },
    }

    return traceContext
  }

  /**
   * Mendapatkan trace ID dari span ID
   */
  private getTraceIdFromSpanId(spanId: string): string {
    const span = this.activeSpans.get(spanId)
    return span ? span.traceId : this.generateId()
  }

  /**
   * Generate ID unik
   */
  private generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substring(2, 9)
  }

  /**
   * Export span ke sistem tracing
   */
  private exportSpan(span: Span): void {
    if (!this.enableTracingExport) {
      return
    }

    // Dalam implementasi nyata, ini akan mengirim span ke sistem tracing
    // seperti Jaeger, Zipkin, atau OpenTelemetry Collector

    logger.debug(`Exported span: ${span.name} (${span.id})`)
  }

  /**
   * Mencari nilai terakhir dengan label yang sama
   */
  private findLastValueWithLabels(metric: Metric, labels?: Record<string, string>): MetricValue | undefined {
    if (!labels) {
      // Jika tidak ada label, cari nilai terakhir tanpa label
      return metric.values
        .filter((v) => !v.labels || Object.keys(v.labels).length === 0)
        .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())[0]
    }

    // Cari nilai dengan label yang sama
    return metric.values
      .filter((v) => this.labelsMatch(v.labels, labels))
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())[0]
  }

  /**
   * Memeriksa apakah dua set label cocok
   */
  private labelsMatch(a?: Record<string, string>, b?: Record<string, string>): boolean {
    if (!a && !b) return true
    if (!a || !b) return false

    const aKeys = Object.keys(a)
    const bKeys = Object.keys(b)

    if (aKeys.length !== bKeys.length) return false

    return aKeys.every((key) => a[key] === b[key])
  }

  /**
   * Flush metrics ke sistem monitoring
   */
  private async flushMetrics(): Promise<void> {
    if (!this.enableMetricsExport || this.metrics.size === 0) {
      return
    }

    try {
      // Dalam implementasi nyata, ini akan mengirim metrik ke sistem monitoring
      // seperti Prometheus, Datadog, atau OpenTelemetry Collector

      logger.debug(`Flushed ${this.metrics.size} metrics`)

      // Bersihkan nilai metrik yang sudah dikirim
      for (const metric of this.metrics.values()) {
        // Simpan nilai terakhir untuk setiap kombinasi label
        const latestValues = new Map<string, MetricValue>()

        for (const value of metric.values) {
          const labelKey = this.getLabelKey(value.labels)
          latestValues.set(labelKey, value)
        }

        // Jika metrik adalah counter, simpan nilai terakhir
        // Jika metrik adalah gauge atau histogram, bersihkan semua nilai
        if (metric.type === "counter") {
          metric.values = Array.from(latestValues.values())
        } else {
          metric.values = []
        }
      }
    } catch (error) {
      logger.error("Failed to flush metrics", error instanceof Error ? error : new Error(String(error)))
    }
  }

  /**
   * Mendapatkan kunci unik untuk label
   */
  private getLabelKey(labels?: Record<string, string>): string {
    if (!labels || Object.keys(labels).length === 0) {
      return "__no_labels__"
    }

    const sortedKeys = Object.keys(labels).sort()
    return sortedKeys.map((key) => `${key}:${labels[key]}`).join(",")
  }

  /**
   * Mendapatkan semua metrik
   */
  public getAllMetrics(): Metric[] {
    return Array.from(this.metrics.values())
  }

  /**
   * Mendapatkan metrik berdasarkan nama
   */
  public getMetric(name: string): Metric | undefined {
    return this.metrics.get(name)
  }

  /**
   * Membersihkan resources saat service dihentikan
   */
  public dispose(): void {
    if (this.flushInterval) {
      clearInterval(this.flushInterval)
      this.flushInterval = null
    }

    // Flush metrics yang tersisa
    this.flushMetrics().catch((error) => {
      logger.error("Failed to flush metrics during disposal", error instanceof Error ? error : new Error(String(error)))
    })

    // End semua span yang aktif
    for (const span of this.activeSpans.values()) {
      span.endTime = new Date()
      span.status = "error"
      span.attributes["error.message"] = "Service disposed before span was ended"
      this.exportSpan(span)
    }

    this.activeSpans.clear()
    this.metrics.clear()
    this.initialized = false
  }
}

