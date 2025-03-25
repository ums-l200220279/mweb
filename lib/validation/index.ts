import { z } from "zod"
import { ValidationError } from "@/lib/errors"

/**
 * Skema validasi terpusat untuk seluruh aplikasi
 */
export const schemas = {
  // Skema untuk penilaian kognitif
  cognitiveAssessment: z.object({
    patientId: z.string().uuid({
      message: "Patient ID must be a valid UUID",
    }),
    assessmentType: z.enum(["MMSE", "MOCA", "SLUMS", "CUSTOM"], {
      errorMap: () => ({ message: "Assessment type must be one of: MMSE, MOCA, SLUMS, CUSTOM" }),
    }),
    responses: z
      .array(
        z.object({
          questionId: z.string(),
          response: z.union([z.string(), z.number(), z.boolean(), z.array(z.string())]),
          timeSpent: z.number().int().positive().optional(),
        }),
      )
      .min(1, { message: "At least one response is required" }),
    metadata: z.object({
      completedAt: z.string().datetime({
        message: "Completed at must be a valid ISO datetime string",
      }),
      administeredBy: z.string().uuid().optional(),
      location: z.string().optional(),
      notes: z.string().max(1000).optional(),
    }),
  }),

  // Skema untuk profil pasien
  patient: z.object({
    firstName: z.string().min(1, { message: "First name is required" }),
    lastName: z.string().min(1, { message: "Last name is required" }),
    dateOfBirth: z.string().refine(
      (value) => {
        const date = new Date(value)
        return !isNaN(date.getTime())
      },
      { message: "Date of birth must be a valid date" },
    ),
    gender: z.enum(["MALE", "FEMALE", "OTHER", "PREFER_NOT_TO_SAY"], {
      errorMap: () => ({
        message: "Gender must be one of: MALE, FEMALE, OTHER, PREFER_NOT_TO_SAY",
      }),
    }),
    contactInformation: z
      .object({
        email: z.string().email({ message: "Email must be valid" }).optional(),
        phone: z.string().optional(),
        address: z
          .object({
            street: z.string().optional(),
            city: z.string().optional(),
            state: z.string().optional(),
            postalCode: z.string().optional(),
            country: z.string().optional(),
          })
          .optional(),
      })
      .optional(),
    medicalHistory: z
      .object({
        conditions: z.array(z.string()).optional(),
        medications: z.array(z.string()).optional(),
        allergies: z.array(z.string()).optional(),
        familyHistory: z.array(z.string()).optional(),
      })
      .optional(),
  }),

  // Skema untuk permainan kognitif
  cognitiveGame: z.object({
    gameType: z.enum(["MEMORY", "ATTENTION", "EXECUTIVE", "LANGUAGE", "VISUOSPATIAL"]),
    difficulty: z.enum(["EASY", "MEDIUM", "HARD", "ADAPTIVE"]),
    duration: z.number().int().positive(),
    settings: z.record(z.any()).optional(),
  }),

  // Skema untuk hasil permainan
  gameResult: z.object({
    gameId: z.string().uuid(),
    patientId: z.string().uuid(),
    score: z.number(),
    metrics: z.record(z.number()).optional(),
    completedAt: z.string().datetime(),
    difficulty: z.enum(["EASY", "MEDIUM", "HARD", "ADAPTIVE"]),
    duration: z.number().int().positive(),
  }),

  // Tambahkan skema lain sesuai kebutuhan
}

/**
 * Fungsi validasi generik
 */
export function validate<T extends z.ZodType>(
  schema: T,
  data: unknown,
): { success: true; data: z.infer<T> } | { success: false; errors: z.ZodError } {
  try {
    const validData = schema.parse(data)
    return { success: true, data: validData }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, errors: error }
    }
    throw error
  }
}

/**
 * Fungsi validasi yang melempar error
 */
export function validateOrThrow<T extends z.ZodType>(
  schema: T,
  data: unknown,
  errorMessage = "Validation failed",
): z.infer<T> {
  try {
    return schema.parse(data)
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new ValidationError(errorMessage, formatZodErrors(error))
    }
    throw error
  }
}

/**
 * Format error Zod menjadi format yang lebih mudah dibaca
 */
export function formatZodErrors(error: z.ZodError): Record<string, string> {
  return error.errors.reduce(
    (acc, curr) => {
      const path = curr.path.join(".")
      acc[path || "general"] = curr.message
      return acc
    },
    {} as Record<string, string>,
  )
}

// Fungsi validasi spesifik
export function validateAssessmentData(data: unknown) {
  return validate(schemas.cognitiveAssessment, data)
}

export function validatePatientData(data: unknown) {
  return validate(schemas.patient, data)
}

export function validateGameData(data: unknown) {
  return validate(schemas.cognitiveGame, data)
}

export function validateGameResult(data: unknown) {
  return validate(schemas.gameResult, data)
}

