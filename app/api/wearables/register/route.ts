import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import prisma from "@/lib/db-client"
import { createWearableService } from "@/lib/wearables/wearable-service"

export async function POST(req: Request) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Parse request body
    const body = await req.json()
    const { patientId, deviceType, deviceId, accessToken, refreshToken } = body

    // Validate input
    if (!patientId || !deviceType || !deviceId) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Check authorization
    // Only allow if user is the patient, their caregiver, or their doctor
    const user = session.user
    const isAuthorized = await checkUserAuthorization(user.id, patientId)
    if (!isAuthorized) {
      return NextResponse.json({ error: "Not authorized to manage this patient's devices" }, { status: 403 })
    }

    // Create wearable service
    const wearableService = createWearableService(deviceType)

    // Register device
    await wearableService.registerDevice(patientId, {
      id: deviceId,
      type: deviceType,
      model: body.model || "Unknown",
      accessToken,
      refreshToken,
    })

    return NextResponse.json({ success: true, message: "Device registered successfully" }, { status: 200 })
  } catch (error) {
    console.error("Error registering wearable device:", error)
    return NextResponse.json({ error: "Failed to register device" }, { status: 500 })
  }
}

// Helper function to check if user is authorized to manage patient's devices
async function checkUserAuthorization(userId: string, patientId: string) {
  // Check if user is the patient
  const patient = await prisma.patient.findUnique({
    where: { id: patientId },
    select: { userId: true, caregiverId: true, doctorId: true },
  })

  if (!patient) return false

  // User is the patient
  if (patient.userId === userId) return true

  // Check if user is the caregiver
  if (patient.caregiverId) {
    const caregiver = await prisma.caregiver.findUnique({
      where: { id: patient.caregiverId },
      select: { userId: true },
    })
    if (caregiver && caregiver.userId === userId) return true
  }

  // Check if user is the doctor
  if (patient.doctorId) {
    const doctor = await prisma.doctor.findUnique({
      where: { id: patient.doctorId },
      select: { userId: true },
    })
    if (doctor && doctor.userId === userId) return true
  }

  return false
}

