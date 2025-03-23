import { prisma } from "@/lib/db"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"

export enum AuditAction {
  CREATE = "CREATE",
  READ = "READ",
  UPDATE = "UPDATE",
  DELETE = "DELETE",
  LOGIN = "LOGIN",
  LOGOUT = "LOGOUT",
  EXPORT = "EXPORT",
  IMPORT = "IMPORT",
  CONSENT = "CONSENT",
  ACCESS_DENIED = "ACCESS_DENIED",
}

export enum AuditResource {
  USER = "USER",
  PROFILE = "PROFILE",
  GAME = "GAME",
  GAME_SESSION = "GAME_SESSION",
  GAME_RESULT = "GAME_RESULT",
  HEALTH_DATA = "HEALTH_DATA",
  SETTINGS = "SETTINGS",
  PAYMENT = "PAYMENT",
  SUBSCRIPTION = "SUBSCRIPTION",
}

type AuditLogData = {
  action: AuditAction
  resource: AuditResource
  resourceId?: string
  description: string
  metadata?: Record<string, any>
  userId?: string
  userIp?: string
  userAgent?: string
}

export class AuditLogger {
  static async log(data: AuditLogData, req?: Request): Promise<void> {
    try {
      // Get user information from session if not provided
      let userId = data.userId
      if (!userId && req) {
        const session = await getServerSession(authOptions)
        userId = session?.user?.id
      }

      // Get IP and user agent from request if not provided
      let userIp = data.userIp
      let userAgent = data.userAgent

      if (req) {
        if (!userIp) {
          userIp = req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip") || "unknown"
        }

        if (!userAgent) {
          userAgent = req.headers.get("user-agent") || "unknown"
        }
      }

      // Sanitize metadata to remove sensitive information
      const sanitizedMetadata = data.metadata ? sanitizeMetadata(data.metadata) : undefined

      // Create audit log entry
      await prisma.auditLog.create({
        data: {
          action: data.action,
          resource: data.resource,
          resourceId: data.resourceId,
          description: data.description,
          metadata: sanitizedMetadata ? JSON.stringify(sanitizedMetadata) : null,
          userId,
          userIp,
          userAgent,
          timestamp: new Date(),
        },
      })
    } catch (error) {
      console.error("Failed to create audit log:", error)

      // Fallback to file-based logging if database logging fails
      try {
        await logToFile({
          ...data,
          error: error instanceof Error ? error.message : String(error),
          timestamp: new Date().toISOString(),
        })
      } catch (fileError) {
        console.error("Failed to write audit log to file:", fileError)
      }
    }
  }
}

// Helper function to sanitize metadata and remove sensitive information
function sanitizeMetadata(metadata: Record<string, any>): Record<string, any> {
  const sensitiveFields = [
    "password",
    "token",
    "secret",
    "credit_card",
    "card_number",
    "cvv",
    "ssn",
    "social_security",
    "dob",
    "birth_date",
    "address",
  ]

  const sanitized = { ...metadata }

  for (const key of Object.keys(sanitized)) {
    const lowerKey = key.toLowerCase()

    // Check if the key contains any sensitive field name
    if (sensitiveFields.some((field) => lowerKey.includes(field))) {
      sanitized[key] = "[REDACTED]"
    } else if (typeof sanitized[key] === "object" && sanitized[key] !== null) {
      // Recursively sanitize nested objects
      sanitized[key] = sanitizeMetadata(sanitized[key])
    }
  }

  return sanitized
}

// Fallback logging to file if database logging fails
async function logToFile(logData: any): Promise<void> {
  const fs = require("fs").promises
  const path = require("path")

  const logDir = process.env.AUDIT_LOG_DIR || path.join(process.cwd(), "logs", "audit")
  const logFile = path.join(logDir, `audit-${new Date().toISOString().split("T")[0]}.log`)

  // Ensure log directory exists
  await fs.mkdir(logDir, { recursive: true })

  // Append log entry to file
  await fs.appendFile(logFile, `${JSON.stringify(logData)}\n`, "utf-8")
}

