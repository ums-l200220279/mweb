/**
 * Analytics Module
 *
 * This file provides analytics tracking functionality for the application.
 * It supports multiple analytics providers and custom event tracking.
 */

type EventName =
  | "page_view"
  | "user_login"
  | "user_logout"
  | "assessment_started"
  | "assessment_completed"
  | "game_started"
  | "game_completed"
  | "report_generated"
  | "error_occurred"
  | "feature_used"

interface EventProperties {
  [key: string]: string | number | boolean | null | undefined
}

// Check if analytics is enabled
const isAnalyticsEnabled = () => {
  return process.env.NEXT_PUBLIC_ENABLE_ANALYTICS === "true"
}

// Check if custom analytics is enabled
const isCustomAnalyticsEnabled = () => {
  return process.env.NEXT_PUBLIC_ENABLE_CUSTOM_ANALYTICS === "true"
}

// Track event with Vercel Analytics
const trackVercelAnalytics = (eventName: EventName, properties?: EventProperties) => {
  if (typeof window !== "undefined" && window.va) {
    window.va("event", {
      name: eventName,
      ...properties,
    })
  }
}

// Track event with custom analytics
const trackCustomAnalytics = async (eventName: EventName, properties?: EventProperties) => {
  if (!isCustomAnalyticsEnabled()) return

  const endpoint = process.env.NEXT_PUBLIC_ANALYTICS_ENDPOINT
  const apiKey = process.env.NEXT_PUBLIC_ANALYTICS_API_KEY

  if (!endpoint || !apiKey) return

  try {
    await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        event: eventName,
        properties,
        timestamp: new Date().toISOString(),
        url: window.location.href,
        userAgent: navigator.userAgent,
      }),
    })
  } catch (error) {
    console.error("Failed to send custom analytics:", error)
  }
}

// Main analytics tracking function
export const trackEvent = (eventName: EventName, properties?: EventProperties) => {
  if (!isAnalyticsEnabled()) return

  // Track with Vercel Analytics
  trackVercelAnalytics(eventName, properties)

  // Track with custom analytics
  trackCustomAnalytics(eventName, properties)
}

// Page view tracking
export const trackPageView = (url: string) => {
  trackEvent("page_view", { url })
}

// User action tracking
export const trackUserLogin = (userId: string) => {
  trackEvent("user_login", { userId })
}

export const trackUserLogout = (userId: string) => {
  trackEvent("user_logout", { userId })
}

// Feature usage tracking
export const trackFeatureUsage = (featureName: string, properties?: EventProperties) => {
  trackEvent("feature_used", {
    feature: featureName,
    ...properties,
  })
}

// Error tracking
export const trackError = (errorMessage: string, errorCode?: string, properties?: EventProperties) => {
  trackEvent("error_occurred", {
    errorMessage,
    errorCode,
    ...properties,
  })
}

