type RetryOptions = {
  maxRetries: number
  initialDelay: number
  maxDelay: number
  backoffFactor: number
  retryableErrors?: Array<string | RegExp>
}

const defaultOptions: RetryOptions = {
  maxRetries: 3,
  initialDelay: 300,
  maxDelay: 5000,
  backoffFactor: 2,
}

export class RetryableError extends Error {
  constructor(
    message: string,
    public readonly originalError?: Error,
  ) {
    super(message)
    this.name = "RetryableError"
  }
}

export async function withRetry<T>(fn: () => Promise<T>, options: Partial<RetryOptions> = {}): Promise<T> {
  const config = { ...defaultOptions, ...options }
  let lastError: Error | undefined
  let delay = config.initialDelay

  for (let attempt = 0; attempt <= config.maxRetries; attempt++) {
    try {
      return await fn()
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error))

      // Check if error is retryable
      const isRetryable =
        error instanceof RetryableError ||
        (config.retryableErrors &&
          config.retryableErrors.some((pattern) =>
            typeof pattern === "string" ? lastError!.message.includes(pattern) : pattern.test(lastError!.message),
          ))

      if (!isRetryable || attempt === config.maxRetries) {
        throw lastError
      }

      // Log retry attempt
      console.warn(
        `Attempt ${attempt + 1}/${config.maxRetries} failed with error: ${lastError.message}. Retrying in ${delay}ms...`,
      )

      // Wait before next retry
      await new Promise((resolve) => setTimeout(resolve, delay))

      // Increase delay with backoff
      delay = Math.min(delay * config.backoffFactor, config.maxDelay)
    }
  }

  throw lastError
}

