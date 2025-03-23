/**
 * Distributed Tracing System
 *
 * This module implements a distributed tracing system for observability.
 * It allows for tracking requests across service boundaries and understanding system behavior.
 */

import { logger } from "@/lib/monitoring/logger"

export interface SpanContext {
  traceId: string
  spanId: string
  parentSpanId?: string
  sampled: boolean
  baggage: Record<string, string>
}

export interface SpanOptions {
  name: string
  parentContext?: SpanContext
  tags?: Record<string, string | number | boolean>
  startTime?: number
}

export class Span {
  public readonly context: SpanContext
  public readonly name: string
  public readonly startTime: number
  private endTime?: number
  private tags: Record<string, string | number | boolean>
  private events: Array<{ name: string; timestamp: number; attributes?: Record<string, any> }> = []
  private status: "unset" | "ok" | "error" = "unset"
  private errorDetails?: Error

  constructor(options: SpanOptions) {
    this.name = options.name
    this.startTime = options.startTime || performance.now()
    this.tags = options.tags || {}

    if (options.parentContext) {
      this.context = {
        traceId: options.parentContext.traceId,
        spanId: generateId(),
        parentSpanId: options.parentContext.spanId,
        sampled: options.parentContext.sampled,
        baggage: { ...options.parentContext.baggage },
      }
    } else {
      this.context = {
        traceId: generateId(),
        spanId: generateId(),
        sampled: shouldSample(),
        baggage: {},
      }
    }
  }

  public setTag(key: string, value: string | number | boolean): this {
    this.tags[key] = value
    return this
  }

  public addEvent(name: string, attributes?: Record<string, any>): this {
    this.events.push({
      name,
      timestamp: performance.now(),
      attributes,
    })
    return this
  }

  public setStatus(status: "ok" | "error", error?: Error): this {
    this.status = status
    this.errorDetails = error

    if (error) {
      this.tags["error"] = true
      this.tags["error.message"] = error.message
      this.tags["error.type"] = error.name
      this.tags["error.stack"] = error.stack || ""
    }

    return this
  }

  public end(endTime?: number): void {
    if (this.endTime !== undefined) {
      logger.warn(`Span ${this.name} already ended`)
      return
    }

    this.endTime = endTime || performance.now()

    // In a real implementation, this would export the span to a tracing backend
    if (this.context.sampled) {
      const duration = this.endTime - this.startTime

      logger.debug(`Span ${this.name} completed in ${duration.toFixed(2)}ms`, {
        traceId: this.context.traceId,
        spanId: this.context.spanId,
        parentSpanId: this.context.parentSpanId,
        duration,
        tags: this.tags,
        events: this.events,
        status: this.status,
      })

      // Export to tracing backend would happen here
      exportSpan(this)
    }
  }

  public get duration(): number | undefined {
    if (this.endTime === undefined) {
      return undefined
    }

    return this.endTime - this.startTime
  }
}

// Tracer class to create and manage spans
export class Tracer {
  private static instance: Tracer
  private currentSpan?: Span
  private samplingRate = 0.1 // Sample 10% of traces by default

  private constructor() {}

  public static getInstance(): Tracer {
    if (!Tracer.instance) {
      Tracer.instance = new Tracer()
    }

    return Tracer.instance
  }

  public startSpan(name: string, options: Omit<SpanOptions, "name"> = {}): Span {
    const parentContext = options.parentContext || this.currentSpan?.context
    const span = new Span({ name, parentContext, ...options })

    return span
  }

  public withSpan<T>(
    name: string,
    fn: (span: Span) => Promise<T> | T,
    options: Omit<SpanOptions, "name"> = {},
  ): Promise<T> {
    const span = this.startSpan(name, options)
    const previousSpan = this.currentSpan
    this.currentSpan = span

    try {
      const result = fn(span)

      if (result instanceof Promise) {
        return result
          .then((value) => {
            span.setStatus("ok")
            span.end()
            this.currentSpan = previousSpan
            return value
          })
          .catch((error) => {
            span.setStatus("error", error)
            span.end()
            this.currentSpan = previousSpan
            throw error
          })
      } else {
        span.setStatus("ok")
        span.end()
        this.currentSpan = previousSpan
        return Promise.resolve(result)
      }
    } catch (error) {
      span.setStatus("error", error as Error)
      span.end()
      this.currentSpan = previousSpan
      throw error
    }
  }

  public getCurrentSpan(): Span | undefined {
    return this.currentSpan
  }

  public setSamplingRate(rate: number): void {
    if (rate < 0 || rate > 1) {
      throw new Error("Sampling rate must be between 0 and 1")
    }

    this.samplingRate = rate
  }

  public getSamplingRate(): number {
    return this.samplingRate
  }
}

// Helper functions
function generateId(): string {
  return crypto.randomUUID()
}

function shouldSample(): boolean {
  return Math.random() < Tracer.getInstance().getSamplingRate()
}

function exportSpan(span: Span): void {
  // In a real implementation, this would send the span to a tracing backend
  // For now, we'll just log it
  if (process.env.ENABLE_TRACING_EXPORT === "true") {
    // Export to tracing backend
    console.log("Exporting span", span)
  }
}

// Create and export singleton instance
export const tracer = Tracer.getInstance()

// React hook for using tracing in components
export function useTracing() {
  return {
    tracer,
    startSpan: (name: string, options?: Omit<SpanOptions, 'name'>) => tracer.startSpan(name, options),
    withSpan: <T>(name: string, fn: (span: Span) => Promise<T> | T, options?: Omit<SpanOptions, 'name'>) => 
      tracer.withSpan(name, fn, options)
  }
}

