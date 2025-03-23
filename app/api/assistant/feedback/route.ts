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
    const { messageId, feedback, sessionId } = await req.json()

    // Validate the request
    if (!messageId || !feedback || !["positive", "negative"].includes(feedback)) {
      return new Response("Invalid request", { status: 400 })
    }

    // Store the feedback
    await prisma.assistantFeedback.create({
      data: {
        messageId,
        feedback,
        userId: session.user.id,
        sessionId: sessionId || session.user.id,
      },
    })

    // Log the feedback
    logger.info("Assistant feedback received", {
      userId: session.user.id,
      messageId,
      feedback,
    })

    return new Response(JSON.stringify({ success: true }), {
      headers: { "Content-Type": "application/json" },
    })
  } catch (error) {
    logger.error("Assistant feedback API error", { error })
    return new Response("Error processing your request", { status: 500 })
  }
}

