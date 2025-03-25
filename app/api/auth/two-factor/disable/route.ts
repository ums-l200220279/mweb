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

    // Get the user's 2FA record
    const twoFactorAuth = await prisma.twoFactorAuth.findUnique({
      where: {
        userId: session.user.id,
      },
    })

    if (!twoFactorAuth) {
      return NextResponse.json({ error: "Two-factor authentication not set up" }, { status: 400 })
    }

    // Verify the token for additional security
    const isValid = authenticator.verify({
      token: body.token,
      secret: twoFactorAuth.secret,
    })

    if (!isValid) {
      return NextResponse.json({ error: "Invalid verification code" }, { status: 400 })
    }

    // Disable 2FA
    await prisma.twoFactorAuth.update({
      where: {
        userId: session.user.id,
      },
      data: {
        enabled: false,
      },
    })

    return NextResponse.json({
      success: true,
      message: "Two-factor authentication disabled successfully",
    })
  } catch (error) {
    console.error("Error disabling 2FA:", error)
    return NextResponse.json({ error: "Failed to disable two-factor authentication" }, { status: 500 })
  }
}

