"use client"

import { useCallback } from "react"
import { useUser } from "@/hooks/use-user"

interface TelemetryOptions {
  anonymize?: boolean
  debug?: boolean
  endpoint?: string
}

export function useTelemetry(options: TelemetryOptions = {}) {
  const { user } = useUser()

  const defaultOptions: TelemetryOptions = {
    anonymize: false,
    debug: false,
    endpoint: "/api/telemetry",
    ...options,
  }

  const trackEvent = useCallback(
    async (eventName: string, eventData: Record<string, any> = {}) => {
      try {
        const payload = {
          event: eventName,
          timestamp: new Date().toISOString(),
          userId: defaultOptions.anonymize ? undefined : user?.id,
          sessionId: getSessionId(),
          data: eventData,
          url: typeof window !== "undefined" ? window.location.href : undefined,
          userAgent: typeof navigator !== "undefined" ? navigator.userAgent : undefined,
        }

        if (defaultOptions.debug) {
          console.log("[Telemetry]", payload)
        }

        // Send the event to the server
        await fetch(defaultOptions.endpoint || "/api/telemetry", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
          // Use keepalive to ensure the request completes even if the page is unloading
          keepalive: true,
        })

        return true
      } catch (error) {
        console.error("[Telemetry Error]", error)
        return false
      }
    },
    [user],
  )

  const trackPageView = useCallback(
    async (pageData: Record<string, any> = {}) => {
      return trackEvent("page_view", pageData)
    },
    [trackEvent],
  )

  const trackError = useCallback(
    async (error: Error, errorContext: Record<string, any> = {}) => {
      return trackEvent("error", {
        message: error.message,
        stack: error.stack,
        ...errorContext,
      })
    },
    [trackEvent],
  )

  return {
    trackEvent,
    trackPageView,
    trackError,
  }
}

// Helper function to get or create a session ID
function getSessionId(): string {
  if (typeof window === "undefined") {
    return "server-side"
  }

  let sessionId = sessionStorage.getItem("telemetry_session_id")

  if (!sessionId) {
    sessionId = generateSessionId()
    sessionStorage.setItem("telemetry_session_id", sessionId)
  }

  return sessionId
}

// Generate a random session ID
function generateSessionId(): string {
  return "sess_" + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
}

