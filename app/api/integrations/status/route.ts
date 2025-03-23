import { NextResponse } from "next/server"
import { serviceRegistry } from "@/lib/integrations/service-registry"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"

export async function GET(request: Request) {
  try {
    // Check authentication for admin access
    const session = await getServerSession(authOptions)
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    // Get query parameters
    const url = new URL(request.url)
    const serviceId = url.searchParams.get("serviceId")
    const refresh = url.searchParams.get("refresh") === "true"

    if (serviceId) {
      // Get status for a specific service
      const service = serviceRegistry.getService(serviceId)
      if (!service) {
        return NextResponse.json({ error: `Service with ID "${serviceId}" not found` }, { status: 404 })
      }

      if (refresh) {
        // Perform a fresh health check
        const health = await serviceRegistry.checkServiceHealth(serviceId)
        return NextResponse.json(health)
      } else {
        // Return cached health status
        const health = serviceRegistry.getServiceHealth(serviceId)
        return NextResponse.json(health)
      }
    } else {
      // Get status for all services
      if (refresh) {
        // Perform fresh health checks for all services
        const healthStatuses = await serviceRegistry.checkAllServicesHealth()
        return NextResponse.json(healthStatuses)
      } else {
        // Return cached health statuses
        const healthStatuses = serviceRegistry.getAllServiceHealth()
        return NextResponse.json(healthStatuses)
      }
    }
  } catch (error) {
    console.error("Error getting integration status:", error)
    return NextResponse.json({ error: "Failed to get integration status" }, { status: 500 })
  }
}

