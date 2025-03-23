import { cache } from "react"

type FetchOptions = {
  method?: "GET" | "POST" | "PUT" | "DELETE" | "PATCH"
  headers?: Record<string, string>
  body?: any
  cache?: RequestCache
  next?: { revalidate?: number | false }
  tags?: string[]
  retry?: number
  retryDelay?: number
  timeout?: number
}

const DEFAULT_RETRY_COUNT = 3
const DEFAULT_RETRY_DELAY = 1000
const DEFAULT_TIMEOUT = 10000

/**
 * Enhanced fetch function with retry, timeout, and error handling
 */
export async function enhancedFetch<T>(url: string, options: FetchOptions = {}): Promise<T> {
  const {
    retry = DEFAULT_RETRY_COUNT,
    retryDelay = DEFAULT_RETRY_DELAY,
    timeout = DEFAULT_TIMEOUT,
    ...fetchOptions
  } = options

  // Add default headers
  const headers = {
    "Content-Type": "application/json",
    ...options.headers,
  }

  // Add body if provided
  const body = options.body ? JSON.stringify(options.body) : undefined

  // Create AbortController for timeout
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), timeout)

  try {
    let lastError: Error | null = null

    // Retry logic
    for (let i = 0; i <= retry; i++) {
      try {
        const response = await fetch(url, {
          ...fetchOptions,
          headers,
          body,
          signal: controller.signal,
        })

        // Clear timeout
        clearTimeout(timeoutId)

        // Handle non-2xx responses
        if (!response.ok) {
          const errorData = await response.json().catch(() => null)
          throw new Error(errorData?.message || `Request failed with status ${response.status}: ${response.statusText}`)
        }

        // Parse and return response
        return await response.json()
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error))

        // Don't retry if we've reached the max retry count or if it's an abort error
        if (i === retry || (error instanceof DOMException && error.name === "AbortError")) {
          throw lastError
        }

        // Wait before retrying
        await new Promise((resolve) => setTimeout(resolve, retryDelay * (i + 1)))
      }
    }

    // This should never be reached due to the throw in the loop, but TypeScript needs it
    throw lastError || new Error("Unknown error occurred")
  } finally {
    clearTimeout(timeoutId)
  }
}

/**
 * Cached version of enhancedFetch for GET requests
 */
export const cachedFetch = cache(enhancedFetch)

/**
 * API client with methods for common operations
 */
export const apiClient = {\
  get: <T>(url: string, options?: Omit<FetchOptions, 'method' | 'body'>) => 
    enhancedFetch<T>(url, { ...options, method: 'GET' }),
    
  post: <T>(url: string, data: any, options?: Omit<FetchOptions, 'method'>) => 
    enhancedFetch<T>(url, { ...options, method: 'POST', body: data }),
    
  put: <T>(url: string, data: any, options?: Omit<FetchOptions, 'method'>) => 
    enhancedFetch<T>(url, { ...options, method: 'PUT', body: data }),
    
  patch: <T>(url: string, data: any, options?: Omit<FetchOptions, 'method'>) => 
    enhancedFetch<T>(url, { ...options, method: 'PATCH', body: data }),
    
  delete: <T>(url: string, options?: Omit<FetchOptions, 'method'>) => 
    enhancedFetch<T>(url, { ...options, method: 'DELETE' }),
    
  // Cached version for GET requests
  cachedGet: <T>(url: string, options?: Omit<FetchOptions, 'method' | 'body'>) => 
    cachedFetch<T>(url, { ...options, method: 'GET' }),
};

