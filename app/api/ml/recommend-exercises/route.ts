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

    // Parse and validate request body
    const body = await req.json()
    const validationResult = requestSchema.safeParse(body)

    if (!validationResult.success) {
      return NextResponse.json({ error: "Invalid request", details: validationResult.error.format() }, { status: 400 })
    }

    const { patientId } = validationResult.data

    // Create ML service and get recommendations
    const mlService = createMLModelService()
    const recommendations = await mlService.recommendExercises(patientId)

    return NextResponse.json(recommendations)
  } catch (error) {
    console.error("Error in recommend-exercises API:", error)
    return NextResponse.json({ error: "Failed to process exercise recommendation request" }, { status: 500 })
  }
}

