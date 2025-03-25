import { calculateScore, saveAssessment } from "@/lib/cognitive-assessment"
import { prisma } from "@/lib/prisma"
import { caches } from "@/lib/cache"
import { ValidationError, NotFoundError } from "@/lib/errors"

// Mock dependencies
jest.mock("@/lib/prisma", () => ({
  cognitiveAssessment: {
    create: jest.fn(),
    findUnique: jest.fn(),
    update: jest.fn(),
  },
}))

jest.mock("@/lib/cache", () => ({
  caches: {
    assessment: {
      invalidate: jest.fn(),
      getOrSet: jest.fn(),
    },
    patient: {
      invalidate: jest.fn(),
    },
  },
}))

describe("Cognitive Assessment Library", () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe("saveAssessment", () => {
    it("validates and saves assessment data", async () => {
      // Mock data
      const validAssessmentData = {
        patientId: "123e4567-e89b-12d3-a456-426614174000",
        assessmentType: "MMSE",
        responses: [{ questionId: "q1", response: "answer1" }],
        metadata: {
          completedAt: new Date().toISOString(),
        },
      }

      // Mock prisma create
      ;(prisma.cognitiveAssessment.create as jest.Mock).mockResolvedValue({
        id: "new-assessment-id",
        ...validAssessmentData,
      })

      // Call function
      const result = await saveAssessment(validAssessmentData)

      // Assertions
      expect(prisma.cognitiveAssessment.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          patientId: validAssessmentData.patientId,
          type: validAssessmentData.assessmentType,
        }),
      })

      expect(caches.assessment.invalidate).toHaveBeenCalledWith(`patient:${validAssessmentData.patientId}:*`)

      expect(caches.patient.invalidate).toHaveBeenCalledWith(`${validAssessmentData.patientId}:assessments:*`)

      expect(result).toEqual(
        expect.objectContaining({
          id: "new-assessment-id",
        }),
      )
    })

    it("throws ValidationError for invalid data", async () => {
      // Invalid data (missing required fields)
      const invalidData = {
        patientId: "123",
        // Missing assessmentType, responses, metadata
      }

      // Call function and expect error
      await expect(saveAssessment(invalidData)).rejects.toThrow(ValidationError)
    })
  })

  describe("calculateScore", () => {
    it("calculates and caches assessment score", async () => {
      // Mock assessment data
      const mockAssessment = {
        id: "test-assessment-id",
        patientId: "123e4567-e89b-12d3-a456-426614174000",
        type: "MMSE",
        responses: [
          { questionId: "orientation_1", response: "correct" },
          { questionId: "orientation_2", response: "correct" },
        ],
      }

      // Mock score result
      const mockScore = {
        totalScore: 28,
        categoryScores: {
          orientation: 10,
          registration: 3,
          attentionCalculation: 5,
          recall: 3,
          language: 6,
          visuospatial: 1,
        },
        interpretation: "Normal cognitive function",
      }

      // Mock prisma findUnique
      ;(prisma.cognitiveAssessment.findUnique as jest.Mock).mockResolvedValue(mockAssessment)

      // Mock cache getOrSet to execute the callback
      ;(caches.assessment.getOrSet as jest.Mock).mockImplementation(async (key, fetchFn) => {
        return await fetchFn()
      })

      // Mock prisma update
      ;(prisma.cognitiveAssessment.update as jest.Mock).mockResolvedValue({
        ...mockAssessment,
        score: mockScore,
      })

      // Call function
      const result = await calculateScore("test-assessment-id")

      // Assertions
      expect(caches.assessment.getOrSet).toHaveBeenCalledWith("score:test-assessment-id", expect.any(Function), {
        ttl: 86400,
      })

      expect(prisma.cognitiveAssessment.findUnique).toHaveBeenCalledWith({
        where: { id: "test-assessment-id" },
      })

      expect(prisma.cognitiveAssessment.update).toHaveBeenCalledWith({
        where: { id: "test-assessment-id" },
        data: { score: expect.any(Object) },
      })
    })

    it("throws NotFoundError for non-existent assessment", async () => {
      // Mock prisma findUnique to return null
      ;(prisma.cognitiveAssessment.findUnique as jest.Mock).mockResolvedValue(null)

      // Mock cache getOrSet to execute the callback
      ;(caches.assessment.getOrSet as jest.Mock).mockImplementation(async (key, fetchFn) => {
        return await fetchFn()
      })

      // Call function and expect error
      await expect(calculateScore("non-existent-id")).rejects.toThrow(NotFoundError)
    })
  })
})

