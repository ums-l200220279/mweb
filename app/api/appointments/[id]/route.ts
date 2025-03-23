import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const appointment = await db.getAppointmentById(params.id)
    if (!appointment) {
      return NextResponse.json({ error: "Appointment not found" }, { status: 404 })
    }

    return NextResponse.json(appointment)
  } catch (error) {
    console.error(`Error fetching appointment ${params.id}:`, error)
    return NextResponse.json({ error: "Failed to fetch appointment" }, { status: 500 })
  }
}

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const data = await request.json()
    const updatedAppointment = await db.updateAppointment(params.id, data)

    if (!updatedAppointment) {
      return NextResponse.json({ error: "Appointment not found" }, { status: 404 })
    }

    return NextResponse.json(updatedAppointment)
  } catch (error) {
    console.error(`Error updating appointment ${params.id}:`, error)
    return NextResponse.json({ error: "Failed to update appointment" }, { status: 500 })
  }
}

