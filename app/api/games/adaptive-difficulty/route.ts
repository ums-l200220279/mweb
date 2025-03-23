import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import prisma from "@/lib/db-client"
import { RedisCache } from "@/lib/cache/redis-cache"

/**
 * Get adaptive difficulty settings for a user and game
 * GET /api/games/adaptive-difficulty
 */
export async function GET(req: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions)
    if (!session || !session.user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    // Parse query parameters
    const { searchParams } = new URL(req.url)
    const gameId = searchParams.get("gameId")

    if (!gameId) {
      return NextResponse.json({ message: "Missing required query parameter: gameId" }, { status: 400 })
    }

    // Get from cache or database
    const cacheKey = `user:${session.user.id}:adaptive:${gameId}`

    const adaptiveDifficulty = await RedisCache.cached(
      cacheKey,
      async () => {
        // Try to get existing settings
        const existing = await prisma.adaptiveDifficulty.findUnique({
          where: {
            userId_gameId: {
              userId: session.user.id,
              gameId,
            },
          },
        })

        if (existing) {
          return existing
        }

        // Create default settings
        return prisma.adaptiveDifficulty.create({
          data: {
            userId: session.user.id,
            gameId,
            baseLevel: 1,
            currentLevel: 1,
            adjustmentFactor: 0.1,
            history: [],
          },
        })
      },
      { ttl: 300 }, // 5 minutes cache
    )

    return NextResponse.json(adaptiveDifficulty)
  } catch (error) {
    console.error("Error fetching adaptive difficulty:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}

/**
 * Update adaptive difficulty settings
 * POST /api/games/adaptive-difficulty
 */
export async function POST(req: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions)
    if (!session || !session.user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    // Parse request body
    const body = await req.json()
    const { gameId, performance } = body

    if (!gameId || performance === undefined) {
      return NextResponse.json({ message: "Missing required fields: gameId, performance" }, { status: 400 })
    }

    // Get current settings
    const current = await prisma.adaptiveDifficulty.findUnique({
      where: {
        userId_gameId: {
          userId: session.user.id,
          gameId,
        },
      },
    })

    // Calculate new level
    // If performance > 0.8, increase difficulty
    // If performance &lt; 0.4, decrease difficulty
    let newLevel = current ? current.currentLevel : 1
    const adjustmentFactor = current ? current.adjustmentFactor : 0.1

    if (performance > 0.8) {
      newLevel = Math.min(10, newLevel + adjustmentFactor)
    } else if (performance < 0.4) {
      newLevel = Math.max(1, newLevel - adjustmentFactor)
    }

    // Update history
    const history = current
      ? [
          ...current.history,
          {
            level: current.currentLevel,
            performance,
            timestamp: new Date(),
          },
        ].slice(-10)
      : [
          {
            // Keep last 10 entries
            level: 1,
            performance,
            timestamp: new Date(),
          },
        ]

    // Update in database
    const updated = await prisma.adaptiveDifficulty.upsert({
      where: {
        userId_gameId: {
          userId: session.user.id,
          gameId,
        },
      },
      update: {
        currentLevel: newLevel,
        history,
      },
      create: {
        userId: session.user.id,
        gameId,
        baseLevel: 1,
        currentLevel: newLevel,
        adjustmentFactor: 0.1,
        history,
      },
    })

    // Invalidate cache
    await RedisCache.delete(`user:${session.user.id}:adaptive:${gameId}`)

    return NextResponse.json(updated)
  } catch (error) {
    console.error("Error updating adaptive difficulty:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}

