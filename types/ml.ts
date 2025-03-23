export interface ModelMetadata {
  id: string
  name: string
  version: string
  description?: string
  accuracy?: number
  parameters?: any
  createdAt: string
  updatedAt?: string
  status: string
}

export interface PredictionResult {
  predictedMMSEScore: number
  confidenceInterval: [number, number]
  riskLevel: "low" | "medium" | "high"
  keyFactors: string[]
  recommendations: string[]
}

export interface Anomaly {
  domain: string
  description: string
  severity: "low" | "medium" | "high"
  recommendedAction: string
}

export interface AnomalyDetectionResult {
  anomaliesDetected: boolean
  anomalies: Anomaly[]
}

export interface ExerciseRecommendation {
  id: string
  name: string
  type: string
  difficulty: "easy" | "medium" | "hard"
  targetDomain: string
  expectedBenefit: string
  frequency: string
}

export interface RecommendationResult {
  recommendedExercises: ExerciseRecommendation[]
  focusAreas: string[]
  avoidAreas: string[]
}

export interface SpeechAnalysisResult {
  transcription: string
  analysis: {
    linguisticFeatures: {
      wordFinding: number
      syntaxComplexity: number
      coherence: number
      repetition: number
    }
    potentialIssues: string[]
    overallAssessment: string
  }
}

export interface TextAnalysisResult {
  linguisticFeatures: {
    grammar: number
    vocabulary: number
    coherence: number
    repetition: number
  }
  potentialIssues: string[]
  overallAssessment: string
}

