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

    // Check if user is a caregiver
    if (session.user.role !== "caregiver") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const caregiverId = session.user.id

    // Get caregiver's data
    const caregiver = await db.getCaregiverById(caregiverId)
    if (!caregiver) {
      return NextResponse.json({ error: "Caregiver not found" }, { status: 404 })
    }

    // Get caregiver's patients
    const patientPromises = caregiver.patients.map((id) => db.getPatientById(id))
    const patients = (await Promise.all(patientPromises)).filter(Boolean)

    // Get all appointments for caregiver's patients
    const appointmentPromises = patients.map((patient) => db.getAppointmentsByPatientId(patient.id))
    const allAppointments = (await Promise.all(appointmentPromises)).flat()

    // Get high-risk patients
    const highRiskPatients = patients.filter((p) => p.riskLevel === "high")

    // Return dashboard data
    return NextResponse.json({
      caregiver,
      metrics: {
        totalPatients: patients.length,
        highRiskPatients: highRiskPatients.length,
        upcomingAppointments: allAppointments.filter((a) => new Date(a.date) >= new Date()).length,
      },
      patients,
      upcomingAppointments: allAppointments
        .filter((a) => new Date(a.date) >= new Date())
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
        .slice(0, 5),
      recentNotes: caregiver.notes.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 5),
    })
  } catch (error) {
    console.error("Error fetching caregiver dashboard data:", error)
    return NextResponse.json({ error: "Failed to fetch caregiver dashboard data" }, { status: 500 })
  }
}

