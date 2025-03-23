export type AchievementCategory =
  | "COGNITIVE_EXERCISE"
  | "MEDICATION_ADHERENCE"
  | "PHYSICAL_ACTIVITY"
  | "SLEEP_QUALITY"
  | "SOCIAL_ENGAGEMENT"
  | "LEARNING"
  | "CONSISTENCY"

export type RewardType = "BADGE" | "POINTS" | "LEVEL_UP" | "UNLOCK_CONTENT" | "CERTIFICATE"

export interface Achievement {
  id: string
  title: string
  description: string
  category: AchievementCategory
  iconUrl: string
  points: number
  requirements: AchievementRequirement[]
  createdAt: Date
  updatedAt: Date
}

export interface AchievementRequirement {
  type: string
  target: number
  operator: "EQUAL" | "GREATER_THAN" | "LESS_THAN" | "BETWEEN"
  value?: number
  minValue?: number
  maxValue?: number
}

export interface UserAchievement {
  id: string
  userId: string
  achievementId: string
  achievement?: Achievement
  earnedAt: Date
  progress: number
  completed: boolean
}

export interface Reward {
  id: string
  userId: string
  type: RewardType
  amount: number
  reason: string
  achievementId?: string
  createdAt: Date
}

export interface UserLevel {
  id: string
  userId: string
  level: number
  currentPoints: number
  pointsToNextLevel: number
  updatedAt: Date
}

export interface LeaderboardEntry {
  userId: string
  username: string
  avatarUrl?: string
  points: number
  level: number
  rank: number
}

export interface GameSession {
  id: string
  userId: string
  gameId: string
  startedAt: Date
  completedAt?: Date
  score: number
  difficulty: "EASY" | "MEDIUM" | "HARD" | "ADAPTIVE"
  metrics: GameMetrics
  duration: number // in seconds
}

export interface GameMetrics {
  accuracy: number // percentage
  reactionTime?: number // milliseconds
  completionRate: number // percentage
  mistakeCount: number
  customMetrics?: Record<string, any>
}

export interface CognitiveAssessment {
  id: string
  userId: string
  assessmentType: string
  score: number
  date: Date
  details: any
}

