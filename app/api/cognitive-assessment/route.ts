import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"
import { MLModels } from "@/lib/ml/models"
import { z } from "zod"

// Schema for cognitive assessment request
const cognitiveAssessmentSchema = z.object({
  userId: z.string().optional(),
  assessmentType: z.enum(["mmse", "game", "comprehensive"]),
  mmseScore: z.number().optional(),
  gameResults: z
    .array(
      z.object({
        gameType: z.string(),
        score: z.number(),
        metrics: z.record(z.string(), z.any()).optional(),
      }),
    )
    .optional(),
  textResponses: z
    .array(
      z.object({
        prompt: z.string(),
        response: z.string(),
      }),
    )
    .optional(),
  audioResponses: z
    .array(
      z.object({
        prompt: z.string(),
        audioUrl: z.string().url(),
      }),
    )
    .optional(),
  includeRecommendations: z.boolean().default(true),
  includeAnomalyDetection: z.boolean().default(true),
  includePrediction: z.boolean().default(true),
})

export async function POST(req: NextRequest) {
  try {
    // Get session for authentication
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Parse request body
    const body = await req.json()
    const validationResult = cognitiveAssessmentSchema.safeParse(body)

    if (!validationResult.success) {
      return NextResponse.json(
        { error: "Invalid request data", details: validationResult.error.format() },
        { status: 400 },
      )
    }

    const data = validationResult.data
    const userId = data.userId || session.user.id

    // Fetch user data needed for assessment
    const user = await db.user.findUnique({
      where: { id: userId },
      include: {
        profile: true,
      },
    })

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Fetch historical cognitive data
    const cognitiveAssessments = await db.cognitiveAssessment.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: 10,
    })

    const cognitiveScores = await db.cognitiveScore.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: 50,
    })

    const gameResults = await db.gameResult.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: 50,
    })

    // Prepare data for ML models
    const cognitiveData = {
      assessments: cognitiveAssessments,
      scores: cognitiveScores,
      gameResults: gameResults,
      userProfile: user.profile || {
        age: 0,
        gender: "unknown",
        educationLevel: "unknown",
        medicalConditions: [],
      },
    }

    // Process new assessment data
    let newAssessment
    let domainScores = []

    if (data.assessmentType === "mmse" && data.mmseScore !== undefined) {
      // Process MMSE assessment
      newAssessment = await db.cognitiveAssessment.create({
        data: {
          userId,
          type: "MMSE",
          mmseScore: data.mmseScore,
          result: "Completed",
          notes: "Automated assessment via API",
        },
      })

      // Calculate domain scores based on MMSE
      domainScores = calculateDomainScoresFromMMSE(data.mmseScore)
    } else if (data.assessmentType === "game" && data.gameResults) {
      // Process game-based assessment
      newAssessment = await db.cognitiveAssessment.create({
        data: {
          userId,
          type: "GAME",
          result: "Completed",
          notes: "Game-based assessment via API",
        },
      })

      // Calculate domain scores based on game results
      domainScores = calculateDomainScoresFromGames(data.gameResults)
    } else if (data.assessmentType === "comprehensive") {
      // Process comprehensive assessment (combines multiple data sources)
      newAssessment = await db.cognitiveAssessment.create({
        data: {
          userId,
          type: "COMPREHENSIVE",
          mmseScore: data.mmseScore,
          result: "Completed",
          notes: "Comprehensive assessment via API",
        },
      })

      // Calculate domain scores based on all available data
      domainScores = calculateComprehensiveDomainScores(
        data.mmseScore,
        data.gameResults,
        data.textResponses,
        data.audioResponses,
      )
    }

    // Save domain scores to database
    for (const domainScore of domainScores) {
      await db.cognitiveScore.create({
        data: {
          userId,
          assessmentId: newAssessment.id,
          domain: domainScore.domain,
          score: domainScore.score,
          notes: domainScore.notes,
        },
      })
    }

    // Run ML models based on request parameters
    const results: any = {
      assessmentId: newAssessment.id,
      domainScores,
    }

    // Add game results to database if provided
    if (data.gameResults) {
      for (const game of data.gameResults) {
        await db.gameResult.create({
          data: {
            userId,
            assessmentId: newAssessment.id,
            gameType: game.gameType,
            score: game.score,
            metrics: game.metrics || {},
          },
        })
      }
    }

    // Process text responses if provided
    if (data.textResponses) {
      const textAnalysisResults = []

      for (const textResponse of data.textResponses) {
        const analysis = await MLModels.analyzeText(
          textResponse.response,
          textResponse.prompt,
          userId,
          "Cognitive assessment",
        )

        textAnalysisResults.push({
          prompt: textResponse.prompt,
          analysis,
        })
      }

      results.textAnalysis = textAnalysisResults
    }

    // Process audio responses if provided
    if (data.audioResponses) {
      const speechAnalysisResults = []

      for (const audioResponse of data.audioResponses) {
        const analysis = await MLModels.analyzeSpeech(
          audioResponse.audioUrl,
          audioResponse.prompt,
          userId,
          "Cognitive assessment",
        )

        speechAnalysisResults.push({
          prompt: audioResponse.prompt,
          analysis,
        })
      }

      results.speechAnalysis = speechAnalysisResults
    }

    // Generate recommendations if requested
    if (data.includeRecommendations) {
      const recommendations = await MLModels.generatePersonalizedRecommendations(cognitiveData)
      results.recommendations = recommendations
    }

    // Detect anomalies if requested
    if (data.includeAnomalyDetection) {
      const anomalyDetection = await MLModels.detectAnomalies(cognitiveData)
      results.anomalyDetection = anomalyDetection
    }

    // Generate predictions if requested
    if (data.includePrediction) {
      const shortTermPrediction = await MLModels.predictCognitiveDecline(cognitiveData, "short-term")
      const mediumTermPrediction = await MLModels.predictCognitiveDecline(cognitiveData, "medium-term")
      const longTermPrediction = await MLModels.predictCognitiveDecline(cognitiveData, "long-term")

      results.predictions = {
        shortTerm: shortTermPrediction,
        mediumTerm: mediumTermPrediction,
        longTerm: longTermPrediction,
      }
    }

    return NextResponse.json(results)
  } catch (error) {
    console.error("Error in cognitive assessment:", error)
    return NextResponse.json({ error: "Internal server error", details: (error as Error).message }, { status: 500 })
  }
}

// Helper functions for calculating domain scores

function calculateDomainScoresFromMMSE(mmseScore: number) {
  // MMSE has a maximum score of 30
  // We'll convert this to domain scores on a scale of 0-100

  // These weightings are based on the MMSE sections:
  // - Orientation (10 points)
  // - Registration (3 points)
  // - Attention and Calculation (5 points)
  // - Recall (3 points)
  // - Language (8 points)
  // - Visuospatial (1 point)

  const normalizedScore = (mmseScore / 30) * 100

  return [
    {
      domain: "memory",
      score: normalizedScore,
      notes: "Derived from MMSE score",
    },
    {
      domain: "attention",
      score: normalizedScore,
      notes: "Derived from MMSE score",
    },
    {
      domain: "executive",
      score: normalizedScore,
      notes: "Derived from MMSE score",
    },
    {
      domain: "language",
      score: normalizedScore,
      notes: "Derived from MMSE score",
    },
    {
      domain: "visuospatial",
      score: normalizedScore,
      notes: "Derived from MMSE score",
    },
  ]
}

function calculateDomainScoresFromGames(gameResults: any[]) {
  // Calculate domain scores based on game results
  // Different games target different cognitive domains

  const domainScores: Record<string, { total: number; count: number }> = {
    memory: { total: 0, count: 0 },
    attention: { total: 0, count: 0 },
    executive: { total: 0, count: 0 },
    language: { total: 0, count: 0 },
    visuospatial: { total: 0, count: 0 },
  }

  for (const game of gameResults) {
    switch (game.gameType) {
      case "NumberMemory":
        domainScores.memory.total += game.score
        domainScores.memory.count += 1
        break
      case "WordAssociation":
        domainScores.language.total += game.score
        domainScores.language.count += 1
        break
      case "PatternRecognition":
        domainScores.visuospatial.total += game.score
        domainScores.visuospatial.count += 1
        break
      case "SpatialMemory":
        domainScores.memory.total += game.score * 0.5
        domainScores.memory.count += 0.5
        domainScores.visuospatial.total += game.score * 0.5
        domainScores.visuospatial.count += 0.5
        break
      case "WorkingMemory":
        domainScores.memory.total += game.score * 0.3
        domainScores.memory.count += 0.3
        domainScores.attention.total += game.score * 0.7
        domainScores.attention.count += 0.7
        break
      default:
        // For unknown game types, distribute evenly across domains
        Object.keys(domainScores).forEach((domain) => {
          domainScores[domain].total += game.score * 0.2
          domainScores[domain].count += 0.2
        })
    }
  }

  // Calculate average scores for each domain
  return Object.entries(domainScores).map(([domain, { total, count }]) => ({
    domain,
    score: count > 0 ? total / count : 0,
    notes: `Derived from game results (${count} games)`,
  }))
}

function calculateComprehensiveDomainScores(
  mmseScore?: number,
  gameResults?: any[],
  textResponses?: any[],
  audioResponses?: any[],
) {
  // Combine scores from multiple sources with appropriate weightings
  const domainScores: Record<string, { total: number; weight: number }> = {
    memory: { total: 0, weight: 0 },
    attention: { total: 0, weight: 0 },
    executive: { total: 0, weight: 0 },
    language: { total: 0, weight: 0 },
    visuospatial: { total: 0, weight: 0 },
  }

  // Add MMSE scores if available (weight: 0.4)
  if (mmseScore !== undefined) {
    const mmseNormalized = (mmseScore / 30) * 100
    Object.keys(domainScores).forEach((domain) => {
      domainScores[domain].total += mmseNormalized * 0.4
      domainScores[domain].weight += 0.4
    })
  }

  // Add game results if available (weight: 0.4)
  if (gameResults && gameResults.length > 0) {
    const gameScores = calculateDomainScoresFromGames(gameResults)
    for (const { domain, score } of gameScores) {
      domainScores[domain].total += score * 0.4
      domainScores[domain].weight += 0.4
    }
  }

  // Add text analysis if available (weight: 0.1)
  if (textResponses && textResponses.length > 0) {
    // In a real implementation, this would use the text analysis results
    // For now, we'll use a placeholder value
    domainScores.language.total += 70 * 0.1
    domainScores.language.weight += 0.1
    domainScores.executive.total += 70 * 0.1
    domainScores.executive.weight += 0.1
  }

  // Add speech analysis if available (weight: 0.1)
  if (audioResponses && audioResponses.length > 0) {
    // In a real implementation, this would use the speech analysis results
    // For now, we'll use a placeholder value
    domainScores.language.total += 70 * 0.1
    domainScores.language.weight += 0.1
    domainScores.memory.total += 70 * 0.1
    domainScores.memory.weight += 0.1
  }

  // Calculate weighted average scores for each domain
  return Object.entries(domainScores).map(([domain, { total, weight }]) => ({
    domain,
    score: weight > 0 ? total / weight : 0,
    notes: `Comprehensive assessment (${weight.toFixed(1)} weighted sources)`,
  }))
}

export async function GET(req: NextRequest) {
  try {
    // Get session for authentication
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const userId = session.user.id
    const searchParams = req.nextUrl.searchParams
    const limit = Number.parseInt(searchParams.get("limit") || "10", 10)
    const page = Number.parseInt(searchParams.get("page") || "1", 10)
    const skip = (page - 1) * limit

    // Fetch user's cognitive assessments
    const assessments = await db.cognitiveAssessment.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
      include: {
        scores: true,
        gameResults: true,
      },
    })

    // Get total count for pagination
    const totalCount = await db.cognitiveAssessment.count({
      where: { userId },
    })

    return NextResponse.json({
      assessments,
      pagination: {
        total: totalCount,
        pages: Math.ceil(totalCount / limit),
        current: page,
        limit,
      },
    })
  } catch (error) {
    console.error("Error fetching cognitive assessments:", error)
    return NextResponse.json({ error: "Internal server error", details: (error as Error).message }, { status: 500 })
  }
}

