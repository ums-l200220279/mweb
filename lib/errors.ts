/**
 * Custom error classes for consistent error handling
 */

// Base API error class
export class ApiError extends Error {
  statusCode: number
  code: string
  details?: any

  constructor(message: string, statusCode: number, code: string, details?: any) {
    super(message)
    this.name = this.constructor.name
    this.statusCode = statusCode
    this.code = code
    this.details = details
    Error.captureStackTrace(this, this.constructor)
  }
}

// 400 Bad Request
export class BadRequestError extends ApiError {
  constructor(message: string, code = "BAD_REQUEST", details?: any) {
    super(message, 400, code, details)
  }
}

// 401 Unauthorized
export class UnauthorizedError extends ApiError {
  constructor(message = "Authentication required", code = "UNAUTHORIZED", details?: any) {
    super(message, 401, code, details)
  }
}

// 403 Forbidden
export class ForbiddenError extends ApiError {
  constructor(message = "Insufficient permissions", code = "FORBIDDEN", details?: any) {
    super(message, 403, code, details)
  }
}

// 404 Not Found
export class NotFoundError extends ApiError {
  constructor(message = "Resource not found", code = "NOT_FOUND", details?: any) {
    super(message, 404, code, details)
  }
}

// 409 Conflict
export class ConflictError extends ApiError {
  constructor(message: string, code = "CONFLICT", details?: any) {
    super(message, 409, code, details)
  }
}

// 422 Unprocessable Entity
export class ValidationError extends ApiError {
  constructor(message = "Validation failed", code = "VALIDATION_ERROR", details?: any) {
    super(message, 422, code, details)
  }
}

// 429 Too Many Requests
export class RateLimitError extends ApiError {
  constructor(message = "Too many requests", code = "RATE_LIMIT", details?: any) {
    super(message, 429, code, details)
  }
}

// 500 Internal Server Error
export class InternalServerError extends ApiError {
  constructor(message = "Internal server error", code = "INTERNAL_ERROR", details?: any) {
    super(message, 500, code, details)
  }
}

