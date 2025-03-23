import { type NextRequest, NextResponse } from "next/server"
import { generateText } from "ai"
import { openai } from "@ai-sdk/openai"

export async function POST(req: NextRequest) {
  const { patientData, currentDiagnosis, proposedTreatment } = await req.json()

  try {
    const { text } = await generateText({
      model: openai("gpt-4o"),
      prompt: `Analyze the following patient data, current diagnosis, and proposed treatment. Provide decision support for the doctor: 
        Patient Data: ${JSON.stringify(patientData)}
        Current Diagnosis: ${currentDiagnosis}
        Proposed Treatment: ${proposedTreatment}`,
      system:
        "You are an AI decision support system for doctors specializing in cognitive health and dementia. Provide evidence-based recommendations and highlight any potential issues or alternative treatments to consider.",
    })

    // Parse the AI-generated decision support
    const decisionSupport = JSON.parse(text)

    return NextResponse.json(decisionSupport)
  } catch (error) {
    console.error("Error in decision support system:", error)
    return NextResponse.json(
      { error: "An error occurred while processing the decision support request." },
      { status: 500 },
    )
  }
}

