import { type NextRequest, NextResponse } from "next/server"
import { getToken } from "next-auth/jwt"
import { RateLimiter } from "@/lib/security/rate-limiter"
import { locales, defaultLocale } from "./lib/i18n/config"

// Define protected routes that require authentication
const protectedRoutes = ["/dashboard", "/patients", "/analytics", "/settings", "/games", "/mmse-test"]

// Define routes that require specific roles
const doctorRoutes = ["/patients", "/analytics"]

const adminRoutes = ["/settings/users", "/settings/system"]

export async function middleware(req: NextRequest) {
  const pathname = req.nextUrl.pathname

  // Check if the pathname already has a locale
  const pathnameHasLocale = locales.some((locale) => pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`)

  if (!pathnameHasLocale) {
    // Get locale from accept-language header or cookie
    const acceptLanguage = req.headers.get("accept-language")
    let locale = defaultLocale

    if (acceptLanguage) {
      const preferredLocale = acceptLanguage
        .split(",")
        .map((lang) => lang.split(";")[0].trim())
        .find((lang) => locales.includes(lang.substring(0, 2) as any))

      if (preferredLocale) {
        locale = preferredLocale.substring(0, 2) as any
      }
    }

    // Redirect to the locale-prefixed path
    return NextResponse.redirect(new URL(`/${locale}${pathname.startsWith("/") ? pathname : `/${pathname}`}`, req.url))
  }

  const path = req.nextUrl.pathname

  // Public paths that don't require authentication
  const publicPaths = ["/", "/auth/login", "/auth/register", "/auth/forgot-password", "/api/auth", "/api/healthcheck"]

  // Check if the path is public
  const isPublicPath = publicPaths.some((publicPath) => path === publicPath || path.startsWith(`${publicPath}/`))

  // Static files and public paths don't need authentication
  if (
    path.includes(".") || // Static files
    isPublicPath
  ) {
    // Add security headers to all responses
    const response = NextResponse.next()

    // Set security headers
    response.headers.set("X-Content-Type-Options", "nosniff")
    response.headers.set("X-Frame-Options", "DENY")
    response.headers.set("X-XSS-Protection", "1; mode=block")
    response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin")
    response.headers.set(
      "Content-Security-Policy",
      "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://vercel.live; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob: https://*; font-src 'self' data:; connect-src 'self' https://* wss://*;",
    )

    return response
  }

  // Get the token
  const token = await getToken({ req })

  // If no token and not on a public path, redirect to login
  if (!token && !isPublicPath) {
    const url = new URL("/auth/login", req.url)
    url.searchParams.set("callbackUrl", encodeURI(req.url))
    return NextResponse.redirect(url)
  }

  // Apply rate limiting to API routes
  if (path.startsWith("/api/")) {
    // Skip rate limiting for authentication endpoints
    if (path.startsWith("/api/auth/")) {
      // Add security headers to all responses
      const response = NextResponse.next()

      // Set security headers
      response.headers.set("X-Content-Type-Options", "nosniff")
      response.headers.set("X-Frame-Options", "DENY")
      response.headers.set("X-XSS-Protection", "1; mode=block")
      response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin")
      response.headers.set(
        "Content-Security-Policy",
        "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://vercel.live; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob: https://*; font-src 'self' data:; connect-src 'self' https://* wss://*;",
      )

      return response
    }

    // Get user ID from token or IP for rate limiting
    const userId = token?.sub || req.ip || "anonymous"

    // Create rate limiter with different limits based on path
    let rateLimiter: RateLimiter

    if (path.includes("/api/games/")) {
      // Game API has higher limits
      rateLimiter = new RateLimiter("game_api", 60, 60) // 60 requests per minute
    } else {
      // Default API rate limit
      rateLimiter = new RateLimiter("general_api", 30, 60) // 30 requests per minute
    }

    // Check if rate limited
    const rateLimited = await rateLimiter.isRateLimited(userId)

    if (rateLimited) {
      return new NextResponse(
        JSON.stringify({
          success: false,
          message: "Rate limit exceeded. Please try again later.",
        }),
        {
          status: 429,
          headers: {
            "Content-Type": "application/json",
            "Retry-After": "60",
          },
        },
      )
    }
  }

  // Check for role-based access to admin routes
  if (path.startsWith("/admin") || path.startsWith("/api/admin")) {
    // Get user roles from token
    const roles = (token?.roles as string[]) || []

    // Check if user has admin role
    if (!roles.includes("admin")) {
      // If API route, return 403 Forbidden
      if (path.startsWith("/api/")) {
        return new NextResponse(
          JSON.stringify({
            success: false,
            message: "Access denied. Insufficient permissions.",
          }),
          {
            status: 403,
            headers: {
              "Content-Type": "application/json",
            },
          },
        )
      }

      // For non-API routes, redirect to unauthorized page
      return NextResponse.redirect(new URL("/unauthorized", req.url))
    }
  }

  // Check for role-based access to researcher routes
  if (path.startsWith("/research") || path.startsWith("/api/research")) {
    // Get user roles from token
    const roles = (token?.roles as string[]) || []

    // Check if user has researcher role
    if (!roles.includes("researcher")) {
      // If API route, return 403 Forbidden
      if (path.startsWith("/api/")) {
        return new NextResponse(
          JSON.stringify({
            success: false,
            message: "Access denied. Insufficient permissions.",
          }),
          {
            status: 403,
            headers: {
              "Content-Type": "application/json",
            },
          },
        )
      }

      // For non-API routes, redirect to unauthorized page
      return NextResponse.redirect(new URL("/unauthorized", req.url))
    }
  }

  // Check if the route is protected
  const isProtectedRoute = protectedRoutes.some((route) => pathname.startsWith(route))

  if (isProtectedRoute) {
    // Get the user's session token
    const token = await getToken({
      req: req,
      secret: process.env.NEXTAUTH_SECRET,
    })

    // If the user is not authenticated, redirect to the login page
    if (!token) {
      const url = new URL("/auth/login", req.url)
      url.searchParams.set("callbackUrl", encodeURI(pathname))
      return NextResponse.redirect(url)
    }

    // Check role-based access
    const userRole = token.role as string

    // Check if the route requires doctor role
    const isDoctorRoute = doctorRoutes.some((route) => pathname.startsWith(route))

    if (isDoctorRoute && userRole !== "doctor" && userRole !== "admin") {
      return NextResponse.redirect(new URL("/unauthorized", req.url))
    }

    // Check if the route requires admin role
    const isAdminRoute = adminRoutes.some((route) => pathname.startsWith(route))

    if (isAdminRoute && userRole !== "admin") {
      return NextResponse.redirect(new URL("/unauthorized", req.url))
    }
  }

  // Add security headers to all responses
  const response = NextResponse.next()

  // Set security headers
  response.headers.set("X-Content-Type-Options", "nosniff")
  response.headers.set("X-Frame-Options", "DENY")
  response.headers.set("X-XSS-Protection", "1; mode=block")
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin")
  response.headers.set(
    "Content-Security-Policy",
    "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://vercel.live; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob: https://*; font-src 'self' data:; connect-src 'self' https://* wss://*;",
  )

  // Continue with the request
  return response
}

// Configure which paths the middleware should run on
export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    "/((?!_next/static|_next/image|favicon.ico|public/|api/public/).*)",
  ],
}

