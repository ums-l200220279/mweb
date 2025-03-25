import { type NextRequest, NextResponse } from "next/server"
import { PatientService } from "@/services/patient-service"
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

    // Get patients
    const patients = await PatientService.getAllPatients(page, limit)

    return NextResponse.json(patients)
  } catch (error) {
    console.error("Error fetching patients:", error)
    return NextResponse.json({ error: "Failed to fetch patients" }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Check if user is admin or doctor
    if (session.user.role !== "ADMIN" && session.user.role !== "DOCTOR") {
      return NextResponse.json({ error: "Forbidden: Only admins and doctors can create patients" }, { status: 403 })
    }

    // Get request body
    const body = await req.json()

    // Validate required fields
    if (!body.userId) {
      return NextResponse.json({ error: "User ID is required" }, { status: 400 })
    }

    // Create patient
    const patient = await PatientService.createPatient({
      userId: body.userId,
      dateOfBirth: body.dateOfBirth ? new Date(body.dateOfBirth) : undefined,
      diagnosis: body.diagnosis,
      riskLevel: body.riskLevel,
    })

    return NextResponse.json(patient, { status: 201 })
  } catch (error) {
    console.error("Error creating patient:", error)
    return NextResponse.json({ error: "Failed to create patient" }, { status: 500 })
  }
}

