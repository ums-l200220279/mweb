import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { createMLModelService } from "@/lib/ml/models"
import { z } from "zod"

const requestSchema = z.object({
  text: z.string().min(1),
})

export async function POST(req: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Check authorization (only doctors can access this endpoint)
    if (session.user.role !== "DOCTOR") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    // Parse and validate request body
    const body = await req.json()
    const validationResult = requestSchema.safeParse(body)

    if (!validationResult.success) {
      return NextResponse.json({ error: "Invalid request", details: validationResult.error.format() }, { status: 400 })
    }

    const { text } = validationResult.data

    // Create ML service and analyze text
    const mlService = createMLModelService()
    const analysis = await mlService.analyzeText(text)

    return NextResponse.json(analysis)
  } catch (error) {
    console.error("Error in analyze-text API:", error)
    return NextResponse.json({ error: "Failed to process text analysis request" }, { status: 500 })
  }
}

