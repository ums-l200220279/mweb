import { ResilientApiClient } from "@/lib/api/resilient-client"

export enum LogLevel {
  DEBUG = "debug",
  INFO = "info",
  WARN = "warn",
  ERROR = "error",
  FATAL = "fatal",
}

export type LogContext = Record<string, any>

export type LogEntry = {
  level: LogLevel
  message: string
  timestamp: string
  context?: LogContext
}

export class Logger {
  private apiClient: ResilientApiClient
  private serviceName: string
  private defaultContext: LogContext
  private consoleLogging: boolean
  private minLevel: LogLevel
  private batchQueue: LogEntry[] = []
  private batchTimer: NodeJS.Timeout | null = null
  private batchSize: number
  private batchInterval: number

  constructor(
    serviceName: string,
    endpoint: string = process.env.LOG_ENDPOINT || "",
    apiKey: string = process.env.LOG_API_KEY || "",
    options: {
      consoleLogging?: boolean
      minLevel?: LogLevel
      defaultContext?: LogContext
      batchSize?: number
      batchInterval?: number
    } = {},
  ) {
    this.serviceName = serviceName
    this.apiClient = new ResilientApiClient(endpoint)
    this.apiClient.setDefaultHeaders({
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    })

    this.consoleLogging = options.consoleLogging ?? process.env.LOG_TO_CONSOLE === "true"
    this.minLevel = options.minLevel ?? (process.env.LOG_LEVEL as LogLevel) ?? LogLevel.INFO
    this.defaultContext = options.defaultContext ?? {}
    this.batchSize = options.batchSize ?? 100
    this.batchInterval = options.batchInterval ?? 5000 // 5 seconds
  }

  /**
   * Log a message at the DEBUG level
   */
  debug(message: string, context: LogContext = {}): void {
    this.log(LogLevel.DEBUG, message, context)
  }

  /**
   * Log a message at the INFO level
   */
  info(message: string, context: LogContext = {}): void {
    this.log(LogLevel.INFO, message, context)
  }

  /**
   * Log a message at the WARN level
   */
  warn(message: string, context: LogContext = {}): void {
    this.log(LogLevel.WARN, message, context)
  }

  /**
   * Log a message at the ERROR level
   */
  error(message: string, context: LogContext = {}): void {
    this.log(LogLevel.ERROR, message, context)
  }

  /**
   * Log a message at the FATAL level
   */
  fatal(message: string, context: LogContext = {}): void {
    this.log(LogLevel.FATAL, message, context)
  }

  /**
   * Log a message at the specified level
   */
  private log(level: LogLevel, message: string, context: LogContext = {}): void {
    // Skip if level is below minimum level
    if (!this.shouldLog(level)) {
      return
    }

    const timestamp = new Date().toISOString()
    const entry: LogEntry = {
      level,
      message,
      timestamp,
      context: { ...this.defaultContext, ...context, service: this.serviceName },
    }

    // Log to console if enabled
    if (this.consoleLogging) {
      this.logToConsole(entry)
    }

    // Add to batch queue
    this.batchQueue.push(entry)

    // Send batch if queue is full
    if (this.batchQueue.length >= this.batchSize) {
      this.sendBatch()
    }

    // Start batch timer if not already running
    if (!this.batchTimer) {
      this.batchTimer = setTimeout(() => this.sendBatch(), this.batchInterval)
    }
  }

  /**
   * Check if a log level should be logged
   */
  private shouldLog(level: LogLevel): boolean {
    const levels = [LogLevel.DEBUG, LogLevel.INFO, LogLevel.WARN, LogLevel.ERROR, LogLevel.FATAL]
    const minLevelIndex = levels.indexOf(this.minLevel)
    const levelIndex = levels.indexOf(level)

    return levelIndex >= minLevelIndex
  }

  /**
   * Log an entry to the console
   */
  private logToConsole(entry: LogEntry): void {
    const { level, message, timestamp, context } = entry

    // Format the log message
    const formattedMessage = `[${timestamp}] [${level.toUpperCase()}] ${message}`

    // Log with appropriate console method
    switch (level) {
      case LogLevel.DEBUG:
        console.debug(formattedMessage, context)
        break
      case LogLevel.INFO:
        console.info(formattedMessage, context)
        break
      case LogLevel.WARN:
        console.warn(formattedMessage, context)
        break
      case LogLevel.ERROR:
      case LogLevel.FATAL:
        console.error(formattedMessage, context)
        break
    }
  }

  /**
   * Send a batch of log entries
   */
  private async sendBatch(): Promise<void> {
    // Clear the batch timer
    if (this.batchTimer) {
      clearTimeout(this.batchTimer)
      this.batchTimer = null
    }

    // If queue is empty, do nothing
    if (this.batchQueue.length === 0) {
      return
    }

    // Get the current batch
    const batch = [...this.batchQueue]
    this.batchQueue = []

    try {
      // Send the batch to the logging service
      await this.apiClient.post("/logs/batch", { logs: batch })
    } catch (error) {
      console.error("Failed to send log batch:", error)

      // Put the batch back in the queue
      this.batchQueue = [...batch, ...this.batchQueue]

      // Limit queue size to prevent memory issues
      if (this.batchQueue.length > this.batchSize * 10) {
        console.warn(`Log queue is too large (${this.batchQueue.length} items). Dropping oldest items.`)
        this.batchQueue = this.batchQueue.slice(-this.batchSize * 10)
      }
    }

    // Restart the batch timer if there are items in the queue
    if (this.batchQueue.length > 0) {
      this.batchTimer = setTimeout(() => this.sendBatch(), this.batchInterval)
    }
  }

  /**
   * Flush all pending log entries
   */
  async flush(): Promise<void> {
    await this.sendBatch()
  }
}

// Create a default logger
export const logger = new Logger("memoright-app")

// Create loggers for specific components
export const apiLogger = new Logger("memoright-api")
export const dbLogger = new Logger("memoright-db")
export const authLogger = new Logger("memoright-auth")
export const gameLogger = new Logger("memoright-game")

