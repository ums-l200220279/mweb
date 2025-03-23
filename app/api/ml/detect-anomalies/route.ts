import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { createMLModelService } from "@/lib/ml/models"
import { z } from "zod"

const requestSchema = z.object({
  patientId: z.string(),
})

export async function POST(req: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Check authorization (doctors and caregivers can access this endpoint)
    if (session.user.role !== "DOCTOR" && session.user.role !== "CAREGIVER") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    // Parse and validate request body
    const body = await req.json()
    const validationResult = requestSchema.safeParse(body)

    if (!validationResult.success) {
      return NextResponse.json({ error: "Invalid request", details: validationResult.error.format() }, { status: 400 })
    }

    const { patientId } = validationResult.data

    // Create ML service and detect anomalies
    const mlService = createMLModelService()
    const anomalies = await mlService.detectAnomalies(patientId)

    return NextResponse.json(anomalies)
  } catch (error) {
    console.error("Error in detect-anomalies API:", error)
    return NextResponse.json({ error: "Failed to process anomaly detection request" }, { status: 500 })
  }
}

