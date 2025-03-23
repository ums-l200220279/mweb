"use client"

import { useEffect } from "react"

import { useState } from "react"

/**
 * Authentication and Authorization Middleware
 *
 * This module implements middleware for handling authentication and authorization.
 * It provides role-based access control and JWT validation.
 */

import { type NextRequest, NextResponse } from "next/server"
import { logger } from "@/lib/monitoring/logger"
import { metrics } from "@/lib/observability/metrics"
import { tracer } from "@/lib/observability/tracing"

// Define user roles
export enum UserRole {
  GUEST = "guest",
  USER = "user",
  ADMIN = "admin",
  SUPER_ADMIN = "super_admin",
}

// Role hierarchy
const roleHierarchy: Record<UserRole, number> = {
  [UserRole.GUEST]: 0,
  [UserRole.USER]: 1,
  [UserRole.ADMIN]: 2,
  [UserRole.SUPER_ADMIN]: 3,
}

// JWT payload interface
export interface JwtPayload {
  sub: string
  email: string
  name?: string
  roles: UserRole[]
  permissions?: string[]
  exp: number
  iat: number
  jti: string
}

// Authentication options
export interface AuthOptions {
  requiredRoles?: UserRole[]
  requiredPermissions?: string[]
  allowGuest?: boolean
}

// Verify JWT token
async function verifyToken(token: string): Promise<JwtPayload | null> {
  return tracer.withSpan("verifyToken", async (span) => {
    try {
      // In a real implementation, this would verify the JWT signature
      // and decode the payload

      // For demonstration purposes, we'll simulate token verification
      if (!token || token === "invalid") {
        span.setTag("auth.valid", false)
        return null
      }

      // Simulate decoding a valid token
      const payload: JwtPayload = {
        sub: "123456",
        email: "user@example.com",
        name: "Test User",
        roles: [UserRole.USER],
        permissions: ["read:patients", "write:patients"],
        exp: Math.floor(Date.now() / 1000) + 3600,
        iat: Math.floor(Date.now() / 1000),
        jti: crypto.randomUUID(),
      }

      span.setTag("auth.valid", true)
      span.setTag("auth.user_id", payload.sub)

      return payload
    } catch (error) {
      span.setStatus("error", error as Error)
      logger.error("Error verifying token", error)
      return null
    }
  })
}

// Check if user has required roles
function hasRequiredRoles(userRoles: UserRole[], requiredRoles: UserRole[]): boolean {
  if (!requiredRoles.length) return true

  // Get the highest role level the user has
  const userHighestRoleLevel = Math.max(...userRoles.map((role) => roleHierarchy[role]))

  // Check if the user's highest role level is sufficient for any of the required roles
  return requiredRoles.some((role) => roleHierarchy[role] <= userHighestRoleLevel)
}

// Check if user has required permissions
function hasRequiredPermissions(userPermissions: string[] = [], requiredPermissions: string[] = []): boolean {
  if (!requiredPermissions.length) return true

  return requiredPermissions.every((permission) => userPermissions.includes(permission))
}

// Authentication middleware
export async function authMiddleware(
  req: NextRequest,
  options: AuthOptions = {},
): Promise<{ user: JwtPayload | null; isAuthenticated: boolean; isAuthorized: boolean }> {
  return tracer.withSpan("authMiddleware", async (span) => {
    const startTime = performance.now()

    try {
      // Extract token from Authorization header
      const authHeader = req.headers.get("authorization")
      const token = authHeader?.startsWith("Bearer ") ? authHeader.substring(7) : null

      span.setTag("auth.token_present", !!token)

      // Verify token
      const user = token ? await verifyToken(token) : null
      const isAuthenticated = !!user

      span.setTag("auth.authenticated", isAuthenticated)

      // Check authorization if authenticated
      let isAuthorized = false

      if (isAuthenticated && user) {
        // Check roles
        const hasRoles = hasRequiredRoles(user.roles, options.requiredRoles || [])

        // Check permissions
        const hasPermissions = hasRequiredPermissions(user.permissions, options.requiredPermissions || [])

        isAuthorized = hasRoles && hasPermissions

        span.setTag("auth.authorized", isAuthorized)
        span.setTag("auth.has_required_roles", hasRoles)
        span.setTag("auth.has_required_permissions", hasPermissions)
      } else if (options.allowGuest) {
        // Allow guest access if specified
        isAuthorized = true
        span.setTag("auth.guest_allowed", true)
      }

      // Record metrics
      const duration = performance.now() - startTime

      metrics
        .createHistogram({
          name: "auth_middleware_duration_seconds",
          help: "Duration of authentication middleware in seconds",
          labelNames: ["authenticated", "authorized"],
        })
        .observe(duration / 1000, {
          authenticated: String(isAuthenticated),
          authorized: String(isAuthorized),
        })

      metrics
        .createCounter({
          name: "auth_requests_total",
          help: "Total number of authentication requests",
          labelNames: ["authenticated", "authorized"],
        })
        .inc(1, {
          authenticated: String(isAuthenticated),
          authorized: String(isAuthorized),
        })

      return { user, isAuthenticated, isAuthorized }
    } catch (error) {
      span.setStatus("error", error as Error)
      logger.error("Error in auth middleware", error)

      // Record error metrics
      metrics
        .createCounter({
          name: "auth_errors_total",
          help: "Total number of authentication errors",
          labelNames: ["error_type"],
        })
        .inc(1, {
          error_type: (error as Error).name || "unknown",
        })

      return { user: null, isAuthenticated: false, isAuthorized: false }
    }
  })
}

// Route handler wrapper for protected routes
export function withAuth(
  handler: (req: NextRequest, user: JwtPayload) => Promise<Response> | Response,
  options: AuthOptions = {},
) {
  return async (req: NextRequest) => {
    const { user, isAuthenticated, isAuthorized } = await authMiddleware(req, options)

    if (!isAuthenticated) {
      return NextResponse.json({ error: "Unauthorized", message: "Authentication required" }, { status: 401 })
    }

    if (!isAuthorized) {
      return NextResponse.json({ error: "Forbidden", message: "Insufficient permissions" }, { status: 403 })
    }

    return handler(req, user!)
  }
}

// React hook for client-side auth
export function useAuth() {
  const [user, setUser] = useState<JwtPayload | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    const checkAuth = async () => {
      try {
        // In a real implementation, this would call an API endpoint
        // to validate the token and get the user info

        // For demonstration purposes, we'll simulate authentication
        const token = localStorage.getItem("auth_token")

        if (token) {
          const payload = await verifyToken(token)
          setUser(payload)
        } else {
          setUser(null)
        }

        setLoading(false)
      } catch (err) {
        setError(err as Error)
        setUser(null)
        setLoading(false)
      }
    }

    checkAuth()
  }, [])

  const login = async (email: string, password: string) => {
    // In a real implementation, this would call an API endpoint
    // to authenticate the user and get a token

    // For demonstration purposes, we'll simulate authentication
    if (email && password) {
      const token = "valid_token"
      localStorage.setItem("auth_token", token)

      const payload = await verifyToken(token)
      setUser(payload)

      return payload
    }

    throw new Error("Invalid credentials")
  }

  const logout = () => {
    localStorage.removeItem("auth_token")
    setUser(null)
  }

  const hasRole = (role: UserRole) => {
    if (!user) return false
    return hasRequiredRoles(user.roles, [role])
  }

  const hasPermission = (permission: string) => {
    if (!user || !user.permissions) return false
    return hasRequiredPermissions(user.permissions, [permission])
  }

  return {
    user,
    loading,
    error,
    login,
    logout,
    isAuthenticated: !!user,
    hasRole,
    hasPermission,
  }
}

