import { withAuth, UserRole } from "@/lib/security/auth-middleware"
import { cognitiveAnalysis, type CognitiveDomain, type CognitiveAssessmentResult } from "@/lib/ai/cognitive-analysis"
import type { NextRequest } from "next/server"
import { logger } from "@/lib/monitoring/logger"
import { tracer } from "@/lib/observability/tracing"

export const POST = withAuth(
  async (req: NextRequest) => {
    return tracer.withSpan("cognitive-anomalies-api", async (span) => {
      try {
        const body = await req.json()
        const { patientId, domain, recentResults } = body as {
          patientId: string
          domain: CognitiveDomain
          recentResults: CognitiveAssessmentResult[]
        }

        if (!patientId || !domain || !recentResults || !Array.isArray(recentResults)) {
          return new Response(JSON.stringify({ error: "Invalid request body" }), {
            status: 400,
            headers: { "Content-Type": "application/json" },
          })
        }

        span.setTag("patient_id", patientId)
        span.setTag("domain", domain)
        span.setTag("result_count", recentResults.length)

        const anomalies = await cognitiveAnalysis.detectAnomalies(patientId, domain, recentResults)

        return new Response(JSON.stringify({ anomalies }), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        })
      } catch (error) {
        logger.error("Error in cognitive anomalies API", error)
        span.setStatus("error", error as Error)

        return new Response(JSON.stringify({ error: "Internal server error" }), {
          status: 500,
          headers: { "Content-Type": "application/json" },
        })
      }
    })
  },
  {
    requiredRoles: [UserRole.USER],
    requiredPermissions: ["read:patients", "read:assessments"],
  },
)

