import { type NextRequest, NextResponse } from "next/server"
import { AppError, InternalServerError } from "@/lib/errors"
import { logger } from "@/lib/logger"
import { generateRequestId } from "@/lib/utils"

/**
 * Middleware untuk penanganan error yang konsisten di seluruh API
 */
export async function errorHandlerMiddleware(
  req: NextRequest,
  handler: (req: NextRequest) => Promise<NextResponse>,
): Promise<NextResponse> {
  const requestId = generateRequestId()

  try {
    // Tambahkan request ID ke header untuk pelacakan
    const response = await handler(req)
    response.headers.set("X-Request-ID", requestId)
    return response
  } catch (error) {
    // Log error dengan konteks
    logger.error("API Error", {
      requestId,
      path: req.nextUrl.pathname,
      method: req.method,
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
    })

    // Konversi error ke AppError jika belum
    const appError =
      error instanceof AppError
        ? error
        : new InternalServerError("An unexpected error occurred", error instanceof Error ? error : undefined)

    // Buat response error yang konsisten
    const errorResponse = NextResponse.json(
      {
        ...appError.toJSON(),
        requestId,
      },
      { status: appError.statusCode },
    )

    // Tambahkan header untuk pelacakan
    errorResponse.headers.set("X-Request-ID", requestId)

    return errorResponse
  }
}

