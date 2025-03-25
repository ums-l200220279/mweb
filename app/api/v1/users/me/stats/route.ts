import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import prisma from "@/lib/db-client"
import { withErrorHandling } from "@/lib/middleware/error-handler"
import { createApiResponse } from "@/lib/api-config"
import { UnauthorizedError } from "@/lib/errors"
import { cache } from "@/lib/cache"
import { PerformanceMonitor } from "@/lib/performance"

/**
 * Get user's game statistics
 * GET /api/v1/users/me/stats
 */
async function handler(request: NextRequest) {
  // Get the session
  const session = await getServerSession(authOptions)
  if (!session?.user) {
    throw new UnauthorizedError()
  }

  const userId = session.user.id
  const cacheKey = `user:${userId}:stats`

  // Measure performance
  return await PerformanceMonitor.measure("/api/v1/users/me/stats", "GET", async () => {
    // Try to get from cache first
    const cachedData = await cache.get(cacheKey)
    if (cachedData) {
      return {
        statusCode: 200,
        result: cachedData,
      }
    }

    // Get game counts by type
    const gameCounts = await prisma.gameResult.groupBy({
      by: ["gameType"],
      where: { userId },
      _count: true,
    })

    // Get average scores by game type
    const averageScores = await prisma.gameResult.groupBy({
      by: ["gameType"],
      where: { userId },
      _avg: {
        score: true,
        accuracy: true,
        reactionTime: true,
      },
    })

    // Get best scores by game type
    const bestScores = await prisma.$queryRaw`
        SELECT "gameType", MAX(score) as "maxScore"
        FROM "GameResult"
        WHERE "userId" = ${userId}
        GROUP BY "gameType"
      `

    // Get recent improvement (last 10 games vs previous 10)
    const recentGames = await prisma.gameResult.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: 20,
    })

    const recent10 = recentGames.slice(0, 10)
    const previous10 = recentGames.slice(10, 20)

    const recent10Avg = recent10.length > 0 ? recent10.reduce((sum, game) => sum + game.score, 0) / recent10.length : 0

    const previous10Avg =
      previous10.length > 0 ? previous10.reduce((sum, game) => sum + game.score, 0) / previous10.length : 0

    const improvement = previous10Avg > 0 ? ((recent10Avg - previous10Avg) / previous10Avg) * 100 : 0

    // Combine all stats
    const stats = {
      totalGames: gameCounts.reduce((sum, item) => sum + item._count, 0),
      gamesByType: Object.fromEntries(gameCounts.map((item) => [item.gameType, item._count])),
      averageScores: Object.fromEntries(
        averageScores.map((item) => [
          item.gameType,
          {
            score: item._avg.score,
            accuracy: item._avg.accuracy,
            reactionTime: item._avg.reactionTime,
          },
        ]),
      ),
      bestScores: Object.fromEntries((bestScores as any[]).map((item) => [item.gameType, item.maxScore])),
      recentImprovement: {
        percentage: improvement,
        recent10Avg,
        previous10Avg,
      },
      lastPlayed: recent10[0]?.createdAt || null,
    }

    // Create response
    const response = createApiResponse(true, stats)

    // Cache the response for 10 minutes
    await cache.set(cacheKey, response, 600)

    return {
      statusCode: 200,
      result: response,
    }
  }).then(({ result }) => {
    return NextResponse.json(result)
  })
}

// Apply error handling middleware
export const GET = (request: NextRequest) => withErrorHandling(request, handler)

