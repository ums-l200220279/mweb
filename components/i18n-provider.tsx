"use client"

import { createContext, useContext, type ReactNode } from "react"
import type { Locale, Messages } from "@/lib/i18n/config"

type I18nContextType = {
  locale: Locale
  messages: Messages
  formatMessage: (id: string, values?: Record<string, string | number>) => string
}

const I18nContext = createContext<I18nContextType | null>(null)

export function useI18n() {
  const context = useContext(I18nContext)
  if (!context) {
    throw new Error("useI18n must be used within an I18nProvider")
  }
  return context
}

type I18nProviderProps = {
  locale: Locale
  messages: Messages
  children: ReactNode
}

export function I18nProvider({ locale, messages, children }: I18nProviderProps) {
  const formatMessage = (id: string, values?: Record<string, string | number>) => {
    const path = id.split(".")
    let message: any = messages

    for (const key of path) {
      if (message && typeof message === "object" && key in message) {
        message = message[key]
      } else {
        return id // Fallback to the ID if message not found
      }
    }

    if (typeof message !== "string") {
      return id
    }

    // Replace placeholders with values
    if (values) {
      return Object.entries(values).reduce(
        (msg, [key, value]) => msg.replace(new RegExp(`{${key}}`, "g"), String(value)),
        message,
      )
    }

    return message
  }

  return <I18nContext.Provider value={{ locale, messages, formatMessage }}>{children}</I18nContext.Provider>
}

