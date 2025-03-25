import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import prisma from "@/lib/db-client"
import { validateCsrfToken } from "@/lib/csrf"
import { cookies } from "next/headers"

// Update user role (admin only)
export async function POST(request: NextRequest) {
  try {
    // Get the current session
    const session = await getServerSession(authOptions)

    if (!session?.user?.id || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Validate CSRF token
    const csrfCookie = cookies().get("csrf-token")
    const body = await request.json()

    if (!csrfCookie || !validateCsrfToken(csrfCookie.value) || csrfCookie.value !== body.csrfToken) {
      return NextResponse.json({ error: "Invalid CSRF token" }, { status: 403 })
    }

    const { userId, role } = body

    if (!userId || !role || !["USER", "INSTRUCTOR", "ADMIN"].includes(role)) {
      return NextResponse.json({ error: "Invalid user ID or role" }, { status: 400 })
    }

    // Update user role
    await prisma.user.update({
      where: {
        id: userId,
      },
      data: {
        role,
      },
    })

    return NextResponse.json({
      success: true,
      message: `User role updated to ${role}`,
    })
  } catch (error) {
    console.error("Error updating user role:", error)
    return NextResponse.json({ error: "Failed to update user role" }, { status: 500 })
  }
}

