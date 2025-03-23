import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { RedisCache } from "@/lib/cache/redis-cache"
import { GameService } from "@/lib/games/game-service"

/**
 * Get game recommendations for a user
 * GET /api/games/recommendations
 */
export async function GET(req: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions)
    if (!session || !session.user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    // Get from cache or generate new recommendations
    const cacheKey = `user:${session.user.id}:recommendations`

    const recommendations = await RedisCache.cached(
      cacheKey,
      async () => {
        return GameService.getGameRecommendations(session.user.id)
      },
      { ttl: 3600 }, // 1 hour cache
    )

    return NextResponse.json(recommendations)
  } catch (error) {
    console.error("Error fetching game recommendations:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}

