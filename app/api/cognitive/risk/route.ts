import { withAuth, UserRole } from "@/lib/security/auth-middleware"
import { cognitiveAnalysis, type CognitiveDomain } from "@/lib/ai/cognitive-analysis"
import type { NextRequest } from "next/server"
import { logger } from "@/lib/monitoring/logger"
import { tracer } from "@/lib/observability/tracing"

export const POST = withAuth(
  async (req: NextRequest) => {
    return tracer.withSpan("cognitive-risk-api", async (span) => {
      try {
        const body = await req.json()
        const { patientId, domainScores, demographics } = body as {
          patientId: string
          domainScores: Record<CognitiveDomain, number>
          demographics: Record<string, any>
        }

        if (!patientId || !domainScores || !demographics) {
          return new Response(JSON.stringify({ error: "Invalid request body" }), {
            status: 400,
            headers: { "Content-Type": "application/json" },
          })
        }

        span.setTag("patient_id", patientId)

        const risk = await cognitiveAnalysis.assessRisk(patientId, domainScores, demographics)

        return new Response(JSON.stringify({ risk }), { status: 200, headers: { "Content-Type": "application/json" } })
      } catch (error) {
        logger.error("Error in cognitive risk API", error)
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

