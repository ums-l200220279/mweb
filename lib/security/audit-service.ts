/**
 * Audit Service untuk Memoright
 *
 * Layanan untuk mencatat dan menganalisis aktivitas pengguna
 * untuk tujuan keamanan dan compliance.
 */

import { Service } from "@/lib/architecture/dependency-injection"
import { logger } from "@/lib/logger"
import { apiClient } from "@/lib/api/fetcher"
import fs from "fs/promises"
import path from "path"

export interface AuditEvent {
  userId: string
  action: string
  resource: string
  resourceId?: string
  details?: Record<string, any>
  ip?: string
  userAgent?: string
  timestamp?: Date
  status?: "success" | "failure"
  reason?: string
}

@Service("auditService")
export class AuditService {
  private initialized = false
  private eventQueue: AuditEvent[] = []
  private flushInterval: NodeJS.Timeout | null = null
  private readonly maxQueueSize: number = 100
  private readonly flushIntervalMs: number = 60 * 1000 // 1 menit
  private readonly auditLogDir: string
  private readonly enableFileLogging: boolean
  private readonly enableApiLogging: boolean

  constructor() {
    this.auditLogDir = process.env.AUDIT_LOG_DIR || "./logs/audit"
    this.enableFileLogging = process.env.ENABLE_AUDIT_FILE_LOGGING === "true"
    this.enableApiLogging = process.env.ENABLE_AUDIT_API_LOGGING === "true"
  }

  /**
   * Inisialisasi service
   */
  public async initialize(): Promise<void> {
    if (this.initialized) {
      return
    }

    try {
      // Buat direktori log jika belum ada
      if (this.enableFileLogging) {
        await fs.mkdir(this.auditLogDir, { recursive: true })
      }

      // Set interval untuk flush events
      this.flushInterval = setInterval(() => {
        this.flushEvents().catch((error) => {
          logger.error("Failed to flush audit events", error instanceof Error ? error : new Error(String(error)))
        })
      }, this.flushIntervalMs)

      this.initialized = true
      logger.info("Audit service initialized")
    } catch (error) {
      logger.error("Failed to initialize audit service", error instanceof Error ? error : new Error(String(error)))
    }
  }

  /**
   * Mencatat event audit
   */
  public async log(event: AuditEvent): Promise<void> {
    if (!this.initialized) {
      await this.initialize()
    }

    // Tambahkan timestamp jika tidak ada
    const eventWithTimestamp = {
      ...event,
      timestamp: event.timestamp || new Date(),
    }

    // Tambahkan ke queue
    this.eventQueue.push(eventWithTimestamp)

    // Flush jika queue terlalu besar
    if (this.eventQueue.length >= this.maxQueueSize) {
      await this.flushEvents()
    }
  }

  /**
   * Flush events ke storage
   */
  private async flushEvents(): Promise<void> {
    if (this.eventQueue.length === 0) {
      return
    }

    const events = [...this.eventQueue]
    this.eventQueue = []

    try {
      // Log ke file jika diaktifkan
      if (this.enableFileLogging) {
        await this.logToFile(events)
      }

      // Log ke API jika diaktifkan
      if (this.enableApiLogging) {
        await this.logToApi(events)
      }
    } catch (error) {
      logger.error("Failed to flush audit events", error instanceof Error ? error : new Error(String(error)))

      // Kembalikan events ke queue jika gagal
      this.eventQueue = [...events, ...this.eventQueue]

      // Batasi ukuran queue
      if (this.eventQueue.length > this.maxQueueSize * 2) {
        this.eventQueue = this.eventQueue.slice(-this.maxQueueSize)
        logger.warn(`Audit event queue truncated to ${this.maxQueueSize} items due to flush failure`)
      }
    }
  }

  /**
   * Log events ke file
   */
  private async logToFile(events: AuditEvent[]): Promise<void> {
    try {
      // Buat nama file berdasarkan tanggal
      const date = new Date().toISOString().split("T")[0]
      const filePath = path.join(this.auditLogDir, `audit-${date}.log`)

      // Format events sebagai JSON lines
      const lines = events.map((event) => JSON.stringify(event)).join("\n") + "\n"

      // Append ke file
      await fs.appendFile(filePath, lines, "utf8")
    } catch (error) {
      logger.error("Failed to log audit events to file", error instanceof Error ? error : new Error(String(error)))
      throw error
    }
  }

  /**
   * Log events ke API
   */
  private async logToApi(events: AuditEvent[]): Promise<void> {
    try {
      await apiClient.post("/api/audit/log", { events })
    } catch (error) {
      logger.error("Failed to log audit events to API", error instanceof Error ? error : new Error(String(error)))
      throw error
    }
  }

  /**
   * Mencari event audit
   */
  public async search(query: {
    userId?: string
    action?: string
    resource?: string
    resourceId?: string
    startDate?: Date
    endDate?: Date
    limit?: number
    offset?: number
  }): Promise<{
    events: AuditEvent[]
    total: number
  }> {
    try {
      return await apiClient.get("/api/audit/search", {
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(query),
      })
    } catch (error) {
      logger.error("Failed to search audit events", error instanceof Error ? error : new Error(String(error)))
      throw error
    }
  }

  /**
   * Membersihkan resources saat service dihentikan
   */
  public dispose(): void {
    if (this.flushInterval) {
      clearInterval(this.flushInterval)
      this.flushInterval = null
    }

    // Flush events yang tersisa
    this.flushEvents().catch((error) => {
      logger.error(
        "Failed to flush audit events during disposal",
        error instanceof Error ? error : new Error(String(error)),
      )
    })

    this.initialized = false
  }
}

