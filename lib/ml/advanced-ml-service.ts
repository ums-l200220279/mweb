/**
 * Advanced ML Service untuk Memoright
 *
 * Layanan untuk mengelola model machine learning tingkat lanjut dengan
 * kemampuan transfer learning, model versioning, dan model caching.
 */

import { Service } from "@/lib/architecture/dependency-injection"
import { logger } from "@/lib/logger"
import { apiClient } from "@/lib/api/fetcher"

export interface ModelMetadata {
  id: string
  name: string
  version: string
  description: string
  createdAt: string
  updatedAt: string
  metrics: {
    accuracy: number
    precision: number
    recall: number
    f1Score: number
  }
  parameters: Record<string, any>
}

export interface PredictionOptions {
  useCache?: boolean
  modelVersion?: string
  returnConfidence?: boolean
  returnExplanation?: boolean
  timeout?: number
}

export interface PredictionResult<T> {
  result: T
  confidence?: number
  explanation?: string
  modelVersion: string
  latency: number
  fromCache: boolean
}

@Service("advancedMlService")
export class AdvancedMlService {
  private modelCache: Map<
    string,
    {
      result: any
      timestamp: number
      modelVersion: string
    }
  > = new Map()

  private modelMetadataCache: Map<string, ModelMetadata> = new Map()
  private initialized = false
  private cacheTTL: number = 60 * 60 * 1000 // 1 hour

  /**
   * Inisialisasi service
   */
  public async initialize(): Promise<void> {
    if (this.initialized) {
      return
    }

    try {
      // Muat metadata model
      await this.loadModelMetadata()
      this.initialized = true
      logger.info("Advanced ML service initialized")
    } catch (error) {
      logger.error(
        "Failed to initialize advanced ML service",
        error instanceof Error ? error : new Error(String(error)),
      )
      throw error
    }
  }

  /**
   * Memuat metadata model dari API
   */
  private async loadModelMetadata(): Promise<void> {
    try {
      const models = await apiClient.get<ModelMetadata[]>("/api/ml/models")

      // Update cache
      this.modelMetadataCache.clear()
      for (const model of models) {
        this.modelMetadataCache.set(model.id, model)
      }

      logger.info(`Loaded metadata for ${models.length} ML models`)
    } catch (error) {
      logger.error("Failed to load model metadata", error instanceof Error ? error : new Error(String(error)))
      throw error
    }
  }

  /**
   * Mendapatkan metadata model berdasarkan ID
   */
  public getModelMetadata(modelId: string): ModelMetadata | undefined {
    return this.modelMetadataCache.get(modelId)
  }

  /**
   * Mendapatkan semua metadata model
   */
  public getAllModelMetadata(): ModelMetadata[] {
    return Array.from(this.modelMetadataCache.values())
  }

  /**
   * Melakukan prediksi dengan model ML
   */
  public async predict<T, U>(modelId: string, input: T, options: PredictionOptions = {}): Promise<PredictionResult<U>> {
    if (!this.initialized) {
      await this.initialize()
    }

    const startTime = Date.now()
    const cacheKey = this.generateCacheKey(modelId, input, options.modelVersion)

    // Cek cache jika diaktifkan
    if (options.useCache !== false) {
      const cached = this.modelCache.get(cacheKey)
      if (cached && Date.now() - cached.timestamp < this.cacheTTL) {
        logger.debug(`Using cached prediction for model ${modelId}`)
        return {
          ...cached.result,
          latency: Date.now() - startTime,
          fromCache: true,
          modelVersion: cached.modelVersion,
        }
      }
    }

    try {
      // Buat request payload
      const payload = {
        input,
        options: {
          modelVersion: options.modelVersion,
          returnConfidence: options.returnConfidence,
          returnExplanation: options.returnExplanation,
        },
      }

      // Kirim request ke API
      const result = await apiClient.post<U>(`/api/ml/${modelId}/predict`, payload, {
        timeout: options.timeout || 30000,
      })

      // Dapatkan versi model yang digunakan
      const modelVersion = options.modelVersion || this.modelMetadataCache.get(modelId)?.version || "unknown"

      // Buat hasil prediksi
      const predictionResult: PredictionResult<U> = {
        result,
        modelVersion,
        latency: Date.now() - startTime,
        fromCache: false,
      }

      // Simpan ke cache
      if (options.useCache !== false) {
        this.modelCache.set(cacheKey, {
          result: predictionResult,
          timestamp: Date.now(),
          modelVersion,
        })
      }

      return predictionResult
    } catch (error) {
      logger.error(`Failed to predict with model ${modelId}`, error instanceof Error ? error : new Error(String(error)))
      throw error
    }
  }

  /**
   * Membuat kunci cache berdasarkan model ID dan input
   */
  private generateCacheKey(modelId: string, input: any, modelVersion?: string): string {
    const inputHash = JSON.stringify(input)
    return `${modelId}:${modelVersion || "latest"}:${inputHash}`
  }

  /**
   * Membersihkan cache untuk model tertentu
   */
  public clearModelCache(modelId?: string): void {
    if (modelId) {
      // Hapus cache untuk model tertentu
      const keysToDelete: string[] = []

      this.modelCache.forEach((_, key) => {
        if (key.startsWith(`${modelId}:`)) {
          keysToDelete.push(key)
        }
      })

      keysToDelete.forEach((key) => this.modelCache.delete(key))
      logger.info(`Cleared cache for model ${modelId}`)
    } else {
      // Hapus semua cache
      this.modelCache.clear()
      logger.info("Cleared all model cache")
    }
  }

  /**
   * Membersihkan resources saat service dihentikan
   */
  public dispose(): void {
    this.modelCache.clear()
    this.modelMetadataCache.clear()
    this.initialized = false
  }
}

