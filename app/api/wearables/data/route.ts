import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { createWearableService } from "@/lib/wearables/wearable-service"

export async function GET(req: Request) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Parse query parameters
    const url = new URL(req.url)
    const patientId = url.searchParams.get("patientId")
    const dataType = url.searchParams.get("dataType")
    const startDate = url.searchParams.get("startDate")
    const endDate = url.searchParams.get("endDate")
    const deviceType = url.searchParams.get("deviceType")

    // Validate input
    if (!patientId || !dataType || !startDate || !endDate || !deviceType) {
      return NextResponse.json({ error: "Missing required parameters" }, { status: 400 })
    }

    // Check authorization
    const user = session.user
    const isAuthorized = await checkUserAuthorization(user.id, patientId)
    if (!isAuthorized) {
      return NextResponse.json({ error: "Not authorized to access this patient's data" }, { status: 403 })
    }

    // Create wearable service
    const wearableService = createWearableService(deviceType as any)

    // Get data based on type
    let data
    const start = new Date(startDate)
    const end = new Date(endDate)

    switch (dataType) {
      case "sleep":
        data = await wearableService.getSleepData(patientId, start, end)
        break
      case "activity":
        data = await wearableService.getActivityData(patientId, start, end)
        break
      case "vitals":
        data = await wearableService.getVitalSignsData(patientId, start, end)
        break
      case "location":
        data = await wearableService.getLocationData(patientId, start, end)
        break
      default:
        return NextResponse.json({ error: "Invalid data type" }, { status: 400 })
    }

    return NextResponse.json({ data }, { status: 200 })
  } catch (error) {
    console.error("Error fetching wearable data:", error)
    return NextResponse.json({ error: "Failed to fetch wearable data" }, { status: 500 })
  }
}

// Helper function to check if user is authorized to access patient's data
async function checkUserAuthorization(userId: string, patientId: string) {
  // Same implementation as in register route
  // ...
  return true // Placeholder
}

