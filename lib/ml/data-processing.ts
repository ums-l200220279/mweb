import prisma from "@/lib/db-client"
import type { CognitiveScore, CognitiveAssessment, Patient } from "@prisma/client"

// Feature extraction for ML models
export async function extractPatientFeatures(patientId: string) {
  // Get patient data
  const patient = await prisma.patient.findUnique({
    where: { id: patientId },
    include: {
      cognitiveScores: {
        orderBy: { date: "desc" },
      },
      assessments: {
        orderBy: { date: "desc" },
      },
      medications: true,
      appointments: true,
      caregiverNotes: true,
    },
  })

  if (!patient) {
    throw new Error("Patient not found")
  }

  // Extract cognitive score trends
  const cognitiveScoreTrend = calculateCognitiveScoreTrend(patient.cognitiveScores)

  // Extract cognitive domain scores
  const domainScores = extractDomainScores(patient.assessments[0])

  // Calculate risk factors
  const riskFactors = calculateRiskFactors(patient)

  // Combine features
  return {
    patientId: patient.id,
    age: patient.age,
    gender: patient.gender,
    diagnosis: patient.diagnosis,
    currentMMSEScore: patient.mmseScore,
    cognitiveScoreTrend,
    domainScores,
    riskFactors,
    medicationCount: patient.medications.length,
    hasCaregiverSupport: patient.caregiverId !== null,
  }
}

// Calculate cognitive score trend
function calculateCognitiveScoreTrend(scores: CognitiveScore[]) {
  if (scores.length < 2) {
    return {
      slope: 0,
      trend: "stable",
    }
  }

  // Calculate slope using linear regression
  const n = scores.length
  const x = Array.from({ length: n }, (_, i) => i) // Time points
  const y = scores.map((score) => score.score) // MMSE scores

  const sumX = x.reduce((a, b) => a + b, 0)
  const sumY = y.reduce((a, b) => a + b, 0)
  const sumXY = x.reduce((sum, xi, i) => sum + xi * y[i], 0)
  const sumXX = x.reduce((sum, xi) => sum + xi * xi, 0)

  const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX)

  let trend = "stable"
  if (slope < -0.5) trend = "declining"
  else if (slope < -1) trend = "rapidly-declining"
  else if (slope > 0.5) trend = "improving"

  return {
    slope,
    trend,
  }
}

// Extract cognitive domain scores
function extractDomainScores(assessment: CognitiveAssessment | undefined) {
  if (!assessment) {
    return {
      memory: null,
      attention: null,
      language: null,
      visualSpatial: null,
      executiveFunction: null,
    }
  }

  return {
    memory: assessment.memory,
    attention: assessment.attention,
    language: assessment.language,
    visualSpatial: assessment.visualSpatial,
    executiveFunction: assessment.executiveFunction,
  }
}

// Calculate risk factors
function calculateRiskFactors(
  patient: Patient & {
    cognitiveScores: CognitiveScore[]
    assessments: CognitiveAssessment[]
  },
) {
  const riskFactors = []

  // Age risk
  if (patient.age > 75) {
    riskFactors.push({
      factor: "Advanced age",
      weight: 0.3,
    })
  }

  // Rapid decline risk
  if (patient.cognitiveScores.length >= 2) {
    const latestScores = patient.cognitiveScores.slice(0, 2)
    const decline = latestScores[0].score - latestScores[1].score

    if (decline >= 3) {
      riskFactors.push({
        factor: "Rapid cognitive decline",
        weight: 0.5,
      })
    }
  }

  // Low MMSE score risk
  if (patient.mmseScore !== null && patient.mmseScore < 20) {
    riskFactors.push({
      factor: "Low cognitive score",
      weight: 0.4,
    })
  }

  // No caregiver support risk
  if (!patient.caregiverId) {
    riskFactors.push({
      factor: "Lack of caregiver support",
      weight: 0.2,
    })
  }

  return riskFactors
}

// Normalize features for ML models
export function normalizeFeatures(features: any) {
  // Implement feature normalization logic
  // This would typically scale numerical features to a standard range
  return features
}

