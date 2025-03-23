import { z } from "zod"
import { NextResponse } from "next/server"
import { logger } from "@/lib/logger"

/**
 * Validates request data against a Zod schema
 */
export async function validateRequest<T>(
  req: Request,
  schema: z.Schema<T>,
): Promise<{ success: true; data: T } | { success: false; error: NextResponse }> {
  try {
    // Parse request body
    const body = await req.json()

    // Validate against schema
    const data = schema.parse(body)

    return { success: true, data }
  } catch (error) {
    // Handle Zod validation errors
    if (error instanceof z.ZodError) {
      logger.warn("Validation error in API request", {
        context: {
          path: req.url,
          errors: error.errors,
        },
      })

      return {
        success: false,
        error: NextResponse.json(
          {
            error: "Validation error",
            details: error.errors,
          },
          { status: 400 },
        ),
      }
    }

    // Handle other errors
    logger.error("Unexpected error validating request", error instanceof Error ? error : new Error(String(error)), {
      context: {
        path: req.url,
      },
    })

    return {
      success: false,
      error: NextResponse.json(
        {
          error: "Invalid request",
        },
        { status: 400 },
      ),
    }
  }
}

/**
 * Common validation schemas
 */
export const schemas = {
  // Patient ID validation
  patientId: z.object({
    patientId: z.string().uuid({
      message: "Patient ID must be a valid UUID",
    }),
  }),

  // Date range validation
  dateRange: z.object({
    startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, {
      message: "Start date must be in YYYY-MM-DD format",
    }),
    endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, {
      message: "End date must be in YYYY-MM-DD format",
    }),
  }),

  // Pagination validation
  pagination: z.object({
    page: z.number().int().min(1).optional().default(1),
    limit: z.number().int().min(1).max(100).optional().default(20),
  }),

  // Game session validation
  gameSession: z.object({
    gameId: z.string(),
    patientId: z.string().uuid(),
    score: z.number().min(0),
    duration: z.number().min(0),
    difficulty: z.enum(["easy", "medium", "hard"]),
    metrics: z.record(z.number()),
    completedAt: z.string().datetime(),
  }),

  // MMSE test validation
  mmseTest: z.object({
    patientId: z.string().uuid(),
    answers: z.array(
      z.object({
        questionId: z.string(),
        answer: z.union([z.string(), z.number(), z.boolean()]),
        score: z.number().min(0),
      }),
    ),
    totalScore: z.number().min(0).max(30),
    completedAt: z.string().datetime(),
    notes: z.string().optional(),
  }),
}

