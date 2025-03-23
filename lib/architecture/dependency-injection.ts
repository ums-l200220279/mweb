/**
 * Dependency Injection Container untuk Memoright
 *
 * Implementasi container dependency injection yang kuat
 * dengan dukungan untuk siklus hidup, lazy loading, dan
 * resolusi otomatis.
 */

import { logger } from "@/lib/logger"

export type ServiceFactory<T = any> = () => T
export type ServiceResolver<T = any> = () => Promise<T>

export interface ServiceRegistration<T = any> {
  id: string
  factory: ServiceFactory<T>
  instance?: T
  singleton: boolean
  lazy: boolean
  dependencies: string[]
  resolver?: ServiceResolver<T>
  resolving?: boolean
}

export interface ContainerOptions {
  autoResolve?: boolean
  enableCircularCheck?: boolean
}

/**
 * Decorator untuk mendaftarkan service ke container
 */
export function Service(
  id: string,
  options: {
    singleton?: boolean
    lazy?: boolean
    dependencies?: string[]
  } = {},
) {
  return (target: any) => {
    // Daftarkan service ke container
    container.register(
      id,
      () => {
        return new target()
      },
      {
        singleton: options.singleton !== false,
        lazy: options.lazy !== false,
        dependencies: options.dependencies || [],
      },
    )

    return target
  }
}

class DependencyInjectionContainer {
  private services: Map<string, ServiceRegistration> = new Map()
  private options: ContainerOptions
  private initialized = false

  constructor(options: ContainerOptions = {}) {
    this.options = {
      autoResolve: true,
      enableCircularCheck: true,
      ...options,
    }
  }

  /**
   * Mendaftarkan service ke container
   */
  public register<T>(
    id: string,
    factory: ServiceFactory<T>,
    options: {
      singleton?: boolean
      lazy?: boolean
      dependencies?: string[]
    } = {},
  ): void {
    if (this.services.has(id)) {
      logger.warn(`Service with id "${id}" is already registered. It will be overwritten.`)
    }

    this.services.set(id, {
      id,
      factory,
      singleton: options.singleton !== false,
      lazy: options.lazy !== false,
      dependencies: options.dependencies || [],
    })

    logger.debug(`Service "${id}" registered`)
  }

  /**
   * Mendapatkan service dari container
   */
  public resolve<T>(id: string): T {
    const registration = this.services.get(id)

    if (!registration) {
      throw new Error(`Service with id "${id}" is not registered`)
    }

    // Jika singleton dan instance sudah ada, kembalikan instance
    if (registration.singleton && registration.instance) {
      return registration.instance as T
    }

    // Jika lazy dan resolver belum dibuat, buat resolver
    if (registration.lazy && !registration.resolver) {
      registration.resolver = this.createResolver<T>(registration)
    }

    // Jika lazy, resolve service
    if (registration.lazy && registration.resolver) {
      // Periksa circular dependency
      if (this.options.enableCircularCheck && registration.resolving) {
        throw new Error(`Circular dependency detected when resolving "${id}"`)
      }

      registration.resolving = true

      try {
        // Resolve service secara sinkron
        const instance = registration.factory() as T

        // Jika singleton, simpan instance
        if (registration.singleton) {
          registration.instance = instance
        }

        registration.resolving = false

        return instance
      } catch (error) {
        registration.resolving = false
        throw error
      }
    }

    // Jika tidak lazy, buat instance baru
    const instance = registration.factory() as T

    // Jika singleton, simpan instance
    if (registration.singleton) {
      registration.instance = instance
    }

    return instance
  }

  /**
   * Mendapatkan service dari container secara asinkron
   */
  public async resolveAsync<T>(id: string): Promise<T> {
    const registration = this.services.get(id)

    if (!registration) {
      throw new Error(`Service with id "${id}" is not registered`)
    }

    // Jika singleton dan instance sudah ada, kembalikan instance
    if (registration.singleton && registration.instance) {
      return registration.instance as T
    }

    // Jika lazy dan resolver belum dibuat, buat resolver
    if (registration.lazy && !registration.resolver) {
      registration.resolver = this.createResolver<T>(registration)
    }

    // Jika lazy, resolve service
    if (registration.lazy && registration.resolver) {
      // Periksa circular dependency
      if (this.options.enableCircularCheck && registration.resolving) {
        throw new Error(`Circular dependency detected when resolving "${id}"`)
      }

      registration.resolving = true

      try {
        // Resolve service secara asinkron
        const instance = await registration.resolver()

        // Jika singleton, simpan instance
        if (registration.singleton) {
          registration.instance = instance
        }

        registration.resolving = false

        return instance
      } catch (error) {
        registration.resolving = false
        throw error
      }
    }

    // Jika tidak lazy, buat instance baru
    const instance = registration.factory() as T

    // Jika singleton, simpan instance
    if (registration.singleton) {
      registration.instance = instance
    }

    return instance
  }

  /**
   * Membuat resolver untuk service
   */
  private createResolver<T>(registration: ServiceRegistration): ServiceResolver<T> {
    return async () => {
      // Resolve dependencies
      for (const dependencyId of registration.dependencies) {
        await this.resolveAsync(dependencyId)
      }

      // Buat instance
      return registration.factory() as T
    }
  }

  /**
   * Memeriksa apakah service terdaftar
   */
  public has(id: string): boolean {
    return this.services.has(id)
  }

  /**
   * Menghapus service dari container
   */
  public remove(id: string): boolean {
    return this.services.delete(id)
  }

  /**
   * Membersihkan semua service
   */
  public clear(): void {
    this.services.clear()
  }

  /**
   * Mendapatkan semua service yang terdaftar
   */
  public getRegistrations(): ServiceRegistration[] {
    return Array.from(this.services.values())
  }

  /**
   * Inisialisasi container
   */
  public async initialize(): Promise<void> {
    if (this.initialized) {
      return
    }

    if (this.options.autoResolve) {
      // Resolve semua service yang tidak lazy
      for (const [id, registration] of this.services.entries()) {
        if (!registration.lazy) {
          await this.resolveAsync(id)
        }
      }
    }

    this.initialized = true
    logger.info("Dependency injection container initialized")
  }

  /**
   * Membersihkan resources saat container dihentikan
   */
  public dispose(): void {
    // Bersihkan semua instance
    for (const registration of this.services.values()) {
      if (registration.instance && typeof (registration.instance as any).dispose === "function") {
        try {
          ;(registration.instance as any).dispose()
        } catch (error) {
          logger.error(
            `Failed to dispose service "${registration.id}"`,
            error instanceof Error ? error : new Error(String(error)),
          )
        }
      }

      registration.instance = undefined
      registration.resolver = undefined
      registration.resolving = false
    }

    this.initialized = false
    logger.info("Dependency injection container disposed")
  }
}

// Singleton instance untuk digunakan di seluruh aplikasi
export const container = new DependencyInjectionContainer()

