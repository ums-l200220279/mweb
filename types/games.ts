export type GameCategory =
  | "MEMORY"
  | "ATTENTION"
  | "PROCESSING_SPEED"
  | "EXECUTIVE_FUNCTION"
  | "LANGUAGE"
  | "VISUAL_SPATIAL"
  | "PROBLEM_SOLVING"

export type GameDifficulty = "EASY" | "MEDIUM" | "HARD" | "ADAPTIVE"

export interface Game {
  id: string
  title: string
  description: string
  instructions: string
  category: GameCategory
  targetCognitiveSkills: string[]
  thumbnailUrl: string
  minPlayTime: number // in seconds
  maxPlayTime: number // in seconds
  defaultDifficulty: GameDifficulty
  supportedDifficulties: GameDifficulty[]
  isAdaptive: boolean
  isPublished: boolean
  createdAt: Date
  updatedAt: Date
}

export interface GameProgress {
  id: string
  userId: string
  gameId: string
  highScore: number
  totalTimePlayed: number // in seconds
  lastPlayedAt: Date
  sessionsCompleted: number
  currentDifficulty: GameDifficulty
  skillProgress: Record<string, number> // Maps cognitive skills to progress (0-100)
}

export interface MemoryGameConfig {
  gridSize: number
  itemCount: number
  exposureTime: number // in milliseconds
  matchingPairs: boolean
  categories: string[]
  useImages: boolean
  useAudio: boolean
  timeLimit?: number // in seconds
}

export interface AttentionGameConfig {
  stimuliCount: number
  targetStimuliRatio: number
  presentationSpeed: number // in milliseconds
  distractors: boolean
  timeLimit?: number // in seconds
}

export interface ProcessingSpeedGameConfig {
  itemCount: number
  complexity: number
  timeLimit: number // in seconds
}

export interface PatternRecognitionGameConfig {
  patternLength: number
  patternTypes: string[]
  timePerPattern: number // in seconds
  progressiveComplexity: boolean
}

export interface LanguageGameConfig {
  wordCount: number
  complexity: number
  categories: string[]
  timeLimit?: number // in seconds
}

export interface GameRecommendation {
  userId: string
  gameId: string
  reason: string
  priority: number
  createdAt: Date
}

export interface AdaptiveDifficultySettings {
  initialDifficulty: number // 0-100 scale
  performanceThresholdUp: number // e.g., 85% to increase difficulty
  performanceThresholdDown: number // e.g., 60% to decrease difficulty
  difficultyStepUp: number // how much to increase difficulty
  difficultyStepDown: number // how much to decrease difficulty
  maxDifficulty: number
  minDifficulty: number
}

