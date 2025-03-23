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

    // Check if user is a patient
    if (session.user.role !== "patient") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const patientId = session.user.id

    // Get patient's data
    const patient = await db.getPatientById(patientId)
    if (!patient) {
      return NextResponse.json({ error: "Patient not found" }, { status: 404 })
    }

    // Get patient's appointments
    const appointments = await db.getAppointmentsByPatientId(patientId)

    // Get patient's assessments
    const assessments = await db.getAssessmentsByPatientId(patientId)

    // Return dashboard data
    return NextResponse.json({
      patient,
      cognitiveScores: patient.cognitiveScores,
      medications: patient.medications,
      upcomingAppointments: appointments
        .filter((a) => new Date(a.date) >= new Date())
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
        .slice(0, 5),
      recentAssessments: assessments
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
        .slice(0, 3),
      caregiverNotes: patient.caregiverNotes
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
        .slice(0, 5),
    })
  } catch (error) {
    console.error("Error fetching patient dashboard data:", error)
    return NextResponse.json({ error: "Failed to fetch patient dashboard data" }, { status: 500 })
  }
}

