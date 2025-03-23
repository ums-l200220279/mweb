"use client"

import { useEffect } from "react"

/**
 * Domain Events System
 *
 * This module implements a domain events system following DDD principles.
 * It allows for decoupled communication between different parts of the application.
 */

import { logger } from "@/lib/monitoring/logger"

export type DomainEventPayload = Record<string, any>

export interface DomainEvent<T extends DomainEventPayload = DomainEventPayload> {
  type: string
  payload: T
  metadata: {
    timestamp: number
    correlationId: string
    causationId?: string
    userId?: string
    source: string
  }
}

type EventHandler<T extends DomainEventPayload = DomainEventPayload> = (event: DomainEvent<T>) => void | Promise<void>

class DomainEventBus {
  private handlers: Record<string, EventHandler[]> = {}
  private middlewares: ((event: DomainEvent, next: () => Promise<void>) => Promise<void>)[] = []

  public subscribe<T extends DomainEventPayload>(eventType: string, handler: EventHandler<T>): () => void {
    if (!this.handlers[eventType]) {
      this.handlers[eventType] = []
    }

    this.handlers[eventType].push(handler as EventHandler)
    logger.debug(`Subscribed to event: ${eventType}`)

    // Return unsubscribe function
    return () => {
      this.handlers[eventType] = this.handlers[eventType].filter((h) => h !== handler)
      logger.debug(`Unsubscribed from event: ${eventType}`)
    }
  }

  public use(middleware: (event: DomainEvent, next: () => Promise<void>) => Promise<void>): void {
    this.middlewares.push(middleware)
  }

  public async publish<T extends DomainEventPayload>(event: DomainEvent<T>): Promise<void> {
    logger.debug(`Publishing event: ${event.type}`, { event })

    const handlers = this.handlers[event.type] || []

    if (handlers.length === 0) {
      logger.debug(`No handlers for event: ${event.type}`)
      return
    }

    const executeMiddlewareChain = async (middlewareIndex: number, event: DomainEvent): Promise<void> => {
      if (middlewareIndex < this.middlewares.length) {
        await this.middlewares[middlewareIndex](event, () => executeMiddlewareChain(middlewareIndex + 1, event))
      } else {
        // Execute all handlers in parallel
        await Promise.all(
          handlers.map(async (handler) => {
            try {
              await handler(event)
            } catch (error) {
              logger.error(`Error in event handler for ${event.type}`, error)
            }
          }),
        )
      }
    }

    await executeMiddlewareChain(0, event)
  }

  public createEvent<T extends DomainEventPayload>(
    type: string,
    payload: T,
    metadata: Partial<DomainEvent["metadata"]> = {},
  ): DomainEvent<T> {
    return {
      type,
      payload,
      metadata: {
        timestamp: Date.now(),
        correlationId: metadata.correlationId || crypto.randomUUID(),
        causationId: metadata.causationId,
        userId: metadata.userId,
        source: metadata.source || "application",
      },
    }
  }
}

// Singleton instance
export const domainEvents = new DomainEventBus()

// Add default middleware for logging
domainEvents.use(async (event, next) => {
  const startTime = performance.now()

  try {
    await next()
  } finally {
    const duration = performance.now() - startTime

    logger.debug(`Event ${event.type} processed in ${duration.toFixed(2)}ms`)
  }
})

// Add middleware for error handling
domainEvents.use(async (event, next) => {
  try {
    await next()
  } catch (error) {
    logger.error(`Unhandled error in event processing: ${event.type}`, error)
    throw error
  }
})

// Hook for React components
export function useDomainEvent<T extends DomainEventPayload>(eventType: string, handler: EventHandler<T>): void {
  useEffect(() => {
    const unsubscribe = domainEvents.subscribe(eventType, handler)
    return unsubscribe
  }, [eventType, handler])
}

