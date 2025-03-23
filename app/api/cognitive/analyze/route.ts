import { withAuth, UserRole } from "@/lib/security/auth-middleware"
import { cognitiveAnalysis, type CognitiveAssessmentResult } from "@/lib/ai/cognitive-analysis"
import type { NextRequest } from "next/server"
import { logger } from "@/lib/monitoring/logger"
import { tracer } from "@/lib/observability/tracing"

export const POST = withAuth(
  async (req: NextRequest) => {
    return tracer.withSpan("cognitive-analyze-api", async (span) => {
      try {
        const body = await req.json()
        const { results } = body as { results: CognitiveAssessmentResult[] }

        if (!results || !Array.isArray(results) || results.length === 0) {
          return new Response(JSON.stringify({ error: "Invalid request body" }), {
            status: 400,
            headers: { "Content-Type": "application/json" },
          })
        }

        span.setTag("patient_id", results[0].patientId)
        span.setTag("result_count", results.length)

        const analysis = await cognitiveAnalysis.analyzeAssessment(results)

        return new Response(JSON.stringify({ analysis }), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        })
      } catch (error) {
        logger.error("Error in cognitive analysis API", error)
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

