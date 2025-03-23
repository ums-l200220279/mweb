import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import prisma from "@/lib/db-client"

export async function GET() {
  const session = await getServerSession(authOptions)

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    let patients = []

    // Filter patients based on user role
    if (session.user.role === "DOCTOR") {
      const doctor = await prisma.doctor.findFirst({
        where: {
          userId: session.user.id,
        },
      })

      if (!doctor) {
        return NextResponse.json({ error: "Doctor not found" }, { status: 404 })
      }

      patients = await prisma.patient.findMany({
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
    } else if (session.user.role === "CAREGIVER") {
      const caregiver = await prisma.caregiver.findFirst({
        where: {
          userId: session.user.id,
        },
      })

      if (!caregiver) {
        return NextResponse.json({ error: "Caregiver not found" }, { status: 404 })
      }

      patients = await prisma.patient.findMany({
        where: {
          caregiverId: caregiver.id,
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
    } else if (session.user.role === "ADMIN") {
      patients = await prisma.patient.findMany({
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
    } else {
      // For patient role, return only their own data
      const patient = await prisma.patient.findFirst({
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
          cognitiveScores: {
            orderBy: {
              date: "desc",
            },
            take: 5,
          },
        },
      })

      if (patient) {
        patients = [patient]
      }
    }

    return NextResponse.json(
      patients.map((patient) => ({
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
        })),
      })),
    )
  } catch (error) {
    console.error("Error fetching patients:", error)
    return NextResponse.json({ error: "Failed to fetch patients" }, { status: 500 })
  }
}

