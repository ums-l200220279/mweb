/**
 * Logger Module
 *
 * This file provides logging functionality for the application.
 * It supports multiple log levels and destinations.
 */

type LogLevel = "debug" | "info" | "warn" | "error"

interface LogEntry {
  timestamp: string
  level: LogLevel
  message: string
  context?: Record<string, any>
}

// Get current log level from environment
const getCurrentLogLevel = (): LogLevel => {
  const level = process.env.LOG_LEVEL?.toLowerCase() as LogLevel
  return ["debug", "info", "warn", "error"].includes(level) ? level : "info"
}

// Check if log level is enabled
const isLevelEnabled = (level: LogLevel): boolean => {
  const currentLevel = getCurrentLogLevel()
  const levels: Record<LogLevel, number> = {
    debug: 0,
    info: 1,
    warn: 2,
    error: 3,
  }

  return levels[level] >= levels[currentLevel]
}

// Log to console
const logToConsole = (entry: LogEntry) => {
  if (process.env.LOG_TO_CONSOLE !== "true") return

  const { level, message, context } = entry

  switch (level) {
    case "debug":
      console.debug(message, context)
      break
    case "info":
      console.info(message, context)
      break
    case "warn":
      console.warn(message, context)
      break
    case "error":
      console.error(message, context)
      break
  }
}

// Log to remote endpoint
const logToRemote = async (entry: LogEntry) => {
  const endpoint = process.env.LOG_ENDPOINT
  const apiKey = process.env.LOG_API_KEY

  if (!endpoint || !apiKey) return

  try {
    await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify(entry),
    })
  } catch (error) {
    console.error("Failed to send log to remote endpoint:", error)
  }
}

// Log to file (server-side only)
const logToFile = (entry: LogEntry) => {
  // This would be implemented in a server environment
  // For client-side, this is a no-op
}

// Create log entry
const createLogEntry = (level: LogLevel, message: string, context?: Record<string, any>): LogEntry => {
  return {
    timestamp: new Date().toISOString(),
    level,
    message,
    context,
  }
}

// Log message
const log = (level: LogLevel, message: string, context?: Record<string, any>) => {
  if (!isLevelEnabled(level)) return

  const entry = createLogEntry(level, message, context)

  logToConsole(entry)
  logToRemote(entry)
  logToFile(entry)
}

// Export logger functions
export const logger = {
  debug: (message: string, context?: Record<string, any>) => log("debug", message, context),

  info: (message: string, context?: Record<string, any>) => log("info", message, context),

  warn: (message: string, context?: Record<string, any>) => log("warn", message, context),

  error: (message: string, context?: Record<string, any>) => log("error", message, context),
}

