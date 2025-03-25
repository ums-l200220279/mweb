/**
 * Sistem penanganan error terpusat untuk Memoright
 * Menyediakan struktur error yang konsisten di seluruh aplikasi
 */

// Tipe dasar untuk semua error aplikasi
export interface AppErrorOptions {
  message: string
  code: string
  statusCode: number
  details?: Record<string, any>
  cause?: Error
}

// Kelas error dasar
export class AppError extends Error {
  code: string
  statusCode: number
  details?: Record<string, any>
  cause?: Error

  constructor(options: AppErrorOptions) {
    super(options.message)
    this.name = this.constructor.name
    this.code = options.code
    this.statusCode = options.statusCode
    this.details = options.details
    this.cause = options.cause

    // Mempertahankan stack trace
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor)
    }
  }

  toJSON() {
    return {
      error: this.message,
      code: this.code,
      details: this.details,
    }
  }
}

// Error spesifik untuk validasi
export class ValidationError extends AppError {
  constructor(message: string, details?: Record<string, any>, cause?: Error) {
    super({
      message,
      code: "VALIDATION_ERROR",
      statusCode: 400,
      details,
      cause,
    })
  }
}

// Error spesifik untuk autentikasi
export class AuthenticationError extends AppError {
  constructor(message = "Authentication required", cause?: Error) {
    super({
      message,
      code: "AUTHENTICATION_ERROR",
      statusCode: 401,
      cause,
    })
  }
}

// Error spesifik untuk otorisasi
export class AuthorizationError extends AppError {
  constructor(message = "Insufficient permissions", cause?: Error) {
    super({
      message,
      code: "AUTHORIZATION_ERROR",
      statusCode: 403,
      cause,
    })
  }
}

// Error spesifik untuk resource tidak ditemukan
export class NotFoundError extends AppError {
  constructor(resource: string, id?: string, cause?: Error) {
    const message = id ? `${resource} with ID ${id} not found` : `${resource} not found`

    super({
      message,
      code: "NOT_FOUND",
      statusCode: 404,
      details: id ? { resource, id } : { resource },
      cause,
    })
  }
}

// Error spesifik untuk konflik data
export class ConflictError extends AppError {
  constructor(message: string, details?: Record<string, any>, cause?: Error) {
    super({
      message,
      code: "CONFLICT_ERROR",
      statusCode: 409,
      details,
      cause,
    })
  }
}

// Error spesifik untuk rate limiting
export class RateLimitError extends AppError {
  constructor(message = "Rate limit exceeded", retryAfter?: number, cause?: Error) {
    super({
      message,
      code: "RATE_LIMIT_ERROR",
      statusCode: 429,
      details: retryAfter ? { retryAfter } : undefined,
      cause,
    })
  }
}

// Error spesifik untuk kesalahan server internal
export class InternalServerError extends AppError {
  constructor(message = "Internal server error", cause?: Error) {
    super({
      message,
      code: "INTERNAL_SERVER_ERROR",
      statusCode: 500,
      cause,
    })
  }
}

// Error spesifik untuk layanan eksternal
export class ExternalServiceError extends AppError {
  constructor(service: string, message: string, cause?: Error) {
    super({
      message: `${service} service error: ${message}`,
      code: "EXTERNAL_SERVICE_ERROR",
      statusCode: 502,
      details: { service },
      cause,
    })
  }
}

