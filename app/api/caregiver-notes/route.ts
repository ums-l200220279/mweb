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

    // Get caregiver notes based on query parameters
    let notes
    if (patientId) {
      notes = await db.getCaregiverNotesByPatientId(patientId)
    } else {
      notes = await db.getCaregiverNotes()
    }

    return NextResponse.json(notes)
  } catch (error) {
    console.error("Error fetching caregiver notes:", error)
    return NextResponse.json({ error: "Failed to fetch caregiver notes" }, { status: 500 })
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
    const newNote = await db.createCaregiverNote(data)

    return NextResponse.json(newNote, { status: 201 })
  } catch (error) {
    console.error("Error creating caregiver note:", error)
    return NextResponse.json({ error: "Failed to create caregiver note" }, { status: 500 })
  }
}

