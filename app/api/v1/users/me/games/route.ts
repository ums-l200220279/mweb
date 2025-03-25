import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { z } from "zod"
import { authOptions } from "@/lib/auth"
import prisma from "@/lib/db-client"
import { withErrorHandling } from "@/lib/middleware/error-handler"
import { withValidation } from "@/lib/middleware/with-validation"
import { createApiResponse } from "@/lib/api-config"
import { UnauthorizedError } from "@/lib/errors"
import { cache } from "@/lib/cache"
import { PerformanceMonitor } from "@/lib/performance"

// Validation schema for query parameters
const querySchema = z.object({
  page: z.string().regex(/^\d+$/).transform(Number).default("1"),
  limit: z.string().regex(/^\d+$/).transform(Number).default("10"),
  gameType: z.string().optional(),
  sortBy: z.enum(["createdAt", "score", "accuracy", "reactionTime"]).default("createdAt"),
  sortOrder: z.enum(["asc", "desc"]).default("desc"),
})

/**
 * Get user's game results
 * GET /api/v1/users/me/games
 */
async function handler(request: NextRequest, validatedData: z.infer<typeof querySchema>) {
  // Get the session
  const session = await getServerSession(authOptions)
  if (!session?.user) {
    throw new UnauthorizedError()
  }

  const userId = session.user.id
  const { page, limit, gameType, sortBy, sortOrder } = validatedData

  // Create cache key based on query parameters
  const cacheKey = `user:${userId}:games:${gameType || "all"}:${page}:${limit}:${sortBy}:${sortOrder}`

  // Measure performance
  return await PerformanceMonitor.measure("/api/v1/users/me/games", "GET", async () => {
    // Try to get from cache first
    const cachedData = await cache.get(cacheKey)
    if (cachedData) {
      return {
        statusCode: 200,
        result: cachedData,
      }
    }

    // Calculate pagination
    const skip = (page - 1) * limit

    // Build where clause
    const where = {
      userId,
      ...(gameType && { gameType }),
    }

    // Get total count for pagination
    const total = await prisma.gameResult.count({ where })

    // Get paginated results
    const games = await prisma.gameResult.findMany({
      where,
      orderBy: {
        [sortBy]: sortOrder,
      },
      skip,
      take: limit,
    })

    // Create response
    const response = createApiResponse(true, games, undefined, {
      page,
      limit,
      total,
    })

    // Cache the response for 5 minutes
    await cache.set(cacheKey, response, 300)

    return {
      statusCode: 200,
      result: response,
    }
  }).then(({ result }) => {
    return NextResponse.json(result)
  })
}

// Combine validation and error handling middleware
export const GET = (request: NextRequest) => {
  return withErrorHandling(request, async (req) => {
    return withValidation(querySchema, async (request, validatedData) => {
      return handler(request, validatedData)
    })(req)
  })
}

