"use client"

import type { ReactNode } from "react"
import { useFeatureFlag, type FeatureContext } from "@/lib/features/feature-flags"

type FeatureFlagProps = {
  featureId: string
  context?: FeatureContext
  children: ReactNode
  fallback?: ReactNode
}

export function FeatureFlag({ featureId, context = {}, children, fallback = null }: FeatureFlagProps) {
  const { isEnabled, isLoading } = useFeatureFlag(featureId, context)

  // While loading, don't render anything
  if (isLoading) {
    return null
  }

  // Render children if feature is enabled, otherwise render fallback
  return isEnabled ? <>{children}</> : <>{fallback}</>
}

