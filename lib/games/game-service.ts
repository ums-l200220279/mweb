import { PrismaClient } from "@prisma/client"
import { RedisCache } from "@/lib/cache/redis-cache"
import type { Game, GameCategory, GameProgress, GameDifficulty, AdaptiveDifficultySettings } from "@/types/games"
import { AchievementService } from "@/lib/gamification/achievement-service"

const prisma = new PrismaClient()
const CACHE_TTL = 3600 // 1 hour

export class GameService {
  /**
   * Get all published games
   */
  static async getAllGames(): Promise<Game[]> {
    const cacheKey = "games:all"

    return RedisCache.cached<Game[]>(
      cacheKey,
      async () => {
        return prisma.game.findMany({
          where: { isPublished: true },
          orderBy: { title: "asc" },
        })
      },
      { ttl: CACHE_TTL },
    )
  }

  /**
   * Get games by category
   */
  static async getGamesByCategory(category: GameCategory): Promise<Game[]> {
    const cacheKey = `games:category:${category}`

    return RedisCache.cached<Game[]>(
      cacheKey,
      async () => {
        return prisma.game.findMany({
          where: {
            category,
            isPublished: true,
          },
          orderBy: { title: "asc" },
        })
      },
      { ttl: CACHE_TTL },
    )
  }

  /**
   * Get a game by ID
   */
  static async getGameById(gameId: string): Promise<Game | null> {
    const cacheKey = `games:id:${gameId}`

    return RedisCache.cached<Game | null>(
      cacheKey,
      async () => {
        return prisma.game.findUnique({
          where: { id: gameId },
        })
      },
      { ttl: CACHE_TTL },
    )
  }

  /**
   * Get user's game progress
   */
  static async getUserGameProgress(userId: string, gameId?: string): Promise<GameProgress[]> {
    const cacheKey = gameId ? `game-progress:user:${userId}:game:${gameId}` : `game-progress:user:${userId}`

    return RedisCache.cached<GameProgress[]>(
      cacheKey,
      async () => {
        return prisma.gameProgress.findMany({
          where: {
            userId,
            ...(gameId ? { gameId } : {}),
          },
          orderBy: { lastPlayedAt: "desc" },
        })
      },
      { ttl: 300 }, // 5 minutes
    )
  }

  /**
   * Record a game session
   */
  static async recordGameSession(
    userId: string,
    gameId: string,
    score: number,
    difficulty: GameDifficulty,
    metrics: any,
    duration: number,
  ): Promise<any> {
    // Create the game session
    const gameSession = await prisma.gameSession.create({
      data: {
        userId,
        gameId,
        startedAt: new Date(Date.now() - duration * 1000), // Calculate start time
        completedAt: new Date(),
        score,
        difficulty,
        metrics,
        duration,
      },
    })

    // Update game progress
    const gameProgress = await prisma.gameProgress.findUnique({
      where: {
        userId_gameId: {
          userId,
          gameId,
        },
      },
    })

    if (gameProgress) {
      // Update existing progress
      await prisma.gameProgress.update({
        where: {
          id: gameProgress.id,
        },
        data: {
          highScore: Math.max(gameProgress.highScore, score),
          totalTimePlayed: gameProgress.totalTimePlayed + duration,
          lastPlayedAt: new Date(),
          sessionsCompleted: gameProgress.sessionsCompleted + 1,
          currentDifficulty: this.calculateNewDifficulty(gameProgress.currentDifficulty, metrics, difficulty),
          skillProgress: this.updateSkillProgress(gameProgress.skillProgress, metrics),
        },
      })
    } else {
      // Create new progress
      const game = await this.getGameById(gameId)

      if (!game) {
        throw new Error(`Game with ID ${gameId} not found`)
      }

      await prisma.gameProgress.create({
        data: {
          userId,
          gameId,
          highScore: score,
          totalTimePlayed: duration,
          lastPlayedAt: new Date(),
          sessionsCompleted: 1,
          currentDifficulty: difficulty,
          skillProgress: this.initializeSkillProgress(game.targetCognitiveSkills, metrics),
        },
      })
    }

    // Clear cache for this user's game progress
    await RedisCache.delete(`game-progress:user:${userId}`)
    await RedisCache.delete(`game-progress:user:${userId}:game:${gameId}`)

    // Check for achievements
    await AchievementService.checkAndUpdateAchievements(userId, "GAME_COMPLETION", {
      gameId,
      score,
      difficulty,
      accuracy: metrics.accuracy,
      reactionTime: metrics.reactionTime,
      completionRate: metrics.completionRate,
      mistakeCount: metrics.mistakeCount,
      duration,
    })

    return gameSession
  }

  /**
   * Calculate new difficulty based on performance
   */
  private static calculateNewDifficulty(
    currentDifficulty: GameDifficulty,
    metrics: any,
    sessionDifficulty: GameDifficulty,
  ): GameDifficulty {
    // If the session wasn't adaptive, keep the current difficulty
    if (sessionDifficulty !== "ADAPTIVE") {
      return currentDifficulty
    }

    // Default adaptive settings
    const settings: AdaptiveDifficultySettings = {
      initialDifficulty: 50,
      performanceThresholdUp: 85,
      performanceThresholdDown: 60,
      difficultyStepUp: 5,
      difficultyStepDown: 10,
      maxDifficulty: 100,
      minDifficulty: 10,
    }

    // Calculate performance score (0-100)
    const performanceScore =
      metrics.accuracy * 0.4 + metrics.completionRate * 0.4 + (100 - Math.min(metrics.mistakeCount * 5, 100)) * 0.2

    // Convert difficulty enum to numeric value
    let numericDifficulty: number
    switch (currentDifficulty) {
      case "EASY":
        numericDifficulty = 25
        break
      case "MEDIUM":
        numericDifficulty = 50
        break
      case "HARD":
        numericDifficulty = 75
        break
      case "ADAPTIVE":
        numericDifficulty = 50 // Default
        break
    }

    // Adjust difficulty based on performance
    if (performanceScore >= settings.performanceThresholdUp) {
      numericDifficulty = Math.min(settings.maxDifficulty, numericDifficulty + settings.difficultyStepUp)
    } else if (performanceScore <= settings.performanceThresholdDown) {
      numericDifficulty = Math.max(settings.minDifficulty, numericDifficulty - settings.difficultyStepDown)
    }

    // Convert numeric difficulty back to enum
    if (numericDifficulty <= 33) {
      return "EASY"
    } else if (numericDifficulty <= 66) {
      return "MEDIUM"
    } else {
      return "HARD"
    }
  }

  /**
   * Initialize skill progress for a new game progress
   */
  private static initializeSkillProgress(targetSkills: string[], metrics: any): Record<string, number> {
    const skillProgress: Record<string, number> = {}

    for (const skill of targetSkills) {
      skillProgress[skill] = 10 // Start at 10%
    }

    return skillProgress
  }

  /**
   * Update skill progress based on game metrics
   */
  private static updateSkillProgress(currentProgress: Record<string, number>, metrics: any): Record<string, number> {
    const updatedProgress = { ...currentProgress }

    // Calculate performance score (0-100)
    const performanceScore =
      metrics.accuracy * 0.4 + metrics.completionRate * 0.4 + (100 - Math.min(metrics.mistakeCount * 5, 100)) * 0.2

    // Update each skill
    for (const skill in updatedProgress) {
      // Increase progress based on performance, but with diminishing returns
      // as the progress gets higher
      const currentSkillProgress = updatedProgress[skill]
      const progressIncrease = Math.max(0, (performanceScore / 100) * (5 - currentSkillProgress / 25))

      updatedProgress[skill] = Math.min(100, currentSkillProgress + progressIncrease)
    }

    return updatedProgress
  }

  /**
   * Get game recommendations for a user
   */
  static async getGameRecommendations(userId: string, limit = 5): Promise<any[]> {
    // Get user's cognitive assessment data
    const assessments = await prisma.cognitiveAssessment.findMany({
      where: { userId },
      orderBy: { date: "desc" },
      take: 1,
    })

    // Get user's game progress
    const gameProgress = await this.getUserGameProgress(userId)

    // Get all games
    const allGames = await this.getAllGames()

    // Calculate recommendation scores
    const recommendations = allGames.map((game) => {
      let score = 0

      // Check if user has played this game before
      const progress = gameProgress.find((p) => p.gameId === game.id)

      if (progress) {
        // Prefer games the user has played but not mastered
        const avgSkillProgress =
          Object.values(progress.skillProgress).reduce((sum, val) => sum + val, 0) /
          Object.values(progress.skillProgress).length

        if (avgSkillProgress < 50) {
          // User needs more practice
          score += 20
        } else if (avgSkillProgress < 80) {
          // User is making good progress
          score += 10
        } else {
          // User has mastered this game
          score -= 10
        }

        // Prefer games played recently but not too recently
        const daysSinceLastPlayed = Math.floor((Date.now() - progress.lastPlayedAt.getTime()) / (1000 * 60 * 60 * 24))

        if (daysSinceLastPlayed < 1) {
          // Played today, lower priority
          score -= 15
        } else if (daysSinceLastPlayed < 3) {
          // Played in the last few days, good spacing
          score += 15
        } else if (daysSinceLastPlayed < 7) {
          // Played in the last week, good spacing
          score += 10
        } else if (daysSinceLastPlayed < 30) {
          // Played in the last month, might need a refresher
          score += 5
        } else {
          // Hasn't played in a while, might have forgotten
          score += 0
        }
      } else {
        // New games get a boost
        score += 15
      }

      // If we have assessment data, use it to recommend games
      if (assessments.length > 0) {
        const assessment = assessments[0]

        // Check which cognitive areas need improvement
        const cognitiveAreas = assessment.details.cognitiveAreas || {}

        for (const skill of game.targetCognitiveSkills) {
          const skillScore = cognitiveAreas[skill] || 50

          if (skillScore < 40) {
            // This area needs significant improvement
            score += 25
          } else if (skillScore < 70) {
            // This area could use some improvement
            score += 15
          } else {
            // This area is strong
            score += 5
          }
        }
      }

      return {
        game,
        score,
      }
    })

    // Sort by score and take the top recommendations
    const topRecommendations = recommendations.sort((a, b) => b.score - a.score).slice(0, limit)

    // Format the response
    return topRecommendations.map((rec) => ({
      id: rec.game.id,
      title: rec.game.title,
      description: rec.game.description,
      category: rec.game.category,
      thumbnailUrl: rec.game.thumbnailUrl,
      recommendationScore: rec.score,
      reason: this.getRecommendationReason(rec.game, rec.score),
    }))
  }

  /**
   * Get a human-readable reason for a game recommendation
   */
  private static getRecommendationReason(game: Game, score: number): string {
    if (score > 40) {
      return `This game targets cognitive skills that could benefit from significant improvement.`
    } else if (score > 30) {
      return `This game is well-suited to your current cognitive profile and learning needs.`
    } else if (score > 20) {
      return `This game provides good practice for skills you're currently developing.`
    } else if (score > 10) {
      return `This game introduces new cognitive challenges that complement your strengths.`
    } else {
      return `This game offers variety to your brain training routine.`
    }
  }
}

