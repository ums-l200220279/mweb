"use client"

import { useState, useEffect } from "react"

interface AccessibilityPreferences {
  fontSize?: number
  highContrast?: boolean
  reduceMotion?: boolean
  speechRate?: number
  speechPitch?: number
  textToSpeech?: boolean
  screenReader?: boolean
  keyboardNavigation?: boolean
}

export function useAccessibility() {
  const [preferences, setPreferences] = useState<AccessibilityPreferences | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const loadPreferences = async () => {
      try {
        // Try to load from localStorage first
        const savedPrefs = localStorage.getItem("accessibility-preferences")

        if (savedPrefs) {
          setPreferences(JSON.parse(savedPrefs))
        } else {
          // If not in localStorage, try to fetch from API
          const response = await fetch("/api/user/accessibility-preferences")

          if (response.ok) {
            const data = await response.json()
            setPreferences(data)

            // Save to localStorage for faster access next time
            localStorage.setItem("accessibility-preferences", JSON.stringify(data))
          } else {
            // Default preferences if nothing is found
            const defaultPrefs: AccessibilityPreferences = {
              fontSize: 1,
              highContrast: false,
              reduceMotion: false,
              speechRate: 1,
              speechPitch: 1,
              textToSpeech: false,
              screenReader: false,
              keyboardNavigation: false,
            }

            setPreferences(defaultPrefs)
            localStorage.setItem("accessibility-preferences", JSON.stringify(defaultPrefs))
          }
        }
      } catch (error) {
        console.error("Error loading accessibility preferences:", error)

        // Set default preferences on error
        const defaultPrefs: AccessibilityPreferences = {
          fontSize: 1,
          highContrast: false,
          reduceMotion: false,
          speechRate: 1,
          speechPitch: 1,
          textToSpeech: false,
          screenReader: false,
          keyboardNavigation: false,
        }

        setPreferences(defaultPrefs)
      } finally {
        setIsLoading(false)
      }
    }

    loadPreferences()
  }, [])

  const updatePreferences = async (newPreferences: Partial<AccessibilityPreferences>) => {
    try {
      const updatedPreferences = { ...preferences, ...newPreferences }

      // Update localStorage
      localStorage.setItem("accessibility-preferences", JSON.stringify(updatedPreferences))

      // Update state
      setPreferences(updatedPreferences)

      // Send to API
      await fetch("/api/user/accessibility-preferences", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updatedPreferences),
      })

      return true
    } catch (error) {
      console.error("Error updating accessibility preferences:", error)
      return false
    }
  }

  const resetPreferences = async () => {
    try {
      const defaultPrefs: AccessibilityPreferences = {
        fontSize: 1,
        highContrast: false,
        reduceMotion: false,
        speechRate: 1,
        speechPitch: 1,
        textToSpeech: false,
        screenReader: false,
        keyboardNavigation: false,
      }

      // Update localStorage
      localStorage.setItem("accessibility-preferences", JSON.stringify(defaultPrefs))

      // Update state
      setPreferences(defaultPrefs)

      // Send to API
      await fetch("/api/user/accessibility-preferences", {
        method: "DELETE",
      })

      return true
    } catch (error) {
      console.error("Error resetting accessibility preferences:", error)
      return false
    }
  }

  return {
    preferences,
    isLoading,
    updatePreferences,
    resetPreferences,
  }
}

