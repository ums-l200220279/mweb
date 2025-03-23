import { type NextRequest, NextResponse } from "next/server"
import { AuditLogger, AuditAction, AuditResource } from "./audit-logger"

export async function gdprMiddleware(req: NextRequest) {
  // Check if the request is for a route that requires GDPR compliance
  const path = req.nextUrl.pathname

  // Skip for static assets and non-GDPR routes
  if (path.startsWith("/_next") || path.startsWith("/static") || path.startsWith("/api/health")) {
    return NextResponse.next()
  }

  // Add GDPR-required headers
  const response = NextResponse.next()

  // Set strict privacy headers
  response.headers.set("Strict-Transport-Security", "max-age=63072000; includeSubDomains; preload")
  response.headers.set("X-Content-Type-Options", "nosniff")
  response.headers.set("X-Frame-Options", "DENY")
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin")
  response.headers.set("Permissions-Policy", "camera=(), microphone=(), geolocation=()")

  // Check if user has consented to cookies
  const cookieConsent = req.cookies.get("cookie_consent")

  // If accessing a protected route and no consent, redirect to consent page
  if (
    !cookieConsent?.value &&
    !path.startsWith("/api") &&
    !path.startsWith("/consent") &&
    !path.startsWith("/privacy") &&
    !path.startsWith("/legal")
  ) {
    // Log the redirect for audit purposes
    await AuditLogger.log({
      action: AuditAction.ACCESS_DENIED,
      resource: AuditResource.USER,
      description: "User redirected to consent page due to missing cookie consent",
      userIp: req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip") || "unknown",
      userAgent: req.headers.get("user-agent") || "unknown",
    })

    // Store the original URL to redirect back after consent
    const redirectUrl = new URL("/consent", req.url)
    redirectUrl.searchParams.set("returnUrl", req.nextUrl.pathname + req.nextUrl.search)

    return NextResponse.redirect(redirectUrl)
  }

  return response
}

