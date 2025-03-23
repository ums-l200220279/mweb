"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"

type ExperimentVariant = {
  id: string
  name: string
  description: string
  config: Record<string, any>
}

type ExperimentAssignment = {
  experimentId: string
  variantId: string
  variant: ExperimentVariant
  isNewAssignment: boolean
  isControl?: boolean
  isOverride?: boolean
}

type UseExperimentOptions = {
  context?: Record<string, any>
  sessionId?: string
  overrideVariantId?: string
  onAssignment?: (assignment: ExperimentAssignment) => void
  onError?: (error: Error) => void
}

/**
 * Hook for using experiments in client components
 */
export function useExperiment(experimentId: string, options: UseExperimentOptions = {}) {
  const { data: session } = useSession()
  const [variant, setVariant] = useState<ExperimentVariant | null>(null)
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [error, setError] = useState<Error | null>(null)
  const [assignment, setAssignment] = useState<ExperimentAssignment | null>(null)

  useEffect(() => {
    const getAssignment = async () => {
      try {
        setIsLoading(true)
        setError(null)

        const response = await fetch("/api/experiments/assignment", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            experimentId,
            sessionId: options.sessionId,
            context: options.context,
            overrideVariantId: options.overrideVariantId,
          }),
        })

        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.error || "Failed to get experiment assignment")
        }

        const data: ExperimentAssignment = await response.json()
        setVariant(data.variant)
        setAssignment(data)

        // Call onAssignment callback if provided
        if (options.onAssignment) {
          options.onAssignment(data)
        }

        // Record experiment exposure
        if (data.isNewAssignment) {
          recordExposure(experimentId, data.variantId)
        }
      } catch (err) {
        console.error("Error getting experiment assignment:", err)
        setError(err instanceof Error ? err : new Error(String(err)))

        // Call onError callback if provided
        if (options.onError) {
          options.onError(err instanceof Error ? err : new Error(String(err)))
        }
      } finally {
        setIsLoading(false)
      }
    }

    if (experimentId) {
      getAssignment()
    } else {
      setIsLoading(false)
    }
  }, [experimentId, options.sessionId, options.overrideVariantId, JSON.stringify(options.context)])

  /**
   * Record a metric for the experiment
   */
  const recordMetric = async (metricName: string, value: number | boolean, metadata: Record<string, any> = {}) => {
    if (!variant) {
      console.warn("Cannot record metric: No variant assigned")
      return
    }

    try {
      const response = await fetch(`/api/experiments/${experimentId}/results`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          variantId: variant.id,
          metricName,
          value,
          sessionId: options.sessionId,
          metadata,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to record metric")
      }

      return await response.json()
    } catch (err) {
      console.error("Error recording experiment metric:", err)
      throw err
    }
  }

  /**
   * Record experiment exposure
   */
  const recordExposure = async (experimentId: string, variantId: string) => {
    try {
      await fetch(`/api/experiments/${experimentId}/results`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          variantId,
          metricName: "exposure",
          value: true,
          sessionId: options.sessionId,
        }),
      })
    } catch (err) {
      console.error("Error recording experiment exposure:", err)
    }
  }

  return {
    variant,
    isLoading,
    error,
    assignment,
    recordMetric,
  }
}

