/**
 * Aggregate Root Base Class
 *
 * This module provides a base class for implementing aggregate roots in DDD.
 * It handles domain events, validation, and state management.
 */

import { domainEvents, type DomainEvent, type DomainEventPayload } from "./domain-events"
import { logger } from "@/lib/monitoring/logger"

export abstract class AggregateRoot<T extends Record<string, any>> {
  protected _state: T
  protected _id: string
  private _pendingEvents: DomainEvent[] = []
  private _version = 0

  constructor(id: string, initialState: T) {
    this._id = id
    this._state = initialState
  }

  get id(): string {
    return this._id
  }

  get state(): Readonly<T> {
    return Object.freeze({ ...this._state })
  }

  get version(): number {
    return this._version
  }

  protected applyEvent<P extends DomainEventPayload>(
    eventType: string,
    payload: P,
    metadata: Partial<DomainEvent["metadata"]> = {},
  ): void {
    const event = domainEvents.createEvent(eventType, payload, {
      ...metadata,
      source: this.constructor.name,
    })

    this._pendingEvents.push(event)
    this.applyEventToState(event)
    this._version++
  }

  protected abstract applyEventToState(event: DomainEvent): void

  public async commitEvents(): Promise<void> {
    if (this._pendingEvents.length === 0) {
      return
    }

    logger.debug(`Committing ${this._pendingEvents.length} events for aggregate ${this.constructor.name}:${this._id}`)

    // Process all pending events
    for (const event of this._pendingEvents) {
      await domainEvents.publish(event)
    }

    // Clear pending events after successful publishing
    this._pendingEvents = []
  }

  protected validate(): boolean {
    // Base validation logic - can be extended by subclasses
    return true
  }

  public toJSON(): Record<string, any> {
    return {
      id: this._id,
      version: this._version,
      state: this._state,
    }
  }

  public static fromJSON<T extends Record<string, any>, A extends AggregateRoot<T>>(
    this: new (
      id: string,
      state: T,
    ) => A,
    data: { id: string; version: number; state: T },
  ): A {
    const aggregate = new this(data.id, data.state)
    aggregate._version = data.version
    return aggregate
  }
}

