import { prisma } from "@/lib/prisma"
import { redis } from "@/lib/redis"
import type { Patient, CognitiveAssessment, CognitiveScore, Prisma } from "@prisma/client"

export type PatientWithRelations = Patient & {
  cognitiveScores: CognitiveScore[]
  assessments: CognitiveAssessment[]
}

export class PatientService {
  /**
   * Get all patients with pagination
   */
  static async getAllPatients(page = 1, limit = 10) {
    const skip = (page - 1) * limit

    // Try to get from cache first
    const cacheKey = `patients:list:${page}:${limit}`
    const cachedData = await redis.get(cacheKey)

    if (cachedData) {
      console.log("Retrieved patients from cache")
      return JSON.parse(cachedData as string)
    }

    // If not in cache, get from database
    const [patients, total] = await Promise.all([
      prisma.patient.findMany({
        skip,
        take: limit,
        include: {
          user: {
            select: {
              name: true,
              email: true,
              image: true,
            },
          },
          cognitiveScores: {
            orderBy: {
              date: "desc",
            },
            take: 1,
          },
        },
        orderBy: {
          updatedAt: "desc",
        },
      }),
      prisma.patient.count(),
    ])

    const result = {
      data: patients,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    }

    // Cache the result for 5 minutes
    await redis.set(cacheKey, JSON.stringify(result), {
      ex: 300, // 5 minutes
    })

    return result
  }

  /**
   * Get a patient by ID with related data
   */
  static async getPatientById(id: string): Promise<PatientWithRelations | null> {
    // Try to get from cache first
    const cacheKey = `patients:${id}`
    const cachedData = await redis.get(cacheKey)

    if (cachedData) {
      console.log("Retrieved patient from cache")
      return JSON.parse(cachedData as string)
    }

    // If not in cache, get from database
    const patient = await prisma.patient.findUnique({
      where: { id },
      include: {
        user: true,
        cognitiveScores: {
          orderBy: {
            date: "desc",
          },
        },
        assessments: {
          include: {
            cognitiveAreas: true,
          },
          orderBy: {
            date: "desc",
          },
        },
        medications: true,
        appointments: {
          include: {
            doctor: {
              include: {
                user: {
                  select: {
                    name: true,
                    email: true,
                  },
                },
              },
            },
          },
          orderBy: {
            date: "desc",
          },
        },
        caregiverNotes: {
          include: {
            caregiver: {
              include: {
                user: {
                  select: {
                    name: true,
                  },
                },
              },
            },
          },
          orderBy: {
            date: "desc",
          },
        },
      },
    })

    if (!patient) return null

    // Cache the result for 5 minutes
    await redis.set(cacheKey, JSON.stringify(patient), {
      ex: 300, // 5 minutes
    })

    return patient as PatientWithRelations
  }

  /**
   * Create a new patient
   */
  static async createPatient(data: {
    userId: string
    dateOfBirth?: Date
    diagnosis?: string
    riskLevel?: Prisma.PatientCreateInput["riskLevel"]
  }) {
    const patient = await prisma.patient.create({
      data,
    })

    // Invalidate cache
    await this.invalidatePatientCache()

    return patient
  }

  /**
   * Update a patient
   */
  static async updatePatient(id: string, data: Prisma.PatientUpdateInput) {
    const patient = await prisma.patient.update({
      where: { id },
      data,
    })

    // Invalidate cache
    await this.invalidatePatientCache(id)

    return patient
  }

  /**
   * Delete a patient
   */
  static async deletePatient(id: string) {
    const patient = await prisma.patient.delete({
      where: { id },
    })

    // Invalidate cache
    await this.invalidatePatientCache(id)

    return patient
  }

  /**
   * Add a cognitive score for a patient
   */
  static async addCognitiveScore(patientId: string, score: number) {
    const cognitiveScore = await prisma.cognitiveScore.create({
      data: {
        patientId,
        score,
      },
    })

    // Invalidate cache
    await this.invalidatePatientCache(patientId)

    return cognitiveScore
  }

  /**
   * Get cognitive scores for a patient
   */
  static async getCognitiveScores(patientId: string) {
    // Try to get from cache first
    const cacheKey = `patients:${patientId}:cognitive-scores`
    const cachedData = await redis.get(cacheKey)

    if (cachedData) {
      console.log("Retrieved cognitive scores from cache")
      return JSON.parse(cachedData as string)
    }

    // If not in cache, get from database
    const scores = await prisma.cognitiveScore.findMany({
      where: { patientId },
      orderBy: {
        date: "asc",
      },
    })

    // Cache the result for 5 minutes
    await redis.set(cacheKey, JSON.stringify(scores), {
      ex: 300, // 5 minutes
    })

    return scores
  }

  /**
   * Invalidate patient cache
   */
  static async invalidatePatientCache(patientId?: string) {
    // Delete specific patient cache if ID is provided
    if (patientId) {
      await redis.del(`patients:${patientId}`)
      await redis.del(`patients:${patientId}:cognitive-scores`)
    }

    // Delete pattern for list cache
    const keys = await redis.keys("patients:list:*")
    if (keys.length > 0) {
      await Promise.all(keys.map((key) => redis.del(key)))
    }
  }
}

