export enum CircuitState {
  CLOSED = "CLOSED",
  OPEN = "OPEN",
  HALF_OPEN = "HALF_OPEN",
}

type CircuitBreakerOptions = {
  failureThreshold: number
  resetTimeout: number
  halfOpenSuccessThreshold: number
}

export class CircuitBreaker {
  private state: CircuitState = CircuitState.CLOSED
  private failureCount = 0
  private successCount = 0
  private lastError: Error | null = null
  private nextAttempt: number = Date.now()
  private readonly options: CircuitBreakerOptions

  constructor(options: Partial<CircuitBreakerOptions> = {}) {
    this.options = {
      failureThreshold: 5,
      resetTimeout: 30000, // 30 seconds
      halfOpenSuccessThreshold: 2,
      ...options,
    }
  }

  public async execute<T>(fn: () => Promise<T>): Promise<T> {
    if (this.state === CircuitState.OPEN) {
      if (Date.now() < this.nextAttempt) {
        throw new Error(`Circuit breaker is open: ${this.lastError?.message}`)
      }
      this.state = CircuitState.HALF_OPEN
      this.successCount = 0
    }

    try {
      const result = await fn()
      this.onSuccess()
      return result
    } catch (error) {
      this.onFailure(error instanceof Error ? error : new Error(String(error)))
      throw error
    }
  }

  private onSuccess(): void {
    if (this.state === CircuitState.HALF_OPEN) {
      this.successCount++
      if (this.successCount >= this.options.halfOpenSuccessThreshold) {
        this.reset()
      }
    } else if (this.state === CircuitState.CLOSED) {
      this.failureCount = 0
    }
  }

  private onFailure(error: Error): void {
    this.lastError = error

    if (this.state === CircuitState.HALF_OPEN) {
      this.tripBreaker()
    } else if (this.state === CircuitState.CLOSED) {
      this.failureCount++
      if (this.failureCount >= this.options.failureThreshold) {
        this.tripBreaker()
      }
    }
  }

  private tripBreaker(): void {
    this.state = CircuitState.OPEN
    this.nextAttempt = Date.now() + this.options.resetTimeout
  }

  private reset(): void {
    this.state = CircuitState.CLOSED
    this.failureCount = 0
    this.successCount = 0
    this.lastError = null
  }

  public getState(): CircuitState {
    return this.state
  }
}

// Circuit breaker registry to manage multiple circuit breakers
export class CircuitBreakerRegistry {
  private static instance: CircuitBreakerRegistry
  private breakers: Map<string, CircuitBreaker> = new Map()

  private constructor() {}

  public static getInstance(): CircuitBreakerRegistry {
    if (!CircuitBreakerRegistry.instance) {
      CircuitBreakerRegistry.instance = new CircuitBreakerRegistry()
    }
    return CircuitBreakerRegistry.instance
  }

  public getBreaker(name: string, options?: Partial<CircuitBreakerOptions>): CircuitBreaker {
    if (!this.breakers.has(name)) {
      this.breakers.set(name, new CircuitBreaker(options))
    }
    return this.breakers.get(name)!
  }
}

