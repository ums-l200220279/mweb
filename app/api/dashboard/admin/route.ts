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

    // Check if user is an admin
    if (session.user.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    // Get all data for admin dashboard
    const patients = await db.getPatients()
    const doctors = await db.getDoctors()
    const caregivers = await db.getCaregivers()
    const appointments = await db.getAppointments()
    const assessments = await db.getAssessments()

    // Calculate system metrics
    const totalUsers = patients.length + doctors.length + caregivers.length
    const activePatients = patients.filter((p) => p.status === "active").length
    const highRiskPatients = patients.filter((p) => p.riskLevel === "high").length

    const today = new Date().toISOString().split("T")[0]
    const appointmentsToday = appointments.filter((a) => a.date === today).length

    const assessmentsThisMonth = assessments.filter((a) => {
      const assessmentDate = new Date(a.date)
      const currentDate = new Date()
      return (
        assessmentDate.getMonth() === currentDate.getMonth() &&
        assessmentDate.getFullYear() === currentDate.getFullYear()
      )
    }).length

    // Return dashboard data
    return NextResponse.json({
      metrics: {
        totalUsers,
        totalPatients: patients.length,
        totalDoctors: doctors.length,
        totalCaregivers: caregivers.length,
        activePatients,
        highRiskPatients,
        appointmentsToday,
        assessmentsThisMonth,
      },
      recentPatients: patients
        .sort((a, b) => new Date(b.lastCheckup).getTime() - new Date(a.lastCheckup).getTime())
        .slice(0, 5),
      upcomingAppointments: appointments
        .filter((a) => new Date(a.date) >= new Date())
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
        .slice(0, 5),
      systemHealth: {
        status: "Operational",
        uptime: "99.9%",
        responseTime: "120ms",
        activeUsers: totalUsers,
        serverLoad: "23%",
        memoryUsage: "42%",
        storageUsage: "38%",
      },
    })
  } catch (error) {
    console.error("Error fetching admin dashboard data:", error)
    return NextResponse.json({ error: "Failed to fetch admin dashboard data" }, { status: 500 })
  }
}

