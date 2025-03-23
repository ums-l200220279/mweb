import { OpenAIStream, StreamingTextResponse } from "ai"
import { openai } from "@ai-sdk/openai"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { logger } from "@/lib/logging"

export const runtime = "nodejs"

export async function POST(req: Request) {
  try {
    // Verify authentication
    const session = await auth()
    if (!session?.user) {
      return new Response("Unauthorized", { status: 401 })
    }

    // Parse the request
    const { messages, context } = await req.json()

    // Log the interaction
    logger.info("Assistant API called", {
      userId: session.user.id,
      messageCount: messages.length,
      context: context?.page || "unknown",
    })

    // Get user's cognitive data if available
    let cognitiveData = null
    try {
      cognitiveData = await prisma.cognitiveAssessment.findFirst({
        where: { userId: session.user.id },
        orderBy: { createdAt: "desc" },
      })
    } catch (error) {
      logger.error("Error fetching cognitive data", { error })
    }

    // Enhance the system message with user context
    const enhancedMessages = [...messages]
    if (cognitiveData && enhancedMessages[0].role === "system") {
      enhancedMessages[0].content += `
Current user cognitive data:
- Last assessment: ${cognitiveData.createdAt}
- Overall score: ${cognitiveData.overallScore}/100
- Memory score: ${cognitiveData.memoryScore}/100
- Attention score: ${cognitiveData.attentionScore}/100
- Processing speed: ${cognitiveData.processingSpeedScore}/100
- Executive function: ${cognitiveData.executiveFunctionScore}/100
`
    }

    // Add page context if available
    if (context?.page && enhancedMessages[0].role === "system") {
      enhancedMessages[0].content += `
Current page context: ${context.page}
`
    }

    // Generate the response stream
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: enhancedMessages.map(({ role, content }) => ({ role, content })),
      temperature: 0.7,
      stream: true,
    })

    // Create a stream and return it
    const stream = OpenAIStream(response)
    return new StreamingTextResponse(stream)
  } catch (error) {
    logger.error("Assistant API error", { error })
    return new Response("Error processing your request", { status: 500 })
  }
}

