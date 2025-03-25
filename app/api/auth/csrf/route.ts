import { type NextRequest, NextResponse } from "next/server"
import { generateCsrfToken } from "@/lib/csrf"
import { cookies } from "next/headers"

export async function GET(request: NextRequest) {
  const { csrfToken, csrfTokenExpiry } = generateCsrfToken()

  // Set CSRF token in a cookie
  cookies().set({
    name: "csrf-token",
    value: csrfToken,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    expires: new Date(csrfTokenExpiry),
    path: "/",
  })

  return NextResponse.json({ csrfToken })
}

