/**
 * Adaptive Difficulty Engine for Cognitive Games
 *
 * This engine dynamically adjusts game difficulty based on player performance,
 * cognitive profile, and therapeutic goals. It ensures optimal challenge levels
 * for maximum cognitive benefit while maintaining player engagement.
 */

// Player performance metrics interface
interface PlayerPerformance {
  accuracy: number // 0-1 representing percentage correct
  responseTime: number // Average response time in milliseconds
  completionRate: number // 0-1 representing percentage of tasks completed
  consistencyScore: number // 0-1 representing consistency across attempts
  fatigueIndicator: number // 0-1 representing estimated cognitive fatigue
}

// Cognitive profile interface
interface CognitiveProfile {
  memory: number // 0-100 score for memory function
  attention: number // 0-100 score for attention function
  processing: number // 0-100 score for processing speed
  executive: number // 0-100 score for executive function
  language: number // 0-100 score for language skills
  visualSpatial: number // 0-100 score for visual-spatial skills
}

// Game difficulty parameters interface
interface DifficultyParameters {
  level: number // Overall difficulty level (1-10)
  timeConstraint: number // Time allowed in seconds
  complexity: number // Complexity of patterns/tasks (1-10)
  distractorLevel: number // Level of distracting elements (0-10)
  itemCount: number // Number of items to remember/process
  assistanceLevel: number // Level of hints/assistance provided (0-10)
}

// Game session context
interface GameContext {
  gameType: string // Type of cognitive game
  sessionDuration: number // Total session time in minutes
  therapeuticGoals: string[] // Array of therapeutic goals
  previousSessions: {
    // History of previous sessions
    date: Date
    performance: PlayerPerformance
    difficulty: DifficultyParameters
  }[]
  patientFatigue: number // Estimated fatigue level (0-10)
  timeOfDay: string // Time of day (morning, afternoon, evening)
}

export class AdaptiveDifficultyEngine {
  private learningRate = 0.2
  private consistencyThreshold = 0.7
  private optimalAccuracyRange = { min: 0.7, max: 0.85 }
  private maxDifficultyJump = 2

  /**
   * Calculate the next difficulty level based on player performance and context
   */
  calculateNextDifficulty(
    currentDifficulty: DifficultyParameters,
    performance: PlayerPerformance,
    profile: CognitiveProfile,
    context: GameContext,
  ): DifficultyParameters {
    // Clone current difficulty to avoid mutation
    const nextDifficulty: DifficultyParameters = { ...currentDifficulty }

    // Calculate performance score (weighted average of metrics)
    const performanceScore = this.calculatePerformanceScore(performance)

    // Determine if difficulty should increase, decrease, or stay the same
    const difficultyDirection = this.determineDifficultyDirection(performanceScore, performance, context)

    // Apply difficulty adjustments based on game type and cognitive profile
    this.applyGameSpecificAdjustments(nextDifficulty, difficultyDirection, profile, context)

    // Apply constraints to ensure changes aren't too drastic
    this.applyConstraints(nextDifficulty, currentDifficulty)

    // Apply therapeutic adjustments based on goals
    this.applyTherapeuticAdjustments(nextDifficulty, context.therapeuticGoals, profile)

    return nextDifficulty
  }

  /**
   * Calculate a weighted performance score from various metrics
   */
  private calculatePerformanceScore(performance: PlayerPerformance): number {
    return (
      performance.accuracy * 0.4 +
      (1 - performance.responseTime / 5000) * 0.2 +
      performance.completionRate * 0.2 +
      performance.consistencyScore * 0.1 +
      (1 - performance.fatigueIndicator) * 0.1
    )
  }

  /**
   * Determine if difficulty should increase, decrease, or stay the same
   */
  private determineDifficultyDirection(
    performanceScore: number,
    performance: PlayerPerformance,
    context: GameContext,
  ): number {
    // If accuracy is too low, decrease difficulty
    if (performance.accuracy < this.optimalAccuracyRange.min) {
      return -1
    }

    // If accuracy is too high, increase difficulty
    if (performance.accuracy > this.optimalAccuracyRange.max && performance.fatigueIndicator < 0.7) {
      return 1
    }

    // If fatigue is high, slightly decrease difficulty
    if (performance.fatigueIndicator > 0.8 || context.patientFatigue > 7) {
      return -0.5
    }

    // Otherwise maintain current difficulty
    return 0
  }

  /**
   * Apply game-specific adjustments to difficulty parameters
   */
  private applyGameSpecificAdjustments(
    difficulty: DifficultyParameters,
    direction: number,
    profile: CognitiveProfile,
    context: GameContext,
  ): void {
    const adjustmentFactor = direction * this.learningRate

    switch (context.gameType) {
      case "memory":
        difficulty.itemCount = Math.max(2, Math.round(difficulty.itemCount + adjustmentFactor * 2))
        difficulty.timeConstraint = Math.max(5, difficulty.timeConstraint - adjustmentFactor * 3)
        // Adjust based on memory profile
        if (profile.memory < 40) {
          difficulty.assistanceLevel = Math.min(10, difficulty.assistanceLevel + 1)
        }
        break

      case "attention":
        difficulty.distractorLevel = Math.max(0, Math.min(10, difficulty.distractorLevel + adjustmentFactor * 3))
        difficulty.complexity = Math.max(1, Math.min(10, difficulty.complexity + adjustmentFactor * 1.5))
        break

      case "processing":
        difficulty.timeConstraint = Math.max(2, difficulty.timeConstraint - adjustmentFactor * 4)
        difficulty.complexity = Math.max(1, Math.min(10, difficulty.complexity + adjustmentFactor * 1))
        break

      case "executive":
        difficulty.complexity = Math.max(1, Math.min(10, difficulty.complexity + adjustmentFactor * 2))
        difficulty.itemCount = Math.max(2, Math.round(difficulty.itemCount + adjustmentFactor * 1.5))
        break

      case "language":
        difficulty.complexity = Math.max(1, Math.min(10, difficulty.complexity + adjustmentFactor * 2))
        difficulty.timeConstraint = Math.max(5, difficulty.timeConstraint - adjustmentFactor * 2)
        break
    }

    // Overall difficulty level adjustment
    difficulty.level = Math.max(1, Math.min(10, difficulty.level + adjustmentFactor * 1.5))
  }

  /**
   * Apply constraints to ensure changes aren't too drastic
   */
  private applyConstraints(newDifficulty: DifficultyParameters, oldDifficulty: DifficultyParameters): void {
    // Ensure level doesn't change too drastically
    if (newDifficulty.level - oldDifficulty.level > this.maxDifficultyJump) {
      newDifficulty.level = oldDifficulty.level + this.maxDifficultyJump
    } else if (oldDifficulty.level - newDifficulty.level > this.maxDifficultyJump) {
      newDifficulty.level = oldDifficulty.level - this.maxDifficultyJump
    }

    // Round numeric values for consistency
    newDifficulty.level = Math.round(newDifficulty.level)
    newDifficulty.itemCount = Math.round(newDifficulty.itemCount)
    newDifficulty.complexity = Math.round(newDifficulty.complexity)
    newDifficulty.distractorLevel = Math.round(newDifficulty.distractorLevel)
    newDifficulty.assistanceLevel = Math.round(newDifficulty.assistanceLevel)

    // Ensure all values are within valid ranges
    newDifficulty.level = Math.max(1, Math.min(10, newDifficulty.level))
    newDifficulty.complexity = Math.max(1, Math.min(10, newDifficulty.complexity))
    newDifficulty.distractorLevel = Math.max(0, Math.min(10, newDifficulty.distractorLevel))
    newDifficulty.itemCount = Math.max(1, newDifficulty.itemCount)
    newDifficulty.timeConstraint = Math.max(1, newDifficulty.timeConstraint)
    newDifficulty.assistanceLevel = Math.max(0, Math.min(10, newDifficulty.assistanceLevel))
  }

  /**
   * Apply therapeutic adjustments based on goals
   */
  private applyTherapeuticAdjustments(
    difficulty: DifficultyParameters,
    goals: string[],
    profile: CognitiveProfile,
  ): void {
    // Adjust difficulty based on therapeutic goals
    if (goals.includes("improve_processing_speed")) {
      difficulty.timeConstraint = Math.max(1, difficulty.timeConstraint * 0.9)
    }

    if (goals.includes("reduce_cognitive_load")) {
      difficulty.distractorLevel = Math.max(0, difficulty.distractorLevel - 1)
      difficulty.assistanceLevel = Math.min(10, difficulty.assistanceLevel + 1)
    }

    if (goals.includes("build_confidence")) {
      // Slightly easier to build confidence
      difficulty.level = Math.max(1, difficulty.level - 0.5)
    }

    // Personalize based on cognitive profile strengths/weaknesses
    const weakestDomain = this.findWeakestDomain(profile)
    if (weakestDomain && profile[weakestDomain as keyof CognitiveProfile] < 40) {
      // Provide more assistance in the weakest cognitive domain
      difficulty.assistanceLevel = Math.min(10, difficulty.assistanceLevel + 2)
    }
  }

  /**
   * Find the weakest cognitive domain
   */
  private findWeakestDomain(profile: CognitiveProfile): string | null {
    let minScore = 100
    let weakestDomain = null

    for (const [domain, score] of Object.entries(profile)) {
      if (score < minScore) {
        minScore = score
        weakestDomain = domain
      }
    }

    return weakestDomain
  }

  /**
   * Get recommended initial difficulty based on cognitive profile
   */
  getInitialDifficulty(gameType: string, profile: CognitiveProfile): DifficultyParameters {
    // Base difficulty template
    const baseDifficulty: DifficultyParameters = {
      level: 3,
      timeConstraint: 30,
      complexity: 3,
      distractorLevel: 2,
      itemCount: 5,
      assistanceLevel: 3,
    }

    // Adjust based on relevant cognitive domain
    let relevantScore = 50 // Default middle score

    switch (gameType) {
      case "memory":
        relevantScore = profile.memory
        break
      case "attention":
        relevantScore = profile.attention
        break
      case "processing":
        relevantScore = profile.processing
        break
      case "executive":
        relevantScore = profile.executive
        break
      case "language":
        relevantScore = profile.language
        break
    }

    // Scale difficulty based on cognitive score (higher score = higher initial difficulty)
    const difficultyScaleFactor = relevantScore / 50 // 1.0 is baseline

    baseDifficulty.level = Math.max(1, Math.min(10, Math.round(baseDifficulty.level * difficultyScaleFactor)))
    baseDifficulty.complexity = Math.max(1, Math.min(10, Math.round(baseDifficulty.complexity * difficultyScaleFactor)))
    baseDifficulty.itemCount = Math.max(2, Math.round(baseDifficulty.itemCount * difficultyScaleFactor))

    // Inverse relationship for assistance (higher score = less assistance)
    baseDifficulty.assistanceLevel = Math.max(
      0,
      Math.min(10, Math.round(baseDifficulty.assistanceLevel * (2 - difficultyScaleFactor))),
    )

    return baseDifficulty
  }
}

export default AdaptiveDifficultyEngine

