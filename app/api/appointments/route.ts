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
    const doctorId = searchParams.get("doctorId")

    // Get appointments based on query parameters
    let appointments
    if (patientId) {
      appointments = await db.getAppointmentsByPatientId(patientId)
    } else if (doctorId) {
      appointments = await db.getAppointmentsByDoctorId(doctorId)
    } else {
      appointments = await db.getAppointments()
    }

    return NextResponse.json(appointments)
  } catch (error) {
    console.error("Error fetching appointments:", error)
    return NextResponse.json({ error: "Failed to fetch appointments" }, { status: 500 })
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
    const newAppointment = await db.createAppointment(data)

    return NextResponse.json(newAppointment, { status: 201 })
  } catch (error) {
    console.error("Error creating appointment:", error)
    return NextResponse.json({ error: "Failed to create appointment" }, { status: 500 })
  }
}

