import { type NextRequest, NextResponse } from "next/server"
import { errorHandlerMiddleware } from "@/middleware/error-handler"
import { getPatientAssessmentHistory } from "@/lib/cognitive-assessment"
import { NotFoundError, AuthorizationError } from "@/lib/errors"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

/**
 * Handler untuk endpoint API riwayat penilaian pasien
 * Menunjukkan penggunaan caching
 */
async function handler(req: NextRequest, { params }: { params: { id: string } }): Promise<NextResponse> {
  // Verifikasi autentikasi
  const session = await getServerSession(authOptions)
  if (!session?.user) {
    throw new AuthorizationError("You must be logged in to access patient data")
  }

  const patientId = params.id

  // Verifikasi pasien ada
  const patient = await prisma.patient.findUnique({
    where: { id: patientId },
  })

  if (!patient) {
    throw new NotFoundError("Patient", patientId)
  }

  // Verifikasi otorisasi
  const canAccessPatient = await checkUserCanAccessPatient(session.user.id, patientId)

  if (!canAccessPatient) {
    throw new AuthorizationError("You do not have permission to access this patient's data")
  }

  // Ambil riwayat penilaian dengan caching
  const assessments = await getPatientAssessmentHistory(patientId)

  return NextResponse.json({ assessments })
}

// Bungkus handler dengan middleware error
export const GET = (req: NextRequest, context: { params: { id: string } }) =>
  errorHandlerMiddleware(req, () => handler(req, context))

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

