import { type NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { validateRequest } from "@/app/api/validate"
import { logger } from "@/lib/logger"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"
import { mlModels } from "@/lib/ml/models"

// Schema for game completion
const gameCompletionSchema = z.object({
  score: z.number().min(0),
  metrics: z.record(z.number()),
  duration: z.number().min(0),
  difficulty: z.enum(["easy", "medium", "hard"]),
})

/**
 * Complete a game session
 *
 * This endpoint is called when a patient completes a game session.
 * It updates the game session with the final score and metrics,
 * and triggers ML analysis if needed.
 */
export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    // Get session ID from params
    const { id } = params

    if (!id) {
      return NextResponse.json({ error: "Session ID is required" }, { status: 400 })
    }

    // Validate user session
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Validate request body
    const validation = await validateRequest(req, gameCompletionSchema)

    if (!validation.success) {
      return validation.error
    }

    const { score, metrics, duration, difficulty } = validation.data

    // Get the game session
    const gameSession = await db.gameSession.findUnique({
      where: { id },
      include: { game: true, patient: true },
    })

    if (!gameSession) {
      return NextResponse.json({ error: "Game session not found" }, { status: 404 })
    }

    // Check if the user has permission to complete this session
    const isPatient = session.user.id === gameSession.patientId
    const isDoctor = session.user.role === "doctor" && gameSession.patient.doctorId === session.user.id
    const isAdmin = session.user.role === "admin"

    if (!isPatient && !isDoctor && !isAdmin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    // Update the game session
    const completedAt = new Date()

    const updatedSession = await db.gameSession.update({
      where: { id },
      data: {
        score,
        metrics,
        duration,
        difficulty,
        completedAt,
        status: "completed",
      },
    })

    logger.info(`Game session ${id} completed`, {
      context: {
        gameId: gameSession.gameId,
        patientId: gameSession.patientId,
        score,
        duration,
      },
    })

    // Get previous sessions for this game and patient
    const previousSessions = await db.gameSession.findMany({
      where: {
        patientId: gameSession.patientId,
        gameId: gameSession.gameId,
        status: "completed",
        id: { not: id },
      },
      orderBy: { completedAt: "desc" },
      take: 10,
    })

    // Calculate performance metrics
    const averageScore =
      previousSessions.length > 0
        ? previousSessions.reduce((sum, session) => sum + session.score, 0) / previousSessions.length
        : null

    const scoreChange = averageScore !== null ? ((score - averageScore) / averageScore) * 100 : null

    const performanceMetrics = {
      averageScore,
      scoreChange,
      sessionsCompleted: previousSessions.length + 1,
    }

    // Trigger anomaly detection if there are enough sessions
    if (previousSessions.length >= 2) {
      try {
        // Get cognitive scores for the patient
        const cognitiveScores = await db.cognitiveScore.findMany({
          where: { patientId: gameSession.patientId },
          orderBy: { date: "desc" },
          take: 10,
        })

        // Format data for anomaly detection
        const anomalyInput = {
          patientId: gameSession.patientId,
          cognitiveScores: cognitiveScores.map((score) => ({
            date: score.date.toISOString(),
            mmseScore: score.mmseScore,
            domainScores: {
              memory: score.memoryScore,
              attention: score.attentionScore,
              language: score.languageScore,
              visuospatial: score.visuospatialScore,
              executiveFunction: score.executiveFunctionScore,
            },
          })),
          gameSessions: [...previousSessions, updatedSession].map((session) => ({
            gameId: session.gameId,
            completedAt: session.completedAt?.toISOString() || new Date().toISOString(),
            score: session.score,
            metrics: session.metrics as Record<string, number>,
          })),
        }

        // Detect anomalies asynchronously
        mlModels
          .detectAnomalies(anomalyInput)
          .then((result) => {
            if (result.anomalies.length > 0) {
              logger.info(`Anomalies detected for patient ${gameSession.patientId}`, {
                context: {
                  anomalies: result.anomalies,
                },
              })

              // Store anomalies in the database
              Promise.all(
                result.anomalies.map((anomaly) =>
                  db.anomaly.create({
                    data: {
                      patientId: gameSession.patientId,
                      type: anomaly.type,
                      severity: anomaly.severity,
                      affectedDomain: anomaly.affectedDomain,
                      description: anomaly.description,
                      confidence: anomaly.confidence,
                      detectedAt: new Date(anomaly.detectedAt),
                      source: "game",
                      sourceId: id,
                    },
                  }),
                ),
              ).catch((error) => {
                logger.error(
                  `Failed to store anomalies for patient ${gameSession.patientId}`,
                  error instanceof Error ? error : new Error(String(error)),
                )
              })
            }
          })
          .catch((error) => {
            logger.error(
              `Failed to detect anomalies for patient ${gameSession.patientId}`,
              error instanceof Error ? error : new Error(String(error)),
            )
          })
      } catch (error) {
        logger.error(
          `Error in anomaly detection for game session ${id}`,
          error instanceof Error ? error : new Error(String(error)),
        )
        // Continue execution, don't fail the request due to ML errors
      }
    }

    // Return the updated session with performance metrics
    return NextResponse.json({
      session: updatedSession,
      performance: performanceMetrics,
    })
  } catch (error) {
    logger.error(`Error completing game session`, error instanceof Error ? error : new Error(String(error)))

    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

