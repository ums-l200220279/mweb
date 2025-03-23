import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import prisma from "@/lib/db-client"

export async function GET() {
  const session = await getServerSession(authOptions)

  if (!session || session.user.role !== "DOCTOR") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    // Get doctor data
    const doctor = await prisma.doctor.findFirst({
      where: {
        userId: session.user.id,
      },
      include: {
        user: {
          select: {
            name: true,
            email: true,
            image: true,
          },
        },
      },
    })

    if (!doctor) {
      return NextResponse.json({ error: "Doctor not found" }, { status: 404 })
    }

    // Get doctor's patients
    const patients = await prisma.patient.findMany({
      where: {
        doctorId: doctor.id,
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
          take: 5,
        },
      },
    })

    // Get upcoming appointments
    const today = new Date()
    const appointments = await prisma.appointment.findMany({
      where: {
        doctorId: doctor.id,
        date: {
          gte: today,
        },
      },
      include: {
        patient: {
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
        date: "asc",
      },
      take: 5,
    })

    // Get recent assessments
    const assessments = await prisma.cognitiveAssessment.findMany({
      where: {
        doctorId: doctor.id,
      },
      include: {
        patient: {
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
      take: 5,
    })

    // Calculate dashboard metrics
    const totalPatients = await prisma.patient.count({
      where: {
        doctorId: doctor.id,
      },
    })

    const highRiskPatients = await prisma.patient.count({
      where: {
        doctorId: doctor.id,
        riskLevel: "high",
      },
    })

    const todayAppointments = await prisma.appointment.count({
      where: {
        doctorId: doctor.id,
        date: {
          equals: new Date(today.setHours(0, 0, 0, 0)),
        },
      },
    })

    // Get average MMSE score
    const avgMmseResult = await prisma.patient.aggregate({
      where: {
        doctorId: doctor.id,
        mmseScore: {
          not: null,
        },
      },
      _avg: {
        mmseScore: true,
      },
    })

    const avgMmseScore = avgMmseResult._avg.mmseScore || 0

    return NextResponse.json({
      doctor: {
        id: doctor.id,
        name: doctor.user.name,
        specialty: doctor.specialty,
        email: doctor.user.email,
        image: doctor.user.image,
      },
      patients: patients.map((patient) => ({
        id: patient.id,
        name: patient.user.name,
        age: patient.age,
        diagnosis: patient.diagnosis,
        mmseScore: patient.mmseScore,
        riskLevel: patient.riskLevel,
        status: patient.status,
        cognitiveScores: patient.cognitiveScores.map((score) => ({
          date: score.date,
          score: score.score,
        })),
      })),
      appointments: appointments.map((apt) => ({
        id: apt.id,
        patientName: apt.patient.user.name,
        date: apt.date,
        time: apt.time,
        type: apt.type,
        status: apt.status,
      })),
      assessments: assessments.map((assessment) => ({
        id: assessment.id,
        patientName: assessment.patient.user.name,
        date: assessment.date,
        mmseScore: assessment.mmseScore,
      })),
      metrics: {
        totalPatients,
        highRiskPatients,
        todayAppointments,
        avgMmseScore,
      },
    })
  } catch (error) {
    console.error("Error fetching doctor dashboard data:", error)
    return NextResponse.json({ error: "Failed to fetch dashboard data" }, { status: 500 })
  }
}

