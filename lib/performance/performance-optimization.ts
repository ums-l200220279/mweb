/**
 * Performance Optimization untuk Memoright
 *
 * Utilitas untuk mengoptimalkan performa aplikasi dengan
 * teknik caching, code splitting, dan lazy loading.
 */

import { logger } from "@/lib/logger"
import { container } from "@/lib/architecture/dependency-injection"
import type { ObservabilityService } from "@/lib/monitoring/observability-service"

export interface CacheOptions {
  ttl: number // Time to live in milliseconds
  maxSize?: number // Maksimum ukuran cache
  namespace?: string // Namespace untuk cache
}

export interface CacheStats {
  hits: number
  misses: number
  size: number
  hitRate: number
}

export class PerformanceCache<K = string, V = any> {
  private cache: Map<K, { value: V; expires: number }> = new Map()
  private options: CacheOptions
  private stats: CacheStats = {
    hits: 0,
    misses: 0,
    size: 0,
    hitRate: 0,
  }
  private observabilityService: ObservabilityService

  constructor(options: CacheOptions) {
    this.options = {
      ttl: 60 * 1000, // Default 1 menit
      maxSize: 1000,
      namespace: "default",
      ...options,
    }

    this.observabilityService = container.resolve<ObservabilityService>("observabilityService")

    // Buat metrik untuk cache
    this.observabilityService.getOrCreateMetric(`cache.${this.options.namespace}.hits`, {
      description: `Cache hits for ${this.options.namespace}`,
      unit: "count",
      type: "counter",
    })

    this.observabilityService.getOrCreateMetric(`cache.${this.options.namespace}.misses`, {
      description: `Cache misses for ${this.options.namespace}`,
      unit: "count",
      type: "counter",
    })

    this.observabilityService.getOrCreateMetric(`cache.${this.options.namespace}.size`, {
      description: `Cache size for ${this.options.namespace}`,
      unit: "count",
      type: "gauge",
    })

    this.observabilityService.getOrCreateMetric(`cache.${this.options.namespace}.hit_rate`, {
      description: `Cache hit rate for ${this.options.namespace}`,
      unit: "percent",
      type: "gauge",
    })
  }

  /**
   * Mendapatkan nilai dari cache
   */
  public get(key: K): V | undefined {
    const entry = this.cache.get(key)

    // Jika tidak ada entry atau sudah kedaluwarsa
    if (!entry || entry.expires < Date.now()) {
      if (entry) {
        // Hapus entry yang kedaluwarsa
        this.cache.delete(key)
        this.updateStats()
      }

      this.stats.misses++
      this.observabilityService.incrementCounter(`cache.${this.options.namespace}.misses`)
      this.updateHitRate()

      return undefined
    }

    this.stats.hits++
    this.observabilityService.incrementCounter(`cache.${this.options.namespace}.hits`)
    this.updateHitRate()

    return entry.value
  }

  /**
   * Menyimpan nilai ke cache
   */
  public set(key: K, value: V, ttl?: number): void {
    // Jika cache penuh, hapus entry tertua
    if (this.options.maxSize && this.cache.size >= this.options.maxSize) {
      const oldestKey = this.cache.keys().next().value
      this.cache.delete(oldestKey)
    }

    const expires = Date.now() + (ttl || this.options.ttl)
    this.cache.set(key, { value, expires })

    this.updateStats()
  }

  /**
   * Menghapus nilai dari cache
   */
  public delete(key: K): boolean {
    const result = this.cache.delete(key)
    this.updateStats()
    return result
  }

  /**
   * Membersihkan seluruh cache
   */
  public clear(): void {
    this.cache.clear()
    this.updateStats()
  }

  /**
   * Membersihkan entry yang kedaluwarsa
   */
  public purgeExpired(): void {
    const now = Date.now()
    for (const [key, entry] of this.cache.entries()) {
      if (entry.expires < now) {
        this.cache.delete(key)
      }
    }

    this.updateStats()
  }

  /**
   * Mendapatkan statistik cache
   */
  public getStats(): CacheStats {
    return { ...this.stats }
  }

  /**
   * Update statistik cache
   */
  private updateStats(): void {
    this.stats.size = this.cache.size
    this.observabilityService.setGauge(`cache.${this.options.namespace}.size`, this.cache.size)
  }

  /**
   * Update hit rate
   */
  private updateHitRate(): void {
    const total = this.stats.hits + this.stats.misses
    this.stats.hitRate = total > 0 ? (this.stats.hits / total) * 100 : 0
    this.observabilityService.setGauge(`cache.${this.options.namespace}.hit_rate`, this.stats.hitRate)
  }
}

/**
 * Utilitas untuk code splitting dan lazy loading
 */
export class LazyLoader {
  private static loadedModules: Map<string, any> = new Map()
  private static loadingPromises: Map<string, Promise<any>> = new Map()
  private static observabilityService: ObservabilityService

  /**
   * Inisialisasi lazy loader
   */
  public static initialize(): void {
    this.observabilityService = container.resolve<ObservabilityService>("observabilityService")

    // Buat metrik untuk lazy loading
    this.observabilityService.getOrCreateMetric("lazy_loading.module_load_time", {
      description: "Module load time",
      unit: "ms",
      type: "histogram",
    })
  }

  /**
   * Load modul secara lazy
   */
  public static async load<T>(moduleId: string, loader: () => Promise<T>): Promise<T> {
    // Jika modul sudah dimuat, kembalikan dari cache
    if (this.loadedModules.has(moduleId)) {
      return this.loadedModules.get(moduleId)
    }

    // Jika modul sedang dimuat, tunggu promise yang ada
    if (this.loadingPromises.has(moduleId)) {
      return this.loadingPromises.get(moduleId)
    }

    // Mulai tracing
    const traceContext = this.observabilityService.startSpan("lazy_load_module", {
      attributes: {
        "module.id": moduleId,
      },
    })

    const startTime = Date.now()

    // Buat promise untuk memuat modul
    const loadPromise = loader()
      .then((module) => {
        // Simpan modul ke cache
        this.loadedModules.set(moduleId, module)

        // Hapus promise dari map
        this.loadingPromises.delete(moduleId)

        // Catat waktu pemuatan
        const loadTime = Date.now() - startTime
        this.observabilityService.recordHistogram("lazy_loading.module_load_time", loadTime, {
          "module.id": moduleId,
        })

        // End tracing
        traceContext.setAttribute("load_time_ms", loadTime)
        traceContext.setStatus("ok")
        traceContext.end()

        logger.debug(`Lazy loaded module: ${moduleId} in ${loadTime}ms`)

        return module
      })
      .catch((error) => {
        // Hapus promise dari map
        this.loadingPromises.delete(moduleId)

        // End tracing dengan error
        traceContext.setAttribute("error", true)
        traceContext.setAttribute("error.message", error instanceof Error ? error.message : String(error))
        traceContext.setStatus("error", error instanceof Error ? error.message : String(error))
        traceContext.end()

        logger.error(
          `Failed to lazy load module: ${moduleId}`,
          error instanceof Error ? error : new Error(String(error)),
        )

        throw error
      })

    // Simpan promise ke map
    this.loadingPromises.set(moduleId, loadPromise)

    return loadPromise
  }

  /**
   * Preload modul
   */
  public static preload(moduleId: string, loader: () => Promise<any>): void {
    // Jika modul sudah dimuat atau sedang dimuat, tidak perlu preload
    if (this.loadedModules.has(moduleId) || this.loadingPromises.has(moduleId)) {
      return
    }

    // Preload modul
    this.load(moduleId, loader).catch((error) => {
      logger.error(`Failed to preload module: ${moduleId}`, error instanceof Error ? error : new Error(String(error)))
    })
  }

  /**
   * Membersihkan cache modul
   */
  public static clearCache(moduleId?: string): void {
    if (moduleId) {
      this.loadedModules.delete(moduleId)
    } else {
      this.loadedModules.clear()
    }
  }
}

/**
 * Utilitas untuk resource prefetching
 */
export class ResourcePrefetcher {
  private static prefetchedResources: Set<string> = new Set()
  private static observabilityService: ObservabilityService

  /**
   * Inisialisasi resource prefetcher
   */
  public static initialize(): void {
    this.observabilityService = container.resolve<ObservabilityService>("observabilityService")

    // Buat metrik untuk prefetching
    this.observabilityService.getOrCreateMetric("prefetching.resources", {
      description: "Prefetched resources",
      unit: "count",
      type: "counter",
    })
  }

  /**
   * Prefetch resource
   */
  public static prefetch(url: string, type: "image" | "script" | "style" | "font" | "fetch" = "fetch"): void {
    // Jika resource sudah di-prefetch, lewati
    if (this.prefetchedResources.has(url)) {
      return
    }

    // Jika tidak di browser, lewati
    if (typeof window === "undefined") {
      return
    }

    try {
      switch (type) {
        case "image":
          this.prefetchImage(url)
          break
        case "script":
          this.prefetchScript(url)
          break
        case "style":
          this.prefetchStyle(url)
          break
        case "font":
          this.prefetchFont(url)
          break
        case "fetch":
        default:
          this.prefetchData(url)
          break
      }

      // Tandai resource sebagai di-prefetch
      this.prefetchedResources.add(url)

      // Catat metrik
      this.observabilityService.incrementCounter("prefetching.resources", 1, {
        "resource.type": type,
      })

      logger.debug(`Prefetched ${type} resource: ${url}`)
    } catch (error) {
      logger.error(
        `Failed to prefetch ${type} resource: ${url}`,
        error instanceof Error ? error : new Error(String(error)),
      )
    }
  }

  /**
   * Prefetch image
   */
  private static prefetchImage(url: string): void {
    const img = new Image()
    img.src = url
  }

  /**
   * Prefetch script
   */
  private static prefetchScript(url: string): void {
    const link = document.createElement("link")
    link.rel = "preload"
    link.as = "script"
    link.href = url
    document.head.appendChild(link)
  }

  /**
   * Prefetch style
   */
  private static prefetchStyle(url: string): void {
    const link = document.createElement("link")
    link.rel = "preload"
    link.as = "style"
    link.href = url
    document.head.appendChild(link)
  }

  /**
   * Prefetch font
   */
  private static prefetchFont(url: string): void {
    const link = document.createElement("link")
    link.rel = "preload"
    link.as = "font"
    link.href = url
    link.crossOrigin = "anonymous"
    document.head.appendChild(link)
  }

  /**
   * Prefetch data
   */
  private static prefetchData(url: string): void {
    const link = document.createElement("link")
    link.rel = "prefetch"
    link.href = url
    document.head.appendChild(link)
  }

  /**
   * Membersihkan cache prefetch
   */
  public static clearCache(): void {
    this.prefetchedResources.clear()
  }
}

/**
 * Inisialisasi utilitas performa
 */
export function initializePerformanceUtils(): void {
  LazyLoader.initialize()
  ResourcePrefetcher.initialize()

  logger.info("Performance utilities initialized")
}

