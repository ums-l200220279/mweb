/**
 * Repository Pattern Implementation
 *
 * This module provides a base repository interface and implementation for DDD.
 * It handles persistence, retrieval, and caching of aggregates.
 */

import type { AggregateRoot } from "./aggregate-root"
import { logger } from "@/lib/monitoring/logger"
import { cache } from "@/lib/caching/distributed-cache"

export interface Repository<T extends AggregateRoot<any>> {
  findById(id: string): Promise<T | null>
  save(aggregate: T): Promise<void>
  delete(id: string): Promise<void>
}

export abstract class BaseRepository<T extends AggregateRoot<any>> implements Repository<T> {
  protected abstract entityName: string

  // Cache configuration
  protected cacheEnabled = true
  protected cacheTTL = 3600 // 1 hour in seconds

  // Optimistic concurrency control
  protected useOptimisticLocking = true

  protected getCacheKey(id: string): string {
    return `${this.entityName}:${id}`
  }

  protected abstract loadFromStorage(id: string): Promise<T | null>
  protected abstract saveToStorage(aggregate: T): Promise<void>
  protected abstract deleteFromStorage(id: string): Promise<void>

  public async findById(id: string): Promise<T | null> {
    const cacheKey = this.getCacheKey(id)

    // Try to get from cache first
    if (this.cacheEnabled) {
      const cached = await cache.get<T>(cacheKey)

      if (cached) {
        logger.debug(`Cache hit for ${this.entityName}:${id}`)
        return cached
      }

      logger.debug(`Cache miss for ${this.entityName}:${id}`)
    }

    // Load from storage
    const aggregate = await this.loadFromStorage(id)

    // Cache the result if found
    if (aggregate && this.cacheEnabled) {
      await cache.set(cacheKey, aggregate, this.cacheTTL)
    }

    return aggregate
  }

  public async save(aggregate: T): Promise<void> {
    // Optimistic concurrency check would happen here in a real implementation

    // Save to storage
    await this.saveToStorage(aggregate)

    // Commit any pending domain events
    await aggregate.commitEvents()

    // Update cache
    if (this.cacheEnabled) {
      const cacheKey = this.getCacheKey(aggregate.id)
      await cache.set(cacheKey, aggregate, this.cacheTTL)
    }

    logger.debug(`Saved ${this.entityName}:${aggregate.id}`)
  }

  public async delete(id: string): Promise<void> {
    // Delete from storage
    await this.deleteFromStorage(id)

    // Remove from cache
    if (this.cacheEnabled) {
      const cacheKey = this.getCacheKey(id)
      await cache.delete(cacheKey)
    }

    logger.debug(`Deleted ${this.entityName}:${id}`)
  }
}

