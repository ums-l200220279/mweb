"use client"

import type React from "react"

/**
 * Micro-Frontend Registry
 *
 * This module provides a centralized registry for micro-frontends in the application.
 * It handles dynamic loading, versioning, and communication between micro-frontends.
 */

import { createContext, useContext, useEffect, useState } from "react"
import { logEvent } from "@/lib/analytics/analytics"
import { logger } from "@/lib/monitoring/logger"

export type MicroFrontendManifest = {
  name: string
  version: string
  entry: string
  dependencies: Record<string, string>
  assets: string[]
  routes: string[]
  permissions: string[]
}

export type MicroFrontendInstance = {
  manifest: MicroFrontendManifest
  Component: React.ComponentType<any>
  loaded: boolean
  error: Error | null
}

type MicroFrontendRegistry = {
  register: (manifest: MicroFrontendManifest) => void
  unregister: (name: string) => void
  get: (name: string) => MicroFrontendInstance | undefined
  getAll: () => Record<string, MicroFrontendInstance>
  load: (name: string) => Promise<MicroFrontendInstance>
}

const initialRegistry: Record<string, MicroFrontendInstance> = {}

const MicroFrontendRegistryContext = createContext<MicroFrontendRegistry | null>(null)

export const MicroFrontendRegistryProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [registry, setRegistry] = useState<Record<string, MicroFrontendInstance>>(initialRegistry)

  const register = (manifest: MicroFrontendManifest) => {
    logger.info(`Registering micro-frontend: ${manifest.name}@${manifest.version}`)

    setRegistry((prev) => ({
      ...prev,
      [manifest.name]: {
        manifest,
        Component: () => null,
        loaded: false,
        error: null,
      },
    }))

    logEvent("micro_frontend_registered", {
      name: manifest.name,
      version: manifest.version,
    })
  }

  const unregister = (name: string) => {
    logger.info(`Unregistering micro-frontend: ${name}`)

    setRegistry((prev) => {
      const newRegistry = { ...prev }
      delete newRegistry[name]
      return newRegistry
    })

    logEvent("micro_frontend_unregistered", { name })
  }

  const get = (name: string) => registry[name]

  const getAll = () => registry

  const load = async (name: string): Promise<MicroFrontendInstance> => {
    const instance = registry[name]

    if (!instance) {
      const error = new Error(`Micro-frontend not found: ${name}`)
      logger.error(error)
      throw error
    }

    if (instance.loaded) {
      return instance
    }

    try {
      logger.info(`Loading micro-frontend: ${name}@${instance.manifest.version}`)

      // In a real implementation, this would dynamically import the micro-frontend
      // For demonstration purposes, we're simulating the loading
      const Component = await new Promise<React.ComponentType<any>>((resolve) => {
        setTimeout(() => {
          resolve(() => <div>Micro-frontend: {name}</div>)
        }, 500)
      })

      const updatedInstance = {
        ...instance,
        Component,
        loaded: true,
      }

      setRegistry((prev) => ({
        ...prev,
        [name]: updatedInstance,
      }))

      logEvent("micro_frontend_loaded", {
        name,
        version: instance.manifest.version,
        loadTime: 500, // In a real implementation, measure actual load time
      })

      return updatedInstance
    } catch (error) {
      logger.error(`Failed to load micro-frontend: ${name}`, error)

      const updatedInstance = {
        ...instance,
        error: error as Error,
      }

      setRegistry((prev) => ({
        ...prev,
        [name]: updatedInstance,
      }))

      logEvent("micro_frontend_load_failed", {
        name,
        version: instance.manifest.version,
        error: (error as Error).message,
      })

      throw error
    }
  }

  return (
    <MicroFrontendRegistryContext.Provider value={{ register, unregister, get, getAll, load }}>
      {children}
    </MicroFrontendRegistryContext.Provider>
  )
}

export const useMicroFrontendRegistry = () => {
  const context = useContext(MicroFrontendRegistryContext)

  if (!context) {
    throw new Error("useMicroFrontendRegistry must be used within a MicroFrontendRegistryProvider")
  }

  return context
}

export const useMicroFrontend = (name: string) => {
  const registry = useMicroFrontendRegistry()
  const [instance, setInstance] = useState<MicroFrontendInstance | undefined>(registry.get(name))
  const [loading, setLoading] = useState(!instance?.loaded)
  const [error, setError] = useState<Error | null>(instance?.error || null)

  useEffect(() => {
    if (!instance?.loaded && !loading) {
      setLoading(true)

      registry
        .load(name)
        .then((loadedInstance) => {
          setInstance(loadedInstance)
          setLoading(false)
        })
        .catch((err) => {
          setError(err as Error)
          setLoading(false)
        })
    }
  }, [instance, loading, name, registry])

  return { instance, loading, error }
}

