import { type NextRequest, NextResponse } from "next/server"
import { CognitiveAssessmentService } from "@/services/cognitive-assessment-service"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"

export async function GET(req: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Check if user is doctor or admin
    if (session.user.role !== "DOCTOR" && session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden: Only doctors and admins can view statistics" }, { status: 403 })
    }

    // Get statistics
    const statistics = await CognitiveAssessmentService.getStatistics()

    return NextResponse.json(statistics)
  } catch (error) {
    console.error("Error fetching assessment statistics:", error)
    return NextResponse.json({ error: "Failed to fetch assessment statistics" }, { status: 500 })
  }
}

