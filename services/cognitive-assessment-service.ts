import { prisma } from "@/lib/prisma"
import { redis } from "@/lib/redis"
import type { CognitiveAssessment, CognitiveArea, Prisma } from "@prisma/client"
import { PatientService } from "./patient-service"

export type AssessmentWithAreas = CognitiveAssessment & {
  cognitiveAreas: CognitiveArea
}

export class CognitiveAssessmentService {
  /**
   * Create a new cognitive assessment
   */
  static async createAssessment(data: {
    patientId: string
    doctorId?: string
    mmseScore: number
    notes?: string
    recommendations?: string
    cognitiveAreas: {
      memory: number
      attention: number
      language: number
      visualSpatial: number
      executiveFunction: number
    }
  }): Promise<AssessmentWithAreas> {
    const { cognitiveAreas, ...assessmentData } = data

    // Use a transaction to ensure both assessment and areas are created
    const assessment = await prisma.$transaction(async (tx) => {
      // Create the assessment
      const assessment = await tx.cognitiveAssessment.create({
        data: assessmentData,
      })

      // Create the cognitive areas
      await tx.cognitiveArea.create({
        data: {
          assessmentId: assessment.id,
          ...cognitiveAreas,
        },
      })

      // Add a cognitive score
      await tx.cognitiveScore.create({
        data: {
          patientId: data.patientId,
          score: data.mmseScore,
        },
      })

      // Return the assessment with cognitive areas
      return tx.cognitiveAssessment.findUnique({
        where: { id: assessment.id },
        include: {
          cognitiveAreas: true,
        },
      })
    })

    // Invalidate cache
    await this.invalidateAssessmentCache()
    await PatientService.invalidatePatientCache(data.patientId)

    return assessment as AssessmentWithAreas
  }

  /**
   * Get all assessments with pagination
   */
  static async getAllAssessments(page = 1, limit = 10) {
    const skip = (page - 1) * limit

    // Try to get from cache first
    const cacheKey = `assessments:list:${page}:${limit}`
    const cachedData = await redis.get(cacheKey)

    if (cachedData) {
      console.log("Retrieved assessments from cache")
      return JSON.parse(cachedData as string)
    }

    // If not in cache, get from database
    const [assessments, total] = await Promise.all([
      prisma.cognitiveAssessment.findMany({
        skip,
        take: limit,
        include: {
          patient: {
            include: {
              user: {
                select: {
                  name: true,
                },
              },
            },
          },
          doctor: {
            include: {
              user: {
                select: {
                  name: true,
                },
              },
            },
          },
          cognitiveAreas: true,
        },
        orderBy: {
          date: "desc",
        },
      }),
      prisma.cognitiveAssessment.count(),
    ])

    const result = {
      data: assessments,
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
   * Get an assessment by ID
   */
  static async getAssessmentById(id: string): Promise<AssessmentWithAreas | null> {
    // Try to get from cache first
    const cacheKey = `assessments:${id}`
    const cachedData = await redis.get(cacheKey)

    if (cachedData) {
      console.log("Retrieved assessment from cache")
      return JSON.parse(cachedData as string)
    }

    // If not in cache, get from database
    const assessment = await prisma.cognitiveAssessment.findUnique({
      where: { id },
      include: {
        patient: {
          include: {
            user: true,
          },
        },
        doctor: {
          include: {
            user: true,
          },
        },
        cognitiveAreas: true,
      },
    })

    if (!assessment) return null

    // Cache the result for 5 minutes
    await redis.set(cacheKey, JSON.stringify(assessment), {
      ex: 300, // 5 minutes
    })

    return assessment as AssessmentWithAreas
  }

  /**
   * Get assessments for a patient
   */
  static async getAssessmentsByPatientId(patientId: string) {
    // Try to get from cache first
    const cacheKey = `patients:${patientId}:assessments`
    const cachedData = await redis.get(cacheKey)

    if (cachedData) {
      console.log("Retrieved patient assessments from cache")
      return JSON.parse(cachedData as string)
    }

    // If not in cache, get from database
    const assessments = await prisma.cognitiveAssessment.findMany({
      where: { patientId },
      include: {
        cognitiveAreas: true,
        doctor: {
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
    })

    // Cache the result for 5 minutes
    await redis.set(cacheKey, JSON.stringify(assessments), {
      ex: 300, // 5 minutes
    })

    return assessments
  }

  /**
   * Update an assessment
   */
  static async updateAssessment(
    id: string,
    data: Prisma.CognitiveAssessmentUpdateInput & {
      cognitiveAreas?: {
        memory?: number
        attention?: number
        language?: number
        visualSpatial?: number
        executiveFunction?: number
      }
    },
  ) {
    const { cognitiveAreas, ...assessmentData } = data

    // Use a transaction to update both assessment and areas
    const assessment = await prisma.$transaction(async (tx) => {
      // Update the assessment
      const assessment = await tx.cognitiveAssessment.update({
        where: { id },
        data: assessmentData,
      })

      // Update cognitive areas if provided
      if (cognitiveAreas) {
        await tx.cognitiveArea.update({
          where: { assessmentId: id },
          data: cognitiveAreas,
        })
      }

      // Return the updated assessment with cognitive areas
      return tx.cognitiveAssessment.findUnique({
        where: { id },
        include: {
          cognitiveAreas: true,
        },
      })
    })

    // Invalidate cache
    await this.invalidateAssessmentCache(id)
    if (assessment?.patientId) {
      await PatientService.invalidatePatientCache(assessment.patientId)
    }

    return assessment as AssessmentWithAreas
  }

  /**
   * Delete an assessment
   */
  static async deleteAssessment(id: string) {
    // Get the assessment first to get the patientId
    const assessment = await prisma.cognitiveAssessment.findUnique({
      where: { id },
    })

    if (!assessment) {
      throw new Error("Assessment not found")
    }

    // Delete the assessment (cognitive areas will be deleted by cascade)
    await prisma.cognitiveAssessment.delete({
      where: { id },
    })

    // Invalidate cache
    await this.invalidateAssessmentCache(id)
    await PatientService.invalidatePatientCache(assessment.patientId)

    return assessment
  }

  /**
   * Get cognitive assessment statistics
   */
  static async getStatistics() {
    // Try to get from cache first
    const cacheKey = "assessments:statistics"
    const cachedData = await redis.get(cacheKey)

    if (cachedData) {
      console.log("Retrieved assessment statistics from cache")
      return JSON.parse(cachedData as string)
    }

    // If not in cache, calculate statistics
    const [totalAssessments, averageScore, scoreDistribution] = await Promise.all([
      prisma.cognitiveAssessment.count(),
      prisma.cognitiveAssessment.aggregate({
        _avg: {
          mmseScore: true,
        },
      }),
      prisma.$queryRaw`
        SELECT 
          CASE 
            WHEN "mmseScore" BETWEEN 0 AND 9 THEN 'Severe'
            WHEN "mmseScore" BETWEEN 10 AND 18 THEN 'Moderate'
            WHEN "mmseScore" BETWEEN 19 AND 23 THEN 'Mild'
            ELSE 'Normal'
          END as category,
          COUNT(*) as count
        FROM "cognitive_assessments"
        GROUP BY category
      `,
    ])

    const statistics = {
      totalAssessments,
      averageScore: averageScore._avg.mmseScore || 0,
      scoreDistribution,
    }

    // Cache the result for 15 minutes
    await redis.set(cacheKey, JSON.stringify(statistics), {
      ex: 900, // 15 minutes
    })

    return statistics
  }

  /**
   * Invalidate assessment cache
   */
  static async invalidateAssessmentCache(assessmentId?: string) {
    // Delete specific assessment cache if ID is provided
    if (assessmentId) {
      await redis.del(`assessments:${assessmentId}`)
    }

    // Delete statistics cache
    await redis.del("assessments:statistics")

    // Delete pattern for list cache
    const keys = await redis.keys("assessments:list:*")
    if (keys.length > 0) {
      await Promise.all(keys.map((key) => redis.del(key)))
    }

    // Delete pattern for patient assessments cache
    const patientKeys = await redis.keys("patients:*:assessments")
    if (patientKeys.length > 0) {
      await Promise.all(patientKeys.map((key) => redis.del(key)))
    }
  }
}

