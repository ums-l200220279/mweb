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

// Get all active sessions for the current user
export async function GET(request: NextRequest) {
  try {
    // Get the current session
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get all sessions for the user
    const sessions = await redis.hgetall(`sessions:${session.user.id}`)

    if (!sessions) {
      return NextResponse.json({ sessions: [] })
    }

    // Format sessions for display
    const formattedSessions = Object.entries(sessions).map(([token, sessionData]) => {
      const data = JSON.parse(sessionData as string)
      return {
        id: token,
        current: token === session.user.sessionToken,
        ...data,
      }
    })

    return NextResponse.json({ sessions: formattedSessions })
  } catch (error) {
    console.error("Error fetching sessions:", error)
    return NextResponse.json({ error: "Failed to fetch sessions" }, { status: 500 })
  }
}

// Revoke a specific session
export async function DELETE(request: NextRequest) {
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

    // Don't allow revoking the current session
    if (body.sessionId === session.user.sessionToken) {
      return NextResponse.json({ error: "Cannot revoke current session" }, { status: 400 })
    }

    // Revoke the session
    await redis.hdel(`sessions:${session.user.id}`, body.sessionId)

    return NextResponse.json({
      success: true,
      message: "Session revoked successfully",
    })
  } catch (error) {
    console.error("Error revoking session:", error)
    return NextResponse.json({ error: "Failed to revoke session" }, { status: 500 })
  }
}

