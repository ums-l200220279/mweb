import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import prisma from "@/lib/db-client"

export async function GET(request: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const patientId = params.id

    // Check authorization based on role
    if (session.user.role === "PATIENT") {
      // Patients can only access their own data
      const patient = await prisma.patient.findFirst({
        where: {
          userId: session.user.id,
        },
      })

      if (!patient || patient.id !== patientId) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
      }
    } else if (session.user.role === "DOCTOR") {
      // Doctors can only access their patients
      const doctor = await prisma.doctor.findFirst({
        where: {
          userId: session.user.id,
        },
      })

      if (!doctor) {
        return NextResponse.json({ error: "Doctor not found" }, { status: 404 })
      }

      const patient = await prisma.patient.findUnique({
        where: {
          id: patientId,
        },
      })

      if (!patient || patient.doctorId !== doctor.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
      }
    } else if (session.user.role === "CAREGIVER") {
      // Caregivers can only access their patients
      const caregiver = await prisma.caregiver.findFirst({
        where: {
          userId: session.user.id,
        },
      })

      if (!caregiver) {
        return NextResponse.json({ error: "Caregiver not found" }, { status: 404 })
      }

      const patient = await prisma.patient.findUnique({
        where: {
          id: patientId,
        },
      })

      if (!patient || patient.caregiverId !== caregiver.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
      }
    }
    // Admins can access all patients

    // Fetch patient with detailed information
    const patient = await prisma.patient.findUnique({
      where: {
        id: patientId,
      },
      include: {
        user: {
          select: {
            name: true,
            email: true,
            image: true,
          },
        },
        cognitiveScores: {
          orderBy: {
            date: "desc",
          },
        },
        medications: true,
        appointments: {
          include: {
            doctor: {
              include: {
                user: {
                  select: {
                    name: true,
                  },
                },
              },
            },
          },
          orderBy: {
            date: "desc",
          },
        },
        assessments: {
          orderBy: {
            date: "desc",
          },
        },
        caregiverNotes: {
          include: {
            caregiver: {
              include: {
                user: {
                  select: {
                    name: true,
                  },
                },
              },
            },
          },
          orderBy: {
            date: "desc",
          },
        },
      },
    })

    if (!patient) {
      return NextResponse.json({ error: "Patient not found" }, { status: 404 })
    }

    return NextResponse.json({
      id: patient.id,
      name: patient.user.name,
      email: patient.user.email,
      image: patient.user.image,
      age: patient.age,
      gender: patient.gender,
      diagnosis: patient.diagnosis,
      mmseScore: patient.mmseScore,
      lastCheckup: patient.lastCheckup,
      riskLevel: patient.riskLevel,
      status: patient.status,
      cognitiveScores: patient.cognitiveScores.map((score) => ({
        date: score.date,
        score: score.score,
        category: score.category,
      })),
      medications: patient.medications.map((med) => ({
        id: med.id,
        name: med.name,
        dosage: med.dosage,
        frequency: med.frequency,
        startDate: med.startDate,
        endDate: med.endDate,
        instructions: med.instructions,
      })),
      appointments: patient.appointments.map((apt) => ({
        id: apt.id,
        date: apt.date,
        time: apt.time,
        type: apt.type,
        status: apt.status,
        doctorName: apt.doctor.user.name,
        notes: apt.notes,
      })),
      assessments: patient.assessments.map((assessment) => ({
        id: assessment.id,
        date: assessment.date,
        mmseScore: assessment.mmseScore,
        memory: assessment.memory,
        attention: assessment.attention,
        language: assessment.language,
        visualSpatial: assessment.visualSpatial,
        executiveFunction: assessment.executiveFunction,
        notes: assessment.notes,
        recommendations: assessment.recommendations,
      })),
      caregiverNotes: patient.caregiverNotes.map((note) => ({
        id: note.id,
        date: note.date,
        content: note.content,
        category: note.category,
        caregiverName: note.caregiver.user.name,
      })),
    })
  } catch (error) {
    console.error("Error fetching patient:", error)
    return NextResponse.json({ error: "Failed to fetch patient" }, { status: 500 })
  }
}

