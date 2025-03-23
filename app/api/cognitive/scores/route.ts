import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import prisma from "@/lib/db-client"
import { RedisCache } from "@/lib/cache/redis-cache"
import { DataAnonymization } from "@/lib/compliance/data-anonymization"

/**
 * Get cognitive scores for a user
 * GET /api/cognitive/scores
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
    const timeRange = searchParams.get("timeRange") || "month"

    // Calculate date range
    const now = new Date()
    let startDate: Date

    switch (timeRange) {
      case "week":
        startDate = new Date(now)
        startDate.setDate(now.getDate() - 7)
        break
      case "month":
        startDate = new Date(now)
        startDate.setMonth(now.getMonth() - 1)
        break
      case "year":
        startDate = new Date(now)
        startDate.setFullYear(now.getFullYear() - 1)
        break
      default:
        startDate = new Date(now)
        startDate.setMonth(now.getMonth() - 1)
    }

    // Get from cache or database
    const cacheKey = `user:${session.user.id}:cognitive:${timeRange}`

    const cognitiveScores = await RedisCache.cached(
      cacheKey,
      async () => {
        return prisma.cognitiveScore.findMany({
          where: {
            patientId: session.user.id,
            date: {
              gte: startDate,
            },
          },
          orderBy: {
            date: "asc",
          },
        })
      },
      { ttl: 300 }, // 5 minutes cache
    )

    // Group scores by category and date
    const groupedScores: Record<string, any[]> = {}

    for (const score of cognitiveScores) {
      if (!groupedScores[score.category]) {
        groupedScores[score.category] = []
      }

      groupedScores[score.category].push({
        date: score.date,
        score: score.score,
      })
    }

    // Calculate averages for each category
    const averages: Record<string, number> = {}

    for (const [category, scores] of Object.entries(groupedScores)) {
      const sum = scores.reduce((total, item) => total + item.score, 0)
      averages[category] = Math.round(sum / scores.length)
    }

    return NextResponse.json({
      timeRange,
      scores: groupedScores,
      averages,
    })
  } catch (error) {
    console.error("Error fetching cognitive scores:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}

/**
 * Get anonymized cognitive scores for research
 * GET /api/cognitive/scores/research
 */
export async function getAnonymizedScores(req: NextRequest) {
  try {
    // Check authentication and authorization
    const session = await getServerSession(authOptions)
    if (!session?.user?.roles?.includes("researcher")) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    // Get all cognitive scores
    const allScores = await prisma.cognitiveScore.findMany({
      include: {
        patient: {
          select: {
            id: true,
            age: true,
            gender: true,
          },
        },
      },
    })

    // Anonymize the data
    const anonymizedData = allScores.map((score) => {
      // Keep only necessary fields
      const data = {
        category: score.category,
        score: score.score,
        date: score.date,
        patientAge: score.patient.age,
        patientGender: score.patient.gender,
      }

      // Anonymize using our data anonymization service
      return DataAnonymization.anonymizePatientData(data)
    })

    // Apply k-anonymity to ensure privacy
    const kAnonymizedData = DataAnonymization.kAnonymize(anonymizedData, 5)

    return NextResponse.json(kAnonymizedData)
  } catch (error) {
    console.error("Error fetching anonymized cognitive scores:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}

