import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { calculateModelMetrics, detectModelDrift } from "@/lib/ml/monitoring"
import { z } from "zod"

const requestSchema = z.object({
  modelId: z.string(),
})

export async function POST(req: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Check authorization (only admins can access this endpoint)
    if (session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    // Parse and validate request body
    const body = await req.json()
    const validationResult = requestSchema.safeParse(body)

    if (!validationResult.success) {
      return NextResponse.json({ error: "Invalid request", details: validationResult.error.format() }, { status: 400 })
    }

    const { modelId } = validationResult.data

    // Calculate model metrics
    const metrics = await calculateModelMetrics(modelId)

    // Detect model drift
    const drift = await detectModelDrift(modelId)

    return NextResponse.json({
      metrics,
      drift,
    })
  } catch (error) {
    console.error("Error in model-metrics API:", error)
    return NextResponse.json({ error: "Failed to process model metrics request" }, { status: 500 })
  }
}

