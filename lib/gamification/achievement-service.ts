import { PrismaClient } from "@prisma/client"
import { RedisCache } from "@/lib/cache/redis-cache"
import type { Achievement, UserAchievement, AchievementCategory } from "@/types/gamification"

const prisma = new PrismaClient()
const CACHE_TTL = 3600 // 1 hour

export class AchievementService {
  /**
   * Get all available achievements
   */
  static async getAllAchievements(): Promise<Achievement[]> {
    const cacheKey = "achievements:all"

    return RedisCache.cached<Achievement[]>(
      cacheKey,
      async () => {
        return prisma.achievement.findMany({
          orderBy: { category: "asc" },
        })
      },
      { ttl: CACHE_TTL },
    )
  }

  /**
   * Get achievements by category
   */
  static async getAchievementsByCategory(category: AchievementCategory): Promise<Achievement[]> {
    const cacheKey = `achievements:category:${category}`

    return RedisCache.cached<Achievement[]>(
      cacheKey,
      async () => {
        return prisma.achievement.findMany({
          where: { category },
          orderBy: { points: "desc" },
        })
      },
      { ttl: CACHE_TTL },
    )
  }

  /**
   * Get user achievements
   */
  static async getUserAchievements(userId: string): Promise<UserAchievement[]> {
    const cacheKey = `achievements:user:${userId}`

    return RedisCache.cached<UserAchievement[]>(
      cacheKey,
      async () => {
        return prisma.userAchievement.findMany({
          where: { userId },
          include: { achievement: true },
          orderBy: { earnedAt: "desc" },
        })
      },
      { ttl: 300 }, // 5 minutes, shorter TTL for user-specific data
    )
  }

  /**
   * Check and update achievements for a user based on an activity
   */
  static async checkAndUpdateAchievements(
    userId: string,
    activityType: string,
    activityData: any,
  ): Promise<UserAchievement[]> {
    // Get all achievements that might be affected by this activity
    const relevantAchievements = await prisma.achievement.findMany({
      where: {
        requirements: {
          some: {
            type: activityType,
          },
        },
      },
    })

    if (relevantAchievements.length === 0) {
      return []
    }

    // Get user's current progress on these achievements
    const userAchievements = await prisma.userAchievement.findMany({
      where: {
        userId,
        achievementId: {
          in: relevantAchievements.map((a) => a.id),
        },
      },
    })

    // Map for quick lookup
    const userAchievementMap = new Map(userAchievements.map((ua) => [ua.achievementId, ua]))

    const updatedAchievements: UserAchievement[] = []
    const newlyCompletedAchievements: UserAchievement[] = []

    // Check each achievement
    for (const achievement of relevantAchievements) {
      let userAchievement = userAchievementMap.get(achievement.id)

      // Skip if already completed
      if (userAchievement?.completed) {
        continue
      }

      // Calculate progress based on requirements and activity data
      const progress = this.calculateProgress(achievement, activityData)
      const completed = progress >= 100

      if (!userAchievement) {
        // Create new user achievement if it doesn't exist
        userAchievement = await prisma.userAchievement.create({
          data: {
            userId,
            achievementId: achievement.id,
            progress,
            completed,
            earnedAt: completed ? new Date() : null,
          },
        })
      } else {
        // Update existing user achievement
        userAchievement = await prisma.userAchievement.update({
          where: { id: userAchievement.id },
          data: {
            progress: Math.max(userAchievement.progress, progress),
            completed: completed || userAchievement.completed,
            earnedAt: completed && !userAchievement.completed ? new Date() : userAchievement.earnedAt,
          },
        })
      }

      updatedAchievements.push(userAchievement)

      if (
        completed &&
        (!userAchievementMap.has(achievement.id) || !userAchievementMap.get(achievement.id)!.completed)
      ) {
        newlyCompletedAchievements.push(userAchievement)
      }
    }

    // If any achievements were completed, award points and create rewards
    if (newlyCompletedAchievements.length > 0) {
      await this.awardAchievementRewards(userId, newlyCompletedAchievements)

      // Clear cache for this user's achievements
      await RedisCache.delete(`achievements:user:${userId}`)
    }

    return updatedAchievements
  }

  /**
   * Calculate progress for an achievement based on activity data
   */
  private static calculateProgress(achievement: Achievement, activityData: any): number {
    let totalProgress = 0
    let requirementCount = 0

    for (const requirement of achievement.requirements) {
      let requirementProgress = 0
      const value = activityData[requirement.type] || 0

      switch (requirement.operator) {
        case "EQUAL":
          requirementProgress = value === requirement.target ? 100 : 0
          break
        case "GREATER_THAN":
          requirementProgress = value >= requirement.target ? 100 : (value / requirement.target) * 100
          break
        case "LESS_THAN":
          requirementProgress = value <= requirement.target ? 100 : 0
          break
        case "BETWEEN":
          if (requirement.minValue !== undefined && requirement.maxValue !== undefined) {
            if (value >= requirement.minValue && value <= requirement.maxValue) {
              requirementProgress = 100
            } else if (value < requirement.minValue) {
              requirementProgress = (value / requirement.minValue) * 100
            } else {
              requirementProgress = 0
            }
          }
          break
      }

      totalProgress += requirementProgress
      requirementCount++
    }

    return requirementCount > 0 ? totalProgress / requirementCount : 0
  }

  /**
   * Award rewards for completed achievements
   */
  private static async awardAchievementRewards(
    userId: string,
    completedAchievements: UserAchievement[],
  ): Promise<void> {
    // Get the full achievement details
    const achievementIds = completedAchievements.map((ua) => ua.achievementId)
    const achievements = await prisma.achievement.findMany({
      where: { id: { in: achievementIds } },
    })

    const achievementMap = new Map(achievements.map((a) => [a.id, a]))

    // Create rewards and update user level
    const rewards = completedAchievements.map((ua) => ({
      userId,
      type: "BADGE" as const,
      amount: achievementMap.get(ua.achievementId)?.points || 0,
      reason: `Completed achievement: ${achievementMap.get(ua.achievementId)?.title}`,
      achievementId: ua.achievementId,
    }))

    // Create rewards
    await prisma.reward.createMany({
      data: rewards,
    })

    // Update user level
    const totalPoints = rewards.reduce((sum, reward) => sum + reward.amount, 0)

    if (totalPoints > 0) {
      const userLevel = await prisma.userLevel.findUnique({
        where: { userId },
      })

      if (userLevel) {
        // Update existing level
        const newPoints = userLevel.currentPoints + totalPoints
        const newLevel = this.calculateLevel(newPoints)

        await prisma.userLevel.update({
          where: { userId },
          data: {
            currentPoints: newPoints,
            level: newLevel,
            pointsToNextLevel: this.calculatePointsToNextLevel(newPoints, newLevel),
          },
        })

        // If level increased, create a level up reward
        if (newLevel > userLevel.level) {
          await prisma.reward.create({
            data: {
              userId,
              type: "LEVEL_UP",
              amount: newLevel - userLevel.level,
              reason: `Leveled up to level ${newLevel}`,
            },
          })
        }
      } else {
        // Create new level
        const newLevel = this.calculateLevel(totalPoints)

        await prisma.userLevel.create({
          data: {
            userId,
            currentPoints: totalPoints,
            level: newLevel,
            pointsToNextLevel: this.calculatePointsToNextLevel(totalPoints, newLevel),
          },
        })

        // Create a level up reward
        await prisma.reward.create({
          data: {
            userId,
            type: "LEVEL_UP",
            amount: newLevel,
            reason: `Reached level ${newLevel}`,
          },
        })
      }
    }
  }

  /**
   * Calculate level based on points
   */
  private static calculateLevel(points: number): number {
    // Simple level calculation: level = sqrt(points / 100)
    return Math.floor(Math.sqrt(points / 100)) + 1
  }

  /**
   * Calculate points needed for next level
   */
  private static calculatePointsToNextLevel(currentPoints: number, currentLevel: number): number {
    const nextLevelPoints = Math.pow(currentLevel, 2) * 100
    return Math.max(0, nextLevelPoints - currentPoints)
  }

  /**
   * Get leaderboard
   */
  static async getLeaderboard(limit = 10): Promise<any[]> {
    const cacheKey = `leaderboard:top:${limit}`

    return RedisCache.cached<any[]>(
      cacheKey,
      async () => {
        const topUsers = await prisma.userLevel.findMany({
          orderBy: { currentPoints: "desc" },
          take: limit,
          include: {
            user: {
              select: {
                id: true,
                name: true,
                image: true,
              },
            },
          },
        })

        return topUsers.map((entry, index) => ({
          userId: entry.userId,
          username: entry.user.name,
          avatarUrl: entry.user.image,
          points: entry.currentPoints,
          level: entry.level,
          rank: index + 1,
        }))
      },
      { ttl: 3600 }, // 1 hour
    )
  }

  /**
   * Get user rank
   */
  static async getUserRank(userId: string): Promise<{ rank: number; totalUsers: number }> {
    const userLevel = await prisma.userLevel.findUnique({
      where: { userId },
    })

    if (!userLevel) {
      return { rank: 0, totalUsers: 0 }
    }

    const higherRankedCount = await prisma.userLevel.count({
      where: {
        currentPoints: { gt: userLevel.currentPoints },
      },
    })

    const totalUsers = await prisma.userLevel.count()

    return {
      rank: higherRankedCount + 1,
      totalUsers,
    }
  }
}

