import prisma from "@/lib/db-client"
import { logger } from "@/lib/logger"

/**
 * Audit logging service for security events
 */
export class AuditService {
  /**
   * Log a security-related event
   */
  static async log(params: {
    userId?: string
    action: string
    resource?: string
    details?: any
    ipAddress?: string
    userAgent?: string
  }): Promise<void> {
    const { userId, action, resource, details, ipAddress, userAgent } = params

    try {
      // Log to database
      await prisma.auditLog.create({
        data: {
          userId,
          action,
          resource,
          details: details ? JSON.stringify(details) : undefined,
          ipAddress,
          userAgent,
        },
      })

      // Also log to application logs
      logger.info(`Audit: ${action}`, {
        userId,
        resource,
        details,
        ipAddress,
        userAgent,
      })
    } catch (error) {
      // Don't let audit logging failures affect the application
      logger.error("Failed to create audit log", {
        error: error instanceof Error ? error.message : String(error),
        params,
      })
    }
  }

  /**
   * Log authentication events
   */
  static async logAuth(params: {
    userId?: string
    action: "login" | "logout" | "login_failed" | "2fa_setup" | "2fa_verify" | "2fa_disable"
    details?: any
    ipAddress?: string
    userAgent?: string
  }): Promise<void> {
    return this.log({
      userId: params.userId,
      action: `auth:${params.action}`,
      resource: "user",
      details: params.details,
      ipAddress: params.ipAddress,
      userAgent: params.userAgent,
    })
  }

  /**
   * Log role change events
   */
  static async logRoleChange(params: {
    adminId: string
    targetUserId: string
    oldRole: string
    newRole: string
    ipAddress?: string
    userAgent?: string
  }): Promise<void> {
    const { adminId, targetUserId, oldRole, newRole, ipAddress, userAgent } = params

    return this.log({
      userId: adminId,
      action: "role:change",
      resource: `user:${targetUserId}`,
      details: { oldRole, newRole },
      ipAddress,
      userAgent,
    })
  }

  /**
   * Log session events
   */
  static async logSession(params: {
    userId: string
    action: "create" | "revoke" | "revoke_all"
    sessionId?: string
    ipAddress?: string
    userAgent?: string
  }): Promise<void> {
    const { userId, action, sessionId, ipAddress, userAgent } = params

    return this.log({
      userId,
      action: `session:${action}`,
      resource: sessionId ? `session:${sessionId}` : "sessions",
      ipAddress,
      userAgent,
    })
  }
}

