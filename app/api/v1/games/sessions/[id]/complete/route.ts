import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { z } from "zod"
import { authOptions } from "@/lib/auth"
import prisma from "@/lib/db-client"
import { withErrorHandling } from "@/lib/middleware/error-handler"
import { withValidation } from "@/lib/middleware/with-validation"
import { createApiResponse } from "@/lib/api-config"
import { NotFoundError, UnauthorizedError } from "@/lib/errors"
import { cache } from "@/lib/cache"
import { logger } from "@/lib/logger"
import { PerformanceMonitor } from "@/lib/performance"

// Validation schema for game completion data
const gameCompletionSchema = z.object({
  score: z.number().min(0),
  accuracy: z.number().min(0).max(100).optional(),
  reactionTime: z.number().min(0).optional(),
  duration: z.number().int().min(1),
  difficulty: z.string(),
  taskType: z.string().optional(),
})

/**
 * Complete a game session
 * POST /api/v1/games/sessions/:id/complete
 */
async function handler(
  request: NextRequest,
  { params }: { params: { id: string } },
  validatedData: z.infer<typeof gameCompletionSchema>,
) {
  // Get the session
  const session = await getServerSession(authOptions)
  if (!session?.user) {
    throw new UnauthorizedError()
  }

  const userId = session.user.id
  const gameId = params.id

  // Measure performance
  return await PerformanceMonitor.measure(`/api/v1/games/sessions/${gameId}/complete`, "POST", async () => {
    // Check if game exists
    const game = await prisma.gameResult.findUnique({
      where: { id: gameId },
    })

    if (!game) {
      throw new NotFoundError("Game session not found")
    }

    // Check if user owns the game
    if (game.userId !== userId) {
      logger.warn("Unauthorized attempt to complete game session", {
        userId,
        gameId,
        ownerId: game.userId,
      })
      throw new UnauthorizedError("You do not have permission to complete this game session")
    }

    // Update game result
    const updatedGame = await prisma.gameResult.update({
      where: { id: gameId },
      data: {
        score: validatedData.score,
        accuracy: validatedData.accuracy,
        reactionTime: validatedData.reactionTime,
        duration: validatedData.duration,
        difficulty: validatedData.difficulty,
        taskType: validatedData.taskType,
      },
    })

    // Invalidate cache for user's game results
    await cache.delete(`user:${userId}:games`)
    await cache.delete(`user:${userId}:stats`)

    logger.info("Game session completed", {
      userId,
      gameId,
      score: validatedData.score,
    })

    return {
      statusCode: 200,
      result: createApiResponse(true, updatedGame),
    }
  }).then(({ result }) => {
    return NextResponse.json(result)
  })
}

// Combine validation and error handling middleware
export const POST = (request: NextRequest, context: { params: { id: string } }) => {
  return withErrorHandling(request, async (req) => {
    return withValidation(gameCompletionSchema, async (request, validatedData) => {
      return handler(request, context, validatedData)
    })(req)
  })
}

