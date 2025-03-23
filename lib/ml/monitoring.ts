// ML model monitoring and evaluation

import type { PredictionResult } from "@/types/ml"
import prisma from "@/lib/db-client"

// Log model predictions for monitoring
export async function logPrediction(
  modelId: string,
  patientId: string,
  prediction: PredictionResult,
  actualValue?: number,
) {
  try {
    // Store prediction in database for monitoring
    await prisma.modelPrediction.create({
      data: {
        modelId,
        patientId,
        predictedValue: prediction.predictedMMSEScore,
        confidenceLower: prediction.confidenceInterval[0],
        confidenceUpper: prediction.confidenceInterval[1],
        actualValue,
        timestamp: new Date(),
        metadata: {
          riskLevel: prediction.riskLevel,
          keyFactors: prediction.keyFactors,
        },
      },
    })
  } catch (error) {
    console.error("Error logging prediction:", error)
  }
}

// Calculate model performance metrics
export async function calculateModelMetrics(modelId: string) {
  try {
    // Get predictions with actual values
    const predictions = await prisma.modelPrediction.findMany({
      where: {
        modelId,
        actualValue: {
          not: null,
        },
      },
    })

    if (predictions.length === 0) {
      return {
        mae: null,
        rmse: null,
        accuracy: null,
        sampleSize: 0,
      }
    }

    // Calculate Mean Absolute Error
    const mae =
      predictions.reduce((sum, pred) => {
        return sum + Math.abs((pred.actualValue as number) - pred.predictedValue)
      }, 0) / predictions.length

    // Calculate Root Mean Square Error
    const rmse = Math.sqrt(
      predictions.reduce((sum, pred) => {
        return sum + Math.pow((pred.actualValue as number) - pred.predictedValue, 2)
      }, 0) / predictions.length,
    )

    // Calculate accuracy (for classification tasks)
    // For MMSE predictions, we consider it accurate if within 2 points
    const accuratePredictions = predictions.filter((pred) => {
      return Math.abs((pred.actualValue as number) - pred.predictedValue) <= 2
    })

    const accuracy = accuratePredictions.length / predictions.length

    return {
      mae,
      rmse,
      accuracy,
      sampleSize: predictions.length,
    }
  } catch (error) {
    console.error("Error calculating model metrics:", error)
    throw error
  }
}

// Detect model drift
export async function detectModelDrift(modelId: string) {
  try {
    // Get recent predictions
    const recentPredictions = await prisma.modelPrediction.findMany({
      where: {
        modelId,
        timestamp: {
          gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // Last 30 days
        },
        actualValue: {
          not: null,
        },
      },
    })

    // Get older predictions for comparison
    const olderPredictions = await prisma.modelPrediction.findMany({
      where: {
        modelId,
        timestamp: {
          lt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
          gte: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000), // 30-90 days ago
        },
        actualValue: {
          not: null,
        },
      },
    })

    if (recentPredictions.length < 10 || olderPredictions.length < 10) {
      return {
        drift: false,
        driftMagnitude: 0,
        message: "Insufficient data to detect drift",
      }
    }

    // Calculate error for recent predictions
    const recentError =
      recentPredictions.reduce((sum, pred) => {
        return sum + Math.abs((pred.actualValue as number) - pred.predictedValue)
      }, 0) / recentPredictions.length

    // Calculate error for older predictions
    const olderError =
      olderPredictions.reduce((sum, pred) => {
        return sum + Math.abs((pred.actualValue as number) - pred.predictedValue)
      }, 0) / olderPredictions.length

    // Calculate drift magnitude
    const driftMagnitude = (recentError - olderError) / olderError

    // Determine if drift is significant
    const drift = driftMagnitude > 0.2 // 20% increase in error

    return {
      drift,
      driftMagnitude,
      message: drift
        ? `Model performance has degraded by ${(driftMagnitude * 100).toFixed(1)}%`
        : "No significant model drift detected",
    }
  } catch (error) {
    console.error("Error detecting model drift:", error)
    throw error
  }
}

