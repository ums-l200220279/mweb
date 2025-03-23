"use client"

import React from "react"

/**
 * Micro-Frontend Architecture untuk Memoright
 *
 * Implementasi arsitektur micro-frontend untuk memungkinkan
 * pengembangan dan deployment independen dari berbagai bagian UI.
 */

import { logger } from "@/lib/logger"
import { container } from "@/lib/architecture/dependency-injection"
import type { ObservabilityService } from "@/lib/monitoring/observability-service"
import type { FeatureFlagService } from "@/lib/feature-flags/feature-flag-service"
import { LazyLoader } from "@/lib/performance/performance-optimization"

export interface MicroFrontendManifest {
  name: string
  version: string
  entry: string
  dependencies: Record<string, string>
  assets: string[]
  routes: string[]
  config: Record<string, any>
  metadata: Record<string, any>
}

export interface MicroFrontendInstance {
  name: string
  version: string
  mount: (container: HTMLElement, props?: any) => void
  unmount: (container: HTMLElement) => void
  update: (props: any) => void
  getRoutes: () => any[]
}

export interface MicroFrontendOptions {
  baseUrl: string
  manifestPath: string
  enableVersionCheck?: boolean
  versionCheckInterval?: number
  enableSharedDependencies?: boolean
  sharedDependencies?: Record<string, any>
}

export class MicroFrontendRegistry {
  private static instance: MicroFrontendRegistry
  private manifests: Map<string, MicroFrontendManifest> = new Map()
  private instances: Map<string, MicroFrontendInstance> = new Map()
  private mountPoints: Map<string, HTMLElement> = new Map()
  private options: MicroFrontendOptions
  private versionCheckInterval: NodeJS.Timeout | null = null
  private observabilityService: ObservabilityService
  private featureFlagService: FeatureFlagService

  private constructor(options: MicroFrontendOptions) {
    this.options = {
      enableVersionCheck: true,
      versionCheckInterval: 5 * 60 * 1000, // 5 minutes
      enableSharedDependencies: true,
      ...options,
    }

    this.observabilityService = container.resolve<ObservabilityService>("observabilityService")
    this.featureFlagService = container.resolve<FeatureFlagService>("featureFlagService")

    // Setup version check interval
    if (this.options.enableVersionCheck) {
      this.setupVersionCheck()
    }
  }

  /**
   * Mendapatkan instance singleton dari registry
   */
  public static getInstance(options?: MicroFrontendOptions): MicroFrontendRegistry {
    if (!MicroFrontendRegistry.instance && options) {
      MicroFrontendRegistry.instance = new MicroFrontendRegistry(options)
    } else if (!MicroFrontendRegistry.instance) {
      throw new Error("MicroFrontendRegistry not initialized. Call getInstance with options first.")
    }

    return MicroFrontendRegistry.instance
  }

  /**
   * Mendaftarkan micro-frontend
   */
  public async register(name: string): Promise<MicroFrontendManifest> {
    try {
      // Mulai tracing
      const traceContext = this.observabilityService.startSpan("register_micro_frontend", {
        attributes: {
          "micro_frontend.name": name,
        },
      })

      // Periksa apakah micro-frontend sudah terdaftar
      if (this.manifests.has(name)) {
        traceContext.setStatus("ok")
        traceContext.end()
        return this.manifests.get(name)!
      }

      // Dapatkan manifest
      const manifestUrl = `${this.options.baseUrl}/${name}/${this.options.manifestPath}`
      const response = await fetch(manifestUrl)

      if (!response.ok) {
        const error = new Error(`Failed to fetch manifest for micro-frontend "${name}": ${response.statusText}`)
        traceContext.setStatus("error", error.message)
        traceContext.end()
        throw error
      }

      const manifest: MicroFrontendManifest = await response.json()

      // Validasi manifest
      this.validateManifest(manifest)

      // Simpan manifest
      this.manifests.set(name, manifest)

      // Catat metrik
      this.observabilityService.incrementCounter("micro_frontend.registered", 1, {
        "micro_frontend.name": name,
        "micro_frontend.version": manifest.version,
      })

      // End tracing
      traceContext.setAttribute("micro_frontend.version", manifest.version)
      traceContext.setStatus("ok")
      traceContext.end()

      logger.info(`Micro-frontend "${name}" registered with version ${manifest.version}`)

      return manifest
    } catch (error) {
      logger.error(
        `Failed to register micro-frontend "${name}"`,
        error instanceof Error ? error : new Error(String(error)),
      )
      throw error
    }
  }

  /**
   * Memuat micro-frontend
   */
  public async load(name: string): Promise<MicroFrontendInstance> {
    try {
      // Mulai tracing
      const traceContext = this.observabilityService.startSpan("load_micro_frontend", {
        attributes: {
          "micro_frontend.name": name,
        },
      })

      // Periksa apakah micro-frontend sudah dimuat
      if (this.instances.has(name)) {
        traceContext.setStatus("ok")
        traceContext.end()
        return this.instances.get(name)!
      }

      // Periksa apakah micro-frontend terdaftar
      if (!this.manifests.has(name)) {
        await this.register(name)
      }

      const manifest = this.manifests.get(name)!

      // Periksa feature flag
      const featureFlagName = `micro_frontend.${name}`
      const isEnabled = await this.featureFlagService.isEnabled(featureFlagName)

      if (!isEnabled) {
        const error = new Error(`Micro-frontend "${name}" is disabled by feature flag`)
        traceContext.setStatus("error", error.message)
        traceContext.end()
        throw error
      }

      // Muat assets
      await this.loadAssets(manifest)

      // Muat entry point
      const entryUrl = `${this.options.baseUrl}/${name}/${manifest.entry}`

      // Gunakan LazyLoader untuk memuat modul
      const moduleId = `micro_frontend.${name}`
      const module = await LazyLoader.load(moduleId, async () => {
        // Dalam implementasi nyata, ini akan menggunakan dynamic import
        // return import(/* webpackIgnore: true */ entryUrl);

        // Untuk simulasi, kita buat instance dummy
        return {
          default: {
            mount: (container: HTMLElement, props?: any) => {
              container.innerHTML = `<div>Micro-frontend "${name}" mounted</div>`
              logger.debug(`Micro-frontend "${name}" mounted`)
            },
            unmount: (container: HTMLElement) => {
              container.innerHTML = ""
              logger.debug(`Micro-frontend "${name}" unmounted`)
            },
            update: (props: any) => {
              logger.debug(`Micro-frontend "${name}" updated with props:`, props)
            },
            getRoutes: () => {
              return manifest.routes.map((route) => ({
                path: route,
                component: () => ({
                  render: () => `<div>Route for "${name}": ${route}</div>`,
                }),
              }))
            },
          },
        }
      })

      // Buat instance
      const instance: MicroFrontendInstance = {
        name,
        version: manifest.version,
        mount: module.default.mount,
        unmount: module.default.unmount,
        update: module.default.update,
        getRoutes: module.default.getRoutes,
      }

      // Simpan instance
      this.instances.set(name, instance)

      // Catat metrik
      this.observabilityService.incrementCounter("micro_frontend.loaded", 1, {
        "micro_frontend.name": name,
        "micro_frontend.version": manifest.version,
      })

      // End tracing
      traceContext.setAttribute("micro_frontend.version", manifest.version)
      traceContext.setStatus("ok")
      traceContext.end()

      logger.info(`Micro-frontend "${name}" loaded with version ${manifest.version}`)

      return instance
    } catch (error) {
      logger.error(`Failed to load micro-frontend "${name}"`, error instanceof Error ? error : new Error(String(error)))

      // Catat metrik
      this.observabilityService.incrementCounter("micro_frontend.load_failed", 1, {
        "micro_frontend.name": name,
        error: error instanceof Error ? error.message : String(error),
      })

      throw error
    }
  }

  /**
   * Memasang micro-frontend ke DOM
   */
  public async mount(name: string, container: HTMLElement, props?: any): Promise<void> {
    try {
      // Mulai tracing
      const traceContext = this.observabilityService.startSpan("mount_micro_frontend", {
        attributes: {
          "micro_frontend.name": name,
        },
      })

      // Periksa apakah container valid
      if (!container) {
        const error = new Error(`Invalid container for micro-frontend "${name}"`)
        traceContext.setStatus("error", error.message)
        traceContext.end()
        throw error
      }

      // Periksa apakah micro-frontend sudah dimuat
      if (!this.instances.has(name)) {
        await this.load(name)
      }

      const instance = this.instances.get(name)!

      // Periksa apakah micro-frontend sudah terpasang di container ini
      if (this.mountPoints.has(name) && this.mountPoints.get(name) === container) {
        // Update props jika sudah terpasang
        instance.update(props || {})

        traceContext.setStatus("ok")
        traceContext.end()
        return
      }

      // Jika sudah terpasang di container lain, lepaskan dulu
      if (this.mountPoints.has(name)) {
        await this.unmount(name)
      }

      // Pasang micro-frontend
      instance.mount(container, props || {})

      // Simpan mount point
      this.mountPoints.set(name, container)

      // Catat metrik
      this.observabilityService.incrementCounter("micro_frontend.mounted", 1, {
        "micro_frontend.name": name,
        "micro_frontend.version": instance.version,
      })

      // End tracing
      traceContext.setAttribute("micro_frontend.version", instance.version)
      traceContext.setStatus("ok")
      traceContext.end()

      logger.debug(`Micro-frontend "${name}" mounted`)
    } catch (error) {
      logger.error(
        `Failed to mount micro-frontend "${name}"`,
        error instanceof Error ? error : new Error(String(error)),
      )

      // Catat metrik
      this.observabilityService.incrementCounter("micro_frontend.mount_failed", 1, {
        "micro_frontend.name": name,
        error: error instanceof Error ? error.message : String(error),
      })

      throw error
    }
  }

  /**
   * Melepaskan micro-frontend dari DOM
   */
  public async unmount(name: string): Promise<void> {
    try {
      // Periksa apakah micro-frontend terpasang
      if (!this.mountPoints.has(name)) {
        return
      }

      // Periksa apakah micro-frontend dimuat
      if (!this.instances.has(name)) {
        return
      }

      const instance = this.instances.get(name)!
      const container = this.mountPoints.get(name)!

      // Lepaskan micro-frontend
      instance.unmount(container)

      // Hapus mount point
      this.mountPoints.delete(name)

      // Catat metrik
      this.observabilityService.incrementCounter("micro_frontend.unmounted", 1, {
        "micro_frontend.name": name,
        "micro_frontend.version": instance.version,
      })

      logger.debug(`Micro-frontend "${name}" unmounted`)
    } catch (error) {
      logger.error(
        `Failed to unmount micro-frontend "${name}"`,
        error instanceof Error ? error : new Error(String(error)),
      )

      // Catat metrik
      this.observabilityService.incrementCounter("micro_frontend.unmount_failed", 1, {
        "micro_frontend.name": name,
        error: error instanceof Error ? error.message : String(error),
      })

      throw error
    }
  }

  /**
   * Memperbarui props micro-frontend
   */
  public async update(name: string, props: any): Promise<void> {
    try {
      // Periksa apakah micro-frontend terpasang
      if (!this.mountPoints.has(name)) {
        throw new Error(`Micro-frontend "${name}" is not mounted`)
      }

      // Periksa apakah micro-frontend dimuat
      if (!this.instances.has(name)) {
        throw new Error(`Micro-frontend "${name}" is not loaded`)
      }

      const instance = this.instances.get(name)!

      // Update props
      instance.update(props)

      logger.debug(`Micro-frontend "${name}" updated with props:`, props)
    } catch (error) {
      logger.error(
        `Failed to update micro-frontend "${name}"`,
        error instanceof Error ? error : new Error(String(error)),
      )
      throw error
    }
  }

  /**
   * Mendapatkan semua rute dari micro-frontend
   */
  public async getRoutes(name: string): Promise<any[]> {
    try {
      // Periksa apakah micro-frontend dimuat
      if (!this.instances.has(name)) {
        await this.load(name)
      }

      const instance = this.instances.get(name)!

      // Dapatkan rute
      return instance.getRoutes()
    } catch (error) {
      logger.error(
        `Failed to get routes for micro-frontend "${name}"`,
        error instanceof Error ? error : new Error(String(error)),
      )
      throw error
    }
  }

  /**
   * Mendapatkan semua rute dari semua micro-frontend
   */
  public async getAllRoutes(): Promise<Record<string, any[]>> {
    const routes: Record<string, any[]> = {}

    for (const name of this.manifests.keys()) {
      try {
        routes[name] = await this.getRoutes(name)
      } catch (error) {
        logger.error(
          `Failed to get routes for micro-frontend "${name}"`,
          error instanceof Error ? error : new Error(String(error)),
        )
        routes[name] = []
      }
    }

    return routes
  }

  /**
   * Memuat assets micro-frontend
   */
  private async loadAssets(manifest: MicroFrontendManifest): Promise<void> {
    try {
      // Mulai tracing
      const traceContext = this.observabilityService.startSpan("load_micro_frontend_assets", {
        attributes: {
          "micro_frontend.name": manifest.name,
          "micro_frontend.version": manifest.version,
        },
      })

      // Muat assets
      for (const asset of manifest.assets) {
        const assetUrl = `${this.options.baseUrl}/${manifest.name}/${asset}`

        // Periksa tipe asset
        if (asset.endsWith(".js")) {
          await this.loadScript(assetUrl)
        } else if (asset.endsWith(".css")) {
          await this.loadStyle(assetUrl)
        }
      }

      // End tracing
      traceContext.setStatus("ok")
      traceContext.end()

      logger.debug(`Assets for micro-frontend "${manifest.name}" loaded`)
    } catch (error) {
      logger.error(
        `Failed to load assets for micro-frontend "${manifest.name}"`,
        error instanceof Error ? error : new Error(String(error)),
      )
      throw error
    }
  }

  /**
   * Memuat script
   */
  private async loadScript(url: string): Promise<void> {
    return new Promise((resolve, reject) => {
      // Periksa apakah script sudah dimuat
      const existingScript = document.querySelector(`script[src="${url}"]`)
      if (existingScript) {
        resolve()
        return
      }

      // Buat script element
      const script = document.createElement("script")
      script.src = url
      script.async = true

      // Event handlers
      script.onload = () => {
        resolve()
      }

      script.onerror = (error) => {
        reject(new Error(`Failed to load script: ${url}`))
      }

      // Tambahkan ke document
      document.head.appendChild(script)
    })
  }

  /**
   * Memuat style
   */
  private async loadStyle(url: string): Promise<void> {
    return new Promise((resolve, reject) => {
      // Periksa apakah style sudah dimuat
      const existingStyle = document.querySelector(`link[href="${url}"]`)
      if (existingStyle) {
        resolve()
        return
      }

      // Buat link element
      const link = document.createElement("link")
      link.href = url
      link.rel = "stylesheet"

      // Event handlers
      link.onload = () => {
        resolve()
      }

      link.onerror = (error) => {
        reject(new Error(`Failed to load style: ${url}`))
      }

      // Tambahkan ke document
      document.head.appendChild(link)
    })
  }

  /**
   * Validasi manifest
   */
  private validateManifest(manifest: MicroFrontendManifest): void {
    if (!manifest.name) {
      throw new Error("Manifest must have a name")
    }

    if (!manifest.version) {
      throw new Error("Manifest must have a version")
    }

    if (!manifest.entry) {
      throw new Error("Manifest must have an entry point")
    }
  }

  /**
   * Setup interval untuk memeriksa versi baru
   */
  private setupVersionCheck(): void {
    if (this.versionCheckInterval) {
      clearInterval(this.versionCheckInterval)
    }

    this.versionCheckInterval = setInterval(() => {
      this.checkForUpdates().catch((error) => {
        logger.error("Failed to check for updates", error instanceof Error ? error : new Error(String(error)))
      })
    }, this.options.versionCheckInterval)
  }

  /**
   * Memeriksa pembaruan untuk semua micro-frontend
   */
  private async checkForUpdates(): Promise<void> {
    for (const [name, manifest] of this.manifests.entries()) {
      try {
        // Dapatkan manifest terbaru
        const manifestUrl = `${this.options.baseUrl}/${name}/${this.options.manifestPath}`
        const response = await fetch(manifestUrl, {
          cache: "no-cache",
        })

        if (!response.ok) {
          continue
        }

        const latestManifest: MicroFrontendManifest = await response.json()

        // Periksa apakah versi berbeda
        if (latestManifest.version !== manifest.version) {
          logger.info(
            `New version available for micro-frontend "${name}": ${latestManifest.version} (current: ${manifest.version})`,
          )

          // Catat metrik
          this.observabilityService.incrementCounter("micro_frontend.update_available", 1, {
            "micro_frontend.name": name,
            "micro_frontend.current_version": manifest.version,
            "micro_frontend.new_version": latestManifest.version,
          })

          // Update manifest
          this.manifests.set(name, latestManifest)

          // Jika micro-frontend dimuat, muat ulang
          if (this.instances.has(name)) {
            // Simpan mount point dan props
            const mountPoint = this.mountPoints.get(name)

            // Hapus instance
            this.instances.delete(name)

            // Jika terpasang, pasang ulang
            if (mountPoint) {
              await this.mount(name, mountPoint)
            }
          }
        }
      } catch (error) {
        logger.error(
          `Failed to check for updates for micro-frontend "${name}"`,
          error instanceof Error ? error : new Error(String(error)),
        )
      }
    }
  }

  /**
   * Membersihkan resources saat registry dihentikan
   */
  public dispose(): void {
    // Lepaskan semua micro-frontend
    for (const name of this.mountPoints.keys()) {
      this.unmount(name).catch((error) => {
        logger.error(
          `Failed to unmount micro-frontend "${name}" during disposal`,
          error instanceof Error ? error : new Error(String(error)),
        )
      })
    }

    // Bersihkan interval
    if (this.versionCheckInterval) {
      clearInterval(this.versionCheckInterval)
      this.versionCheckInterval = null
    }

    // Bersihkan state
    this.manifests.clear()
    this.instances.clear()
    this.mountPoints.clear()

    logger.info("Micro-frontend registry disposed")
  }
}

/**
 * Komponen React untuk memasang micro-frontend
 */
export function MicroFrontend({
  name,
  container,
  props,
}: {
  name: string
  container: HTMLElement | null
  props?: any
}) {
  React.useEffect(() => {
    if (!container) return

    const registry = MicroFrontendRegistry.getInstance()

    // Pasang micro-frontend
    registry.mount(name, container, props).catch((error) => {
      logger.error(
        `Failed to mount micro-frontend "${name}" in React component`,
        error instanceof Error ? error : new Error(String(error)),
      )
    })

    // Cleanup saat komponen unmount
    return () => {
      registry.unmount(name).catch((error) => {
        logger.error(
          `Failed to unmount micro-frontend "${name}" in React component`,
          error instanceof Error ? error : new Error(String(error)),
        )
      })
    }
  }, [name, container])

  React.useEffect(() => {
    if (!container) return

    const registry = MicroFrontendRegistry.getInstance()

    // Update props saat berubah
    registry.update(name, props).catch((error) => {
      logger.error(
        `Failed to update micro-frontend "${name}" in React component`,
        error instanceof Error ? error : new Error(String(error)),
      )
    })
  }, [props])

  return null
}

