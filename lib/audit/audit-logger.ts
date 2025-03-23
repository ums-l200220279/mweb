import prisma from "@/lib/db-client"
import { RedisCache } from "@/lib/cache/redis-cache"
import { Encryption } from "@/lib/security/encryption"

export type AuditAction =
  | "LOGIN"
  | "LOGOUT"
  | "PASSWORD_CHANGE"
  | "PROFILE_UPDATE"
  | "GAME_SESSION_START"
  | "GAME_SESSION_COMPLETE"
  | "ACHIEVEMENT_EARNED"
  | "DATA_EXPORT"
  | "DATA_DELETE"
  | "ADMIN_ACTION"
  | "API_ACCESS"
  | "SECURITY_EVENT"

export type AuditResource = "USER" | "GAME_SESSION" | "ACHIEVEMENT" | "COGNITIVE_SCORE" | "SYSTEM" | "SECURITY"

interface AuditLogEntry {
  userId: string
  action: AuditAction
  resource: AuditResource
  resourceId?: string
  ipAddress?: string
  userAgent?: string
  details?: any
}

export class AuditLogger {
  private static readonly BATCH_SIZE = 50
  private static readonly BATCH_INTERVAL = 60000 // 1 minute
  private static readonly CACHE_KEY = "audit:batch"

  private static batchTimer: NodeJS.Timeout | null = null

  /**
   * Log an audit event
   * @param entry The audit log entry
   */
  static async log(entry: AuditLogEntry): Promise<void> {
    try {
      // Add timestamp
      const logEntry = {
        ...entry,
        timestamp: new Date(),
      }

      // Encrypt sensitive details if present
      if (logEntry.details) {
        logEntry.details = Encryption.encrypt(JSON.stringify(logEntry.details))
      }

      // Add to batch
      await this.addToBatch(logEntry)

      // Start batch timer if not already running
      if (!this.batchTimer) {
        this.batchTimer = setTimeout(() => this.flushBatch(), this.BATCH_INTERVAL)
      }
    } catch (error) {
      console.error("Error logging audit event:", error)

      // If batching fails, try to log directly
      try {
        await prisma.auditLog.create({
          data: {
            userId: entry.userId,
            action: entry.action,
            resource: entry.resource,
            resourceId: entry.resourceId,
            ipAddress: entry.ipAddress,
            userAgent: entry.userAgent,
            details: entry.details ? Encryption.encrypt(JSON.stringify(entry.details)) : null,
            timestamp: new Date(),
          },
        })
      } catch (directError) {
        console.error("Failed to log audit event directly:", directError)
      }
    }
  }

  /**
   * Add an entry to the batch
   * @param entry The entry to add
   */
  private static async addToBatch(entry: any): Promise<void> {
    // Get current batch
    const batch = (await RedisCache.get<any[]>(this.CACHE_KEY)) || []

    // Add entry to batch
    batch.push(entry)

    // Save updated batch
    await RedisCache.set(this.CACHE_KEY, batch)

    // If batch is full, flush it
    if (batch.length >= this.BATCH_SIZE) {
      await this.flushBatch()
    }
  }

  /**
   * Flush the batch to the database
   */
  private static async flushBatch(): Promise<void> {
    try {
      // Clear the timer
      if (this.batchTimer) {
        clearTimeout(this.batchTimer)
        this.batchTimer = null
      }

      // Get current batch
      const batch = (await RedisCache.get<any[]>(this.CACHE_KEY)) || []

      // If batch is empty, nothing to do
      if (batch.length === 0) {
        return
      }

      // Clear the batch
      await RedisCache.delete(this.CACHE_KEY)

      // Insert all entries
      await prisma.auditLog.createMany({
        data: batch,
      })
    } catch (error) {
      console.error("Error flushing audit log batch:", error)

      // If batch flush fails, try to log entries individually
      try {
        const batch = (await RedisCache.get<any[]>(this.CACHE_KEY)) || []

        for (const entry of batch) {
          await prisma.auditLog.create({
            data: entry,
          })
        }

        // Clear the batch
        await RedisCache.delete(this.CACHE_KEY)
      } catch (individualError) {
        console.error("Failed to log individual audit entries:", individualError)
      }
    }
  }

  /**
   * Get audit logs for a user
   * @param userId The user ID
   * @param limit The maximum number of logs to return
   * @param offset The offset for pagination
   * @returns The audit logs
   */
  static async getUserLogs(userId: string, limit = 50, offset = 0): Promise<any[]> {
    const logs = await prisma.auditLog.findMany({
      where: { userId },
      orderBy: { timestamp: "desc" },
      take: limit,
      skip: offset,
    })

    // Decrypt details
    return logs.map((log) => ({
      ...log,
      details: log.details ? JSON.parse(Encryption.decrypt(log.details as string)) : null,
    }))
  }

  /**
   * Get security audit logs
   * @param limit The maximum number of logs to return
   * @param offset The offset for pagination
   * @returns The security audit logs
   */
  static async getSecurityLogs(limit = 50, offset = 0): Promise<any[]> {
    const logs = await prisma.auditLog.findMany({
      where: {
        OR: [
          { resource: "SECURITY" },
          { action: "SECURITY_EVENT" },
          { action: "LOGIN" },
          { action: "LOGOUT" },
          { action: "PASSWORD_CHANGE" },
        ],
      },
      orderBy: { timestamp: "desc" },
      take: limit,
      skip: offset,
    })

    // Decrypt details
    return logs.map((log) => ({
      ...log,
      details: log.details ? JSON.parse(Encryption.decrypt(log.details as string)) : null,
    }))
  }
}

