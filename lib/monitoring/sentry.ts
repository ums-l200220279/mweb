import * as Sentry from "@sentry/nextjs"
import { ProfilingIntegration } from "@sentry/profiling-node"
import { logger } from "./logger"

/**
 * Initialize Sentry for error tracking and performance monitoring
 */
export function initSentry() {
  if (process.env.NEXT_PUBLIC_SENTRY_DSN) {
    try {
      Sentry.init({
        dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,

        // Set tracesSampleRate to 1.0 to capture 100% of transactions for performance monitoring
        // We recommend adjusting this value in production
        tracesSampleRate: process.env.NODE_ENV === "production" ? 0.2 : 1.0,

        // Set profilesSampleRate to 1.0 to profile all transactions
        // We recommend adjusting this value in production
        profilesSampleRate: process.env.NODE_ENV === "production" ? 0.1 : 1.0,

        // Enable profiling integration
        integrations: [new ProfilingIntegration()],

        // Enable performance monitoring
        enableTracing: true,

        // Environment
        environment: process.env.NODE_ENV || "development",

        // Release
        release: process.env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_SHA || "local",

        // Ignore errors from development
        beforeSend(event) {
          // Don't send events in development
          if (process.env.NODE_ENV === "development" && !process.env.SENTRY_ENABLE_DEV) {
            return null
          }
          return event
        },

        // Capture unhandled promise rejections
        autoSessionTracking: true,
      })

      logger.info("Sentry initialized successfully")
    } catch (error) {
      logger.error("Failed to initialize Sentry", { error })
    }
  } else {
    logger.warn("Sentry DSN not provided, skipping initialization")
  }
}

/**
 * Capture an exception with Sentry
 * @param error The error to capture
 * @param context Additional context for the error
 */
export function captureException(error: Error, context?: Record<string, any>) {
  if (process.env.NEXT_PUBLIC_SENTRY_DSN) {
    try {
      Sentry.captureException(error, {
        extra: context,
      })
    } catch (sentryError) {
      logger.error("Failed to capture exception with Sentry", { error: sentryError })
    }
  }

  // Always log the error locally
  logger.error(error.message, {
    error: {
      name: error.name,
      message: error.message,
      stack: error.stack,
      ...context,
    },
  })
}

/**
 * Set user information for Sentry
 * @param user User information
 */
export function setUser(user: { id: string; email?: string; username?: string }) {
  if (process.env.NEXT_PUBLIC_SENTRY_DSN) {
    try {
      Sentry.setUser(user)
    } catch (error) {
      logger.error("Failed to set user for Sentry", { error })
    }
  }
}

/**
 * Clear user information from Sentry
 */
export function clearUser() {
  if (process.env.NEXT_PUBLIC_SENTRY_DSN) {
    try {
      Sentry.setUser(null)
    } catch (error) {
      logger.error("Failed to clear user from Sentry", { error })
    }
  }
}

/**
 * Start a new transaction for performance monitoring
 * @param name Transaction name
 * @param op Operation type
 * @returns Transaction object
 */
export function startTransaction(name: string, op: string) {
  if (process.env.NEXT_PUBLIC_SENTRY_DSN) {
    try {
      return Sentry.startTransaction({
        name,
        op,
      })
    } catch (error) {
      logger.error("Failed to start transaction with Sentry", { error })
    }
  }

  return null
}

/**
 * Set a tag for the current scope
 * @param key Tag key
 * @param value Tag value
 */
export function setTag(key: string, value: string) {
  if (process.env.NEXT_PUBLIC_SENTRY_DSN) {
    try {
      Sentry.setTag(key, value)
    } catch (error) {
      logger.error("Failed to set tag for Sentry", { error })
    }
  }
}

/**
 * Set extra context for the current scope
 * @param key Context key
 * @param value Context value
 */
export function setExtra(key: string, value: any) {
  if (process.env.NEXT_PUBLIC_SENTRY_DSN) {
    try {
      Sentry.setExtra(key, value)
    } catch (error) {
      logger.error("Failed to set extra context for Sentry", { error })
    }
  }
}

/**
 * Add breadcrumb to the current scope
 * @param breadcrumb Breadcrumb data
 */
export function addBreadcrumb(breadcrumb: {
  category?: string
  message: string
  level?: "fatal" | "error" | "warning" | "info" | "debug"
  data?: Record<string, any>
}) {
  if (process.env.NEXT_PUBLIC_SENTRY_DSN) {
    try {
      Sentry.addBreadcrumb({
        category: breadcrumb.category || "custom",
        message: breadcrumb.message,
        level: breadcrumb.level || "info",
        data: breadcrumb.data,
      })
    } catch (error) {
      logger.error("Failed to add breadcrumb for Sentry", { error })
    }
  }
}

/**
 * Flush Sentry events
 * @returns Promise that resolves when events are flushed
 */
export async function flush(timeout?: number): Promise<boolean> {
  if (process.env.NEXT_PUBLIC_SENTRY_DSN) {
    try {
      return await Sentry.flush(timeout)
    } catch (error) {
      logger.error("Failed to flush Sentry events", { error })
      return false
    }
  }

  return true
}

