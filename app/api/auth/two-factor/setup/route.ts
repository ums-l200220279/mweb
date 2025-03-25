import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import prisma from "@/lib/db-client"
import { validateCsrfToken } from "@/lib/csrf"
import { cookies } from "next/headers"
import { authenticator } from "otplib"

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

    // Generate a new secret
    const secret = authenticator.generateSecret()

    // Save the secret to the database
    await prisma.twoFactorAuth.upsert({
      where: {
        userId: session.user.id,
      },
      update: {
        secret,
        // Don't enable yet - user needs to verify first
        enabled: false,
      },
      create: {
        userId: session.user.id,
        secret,
        enabled: false,
      },
    })

    // Generate the TOTP URI for QR code
    const otpauth = authenticator.keyuri(session.user.email || session.user.id, "MemoRight", secret)

    return NextResponse.json({
      secret,
      otpauth,
    })
  } catch (error) {
    console.error("Error setting up 2FA:", error)
    return NextResponse.json({ error: "Failed to set up two-factor authentication" }, { status: 500 })
  }
}

