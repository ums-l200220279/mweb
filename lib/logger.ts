/**
 * Structured logger with support for different log levels and contexts
 */

type LogLevel = "debug" | "info" | "warn" | "error"

interface LogContext {
  [key: string]: any
}

interface LogOptions {
  context?: LogContext
  tags?: string[]
  userId?: string
  sessionId?: string
}

// Environment variables
const LOG_LEVEL = process.env.LOG_LEVEL || "info"
const LOG_TO_CONSOLE = process.env.LOG_TO_CONSOLE !== "false"
const LOG_ENDPOINT = process.env.LOG_ENDPOINT
const LOG_API_KEY = process.env.LOG_API_KEY

// Log level hierarchy for filtering
const LOG_LEVELS: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
}

// Check if the log level should be logged based on the configured level
const shouldLog = (level: LogLevel): boolean => {
  return LOG_LEVELS[level] >= LOG_LEVELS[LOG_LEVEL as LogLevel]
}

// Format the log message with timestamp and level
const formatLogMessage = (level: LogLevel, message: string, options?: LogOptions): any => {
  const timestamp = new Date().toISOString()

  return {
    timestamp,
    level,
    message,
    ...options?.context,
    tags: options?.tags || [],
    userId: options?.userId,
    sessionId: options?.sessionId,
  }
}

// Send log to remote logging service if configured
const sendRemoteLog = async (logData: any): Promise<void> => {
  if (!LOG_ENDPOINT) return

  try {
    await fetch(LOG_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${LOG_API_KEY}`,
      },
      body: JSON.stringify(logData),
    })
  } catch (error) {
    // Don't use the logger here to avoid infinite loops
    console.error("Failed to send log to remote endpoint:", error)
  }
}

// Log to console with appropriate styling
const logToConsole = (level: LogLevel, formattedLog: any): void => {
  if (!LOG_TO_CONSOLE) return

  const { timestamp, message, ...rest } = formattedLog
  const contextStr = Object.keys(rest).length > 0 ? JSON.stringify(rest) : ""

  switch (level) {
    case "debug":
      console.debug(`[${timestamp}] [DEBUG] ${message}`, contextStr)
      break
    case "info":
      console.info(`[${timestamp}] [INFO] ${message}`, contextStr)
      break
    case "warn":
      console.warn(`[${timestamp}] [WARN] ${message}`, contextStr)
      break
    case "error":
      console.error(`[${timestamp}] [ERROR] ${message}`, contextStr)
      break
  }
}

// Main logger functions
export const logger = {
  debug: (message: string, options?: LogOptions): void => {
    if (!shouldLog("debug")) return

    const formattedLog = formatLogMessage("debug", message, options)
    logToConsole("debug", formattedLog)
    sendRemoteLog(formattedLog)
  },

  info: (message: string, options?: LogOptions): void => {
    if (!shouldLog("info")) return

    const formattedLog = formatLogMessage("info", message, options)
    logToConsole("info", formattedLog)
    sendRemoteLog(formattedLog)
  },

  warn: (message: string, options?: LogOptions): void => {
    if (!shouldLog("warn")) return

    const formattedLog = formatLogMessage("warn", message, options)
    logToConsole("warn", formattedLog)
    sendRemoteLog(formattedLog)
  },

  error: (message: string, error?: Error, options?: LogOptions): void => {
    if (!shouldLog("error")) return

    const context = {
      ...(options?.context || {}),
      errorName: error?.name,
      errorMessage: error?.message,
      errorStack: error?.stack,
    }

    const formattedLog = formatLogMessage("error", message, {
      ...options,
      context,
    })

    logToConsole("error", formattedLog)
    sendRemoteLog(formattedLog)
  },

  // Create a child logger with predefined context
  child: (defaultContext: LogContext) => ({
    debug: (message: string, options?: LogOptions) =>
      logger.debug(message, {
        ...options,
        context: { ...defaultContext, ...(options?.context || {}) },
      }),

    info: (message: string, options?: LogOptions) =>
      logger.info(message, {
        ...options,
        context: { ...defaultContext, ...(options?.context || {}) },
      }),

    warn: (message: string, options?: LogOptions) =>
      logger.warn(message, {
        ...options,
        context: { ...defaultContext, ...(options?.context || {}) },
      }),

    error: (message: string, error?: Error, options?: LogOptions) =>
      logger.error(message, error, {
        ...options,
        context: { ...defaultContext, ...(options?.context || {}) },
      }),
  }),
}

