import type { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { ValidationError } from "@/lib/errors"

/**
 * Middleware for validating request data with Zod schemas
 */
export function withValidation<T extends z.ZodType>(
  schema: T,
  handler: (request: NextRequest, validatedData: z.infer<T>) => Promise<NextResponse>,
) {
  return async (request: NextRequest): Promise<NextResponse> => {
    try {
      let data: any

      // Handle different content types
      if (request.headers.get("content-type")?.includes("application/json")) {
        data = await request.json()
      } else if (request.headers.get("content-type")?.includes("multipart/form-data")) {
        const formData = await request.formData()
        data = Object.fromEntries(formData.entries())
      } else if (request.method === "GET") {
        // For GET requests, validate query parameters
        const url = new URL(request.url)
        data = Object.fromEntries(url.searchParams.entries())
      }

      // Validate the data against the schema
      const validatedData = schema.parse(data)

      // Call the handler with validated data
      return handler(request, validatedData)
    } catch (error) {
      if (error instanceof z.ZodError) {
        throw new ValidationError("Validation failed", "VALIDATION_ERROR", error.errors)
      }
      throw error
    }
  }
}

