import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

export async function GET(request: Request) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get query parameters
    const { searchParams } = new URL(request.url)
    const patientId = searchParams.get("patientId")

    // Get assessments based on query parameters
    let assessments
    if (patientId) {
      assessments = await db.getAssessmentsByPatientId(patientId)
    } else {
      assessments = await db.getAssessments()
    }

    return NextResponse.json(assessments)
  } catch (error) {
    console.error("Error fetching assessments:", error)
    return NextResponse.json({ error: "Failed to fetch assessments" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const data = await request.json()
    const newAssessment = await db.createAssessment(data)

    return NextResponse.json(newAssessment, { status: 201 })
  } catch (error) {
    console.error("Error creating assessment:", error)
    return NextResponse.json({ error: "Failed to create assessment" }, { status: 500 })
  }
}

