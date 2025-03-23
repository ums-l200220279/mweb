// Implementasi model registry untuk mengelola model ML
import { RedisCache } from "@/lib/cache/redis-cache"
import type { ModelMetadata } from "@/types/ml"

export class ModelRegistry {
  private static readonly REGISTRY_KEY_PREFIX = "model:registry:"

  /**
   * Register a new model version
   */
  static async registerModel(modelId: string, version: string, metadata: ModelMetadata): Promise<void> {
    const key = `${this.REGISTRY_KEY_PREFIX}${modelId}:${version}`

    // Store model metadata
    await RedisCache.set(key, {
      ...metadata,
      registeredAt: new Date().toISOString(),
      status: "registered",
    })

    // Update latest version pointer
    await RedisCache.set(`${this.REGISTRY_KEY_PREFIX}${modelId}:latest`, version)
  }

  /**
   * Get model metadata by ID and version
   */
  static async getModel(modelId: string, version?: string): Promise<ModelMetadata | null> {
    // If version not specified, get latest
    if (!version) {
      version = await RedisCache.get<string>(`${this.REGISTRY_KEY_PREFIX}${modelId}:latest`)

      if (!version) return null
    }

    const key = `${this.REGISTRY_KEY_PREFIX}${modelId}:${version}`
    return await RedisCache.get<ModelMetadata>(key)
  }

  /**
   * Update model status (e.g., "deployed", "archived")
   */
  static async updateModelStatus(modelId: string, version: string, status: string): Promise<void> {
    const key = `${this.REGISTRY_KEY_PREFIX}${modelId}:${version}`
    const model = await RedisCache.get<ModelMetadata>(key)

    if (!model) {
      throw new Error(`Model ${modelId}:${version} not found`)
    }

    await RedisCache.set(key, {
      ...model,
      status,
      updatedAt: new Date().toISOString(),
    })
  }

  /**
   * List all versions of a model
   */
  static async listModelVersions(modelId: string): Promise<string[]> {
    // In a real implementation, this would query Redis for all keys matching the pattern
    // For this example, we'll return a mock response
    return ["1.0.0", "1.1.0", "2.0.0"]
  }

  /**
   * Track model performance metrics
   */
  static async trackModelMetrics(modelId: string, version: string, metrics: Record<string, number>): Promise<void> {
    const key = `${this.REGISTRY_KEY_PREFIX}${modelId}:${version}:metrics`
    const existingMetrics = (await RedisCache.get<Record<string, number[]>>(key)) || {}

    // Update metrics
    const updatedMetrics: Record<string, number[]> = { ...existingMetrics }

    for (const [metricName, value] of Object.entries(metrics)) {
      if (!updatedMetrics[metricName]) {
        updatedMetrics[metricName] = []
      }
      updatedMetrics[metricName].push(value)
    }

    await RedisCache.set(key, updatedMetrics)
  }
}

