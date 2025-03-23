import { withRetry, RetryableError } from "../resilience/retry"
import { CircuitBreakerRegistry } from "../resilience/circuit-breaker"

export class ResilientApiClient {
  private baseUrl: string
  private circuitBreaker: CircuitBreakerRegistry

  constructor(baseUrl: string = process.env.EXTERNAL_API_URL || "") {
    this.baseUrl = baseUrl
    this.circuitBreaker = CircuitBreakerRegistry.getInstance()
  }

  async get<T>(path: string, options: RequestInit = {}): Promise<T> {
    const breaker = this.circuitBreaker.getBreaker(`GET:${path}`)

    return breaker.execute(() =>
      withRetry(
        async () => {
          const response = await fetch(`${this.baseUrl}${path}`, {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              ...options.headers,
            },
            ...options,
          })

          if (!response.ok) {
            const status = response.status

            // Network or server errors (5xx) are retryable
            if (status >= 500 || status === 429) {
              throw new RetryableError(`Server error: ${status}`)
            }

            // Client errors (4xx) are not retryable (except 429)
            throw new Error(`API error: ${status}`)
          }

          return response.json()
        },
        {
          retryableErrors: ["ECONNRESET", "ETIMEDOUT", "ECONNREFUSED", /network error/i, /timeout/i, /Server error/i],
        },
      ),
    )
  }

  async post<T>(path: string, data: any, options: RequestInit = {}): Promise<T> {
    const breaker = this.circuitBreaker.getBreaker(`POST:${path}`)

    return breaker.execute(() =>
      withRetry(async () => {
        const response = await fetch(`${this.baseUrl}${path}`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...options.headers,
          },
          body: JSON.stringify(data),
          ...options,
        })

        if (!response.ok) {
          const status = response.status

          if (status >= 500 || status === 429) {
            throw new RetryableError(`Server error: ${status}`)
          }

          throw new Error(`API error: ${status}`)
        }

        return response.json()
      }),
    )
  }

  // Implementasi untuk PUT, DELETE, dll. bisa ditambahkan dengan pola yang sama
}

