/**
 * API configuration and versioning
 */
export const API_VERSION = "v1"
export const API_PREFIX = `/api/${API_VERSION}`

// API response structure
export interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: {
    code: string
    message: string
    details?: any
  }
  meta?: {
    page?: number
    limit?: number
    total?: number
    version: string
  }
}

// Standard API response creator
export function createApiResponse<T>(
  success: boolean,
  data?: T,
  error?: { code: string; message: string; details?: any },
  meta?: { page?: number; limit?: number; total?: number },
): ApiResponse<T> {
  return {
    success,
    ...(data && { data }),
    ...(error && { error }),
    meta: {
      ...(meta || {}),
      version: API_VERSION,
    },
  }
}

