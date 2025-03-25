import { prisma } from "@/lib/prisma"
import { caches } from "@/lib/cache"
import { logger } from "@/lib/logger"
import { validateOrThrow, schemas } from "@/lib/validation"
import { NotFoundError } from "@/lib/errors"

/**
 * Menyimpan hasil penilaian kognitif
 */
export async function saveAssessment(data: unknown) {
  // Validasi data
  const validData = validateOrThrow(schemas.cognitiveAssessment, data, "Invalid assessment data")

  // Simpan ke database
  const assessment = await prisma.cognitiveAssessment.create({
    data: {
      patientId: validData.patientId,
      type: validData.assessmentType,
      responses: validData.responses,
      metadata: validData.metadata,
    },
  })

  // Invalidasi cache yang terkait
  await caches.assessment.invalidate(`patient:${validData.patientId}:*`)
  await caches.patient.invalidate(`${validData.patientId}:assessments:*`)

  logger.info("Assessment saved", { assessmentId: assessment.id })

  return assessment
}

/**
 * Menghitung skor penilaian kognitif
 */
export async function calculateScore(assessmentId: string) {
  // Coba ambil dari cache terlebih dahulu
  const cacheKey = `score:${assessmentId}`

  return caches.assessment.getOrSet(
    cacheKey,
    async () => {
      // Ambil penilaian dari database
      const assessment = await prisma.cognitiveAssessment.findUnique({
        where: { id: assessmentId },
      })

      if (!assessment) {
        throw new NotFoundError("Assessment", assessmentId)
      }

      // Hitung skor berdasarkan tipe penilaian
      let score
      switch (assessment.type) {
        case "MMSE":
          score = calculateMMSEScore(assessment.responses)
          break
        case "MOCA":
          score = calculateMOCAScore(assessment.responses)
          break
        case "SLUMS":
          score = calculateSLUMSScore(assessment.responses)
          break
        case "CUSTOM":
          score = calculateCustomScore(assessment.responses)
          break
        default:
          throw new Error(`Unsupported assessment type: ${assessment.type}`)
      }

      // Simpan skor ke database
      await prisma.cognitiveAssessment.update({
        where: { id: assessmentId },
        data: { score },
      })

      logger.info("Assessment score calculated", {
        assessmentId,
        score: score.totalScore,
      })

      return score
    },
    { ttl: 86400 }, // Cache selama 1 hari
  )
}

/**
 * Mendapatkan riwayat penilaian pasien dengan caching
 */
export async function getPatientAssessmentHistory(patientId: string) {
  const cacheKey = `patient:${patientId}:assessments`

  return caches.assessment.getOrSet(
    cacheKey,
    async () => {
      const assessments = await prisma.cognitiveAssessment.findMany({
        where: { patientId },
        orderBy: { createdAt: "desc" },
      })

      return assessments
    },
    { ttl: 300, staleWhileRevalidate: true }, // Cache 5 menit dengan refresh di background
  )
}

// Fungsi helper untuk menghitung skor
function calculateMMSEScore(responses: any[]) {
  // Implementasi algoritma penilaian MMSE
  // ...

  // Contoh implementasi sederhana
  const categoryScores = {
    orientation: calculateOrientationScore(responses),
    registration: calculateRegistrationScore(responses),
    attentionCalculation: calculateAttentionScore(responses),
    recall: calculateRecallScore(responses),
    language: calculateLanguageScore(responses),
    visuospatial: calculateVisuospatialScore(responses),
  }

  const totalScore = Object.values(categoryScores).reduce((sum, score) => sum + score, 0)

  return {
    totalScore,
    categoryScores,
    interpretation: interpretMMSEScore(totalScore),
  }
}

function calculateMOCAScore(responses: any[]) {
  // Implementasi algoritma penilaian MOCA
  // ...
  return { totalScore: 0, categoryScores: {}, interpretation: "" }
}

function calculateSLUMSScore(responses: any[]) {
  // Implementasi algoritma penilaian SLUMS
  // ...
  return { totalScore: 0, categoryScores: {}, interpretation: "" }
}

function calculateCustomScore(responses: any[]) {
  // Implementasi algoritma penilaian kustom
  // ...
  return { totalScore: 0, categoryScores: {}, interpretation: "" }
}

// Fungsi helper lainnya
function calculateOrientationScore(responses: any[]) {
  // Implementasi perhitungan skor orientasi
  return 0
}

function calculateRegistrationScore(responses: any[]) {
  // Implementasi perhitungan skor registrasi
  return 0
}

function calculateAttentionScore(responses: any[]) {
  // Implementasi perhitungan skor perhatian
  return 0
}

function calculateRecallScore(responses: any[]) {
  // Implementasi perhitungan skor ingatan
  return 0
}

function calculateLanguageScore(responses: any[]) {
  // Implementasi perhitungan skor bahasa
  return 0
}

function calculateVisuospatialScore(responses: any[]) {
  // Implementasi perhitungan skor visuospasial
  return 0
}

function interpretMMSEScore(score: number) {
  // Interpretasi skor MMSE
  if (score >= 24) {
    return "Normal cognitive function"
  } else if (score >= 19) {
    return "Mild cognitive impairment"
  } else if (score >= 10) {
    return "Moderate cognitive impairment"
  } else {
    return "Severe cognitive impairment"
  }
}

