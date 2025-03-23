"use client"

import { useEffect } from "react"

import { useState } from "react"

import { prisma } from "@/lib/db"
import { cache } from "react"

export type FeatureFlag = {
  id: string
  name: string
  description: string
  enabled: boolean
  percentage: number // For gradual rollout (0-100)
  rules: FeatureFlagRule[]
  createdAt: Date
  updatedAt: Date
}

export type FeatureFlagRule = {
  id: string
  featureFlagId: string
  attribute: string // e.g., 'userId', 'role', 'country'
  operator: "equals" | "not_equals" | "contains" | "not_contains" | "in" | "not_in" | "greater_than" | "less_than"
  value: string
  createdAt: Date
  updatedAt: Date
}

export type FeatureContext = {
  userId?: string
  sessionId?: string
  role?: string
  country?: string
  deviceType?: string
  appVersion?: string
  [key: string]: string | undefined
}

// Cache feature flags for 5 minutes
const CACHE_TTL = 5 * 60 * 1000
let cachedFlags: FeatureFlag[] | null = null
let lastCacheTime = 0

// Function to get all feature flags (cached)
export const getFeatureFlags = async (): Promise<FeatureFlag[]> => {
  const now = Date.now()

  // Return cached flags if they exist and are not expired
  if (cachedFlags && now - lastCacheTime < CACHE_TTL) {
    return cachedFlags
  }

  try {
    // Fetch flags from database
    const flags = await prisma.featureFlag.findMany({
      include: {
        rules: true,
      },
    })

    // Update cache
    cachedFlags = flags
    lastCacheTime = now

    return flags
  } catch (error) {
    console.error("Error fetching feature flags:", error)

    // Return cached flags if available, even if expired
    if (cachedFlags) {
      return cachedFlags
    }

    // Return empty array if no cached flags
    return []
  }
}

// Function to check if a feature is enabled
export const isFeatureEnabled = async (featureId: string, context: FeatureContext = {}): Promise<boolean> => {
  try {
    // Get all feature flags
    const flags = await getFeatureFlags()

    // Find the requested feature flag
    const flag = flags.find((f) => f.id === featureId || f.name === featureId)

    // If flag doesn't exist, return false
    if (!flag) {
      return false
    }

    // If flag is disabled, return false
    if (!flag.enabled) {
      return false
    }

    // Check if any rules apply
    if (flag.rules.length > 0) {
      // If there are rules, at least one must match
      const ruleMatches = flag.rules.some((rule) => evaluateRule(rule, context))
      if (!ruleMatches) {
        return false
      }
    }

    // If percentage is 100, feature is fully enabled
    if (flag.percentage === 100) {
      return true
    }

    // For percentage rollouts, use a consistent hash based on userId or sessionId
    if (flag.percentage > 0) {
      const idForHashing = context.userId || context.sessionId

      if (idForHashing) {
        // Generate a hash value between 0-99
        const hash = generateConsistentHash(idForHashing + featureId) % 100

        // If hash is less than percentage, enable the feature
        return hash < flag.percentage
      }
    }

    // Default to enabled if percentage is set but no ID is available
    return true
  } catch (error) {
    console.error(`Error checking feature flag ${featureId}:`, error)
    return false // Default to disabled on error
  }
}

// Function to evaluate a feature flag rule
function evaluateRule(rule: FeatureFlagRule, context: FeatureContext): boolean {
  const contextValue = context[rule.attribute]

  // If the attribute doesn't exist in the context, rule doesn't match
  if (contextValue === undefined) {
    return false
  }

  switch (rule.operator) {
    case "equals":
      return contextValue === rule.value

    case "not_equals":
      return contextValue !== rule.value

    case "contains":
      return contextValue.includes(rule.value)

    case "not_contains":
      return !contextValue.includes(rule.value)

    case "in":
      return rule.value
        .split(",")
        .map((v) => v.trim())
        .includes(contextValue)

    case "not_in":
      return !rule.value
        .split(",")
        .map((v) => v.trim())
        .includes(contextValue)

    case "greater_than":
      return Number.parseFloat(contextValue) > Number.parseFloat(rule.value)

    case "less_than":
      return Number.parseFloat(contextValue) < Number.parseFloat(rule.value)

    default:
      return false
  }
}

// Generate a consistent hash for a string
function generateConsistentHash(input: string): number {
  let hash = 0

  for (let i = 0; i < input.length; i++) {
    const char = input.charCodeAt(i)
    hash = (hash << 5) - hash + char
    hash = hash & hash // Convert to 32bit integer
  }

  // Ensure positive value
  return Math.abs(hash)
}

// React hook for checking feature flags (client-side)
export function useFeatureFlag(featureId: string, context: FeatureContext = {}) {
  const [isEnabled, setIsEnabled] = useState<boolean>(false)
  const [isLoading, setIsLoading] = useState<boolean>(true)

  useEffect(() => {
    let isMounted = true

    const checkFeature = async () => {
      try {
        const enabled = await isFeatureEnabled(featureId, context)

        if (isMounted) {
          setIsEnabled(enabled)
          setIsLoading(false)
        }
      } catch (error) {
        console.error(`Error checking feature flag ${featureId}:`, error)

        if (isMounted) {
          setIsEnabled(false)
          setIsLoading(false)
        }
      }
    }

    checkFeature()

    return () => {
      isMounted = false
    }
  }, [featureId, JSON.stringify(context)])

  return { isEnabled, isLoading }
}

// Server-side React hook (cached)
export const useFeatureFlagServer = cache(async (featureId: string, context: FeatureContext = {}) => {
  return isFeatureEnabled(featureId, context)
})

// Function to create or update a feature flag
export async function upsertFeatureFlag(flag: Partial<FeatureFlag> & { name: string }): Promise<FeatureFlag> {
  try {
    const result = await prisma.featureFlag.upsert({
      where: {
        name: flag.name,
      },
      update: {
        description: flag.description,
        enabled: flag.enabled !== undefined ? flag.enabled : true,
        percentage: flag.percentage !== undefined ? flag.percentage : 100,
        updatedAt: new Date(),
      },
      create: {
        name: flag.name,
        description: flag.description || "",
        enabled: flag.enabled !== undefined ? flag.enabled : true,
        percentage: flag.percentage !== undefined ? flag.percentage : 100,
      },
    })

    // Invalidate cache
    cachedFlags = null

    return result as FeatureFlag
  } catch (error) {
    console.error(`Error upserting feature flag ${flag.name}:`, error)
    throw error
  }
}

// Function to add a rule to a feature flag
export async function addFeatureFlagRule(
  flagId: string,
  rule: Omit<FeatureFlagRule, "id" | "featureFlagId" | "createdAt" | "updatedAt">,
): Promise<FeatureFlagRule> {
  try {
    const result = await prisma.featureFlagRule.create({
      data: {
        featureFlagId: flagId,
        attribute: rule.attribute,
        operator: rule.operator,
        value: rule.value,
      },
    })

    // Invalidate cache
    cachedFlags = null

    return result as FeatureFlagRule
  } catch (error) {
    console.error(`Error adding rule to feature flag ${flagId}:`, error)
    throw error
  }
}

// Function to delete a feature flag
export async function deleteFeatureFlag(flagId: string): Promise<void> {
  try {
    // Delete all rules first
    await prisma.featureFlagRule.deleteMany({
      where: {
        featureFlagId: flagId,
      },
    })

    // Then delete the flag
    await prisma.featureFlag.delete({
      where: {
        id: flagId,
      },
    })

    // Invalidate cache
    cachedFlags = null
  } catch (error) {
    console.error(`Error deleting feature flag ${flagId}:`, error)
    throw error
  }
}

