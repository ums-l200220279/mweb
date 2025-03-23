import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import prisma from "@/lib/db-client"
import { AuditLogger } from "@/lib/audit/audit-logger"
import { RedisCache } from "@/lib/cache/redis-cache"
import { RateLimiter } from "@/lib/security/rate-limiter"

/**
 * Start a new game session
 * POST /api/games/sessions
 */
export async function POST(req: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions)
    if (!session || !session.user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    // Rate limiting
    const rateLimiter = new RateLimiter("game_session_start", 10, 60) // 10 requests per minute
    const rateLimited = await rateLimiter.isRateLimited(session.user.id)

    if (rateLimited) {
      return NextResponse.json({ message: "Rate limit exceeded. Please try again later." }, { status: 429 })
    }

    // Parse request body
    const body = await req.json()
    const { gameId, difficulty } = body

    if (!gameId || !difficulty) {
      return NextResponse.json({ message: "Missing required fields: gameId, difficulty" }, { status: 400 })
    }

    // Validate game exists
    const game = await prisma.game.findUnique({
      where: { id: gameId },
    })

    if (!game) {
      return NextResponse.json({ message: `Game with ID ${gameId} } not found` }, { status: 404 })
    }

    // Create new game session
    const gameSession = await prisma.gameSession.create({
      data: {
        userId: session.user.id,
        gameId,
        startTime: new Date(),
        score: 0,
        difficulty,
        completed: false,
        metrics: {
          correctAnswers: 0,
          totalQuestions: 0,
          averageResponseTime: 0,
          mistakes: 0,
          hints: 0,
        },
      },
    })

    // Log audit event
    await AuditLogger.log({
      userId: session.user.id,
      action: "GAME_SESSION_START",
      resource: "GAME_SESSION",
      resourceId: gameSession.id,
      details: {
        gameId,
        difficulty,
      },
    })

    // Update user streak
    await prisma.userProgress.upsert({
      where: { userId: session.user.id },
      update: {
        lastActive: new Date(),
        streak: {
          increment: 1,
        },
      },
      create: {
        userId: session.user.id,
        points: 0,
        level: 1,
        streak: 1,
        lastActive: new Date(),
      },
    })

    return NextResponse.json(gameSession)
  } catch (error) {
    console.error("Error starting game session:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}

/**
 * Get user's game sessions
 * GET /api/games/sessions
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
    const limit = Number.parseInt(searchParams.get("limit") || "10")
    const gameId = searchParams.get("gameId")

    // Get sessions from cache or database
    const cacheKey = `user:${session.user.id}:sessions:${gameId || "all"}:${limit}`

    const gameSessions = await RedisCache.cached(
      cacheKey,
      async () => {
        return prisma.gameSession.findMany({
          where: {
            userId: session.user.id,
            ...(gameId ? { gameId } : {}),
          },
          orderBy: { startTime: "desc" },
          take: limit,
          include: {
            game: true,
          },
        })
      },
      { ttl: 300 }, // 5 minutes cache
    )

    return NextResponse.json(gameSessions)
  } catch (error) {
    console.error("Error fetching game sessions:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}

```typescript file="app/api/games/sessions/[id]/complete/route.ts"
import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import prisma from "@/lib/db-client"
import { AuditLogger } from "@/lib/audit/audit-logger"
import { RedisCache } from "@/lib/cache/redis-cache"
import { AchievementService } from "@/lib/gamification/achievement-service"
import { GameService } from "@/lib/games/game-service"

/**
 * Complete a game session
 * POST /api/games/sessions/[id]/complete
 */
export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const sessionId = params.id
    
    // Check authentication
    const session = await getServerSession(authOptions)
    if (!session || !session.user) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      )
    }
    
    // Parse request body
    const body = await req.json()
    const { score, metrics } = body
    
    if (score === undefined || !metrics) {
      return NextResponse.json(
        { message: "Missing required fields: score, metrics" },
        { status: 400 }
      )
    }
    
    // Get the game session
    const gameSession = await prisma.gameSession.findUnique({
      where: { id: sessionId },
      include: { game: true }
    })
    
    if (!gameSession) {
      return NextResponse.json(
        { message: \`Game session with ID ${sessionId} not found\` },
        { status: 404 }
      )
    }
    
    // Verify ownership
    if (gameSession.userId !== session.user.id) {
      return NextResponse.json(
        { message: "You don't have permission to complete this game session" },
        { status: 403 }
      )
    }
    
    // Verify session is not already completed
    if (gameSession.completed) {
      return NextResponse.json(
        { message: "This game session is already completed" },
        { status: 400 }
      )
    }
    
    // Update the session
    const updatedSession = await prisma.gameSession.update({
      where: { id: sessionId },
      data: {
        endTime: new Date(),
        score,
        completed: true,
        metrics
      }
    })
    
    // Log audit event
    await AuditLogger.log({
      userId: session.user.id,
      action: "GAME_SESSION_COMPLETE",
      resource: "GAME_SESSION",
      resourceId: sessionId,
      details: {
        gameId: gameSession.gameId,
        score,
        metrics
      }
    })
    
    // Update cognitive scores
    await GameService.updateCognitiveScores(updatedSession)
    
    // Check for achievements
    const newAchievements = await AchievementService.checkAndAwardAchievements(
      session.user.id,
      { gameSession: updatedSession }
    )
    
    // Update adaptive difficulty if applicable
    if (gameSession.difficulty === "adaptive") {
      // Calculate performance score (0-1)
      const performance = metrics.correctAnswers / 
        (metrics.totalQuestions || 1)
      
      await GameService.updateAdaptiveDifficulty(
        session.user.id,
        gameSession.gameId,
        performance
      )
    }
    
    // Invalidate relevant caches
    await RedisCache.delete(\`user:${session.user.id}:sessions:all:10\`)
    await RedisCache.delete(\`user:${session.user.id}:sessions:${gameSession.gameId}:10\`)
    await RedisCache.delete(\`user:${session.user.id}:progress\`)
    
    return NextResponse.json({
      session: updatedSession,
      newAchievements: newAchievements.length > 0 ? newAchievements : null
    })
  } catch (error) {
    console.error("Error completing game session:", error)
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    )
  }
}

