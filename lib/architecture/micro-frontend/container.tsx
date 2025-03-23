"use client"

import type React from "react"

/**
 * Micro-Frontend Container
 *
 * This component serves as a container for loading and rendering micro-frontends.
 * It handles loading states, error boundaries, and communication between micro-frontends.
 */

import { Suspense, useEffect, useState } from "react"
import { useMicroFrontend } from "./registry"
import { ErrorBoundary } from "@/lib/monitoring/error-boundary"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { ErrorMessage } from "@/components/ui/error-message"
import { logger } from "@/lib/monitoring/logger"
import { logEvent } from "@/lib/analytics/analytics"

interface MicroFrontendContainerProps {
  name: string
  fallback?: React.ReactNode
  errorFallback?: React.ReactNode
  props?: Record<string, any>
}

export function MicroFrontendContainer({
  name,
  fallback = <LoadingSpinner size="lg" className="my-8" />,
  errorFallback,
  props = {},
}: MicroFrontendContainerProps) {
  const { instance, loading, error } = useMicroFrontend(name)
  const [renderTime, setRenderTime] = useState<number | null>(null)

  useEffect(() => {
    if (instance?.loaded) {
      const startTime = performance.now()

      return () => {
        const endTime = performance.now()
        const duration = endTime - startTime
        setRenderTime(duration)

        logEvent("micro_frontend_rendered", {
          name,
          version: instance.manifest.version,
          renderTime: duration,
        })
      }
    }
  }, [instance, name])

  if (loading) {
    return <>{fallback}</>
  }

  if (error || !instance) {
    logger.error(`Error rendering micro-frontend: ${name}`, error)

    return (
      <>
        {errorFallback || (
          <ErrorMessage
            title={`Failed to load ${name}`}
            message={error?.message || "Unknown error occurred"}
            onRetry={() => window.location.reload()}
          />
        )}
      </>
    )
  }

  const { Component } = instance

  return (
    <ErrorBoundary
      fallback={(error) => (
        <ErrorMessage title={`Error in ${name}`} message={error.message} onRetry={() => window.location.reload()} />
      )}
      onError={(error) => {
        logger.error(`Runtime error in micro-frontend: ${name}`, error)
        logEvent("micro_frontend_runtime_error", {
          name,
          version: instance.manifest.version,
          error: error.message,
        })
      }}
    >
      <Suspense fallback={fallback}>
        <Component {...props} />
      </Suspense>
    </ErrorBoundary>
  )
}

