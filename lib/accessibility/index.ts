"use client"

import { useEffect, useState } from "react"

/**
 * Tipe untuk pengaturan aksesibilitas
 */
export interface AccessibilitySettings {
  fontSize: "normal" | "large" | "x-large"
  contrast: "normal" | "high"
  reducedMotion: boolean
  screenReader: boolean
  keyboardNavigation: boolean
  simplifiedUI: boolean
}

/**
 * Default pengaturan aksesibilitas
 */
export const defaultAccessibilitySettings: AccessibilitySettings = {
  fontSize: "normal",
  contrast: "normal",
  reducedMotion: false,
  screenReader: false,
  keyboardNavigation: false,
  simplifiedUI: false,
}

/**
 * Hook untuk mengelola pengaturan aksesibilitas
 */
export function useAccessibilitySettings(): [
  AccessibilitySettings,
  (settings: Partial<AccessibilitySettings>) => void,
] {
  const [settings, setSettings] = useState<AccessibilitySettings>(() => {
    // Ambil pengaturan dari localStorage jika ada
    if (typeof window !== "undefined") {
      const savedSettings = localStorage.getItem("accessibility-settings")
      if (savedSettings) {
        try {
          return JSON.parse(savedSettings)
        } catch (e) {
          console.error("Failed to parse accessibility settings:", e)
        }
      }
    }
    return defaultAccessibilitySettings
  })

  // Simpan pengaturan ke localStorage saat berubah
  useEffect(() => {
    localStorage.setItem("accessibility-settings", JSON.stringify(settings))

    // Terapkan pengaturan ke dokumen
    applyAccessibilitySettings(settings)
  }, [settings])

  // Fungsi untuk memperbarui pengaturan
  const updateSettings = (newSettings: Partial<AccessibilitySettings>) => {
    setSettings((prev) => ({
      ...prev,
      ...newSettings,
    }))
  }

  return [settings, updateSettings]
}

/**
 * Terapkan pengaturan aksesibilitas ke dokumen
 */
function applyAccessibilitySettings(settings: AccessibilitySettings) {
  const html = document.documentElement

  // Font size
  html.style.fontSize = settings.fontSize === "normal" ? "16px" : settings.fontSize === "large" ? "20px" : "24px"

  // High contrast
  if (settings.contrast === "high") {
    html.classList.add("high-contrast")
  } else {
    html.classList.remove("high-contrast")
  }

  // Reduced motion
  if (settings.reducedMotion) {
    html.classList.add("reduced-motion")
  } else {
    html.classList.remove("reduced-motion")
  }

  // Simplified UI
  if (settings.simplifiedUI) {
    html.classList.add("simplified-ui")
  } else {
    html.classList.remove("simplified-ui")
  }

  // Keyboard navigation
  if (settings.keyboardNavigation) {
    html.classList.add("keyboard-navigation")
  } else {
    html.classList.remove("keyboard-navigation")
  }
}

/**
 * Hook untuk mendeteksi preferensi aksesibilitas sistem
 */
export function useSystemAccessibilityPreferences() {
  const [preferences, setPreferences] = useState({
    prefersReducedMotion: false,
    prefersHighContrast: false,
  })

  useEffect(() => {
    // Deteksi preferensi reduced motion
    const reducedMotionQuery = window.matchMedia("(prefers-reduced-motion: reduce)")
    setPreferences((prev) => ({
      ...prev,
      prefersReducedMotion: reducedMotionQuery.matches,
    }))

    // Deteksi preferensi high contrast
    const highContrastQuery = window.matchMedia("(prefers-contrast: more)")
    setPreferences((prev) => ({
      ...prev,
      prefersHighContrast: highContrastQuery.matches,
    }))

    // Listener untuk perubahan preferensi
    const handleReducedMotionChange = (e: MediaQueryListEvent) => {
      setPreferences((prev) => ({
        ...prev,
        prefersReducedMotion: e.matches,
      }))
    }

    const handleHighContrastChange = (e: MediaQueryListEvent) => {
      setPreferences((prev) => ({
        ...prev,
        prefersHighContrast: e.matches,
      }))
    }

    reducedMotionQuery.addEventListener("change", handleReducedMotionChange)
    highContrastQuery.addEventListener("change", handleHighContrastChange)

    return () => {
      reducedMotionQuery.removeEventListener("change", handleReducedMotionChange)
      highContrastQuery.removeEventListener("change", handleHighContrastChange)
    }
  }, [])

  return preferences
}

