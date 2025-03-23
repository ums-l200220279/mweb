import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { createMLModelService } from "@/lib/ml/models"

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

    // Get audio data from request
    const formData = await req.formData()
    const audioFile = formData.get("audio") as File

    if (!audioFile) {
      return NextResponse.json({ error: "No audio file provided" }, { status: 400 })
    }

    // Convert file to ArrayBuffer
    const arrayBuffer = await audioFile.arrayBuffer()

    // Create ML service and analyze speech
    const mlService = createMLModelService()
    const analysis = await mlService.analyzeSpeech(arrayBuffer)

    return NextResponse.json(analysis)
  } catch (error) {
    console.error("Error in analyze-speech API:", error)
    return NextResponse.json({ error: "Failed to process speech analysis request" }, { status: 500 })
  }
}

