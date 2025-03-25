import { type NextRequest, NextResponse } from "next/server"
import { getToken } from "next-auth/jwt"
import { Ratelimit } from "@upstash/ratelimit"
import { Redis } from "@upstash/redis"
import { logger } from "@/lib/logger"
import { AuditService } from "@/lib/audit"
import { PerformanceMonitor } from "@/lib/performance"

// Define public routes that don't require authentication
const publicRoutes = [
  "/",
  "/auth/login",
  "/auth/register",
  "/auth/forgot-password",
  "/auth/reset-password",
  "/auth/verify-email",
  "/about",
  "/pricing",
  "/contact",
  "/terms",
  "/privacy",
  "/faq",
  "/blog",
]

// Define auth routes (redirect authenticated users away from these)
const authRoutes = ["/auth/login", "/auth/register", "/auth/forgot-password", "/auth/reset-password"]

// Define API routes that should be excluded from middleware
const apiRoutes = ["/api/auth", "/api/webhook"]

// Initialize Redis client for rate limiting
const redis = new Redis({
  url: process.env.REDIS_URL || "",
  token: process.env.REDIS_TOKEN || "",
})

// Create a rate limiter that allows 10 requests per minute for auth endpoints
const authRatelimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(10, "1 m"),
  analytics: true,
  prefix: "ratelimit:auth",
})

// Create a rate limiter that allows 100 requests per minute for general API endpoints
const generalRatelimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(100, "1 m"),
  analytics: true,
  prefix: "ratelimit:general",
})

export async function middleware(request: NextRequest) {
  const startTime = performance.now()
  const { pathname } = request.nextUrl

  // Skip middleware for static assets
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/static") ||
    pathname.includes(".") // Skip files with extensions (images, etc.)
  ) {
    return NextResponse.next()
  }

  try {
    // Apply rate limiting for authentication endpoints
    if (pathname.startsWith("/api/auth") || authRoutes.some((route) => pathname === route)) {
      const ip = request.ip ?? "anonymous"
      const { success, limit, reset, remaining } = await authRatelimit.limit(ip)

      if (!success) {
        logger.warn("Rate limit exceeded for auth endpoint", {
          ip,
          pathname,
          limit,
          remaining: 0,
        })

        return new NextResponse("Too Many Requests", {
          status: 429,
          headers: {
            "X-RateLimit-Limit": limit.toString(),
            "X-RateLimit-Remaining": "0",
            "X-RateLimit-Reset": reset.toString(),
            "Retry-After": Math.ceil((reset - Date.now()) / 1000).toString(),
          },
        })
      }
    } else if (pathname.startsWith("/api/")) {
      // Apply general rate limiting for other API endpoints
      const ip = request.ip ?? "anonymous"
      const { success, limit, reset, remaining } = await generalRatelimit.limit(ip)

      if (!success) {
        logger.warn("Rate limit exceeded for API endpoint", {
          ip,
          pathname,
          limit,
          remaining: 0,
        })

        return new NextResponse("Too Many Requests", {
          status: 429,
          headers: {
            "X-RateLimit-Limit": limit.toString(),
            "X-RateLimit-Remaining": "0",
            "X-RateLimit-Reset": reset.toString(),
            "Retry-After": Math.ceil((reset - Date.now()) / 1000).toString(),
          },
        })
      }
    }

    // Get the NextAuth.js token
    const token = await getToken({
      req: request,
      secret: process.env.NEXTAUTH_SECRET,
    })

    const isAuthenticated = !!token
    const isPublicRoute = publicRoutes.some((route) => pathname === route || pathname.startsWith(`${route}/`))
    const isAuthRoute = authRoutes.some((route) => pathname === route || pathname.startsWith(`${route}/`))

    // Case 1: User is not authenticated and trying to access protected route
    if (!isAuthenticated && !isPublicRoute) {
      logger.info("Unauthenticated access attempt to protected route", {
        pathname,
        ip: request.ip,
      })

      const url = new URL("/auth/login", request.url)
      url.searchParams.set("callbackUrl", encodeURI(request.url))
      return NextResponse.redirect(url)
    }

    // Case 2: User is authenticated and trying to access auth routes
    if (isAuthenticated && isAuthRoute) {
      return NextResponse.redirect(new URL("/dashboard", request.url))
    }

    // Case 3: Role-based access control for admin routes
    if (pathname.startsWith("/admin") && token?.role !== "ADMIN") {
      logger.warn("Unauthorized access attempt to admin route", {
        userId: token?.id,
        role: token?.role,
        pathname,
        ip: request.ip,
      })

      await AuditService.log({
        userId: token?.id as string,
        action: "access:denied",
        resource: pathname,
        details: { role: token?.role, requiredRole: "ADMIN" },
        ipAddress: request.ip,
        userAgent: request.headers.get("user-agent") || undefined,
      })

      return NextResponse.redirect(new URL("/dashboard", request.url))
    }

    // Case 4: Role-based access control for instructor routes
    if (pathname.startsWith("/instructor") && token?.role !== "ADMIN" && token?.role !== "INSTRUCTOR") {
      logger.warn("Unauthorized access attempt to instructor route", {
        userId: token?.id,
        role: token?.role,
        pathname,
        ip: request.ip,
      })

      await AuditService.log({
        userId: token?.id as string,
        action: "access:denied",
        resource: pathname,
        details: { role: token?.role, requiredRoles: ["ADMIN", "INSTRUCTOR"] },
        ipAddress: request.ip,
        userAgent: request.headers.get("user-agent") || undefined,
      })

      return NextResponse.redirect(new URL("/dashboard", request.url))
    }

    // Track session for monitoring
    if (isAuthenticated && token.id) {
      try {
        await redis.hset(`sessions:${token.id}`, {
          [token.sessionToken || "unknown"]: JSON.stringify({
            lastActive: Date.now(),
            userAgent: request.headers.get("user-agent") || "unknown",
            ip: request.ip || "unknown",
            path: pathname,
          }),
        })
        // Set expiry for session tracking (30 days)
        await redis.expire(`sessions:${token.id}`, 60 * 60 * 24 * 30)
      } catch (error) {
        // Silent fail - don't block the request if session tracking fails
        logger.error("Session tracking error", {
          error: error instanceof Error ? error.message : String(error),
          userId: token.id,
        })
      }
    }

    // Allow all other requests to proceed
    const response = NextResponse.next()

    // Add security headers
    response.headers.set("X-Content-Type-Options", "nosniff")
    response.headers.set("X-Frame-Options", "DENY")
    response.headers.set("X-XSS-Protection", "1; mode=block")
    response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin")
    response.headers.set("Permissions-Policy", "camera=(), microphone=(), geolocation=()")

    // Record performance metrics
    const endTime = performance.now()
    const duration = Math.round(endTime - startTime)

    if (pathname.startsWith("/api/")) {
      // Record API performance metrics
      PerformanceMonitor.recordMetric({
        endpoint: pathname,
        method: request.method,
        statusCode: 200, // We don't know the actual status code here
        duration,
      }).catch((error) => {
        logger.error("Error recording middleware performance metric", { error })
      })
    }

    return response
  } catch (error) {
    // Log any errors in middleware
    logger.error("Middleware error", {
      error: error instanceof Error ? error.stack : String(error),
      pathname,
      method: request.method,
      ip: request.ip,
    })

    // Return a generic error response
    return new NextResponse("Internal Server Error", { status: 500 })
  }
}

// Configure which routes the middleware should run on
export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * 1. /_next (Next.js internals)
     * 2. /static (static files)
     * 3. /_vercel (Vercel internals)
     * 4. /favicon.ico, /robots.txt (common static files)
     */
    "/((?!_next|_vercel|static|favicon.ico|robots.txt).*)",
  ],
}

