import { type NextRequest, NextResponse } from "next/server"
import { ApiError, InternalServerError } from "@/lib/errors"
import { createApiResponse } from "@/lib/api-config"
import { logger } from "@/lib/logger"
import { ZodError } from "zod"

/**
 * Centralized error handling middleware for API routes
 */
export async function withErrorHandling(
  request: NextRequest,
  handler: (request: NextRequest) => Promise<NextResponse>,
): Promise<NextResponse> {
  try {
    return await handler(request)
  } catch (error) {
    // Log the error
    logger.error("API Error", {
      path: request.nextUrl.pathname,
      method: request.method,
      error: error instanceof Error ? error.stack : String(error),
    })

    // Handle Zod validation errors
    if (error instanceof ZodError) {
      const response = createApiResponse(false, undefined, {
        code: "VALIDATION_ERROR",
        message: "Validation failed",
        details: error.errors,
      })
      return NextResponse.json(response, { status: 422 })
    }

    // Handle known API errors
    if (error instanceof ApiError) {
      const response = createApiResponse(false, undefined, {
        code: error.code,
        message: error.message,
        details: error.details,
      })
      return NextResponse.json(response, { status: error.statusCode })
    }

    // Handle unknown errors
    const serverError = new InternalServerError(
      process.env.NODE_ENV === "production"
        ? "An unexpected error occurred"
        : error instanceof Error
          ? error.message
          : String(error),
    )

    const response = createApiResponse(false, undefined, {
      code: serverError.code,
      message: serverError.message,
    })

    return NextResponse.json(response, { status: 500 })
  }
}

