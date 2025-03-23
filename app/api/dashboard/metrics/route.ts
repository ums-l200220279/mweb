import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import prisma from "@/lib/db-client"

export async function GET() {
  const session = await getServerSession(authOptions)

  if (!session) {
    return new NextResponse(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    })
  }

  try {
    // Get total patients count
    const totalPatients = await prisma.patient.count()

    // Get active patients count
    const activePatients = await prisma.patient.count({
      where: { status: "active" },
    })

    // Get high risk patients count
    const highRiskPatients = await prisma.patient.count({
      where: { riskLevel: "high" },
    })

    // Get today's appointments
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)

    const appointmentsToday = await prisma.appointment.count({
      where: {
        date: {
          gte: today,
          lt: tomorrow,
        },
      },
    })

    // Get average MMSE score
    const patients = await prisma.patient.findMany({
      select: { mmseScore: true },
    })

    const totalMmseScore = patients.reduce((sum, patient) => {
      return sum + (patient.mmseScore || 0)
    }, 0)

    const averageMmseScore = totalPatients > 0 ? totalMmseScore / totalPatients : 0

    // Get pending assessments count
    const pendingAssessments = await prisma.appointment.count({
      where: {
        type: "cognitive assessment",
        status: "pending",
      },
    })

    return NextResponse.json({
      totalPatients,
      activePatients,
      highRiskPatients,
      appointmentsToday,
      averageMmseScore,
      pendingAssessments,
    })
  } catch (error) {
    console.error("Error fetching dashboard metrics:", error)
    return new NextResponse(JSON.stringify({ error: "Internal Server Error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    })
  }
}

