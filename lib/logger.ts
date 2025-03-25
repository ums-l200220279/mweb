/**
 * Structured logging service
 */

type LogLevel = "debug" | "info" | "warn" | "error"

interface LogEntry {
  level: LogLevel
  message: string
  timestamp: string
  context?: Record<string, any>
}

class Logger {
  private readonly minLevel: LogLevel
  private readonly logToConsole: boolean
  private readonly logToApi: boolean
  private readonly apiEndpoint?: string
  private readonly apiKey?: string

  constructor() {
    this.minLevel = (process.env.LOG_LEVEL as LogLevel) || "info"
    this.logToConsole = process.env.LOG_TO_CONSOLE !== "false"
    this.logToApi = !!process.env.LOG_ENDPOINT
    this.apiEndpoint = process.env.LOG_ENDPOINT
    this.apiKey = process.env.LOG_API_KEY
  }

  private shouldLog(level: LogLevel): boolean {
    const levels: Record<LogLevel, number> = {
      debug: 0,
      info: 1,
      warn: 2,
      error: 3,
    }

    return levels[level] >= levels[this.minLevel]
  }

  private async sendToApi(entry: LogEntry): Promise<void> {
    if (!this.logToApi || !this.apiEndpoint) return

    try {
      await fetch(this.apiEndpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(this.apiKey && { "X-API-Key": this.apiKey }),
        },
        body: JSON.stringify(entry),
      })
    } catch (error) {
      // Fallback to console if API logging fails
      console.error("Failed to send log to API:", error)
    }
  }

  private logToOutput(entry: LogEntry): void {
    if (!this.logToConsole) return

    const { level, message, timestamp, context } = entry

    // Format for better console readability
    const formattedContext = context ? `\n${JSON.stringify(context, null, 2)}` : ""

    switch (level) {
      case "debug":
        console.debug(`[${timestamp}] DEBUG: ${message}${formattedContext}`)
        break
      case "info":
        console.info(`[${timestamp}] INFO: ${message}${formattedContext}`)
        break
      case "warn":
        console.warn(`[${timestamp}] WARN: ${message}${formattedContext}`)
        break
      case "error":
        console.error(`[${timestamp}] ERROR: ${message}${formattedContext}`)
        break
    }
  }

  private async log(level: LogLevel, message: string, context?: Record<string, any>): Promise<void> {
    if (!this.shouldLog(level)) return

    const entry: LogEntry = {
      level,
      message,
      timestamp: new Date().toISOString(),
      ...(context && { context }),
    }

    this.logToOutput(entry)
    await this.sendToApi(entry)
  }

  debug(message: string, context?: Record<string, any>): void {
    this.log("debug", message, context)
  }

  info(message: string, context?: Record<string, any>): void {
    this.log("info", message, context)
  }

  warn(message: string, context?: Record<string, any>): void {
    this.log("warn", message, context)
  }

  error(message: string, context?: Record<string, any>): void {
    this.log("error", message, context)
  }
}

export const logger = new Logger()

