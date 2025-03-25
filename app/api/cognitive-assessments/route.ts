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

    // Get query parameters
    const searchParams = req.nextUrl.searchParams
    const page = Number.parseInt(searchParams.get("page") || "1")
    const limit = Number.parseInt(searchParams.get("limit") || "10")

    // Get assessments
    const assessments = await CognitiveAssessmentService.getAllAssessments(page, limit)

    return NextResponse.json(assessments)
  } catch (error) {
    console.error("Error fetching assessments:", error)
    return NextResponse.json({ error: "Failed to fetch assessments" }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Check if user is doctor
    if (session.user.role !== "DOCTOR" && session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden: Only doctors can create assessments" }, { status: 403 })
    }

    // Get request body
    const body = await req.json()

    // Validate required fields
    if (!body.patientId || !body.mmseScore || !body.cognitiveAreas) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Create assessment
    const assessment = await CognitiveAssessmentService.createAssessment({
      patientId: body.patientId,
      doctorId: body.doctorId || (session.user.role === "DOCTOR" ? session.user.id : undefined),
      mmseScore: body.mmseScore,
      notes: body.notes,
      recommendations: body.recommendations,
      cognitiveAreas: {
        memory: body.cognitiveAreas.memory,
        attention: body.cognitiveAreas.attention,
        language: body.cognitiveAreas.language,
        visualSpatial: body.cognitiveAreas.visualSpatial,
        executiveFunction: body.cognitiveAreas.executiveFunction,
      },
    })

    return NextResponse.json(assessment, { status: 201 })
  } catch (error) {
    console.error("Error creating assessment:", error)
    return NextResponse.json({ error: "Failed to create assessment" }, { status: 500 })
  }
}

