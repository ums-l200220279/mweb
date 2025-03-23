import { logger } from "@/lib/logger"
import { apiClient } from "@/lib/api/fetcher"

// Types for ML model inputs and outputs
export interface CognitiveDeclineInput {
  patientId: string
  cognitiveScores: Array<{
    date: string
    mmseScore: number
    domainScores: {
      memory: number
      attention: number
      language: number
      visuospatial: number
      executiveFunction: number
    }
  }>
  demographics: {
    age: number
    gender: string
    education: string
    medicalHistory: string[]
  }
}

export interface CognitiveDeclineOutput {
  riskScore: number
  riskLevel: "low" | "moderate" | "high"
  confidenceInterval: {
    lower: number
    upper: number
  }
  projectedDecline: Array<{
    date: string
    projectedScore: number
    confidenceLower: number
    confidenceUpper: number
  }>
  contributingFactors: Array<{
    factor: string
    importance: number
  }>
  recommendations: string[]
}

export interface AnomalyInput {
  patientId: string
  cognitiveScores: Array<{
    date: string
    mmseScore: number
    domainScores: Record<string, number>
  }>
  gameSessions: Array<{
    gameId: string
    completedAt: string
    score: number
    metrics: Record<string, number>
  }>
}

export interface AnomalyOutput {
  anomalies: Array<{
    detectedAt: string
    type: string
    severity: "low" | "moderate" | "high"
    affectedDomain: string
    description: string
    confidence: number
  }>
}

export interface RecommendationInput {
  patientId: string
  cognitiveProfile: {
    strengths: string[]
    weaknesses: string[]
    mmseScore: number
    domainScores: Record<string, number>
  }
  preferences: {
    interests: string[]
    activityLevel: "low" | "moderate" | "high"
    timeAvailable: number
  }
  previousRecommendations?: Array<{
    recommendation: string
    adherence: number
    feedback: string
  }>
}

export interface RecommendationOutput {
  cognitiveExercises: Array<{
    name: string
    description: string
    targetDomain: string
    difficulty: "easy" | "medium" | "hard"
    timeRequired: number
    instructions: string
  }>
  lifestyleRecommendations: Array<{
    category: string
    recommendation: string
    rationale: string
    evidence: string
  }>
  medicalRecommendations?: Array<{
    recommendation: string
    urgency: "routine" | "soon" | "urgent"
    rationale: string
    disclaimer: string
  }>
}

export interface SpeechAnalysisInput {
  patientId: string
  audioUrl: string
  prompt: string
  previousAnalyses?: Array<{
    date: string
    metrics: Record<string, number>
  }>
}

export interface SpeechAnalysisOutput {
  transcript: string
  metrics: {
    fluency: number
    coherence: number
    vocabulary: number
    grammaticalAccuracy: number
    hesitations: number
    fillerWords: number
    sentenceComplexity: number
  }
  anomalies: Array<{
    type: string
    description: string
    confidence: number
    examples: string[]
  }>
  comparison?: {
    trend: "improving" | "stable" | "declining"
    significantChanges: Array<{
      metric: string
      change: number
      significance: number
    }>
  }
}

export interface TextAnalysisInput {
  patientId: string
  text: string
  prompt: string
  previousAnalyses?: Array<{
    date: string
    metrics: Record<string, number>
  }>
}

export interface TextAnalysisOutput {
  metrics: {
    coherence: number
    complexity: number
    vocabulary: number
    grammaticalAccuracy: number
    topicAdherence: number
    sentenceVariety: number
  }
  anomalies: Array<{
    type: string
    description: string
    confidence: number
    examples: string[]
  }>
  comparison?: {
    trend: "improving" | "stable" | "declining"
    significantChanges: Array<{
      metric: string
      change: number
      significance: number
    }>
  }
}

// Cache for ML model results
const modelCache = new Map<string, { result: any; timestamp: number }>()
const CACHE_TTL = 1000 * 60 * 60 // 1 hour

// Helper function to get cached result or compute new result
async function getCachedOrCompute<T, U>(cacheKey: string, computeFn: () => Promise<U>): Promise<U> {
  const cached = modelCache.get(cacheKey)

  // Return cached result if it exists and is not expired
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    logger.debug(`Using cached result for ${cacheKey}`)
    return cached.result as U
  }

  // Compute new result
  logger.info(`Computing new result for ${cacheKey}`)
  const result = await computeFn()

  // Cache the result
  modelCache.set(cacheKey, {
    result,
    timestamp: Date.now(),
  })

  return result
}

// ML model implementations
export const mlModels = {
  /**
   * Predicts cognitive decline based on historical cognitive scores and patient demographics
   */
  predictCognitiveDecline: async (input: CognitiveDeclineInput): Promise<CognitiveDeclineOutput> => {
    const cacheKey = `cognitive-decline-${input.patientId}-${JSON.stringify(input.cognitiveScores.slice(-3))}`

    return getCachedOrCompute(cacheKey, async () => {
      try {
        logger.info(`Predicting cognitive decline for patient ${input.patientId}`)

        const result = await apiClient.post<CognitiveDeclineOutput>(
          "/api/ml/predict-cognitive-decline",
          input,
          { timeout: 20000 }, // Longer timeout for ML operations
        )

        return result
      } catch (error) {
        logger.error(
          `Failed to predict cognitive decline for patient ${input.patientId}`,
          error instanceof Error ? error : new Error(String(error)),
        )

        // Return a fallback result in case of error
        return {
          riskScore: 0.5,
          riskLevel: "moderate",
          confidenceInterval: { lower: 0.4, upper: 0.6 },
          projectedDecline: input.cognitiveScores.slice(-3).map((score, index) => ({
            date: new Date(Date.now() + (index + 1) * 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
            projectedScore: score.mmseScore * 0.98,
            confidenceLower: score.mmseScore * 0.95,
            confidenceUpper: score.mmseScore * 1.01,
          })),
          contributingFactors: [
            { factor: "Age", importance: 0.3 },
            { factor: "Previous MMSE Scores", importance: 0.5 },
          ],
          recommendations: [
            "Continue regular cognitive assessments",
            "Maintain physical activity",
            "Engage in cognitive exercises",
          ],
        }
      }
    })
  },

  /**
   * Detects anomalies in cognitive performance based on historical data
   */
  detectAnomalies: async (input: AnomalyInput): Promise<AnomalyOutput> => {
    const cacheKey = `anomalies-${input.patientId}-${input.cognitiveScores.length}-${input.gameSessions.length}`

    return getCachedOrCompute(cacheKey, async () => {
      try {
        logger.info(`Detecting anomalies for patient ${input.patientId}`)

        const result = await apiClient.post<AnomalyOutput>("/api/ml/detect-anomalies", input, { timeout: 15000 })

        return result
      } catch (error) {
        logger.error(
          `Failed to detect anomalies for patient ${input.patientId}`,
          error instanceof Error ? error : new Error(String(error)),
        )

        // Return empty anomalies in case of error
        return { anomalies: [] }
      }
    })
  },

  /**
   * Generates personalized recommendations based on cognitive profile and preferences
   */
  generatePersonalizedRecommendations: async (input: RecommendationInput): Promise<RecommendationOutput> => {
    const cacheKey = `recommendations-${input.patientId}-${JSON.stringify(input.cognitiveProfile)}-${JSON.stringify(input.preferences)}`

    return getCachedOrCompute(cacheKey, async () => {
      try {
        logger.info(`Generating recommendations for patient ${input.patientId}`)

        const result = await apiClient.post<RecommendationOutput>("/api/ml/generate-recommendations", input, {
          timeout: 15000,
        })

        return result
      } catch (error) {
        logger.error(
          `Failed to generate recommendations for patient ${input.patientId}`,
          error instanceof Error ? error : new Error(String(error)),
        )

        // Return basic recommendations in case of error
        return {
          cognitiveExercises: [
            {
              name: "Memory Card Matching",
              description: "A simple card matching game to improve memory",
              targetDomain: "memory",
              difficulty: "easy",
              timeRequired: 10,
              instructions: "Flip cards to find matching pairs",
            },
          ],
          lifestyleRecommendations: [
            {
              category: "Physical Activity",
              recommendation: "Take a 30-minute walk daily",
              rationale: "Regular physical activity improves cognitive function",
              evidence: "Multiple studies have shown the benefits of exercise for brain health",
            },
          ],
        }
      }
    })
  },

  /**
   * Analyzes speech for cognitive indicators
   */
  analyzeSpeech: async (input: SpeechAnalysisInput): Promise<SpeechAnalysisOutput> => {
    // Don't cache speech analysis results as they should be analyzed fresh each time
    try {
      logger.info(`Analyzing speech for patient ${input.patientId}`)

      const result = await apiClient.post<SpeechAnalysisOutput>(
        "/api/ml/analyze-speech",
        input,
        { timeout: 30000 }, // Longer timeout for speech processing
      )

      return result
    } catch (error) {
      logger.error(
        `Failed to analyze speech for patient ${input.patientId}`,
        error instanceof Error ? error : new Error(String(error)),
      )

      // Return basic analysis in case of error
      return {
        transcript: "Speech analysis failed. Please try again.",
        metrics: {
          fluency: 0.5,
          coherence: 0.5,
          vocabulary: 0.5,
          grammaticalAccuracy: 0.5,
          hesitations: 0.5,
          fillerWords: 0.5,
          sentenceComplexity: 0.5,
        },
        anomalies: [],
      }
    }
  },

  /**
   * Analyzes text for cognitive indicators
   */
  analyzeText: async (input: TextAnalysisInput): Promise<TextAnalysisOutput> => {
    // Don't cache text analysis results as they should be analyzed fresh each time
    try {
      logger.info(`Analyzing text for patient ${input.patientId}`)

      const result = await apiClient.post<TextAnalysisOutput>("/api/ml/analyze-text", input, { timeout: 15000 })

      return result
    } catch (error) {
      logger.error(
        `Failed to analyze text for patient ${input.patientId}`,
        error instanceof Error ? error : new Error(String(error)),
      )

      // Return basic analysis in case of error
      return {
        metrics: {
          coherence: 0.5,
          complexity: 0.5,
          vocabulary: 0.5,
          grammaticalAccuracy: 0.5,
          topicAdherence: 0.5,
          sentenceVariety: 0.5,
        },
        anomalies: [],
      }
    }
  },

  // Clear the cache for a specific patient or all patients
  clearCache: (patientId?: string) => {
    if (patientId) {
      // Clear cache for a specific patient
      const keysToDelete: string[] = []

      modelCache.forEach((_, key) => {
        if (key.includes(patientId)) {
          keysToDelete.push(key)
        }
      })

      keysToDelete.forEach((key) => modelCache.delete(key))
      logger.info(`Cleared ML model cache for patient ${patientId}`)
    } else {
      // Clear all cache
      modelCache.clear()
      logger.info("Cleared all ML model cache")
    }
  },
}

