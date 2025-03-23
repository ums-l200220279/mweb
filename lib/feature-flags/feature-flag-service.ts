/**
 * Feature Flag Service untuk Memoright
 *
 * Layanan untuk mengelola feature flags yang memungkinkan pengaktifan/penonaktifan
 * fitur secara dinamis tanpa deployment ulang.
 */

import { Service } from "@/lib/architecture/dependency-injection"
import { logger } from "@/lib/logger"
import { apiClient } from "@/lib/api/fetcher"

export interface FeatureFlag {
  id: string
  name: string
  description: string
  enabled: boolean
  conditions?: {
    userIds?: string[]
    userRoles?: string[]
    percentage?: number
    startDate?: string
    endDate?: string
    environments?: string[]
  }
}

@Service("featureFlagService")
export class FeatureFlagService {
  private flags: Map<string, FeatureFlag> = new Map()
  private initialized = false
  private refreshInterval: NodeJS.Timeout | null = null
  private currentEnvironment: string

  constructor() {
    this.currentEnvironment = process.env.NODE_ENV || "development"
  }

  /**
   * Inisialisasi service dan memuat feature flags
   */
  public async initialize(): Promise<void> {
    if (this.initialized) {
      return
    }

    try {
      await this.loadFlags()
      this.initialized = true

      // Refresh flags setiap 5 menit
      this.refreshInterval = setInterval(
        () => {
          this.loadFlags().catch((error) => {
            logger.error("Failed to refresh feature flags", error)
          })
        },
        5 * 60 * 1000,
      )
    } catch (error) {
      logger.error(
        "Failed to initialize feature flag service",
        error instanceof Error ? error : new Error(String(error)),
      )
      throw error
    }
  }

  /**
   * Memuat feature flags dari API atau storage
   */
  private async loadFlags(): Promise<void> {
    try {
      const flags = await apiClient.get<FeatureFlag[]>("/api/feature-flags")

      // Update flags map
      this.flags.clear()
      for (const flag of flags) {
        this.flags.set(flag.id, flag)
      }

      logger.info(`Loaded ${flags.length} feature flags`)
    } catch (error) {
      logger.error("Failed to load feature flags", error instanceof Error ? error : new Error(String(error)))

      // Fallback ke flags default jika gagal
      this.loadDefaultFlags()
    }
  }

  /**
   * Memuat feature flags default jika API tidak tersedia
   */
  private loadDefaultFlags(): void {
    const defaultFlags: FeatureFlag[] = [
      {
        id: "advanced-analytics",
        name: "Advanced Analytics",
        description: "Enable advanced analytics features",
        enabled: true,
      },
      {
        id: "ai-recommendations",
        name: "AI Recommendations",
        description: "Enable AI-powered recommendations",
        enabled: true,
      },
      {
        id: "new-cognitive-games",
        name: "New Cognitive Games",
        description: "Enable new cognitive games",
        enabled: false,
        conditions: {
          environments: ["development", "staging"],
        },
      },
    ]

    this.flags.clear()
    for (const flag of defaultFlags) {
      this.flags.set(flag.id, flag)
    }

    logger.info(`Loaded ${defaultFlags.length} default feature flags`)
  }

  /**
   * Memeriksa apakah feature flag diaktifkan
   */
  public isEnabled(
    flagId: string,
    context?: {
      userId?: string
      userRole?: string
    },
  ): boolean {
    if (!this.initialized) {
      logger.warn("Feature flag service not initialized")
      return false
    }

    const flag = this.flags.get(flagId)
    if (!flag) {
      logger.warn(`Feature flag not found: ${flagId}`)
      return false
    }

    // Periksa apakah flag diaktifkan secara global
    if (!flag.enabled) {
      return false
    }

    // Periksa kondisi jika ada
    if (flag.conditions) {
      // Periksa environment
      if (flag.conditions.environments && !flag.conditions.environments.includes(this.currentEnvironment)) {
        return false
      }

      // Periksa user ID
      if (context?.userId && flag.conditions.userIds && !flag.conditions.userIds.includes(context.userId)) {
        return false
      }

      // Periksa user role
      if (context?.userRole && flag.conditions.userRoles && !flag.conditions.userRoles.includes(context.userRole)) {
        return false
      }

      // Periksa tanggal
      const now = new Date()
      if (flag.conditions.startDate && new Date(flag.conditions.startDate) > now) {
        return false
      }
      if (flag.conditions.endDate && new Date(flag.conditions.endDate) < now) {
        return false
      }

      // Periksa persentase
      if (flag.conditions.percentage !== undefined) {
        const randomValue = Math.random() * 100
        if (randomValue > flag.conditions.percentage) {
          return false
        }
      }
    }

    return true
  }

  /**
   * Mendapatkan semua feature flags
   */
  public getAllFlags(): FeatureFlag[] {
    return Array.from(this.flags.values())
  }

  /**
   * Mendapatkan feature flag berdasarkan ID
   */
  public getFlag(flagId: string): FeatureFlag | undefined {
    return this.flags.get(flagId)
  }

  /**
   * Mengaktifkan feature flag
   */
  public enableFlag(flagId: string): void {
    const flag = this.flags.get(flagId)
    if (flag) {
      flag.enabled = true
      this.flags.set(flagId, flag)
    }
  }

  /**
   * Menonaktifkan feature flag
   */
  public disableFlag(flagId: string): void {
    const flag = this.flags.get(flagId)
    if (flag) {
      flag.enabled = false
      this.flags.set(flagId, flag)
    }
  }

  /**
   * Membersihkan resources saat service dihentikan
   */
  public dispose(): void {
    if (this.refreshInterval) {
      clearInterval(this.refreshInterval)
      this.refreshInterval = null
    }
    this.flags.clear()
    this.initialized = false
  }
}

