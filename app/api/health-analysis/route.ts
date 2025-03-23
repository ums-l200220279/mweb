import { type NextRequest, NextResponse } from "next/server"
import { generateText } from "ai"
import { openai } from "@ai-sdk/openai"

export async function POST(req: NextRequest) {
  const { patientData } = await req.json()

  try {
    const { text } = await generateText({
      model: openai("gpt-4o"),
      prompt: `Analyze the following patient data and provide personalized health recommendations: ${JSON.stringify(patientData)}`,
      system:
        "You are an AI system specialized in analyzing patient health data and providing personalized recommendations for cognitive health.",
    })

    // Parse the AI-generated analysis and recommendations
    const analysis = JSON.parse(text)

    return NextResponse.json(analysis)
  } catch (error) {
    console.error("Error in health analysis:", error)
    return NextResponse.json({ error: "An error occurred while processing the health analysis." }, { status: 500 })
  }
}

