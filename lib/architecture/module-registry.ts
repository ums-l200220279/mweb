/**
 * Module Registry untuk Memoright
 *
 * Sistem modular untuk mendaftarkan dan mengelola fitur-fitur aplikasi.
 * Memungkinkan lazy-loading dan feature flags.
 */

import { container } from "./dependency-injection"

export interface ModuleDefinition {
  id: string
  name: string
  description: string
  version: string
  dependencies?: string[]
  initialize: () => Promise<void>
  enabled?: boolean
  featureFlag?: string
}

export class ModuleRegistry {
  private static instance: ModuleRegistry
  private modules: Map<string, ModuleDefinition> = new Map()
  private initializedModules: Set<string> = new Set()

  private constructor() {}

  /**
   * Mendapatkan instance singleton dari registry
   */
  public static getInstance(): ModuleRegistry {
    if (!ModuleRegistry.instance) {
      ModuleRegistry.instance = new ModuleRegistry()
    }
    return ModuleRegistry.instance
  }

  /**
   * Mendaftarkan modul baru
   */
  public register(module: ModuleDefinition): void {
    if (this.modules.has(module.id)) {
      throw new Error(`Module already registered: ${module.id}`)
    }
    this.modules.set(module.id, module)
  }

  /**
   * Mendapatkan modul berdasarkan ID
   */
  public getModule(id: string): ModuleDefinition | undefined {
    return this.modules.get(id)
  }

  /**
   * Mendapatkan semua modul yang terdaftar
   */
  public getAllModules(): ModuleDefinition[] {
    return Array.from(this.modules.values())
  }

  /**
   * Mengaktifkan modul
   */
  public enableModule(id: string): void {
    const module = this.modules.get(id)
    if (!module) {
      throw new Error(`Module not found: ${id}`)
    }
    module.enabled = true
    this.modules.set(id, module)
  }

  /**
   * Menonaktifkan modul
   */
  public disableModule(id: string): void {
    const module = this.modules.get(id)
    if (!module) {
      throw new Error(`Module not found: ${id}`)
    }
    module.enabled = false
    this.modules.set(id, module)
  }

  /**
   * Memeriksa apakah modul diaktifkan
   */
  public isModuleEnabled(id: string): boolean {
    const module = this.modules.get(id)
    if (!module) {
      return false
    }

    // Periksa feature flag jika ada
    if (module.featureFlag) {
      const featureFlagService = container.resolve<any>("featureFlagService")
      if (featureFlagService && !featureFlagService.isEnabled(module.featureFlag)) {
        return false
      }
    }

    return module.enabled !== false
  }

  /**
   * Menginisialisasi modul dan dependensinya
   */
  public async initializeModule(id: string): Promise<void> {
    if (this.initializedModules.has(id)) {
      return
    }

    const module = this.modules.get(id)
    if (!module) {
      throw new Error(`Module not found: ${id}`)
    }

    if (!this.isModuleEnabled(id)) {
      throw new Error(`Module is disabled: ${id}`)
    }

    // Inisialisasi dependensi terlebih dahulu
    if (module.dependencies && module.dependencies.length > 0) {
      for (const depId of module.dependencies) {
        await this.initializeModule(depId)
      }
    }

    // Inisialisasi modul
    await module.initialize()
    this.initializedModules.add(id)
  }

  /**
   * Menginisialisasi semua modul yang diaktifkan
   */
  public async initializeAllModules(): Promise<void> {
    const modules = this.getAllModules().filter((m) => this.isModuleEnabled(m.id))

    // Urutkan modul berdasarkan dependensi
    const sortedModules = this.topologicalSort(modules)

    for (const module of sortedModules) {
      if (!this.initializedModules.has(module.id)) {
        await module.initialize()
        this.initializedModules.add(module.id)
      }
    }
  }

  /**
   * Mengurutkan modul berdasarkan dependensi menggunakan topological sort
   */
  private topologicalSort(modules: ModuleDefinition[]): ModuleDefinition[] {
    const result: ModuleDefinition[] = []
    const visited = new Set<string>()
    const temp = new Set<string>()

    // Fungsi rekursif untuk DFS
    const visit = (moduleId: string) => {
      if (temp.has(moduleId)) {
        throw new Error(`Circular dependency detected: ${moduleId}`)
      }
      if (visited.has(moduleId)) {
        return
      }

      const module = this.modules.get(moduleId)
      if (!module) {
        throw new Error(`Module not found: ${moduleId}`)
      }

      temp.add(moduleId)

      if (module.dependencies) {
        for (const depId of module.dependencies) {
          visit(depId)
        }
      }

      temp.delete(moduleId)
      visited.add(moduleId)
      result.push(module)
    }

    // Mulai DFS dari setiap modul
    for (const module of modules) {
      if (!visited.has(module.id)) {
        visit(module.id)
      }
    }

    return result
  }

  /**
   * Reset registry (terutama untuk testing)
   */
  public reset(): void {
    this.modules.clear()
    this.initializedModules.clear()
  }
}

// Singleton instance untuk digunakan di seluruh aplikasi
export const moduleRegistry = ModuleRegistry.getInstance()

