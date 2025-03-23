/**
 * Cognitive Analysis Module
 *
 * This module provides AI-powered cognitive analysis capabilities.
 * It implements algorithms for analyzing cognitive health data and detecting patterns.
 */

import { logger } from "@/lib/monitoring/logger"
import { metrics } from "@/lib/observability/metrics"
import { tracer } from "@/lib/observability/tracing"

// Cognitive domain types
export enum CognitiveDomain {
  MEMORY = "memory",
  ATTENTION = "attention",
  EXECUTIVE_FUNCTION = "executive_function",
  LANGUAGE = "language",
  VISUOSPATIAL = "visuospatial",
  PROCESSING_SPEED = "processing_speed",
}

// Cognitive assessment result
export interface CognitiveAssessmentResult {
  patientId: string
  timestamp: number
  domain: CognitiveDomain
  score: number
  rawData: Record<string, any>
  metadata: Record<string, any>
}

// Cognitive trend analysis result
export interface CognitiveTrendAnalysis {
  patientId: string
  domain: CognitiveDomain
  timeRange: {
    start: number
    end: number
  }
  dataPoints: Array<{
    timestamp: number
    score: number
  }>
  trend: {
    slope: number
    intercept: number
    correlation: number
  }
  percentile: number
  zScore: number
  classification: "normal" | "mild_decline" | "moderate_decline" | "severe_decline"
  confidence: number
}

// Anomaly detection result
export interface CognitiveAnomalyDetection {
  patientId: string
  domain: CognitiveDomain
  timestamp: number
  score: number
  expectedScore: number
  deviation: number
  zScore: number
  isAnomaly: boolean
  confidence: number
  factors: Array<{
    name: string
    contribution: number
  }>
}

// Risk assessment result
export interface CognitiveRiskAssessment {
  patientId: string
  timestamp: number
  overallRisk: number
  domainRisks: Record<CognitiveDomain, number>
  factors: Array<{
    name: string
    weight: number
    value: number
    contribution: number
  }>
  recommendations: string[]
  confidence: number
}

// Cognitive Analysis Service
export class CognitiveAnalysisService {
  private static instance: CognitiveAnalysisService

  private constructor() {}

  public static getInstance(): CognitiveAnalysisService {
    if (!CognitiveAnalysisService.instance) {
      CognitiveAnalysisService.instance = new CognitiveAnalysisService()
    }

    return CognitiveAnalysisService.instance
  }

  // Analyze cognitive assessment results
  public async analyzeAssessment(results: CognitiveAssessmentResult[]): Promise<Record<CognitiveDomain, number>> {
    return tracer.withSpan("analyzeAssessment", async (span) => {
      span.setTag("patient_id", results[0]?.patientId)
      span.setTag("result_count", results.length)

      const startTime = performance.now()

      try {
        // Group results by domain
        const domainResults: Record<CognitiveDomain, CognitiveAssessmentResult[]> = {} as any

        for (const result of results) {
          if (!domainResults[result.domain]) {
            domainResults[result.domain] = []
          }

          domainResults[result.domain].push(result)
        }

        // Calculate average score for each domain
        const domainScores: Record<CognitiveDomain, number> = {} as any

        for (const domain of Object.keys(domainResults) as CognitiveDomain[]) {
          const results = domainResults[domain]
          const sum = results.reduce((acc, result) => acc + result.score, 0)
          domainScores[domain] = sum / results.length
        }

        // Record metrics
        for (const [domain, score] of Object.entries(domainScores)) {
          metrics
            .createGauge({
              name: "cognitive_domain_score",
              help: "Cognitive domain score",
              labelNames: ["domain", "patient_id"],
            })
            .set(score, {
              domain,
              patient_id: results[0]?.patientId,
            })
        }

        const duration = performance.now() - startTime

        metrics
          .createHistogram({
            name: "cognitive_analysis_duration_seconds",
            help: "Duration of cognitive analysis in seconds",
            labelNames: ["operation"],
          })
          .observe(duration / 1000, { operation: "analyzeAssessment" })

        return domainScores
      } catch (error) {
        span.setStatus("error", error as Error)
        logger.error("Error analyzing cognitive assessment", error)
        throw error
      }
    })
  }

  // Analyze cognitive trends over time
  public async analyzeTrends(
    patientId: string,
    domain: CognitiveDomain,
    timeRange: { start: number; end: number },
  ): Promise<CognitiveTrendAnalysis> {
    return tracer.withSpan("analyzeTrends", async (span) => {
      span.setTag("patient_id", patientId)
      span.setTag("domain", domain)

      const startTime = performance.now()

      try {
        // In a real implementation, this would fetch historical data
        // and perform statistical analysis

        // For demonstration purposes, we'll simulate trend analysis
        const dataPoints = this.generateSimulatedDataPoints(timeRange)

        // Calculate linear regression
        const { slope, intercept, correlation } = this.calculateLinearRegression(dataPoints)

        // Calculate percentile and z-score
        const percentile = 65 + Math.random() * 20
        const zScore = (percentile / 100 - 0.5) * 2

        // Classify trend
        let classification: CognitiveTrendAnalysis["classification"] = "normal"

        if (slope < -0.1) {
          classification = "mild_decline"
        } else if (slope < -0.2) {
          classification = "moderate_decline"
        } else if (slope < -0.3) {
          classification = "severe_decline"
        }

        const result: CognitiveTrendAnalysis = {
          patientId,
          domain,
          timeRange,
          dataPoints,
          trend: {
            slope,
            intercept,
            correlation,
          },
          percentile,
          zScore,
          classification,
          confidence: 0.85 + Math.random() * 0.1,
        }

        const duration = performance.now() - startTime

        metrics
          .createHistogram({
            name: "cognitive_analysis_duration_seconds",
            help: "Duration of cognitive analysis in seconds",
            labelNames: ["operation"],
          })
          .observe(duration / 1000, { operation: "analyzeTrends" })

        return result
      } catch (error) {
        span.setStatus("error", error as Error)
        logger.error("Error analyzing cognitive trends", error)
        throw error
      }
    })
  }

  // Detect anomalies in cognitive data
  public async detectAnomalies(
    patientId: string,
    domain: CognitiveDomain,
    recentResults: CognitiveAssessmentResult[],
  ): Promise<CognitiveAnomalyDetection[]> {
    return tracer.withSpan("detectAnomalies", async (span) => {
      span.setTag("patient_id", patientId)
      span.setTag("domain", domain)
      span.setTag("result_count", recentResults.length)

      const startTime = performance.now()

      try {
        // In a real implementation, this would use statistical methods
        // or machine learning to detect anomalies

        // For demonstration purposes, we'll simulate anomaly detection
        const anomalies: CognitiveAnomalyDetection[] = []

        for (const result of recentResults) {
          // Calculate expected score based on historical data
          const expectedScore = 70 + Math.random() * 10

          // Calculate deviation
          const deviation = result.score - expectedScore

          // Calculate z-score
          const zScore = deviation / 10

          // Determine if it's an anomaly
          const isAnomaly = Math.abs(zScore) > 2

          if (isAnomaly) {
            anomalies.push({
              patientId,
              domain,
              timestamp: result.timestamp,
              score: result.score,
              expectedScore,
              deviation,
              zScore,
              isAnomaly,
              confidence: 0.7 + Math.random() * 0.2,
              factors: [
                {
                  name: "Recent medication change",
                  contribution: 0.4 + Math.random() * 0.2,
                },
                {
                  name: "Sleep quality",
                  contribution: 0.3 + Math.random() * 0.2,
                },
                {
                  name: "Stress level",
                  contribution: 0.2 + Math.random() * 0.1,
                },
              ],
            })

            // Record anomaly metric
            metrics
              .createCounter({
                name: "cognitive_anomalies_detected",
                help: "Number of cognitive anomalies detected",
                labelNames: ["domain", "patient_id"],
              })
              .inc(1, {
                domain,
                patient_id: patientId,
              })
          }
        }

        const duration = performance.now() - startTime

        metrics
          .createHistogram({
            name: "cognitive_analysis_duration_seconds",
            help: "Duration of cognitive analysis in seconds",
            labelNames: ["operation"],
          })
          .observe(duration / 1000, { operation: "detectAnomalies" })

        return anomalies
      } catch (error) {
        span.setStatus("error", error as Error)
        logger.error("Error detecting cognitive anomalies", error)
        throw error
      }
    })
  }

  // Assess cognitive risk
  public async assessRisk(
    patientId: string,
    domainScores: Record<CognitiveDomain, number>,
    demographics: Record<string, any>,
  ): Promise<CognitiveRiskAssessment> {
    return tracer.withSpan("assessRisk", async (span) => {
      span.setTag("patient_id", patientId)

      const startTime = performance.now()

      try {
        // In a real implementation, this would use a risk model
        // trained on historical data

        // For demonstration purposes, we'll simulate risk assessment
        const domainRisks: Record<CognitiveDomain, number> = {} as any

        // Calculate risk for each domain
        for (const domain of Object.keys(domainScores) as CognitiveDomain[]) {
          const score = domainScores[domain]

          // Higher score = lower risk
          domainRisks[domain] = Math.max(0, Math.min(1, 1 - score / 100))
        }

        // Calculate overall risk
        const overallRisk =
          Object.values(domainRisks).reduce((acc, risk) => acc + risk, 0) / Object.values(domainRisks).length

        // Generate risk factors
        const factors = [
          {
            name: "Age",
            weight: 0.3,
            value: demographics.age || 65,
            contribution: (0.3 * ((demographics.age || 65) - 50)) / 50,
          },
          {
            name: "Family history",
            weight: 0.2,
            value: demographics.familyHistory ? 1 : 0,
            contribution: 0.2 * (demographics.familyHistory ? 1 : 0),
          },
          {
            name: "Cognitive decline rate",
            weight: 0.4,
            value: 0.1 + Math.random() * 0.2,
            contribution: 0.4 * (0.1 + Math.random() * 0.2),
          },
          {
            name: "Lifestyle factors",
            weight: 0.1,
            value: 0.5 + Math.random() * 0.5,
            contribution: 0.1 * (0.5 + Math.random() * 0.5),
          },
        ]

        // Generate recommendations
        const recommendations = [
          "Regular cognitive assessments every 3 months",
          "Consider memory enhancement exercises",
          "Maintain regular physical activity",
          "Ensure adequate sleep and stress management",
          "Follow up with specialist for detailed evaluation",
        ]

        const result: CognitiveRiskAssessment = {
          patientId,
          timestamp: Date.now(),
          overallRisk,
          domainRisks,
          factors,
          recommendations,
          confidence: 0.8 + Math.random() * 0.15,
        }

        // Record risk metric
        metrics
          .createGauge({
            name: "cognitive_risk_score",
            help: "Cognitive risk score",
            labelNames: ["patient_id"],
          })
          .set(overallRisk, {
            patient_id: patientId,
          })

        const duration = performance.now() - startTime

        metrics
          .createHistogram({
            name: "cognitive_analysis_duration_seconds",
            help: "Duration of cognitive analysis in seconds",
            labelNames: ["operation"],
          })
          .observe(duration / 1000, { operation: "assessRisk" })

        return result
      } catch (error) {
        span.setStatus("error", error as Error)
        logger.error("Error assessing cognitive risk", error)
        throw error
      }
    })
  }

  // Helper method to generate simulated data points
  private generateSimulatedDataPoints(timeRange: { start: number; end: number }) {
    const dataPoints: Array<{ timestamp: number; score: number }> = []
    const numPoints = 10

    const timeStep = (timeRange.end - timeRange.start) / numPoints

    // Generate data with a slight downward trend
    for (let i = 0; i < numPoints; i++) {
      const timestamp = timeRange.start + i * timeStep

      // Base score with slight downward trend and random noise
      const baseScore = 85 - i * 0.5
      const noise = (Math.random() - 0.5) * 10
      const score = Math.max(0, Math.min(100, baseScore + noise))

      dataPoints.push({ timestamp, score })
    }

    return dataPoints
  }

  // Helper method to calculate linear regression
  private calculateLinearRegression(dataPoints: Array<{ timestamp: number; score: number }>) {
    const n = dataPoints.length

    if (n <= 1) {
      return { slope: 0, intercept: dataPoints[0]?.score || 0, correlation: 0 }
    }

    // Normalize timestamps to days from start
    const startTime = dataPoints[0].timestamp
    const normalizedPoints = dataPoints.map((point) => ({
      x: (point.timestamp - startTime) / (24 * 60 * 60 * 1000), // Convert to days
      y: point.score,
    }))

    // Calculate means
    const meanX = normalizedPoints.reduce((sum, point) => sum + point.x, 0) / n
    const meanY = normalizedPoints.reduce((sum, point) => sum + point.y, 0) / n

    // Calculate variances and covariance
    let varX = 0
    let varY = 0
    let covXY = 0

    for (const point of normalizedPoints) {
      const diffX = point.x - meanX
      const diffY = point.y - meanY

      varX += diffX * diffX
      varY += diffY * diffY
      covXY += diffX * diffY
    }

    varX /= n
    varY /= n
    covXY /= n

    // Calculate slope and intercept
    const slope = covXY / varX
    const intercept = meanY - slope * meanX

    // Calculate correlation coefficient
    const correlation = covXY / Math.sqrt(varX * varY)

    return { slope, intercept, correlation }
  }
}

// Create and export singleton instance
export const cognitiveAnalysis = CognitiveAnalysisService.getInstance()

// React hook for using cognitive analysis in components
export function useCognitiveAnalysis() {
  return {
    analyzeAssessment: (results: CognitiveAssessmentResult[]) => cognitiveAnalysis.analyzeAssessment(results),
    analyzeTrends: (patientId: string, domain: CognitiveDomain, timeRange: { start: number; end: number }) =>
      cognitiveAnalysis.analyzeTrends(patientId, domain, timeRange),
    detectAnomalies: (patientId: string, domain: CognitiveDomain, recentResults: CognitiveAssessmentResult[]) =>
      cognitiveAnalysis.detectAnomalies(patientId, domain, recentResults),
    assessRisk: (patientId: string, domainScores: Record<CognitiveDomain, number>, demographics: Record<string, any>) =>
      cognitiveAnalysis.assessRisk(patientId, domainScores, demographics),
  }
}

