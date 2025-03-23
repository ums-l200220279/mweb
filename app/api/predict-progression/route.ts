import { type NextRequest, NextResponse } from "next/server"
import { generateText } from "ai"
import { openai } from "@ai-sdk/openai"

export async function POST(req: NextRequest) {
  const { patientData, timeframe } = await req.json()

  try {
    const { text } = await generateText({
      model: openai("gpt-4o"),
      prompt: `Based on the following patient data, predict the progression of cognitive decline over the next ${timeframe} months: ${JSON.stringify(patientData)}`,
      system:
        "You are an AI system specialized in predicting the progression of dementia and Alzheimer's disease. Provide a detailed prediction based on the given patient data and timeframe.",
    })

    // Parse the AI-generated prediction
    const prediction = JSON.parse(text)

    return NextResponse.json(prediction)
  } catch (error) {
    console.error("Error in predicting progression:", error)
    return NextResponse.json({ error: "An error occurred while processing the prediction request." }, { status: 500 })
  }
}

