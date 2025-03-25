import { type NextRequest, NextResponse } from "next/server"
import { PatientService } from "@/services/patient-service"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get patient by ID
    const patient = await PatientService.getPatientById(params.id)

    if (!patient) {
      return NextResponse.json({ error: "Patient not found" }, { status: 404 })
    }

    return NextResponse.json(patient)
  } catch (error) {
    console.error("Error fetching patient:", error)
    return NextResponse.json({ error: "Failed to fetch patient" }, { status: 500 })
  }
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Check if user is admin, doctor, or the patient's caregiver
    if (session.user.role !== "ADMIN" && session.user.role !== "DOCTOR" && session.user.role !== "CAREGIVER") {
      return NextResponse.json({ error: "Forbidden: Not authorized to update this patient" }, { status: 403 })
    }

    // Get request body
    const body = await req.json()

    // Update patient
    const patient = await PatientService.updatePatient(params.id, {
      diagnosis: body.diagnosis,
      riskLevel: body.riskLevel,
      status: body.status,
      dateOfBirth: body.dateOfBirth ? new Date(body.dateOfBirth) : undefined,
    })

    return NextResponse.json(patient)
  } catch (error) {
    console.error("Error updating patient:", error)
    return NextResponse.json({ error: "Failed to update patient" }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Check if user is admin
    if (session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden: Only admins can delete patients" }, { status: 403 })
    }

    // Delete patient
    await PatientService.deletePatient(params.id)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting patient:", error)
    return NextResponse.json({ error: "Failed to delete patient" }, { status: 500 })
  }
}

