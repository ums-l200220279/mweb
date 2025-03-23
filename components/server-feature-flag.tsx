import type { ReactNode } from "react"
import { useFeatureFlagServer, type FeatureContext } from "@/lib/features/feature-flags"

type ServerFeatureFlagProps = {
  featureId: string
  context?: FeatureContext
  children: ReactNode
  fallback?: ReactNode
}

export async function ServerFeatureFlag({
  featureId,
  context = {},
  children,
  fallback = null,
}: ServerFeatureFlagProps) {
  const isEnabled = await useFeatureFlagServer(featureId, context)

  // Render children if feature is enabled, otherwise render fallback
  return isEnabled ? <>{children}</> : <>{fallback}</>
}

