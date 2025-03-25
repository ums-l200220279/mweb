import { type NextRequest, NextResponse } from "next/server"
import { errorHandlerMiddleware } from "@/middleware/error-handler"
import { validateAssessmentData } from "@/lib/validation"
import { saveAssessment, calculateScore } from "@/lib/cognitive-assessment"
import { AuthorizationError, ValidationError, NotFoundError } from "@/lib/errors"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { db } from "@/lib/prisma" // Import prisma instance as db

/**
 * Handler untuk endpoint API penilaian kognitif
 * Menunjukkan penggunaan sistem error yang konsisten
 */
async function handler(req: NextRequest): Promise<NextResponse> {
  // Verifikasi autentikasi
  const session = await getServerSession(authOptions)
  if (!session?.user) {
    throw new AuthorizationError("You must be logged in to submit an assessment")
  }

  if (req.method === "POST") {
    // Validasi data input
    const data = await req.json()
    const validationResult = validateAssessmentData(data)

    if (!validationResult.success) {
      throw new ValidationError("Invalid assessment data", { errors: validationResult.errors })
    }

    // Verifikasi pasien ada
    const patient = await prisma.patient.findUnique({
      where: { id: data.patientId },
    })

    if (!patient) {
      throw new NotFoundError("Patient", data.patientId)
    }

    // Verifikasi otorisasi
    const canAccessPatient = await checkUserCanAccessPatient(session.user.id, data.patientId)

    if (!canAccessPatient) {
      throw new AuthorizationError("You do not have permission to submit assessments for this patient")
    }

    // Proses penilaian
    const assessmentResult = await saveAssessment(data)
    const score = await calculateScore(assessmentResult.id)

    return NextResponse.json({
      success: true,
      assessmentId: assessmentResult.id,
      score,
    })
  }

  // Metode HTTP tidak didukung
  return NextResponse.json({ error: "Method not allowed" }, { status: 405 })
}

// Bungkus handler dengan middleware error
export const POST = (req: NextRequest) => errorHandlerMiddleware(req, handler)

// Fungsi helper untuk memeriksa otorisasi
async function checkUserCanAccessPatient(userId: string, patientId: string): Promise<boolean> {
  // Implementasi logika otorisasi
  const relationship = await prisma.patientUserRelationship.findFirst({
    where: {
      userId,
      patientId,
      OR: [{ role: "DOCTOR" }, { role: "CAREGIVER" }, { role: "RESEARCHER" }],
    },
  })

  return !!relationship
}

export async function GET(req: NextRequest) {
  try {
    // Get session for authentication
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const userId = session.user.id
    const searchParams = req.nextUrl.searchParams
    const limit = Number.parseInt(searchParams.get("limit") || "10", 10)
    const page = Number.parseInt(searchParams.get("page") || "1", 10)
    const skip = (page - 1) * limit

    // Fetch user's cognitive assessments
    const assessments = await db.cognitiveAssessment.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
      include: {
        scores: true,
        gameResults: true,
      },
    })

    // Get total count for pagination
    const totalCount = await db.cognitiveAssessment.count({
      where: { userId },
    })

    return NextResponse.json({
      assessments,
      pagination: {
        total: totalCount,
        pages: Math.ceil(totalCount / limit),
        current: page,
        limit,
      },
    })
  } catch (error) {
    console.error("Error fetching cognitive assessments:", error)
    return NextResponse.json({ error: "Internal server error", details: (error as Error).message }, { status: 500 })
  }
}

