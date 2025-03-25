import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { Redis } from "@upstash/redis"
import { validateCsrfToken } from "@/lib/csrf"
import { cookies } from "next/headers"

// Initialize Redis client for session tracking
const redis = new Redis({
  url: process.env.REDIS_URL || "",
  token: process.env.REDIS_TOKEN || "",
})

// Revoke all sessions except the current one
export async function POST(request: NextRequest) {
  try {
    // Get the current session
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Validate CSRF token
    const csrfCookie = cookies().get("csrf-token")
    const body = await request.json()

    if (!csrfCookie || !validateCsrfToken(csrfCookie.value) || csrfCookie.value !== body.csrfToken) {
      return NextResponse.json({ error: "Invalid CSRF token" }, { status: 403 })
    }

    // Get all sessions for the user
    const sessions = await redis.hgetall(`sessions:${session.user.id}`)

    if (!sessions) {
      return NextResponse.json({
        success: true,
        message: "No sessions to revoke",
      })
    }

    // Keep track of the current session
    const currentSessionToken = session.user.sessionToken

    // Revoke all sessions except the current one
    for (const [token, _] of Object.entries(sessions)) {
      if (token !== currentSessionToken) {
        await redis.hdel(`sessions:${session.user.id}`, token)
      }
    }

    return NextResponse.json({
      success: true,
      message: "All other sessions revoked successfully",
    })
  } catch (error) {
    console.error("Error revoking all sessions:", error)
    return NextResponse.json({ error: "Failed to revoke sessions" }, { status: 500 })
  }
}

