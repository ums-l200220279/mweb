"use client"

import type React from "react"

import { useEffect, useRef } from "react"

/**
 * Accessibility utility functions for Memoright
 * These utilities help ensure the application is accessible to all users
 */

/**
 * Ensures proper focus management for modals and dialogs
 * @param isOpen Whether the modal is open
 * @param initialFocusRef Ref to the element that should receive focus when the modal opens
 * @returns Ref to the element that had focus before the modal opened
 */
export function useFocusTrap(isOpen: boolean, initialFocusRef?: React.RefObject<HTMLElement>) {
  const previousFocusRef = useRef<HTMLElement | null>(null)

  useEffect(() => {
    if (isOpen) {
      // Store the currently focused element
      previousFocusRef.current = document.activeElement as HTMLElement

      // Focus the initial element if provided, otherwise focus the first focusable element
      if (initialFocusRef?.current) {
        initialFocusRef.current.focus()
      } else {
        const focusableElements = document.querySelectorAll(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
        )

        if (focusableElements.length > 0) {
          ;(focusableElements[0] as HTMLElement).focus()
        }
      }

      // Trap focus within the modal
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === "Tab") {
          const focusableElements = document.querySelectorAll(
            'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
          )

          if (focusableElements.length === 0) return

          const firstElement = focusableElements[0] as HTMLElement
          const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement

          if (e.shiftKey && document.activeElement === firstElement) {
            e.preventDefault()
            lastElement.focus()
          } else if (!e.shiftKey && document.activeElement === lastElement) {
            e.preventDefault()
            firstElement.focus()
          }
        }
      }

      document.addEventListener("keydown", handleKeyDown)

      return () => {
        document.removeEventListener("keydown", handleKeyDown)
      }
    } else if (previousFocusRef.current) {
      // Restore focus when modal closes
      previousFocusRef.current.focus()
    }
  }, [isOpen, initialFocusRef])

  return previousFocusRef
}

/**
 * Announces messages to screen readers using ARIA live regions
 * @param message The message to announce
 * @param priority The priority of the announcement (polite or assertive)
 */
export function announceToScreenReader(message: string, priority: "polite" | "assertive" = "polite") {
  // Check if the live region already exists
  let liveRegion = document.getElementById(`sr-live-${priority}`)

  // Create the live region if it doesn't exist
  if (!liveRegion) {
    liveRegion = document.createElement("div")
    liveRegion.id = `sr-live-${priority}`
    liveRegion.setAttribute("aria-live", priority)
    liveRegion.setAttribute("aria-atomic", "true")
    liveRegion.classList.add("sr-only")
    document.body.appendChild(liveRegion)
  }

  // Clear the live region (this is necessary for some screen readers)
  liveRegion.textContent = ""

  // Set the message after a small delay to ensure it's announced
  setTimeout(() => {
    liveRegion!.textContent = message
  }, 50)
}

/**
 * Hook to announce messages to screen readers
 * @param message The message to announce
 * @param priority The priority of the announcement (polite or assertive)
 * @param deps Dependencies that trigger the announcement when changed
 */
export function useAnnounce(
  message: string,
  priority: "polite" | "assertive" = "polite",
  deps: React.DependencyList = [],
) {
  useEffect(() => {
    if (message) {
      announceToScreenReader(message, priority)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps)
}

/**
 * Checks if high contrast mode is enabled
 * @returns Whether high contrast mode is enabled
 */
export function isHighContrastMode(): boolean {
  if (typeof window === "undefined") return false

  // Check for Windows high contrast mode
  const isHighContrast = window.matchMedia("(-ms-high-contrast: active)").matches

  // Check for forced colors mode (newer browsers)
  const isForcedColors = window.matchMedia("(forced-colors: active)").matches

  return isHighContrast || isForcedColors
}

/**
 * Hook to detect high contrast mode
 * @returns Whether high contrast mode is enabled
 */
export function useHighContrastMode(): boolean {
  const [isHighContrast, setIsHighContrast] = useState(false)

  useEffect(() => {
    // Check initial state
    setIsHighContrast(isHighContrastMode())

    // Listen for changes
    const mediaQueryList = window.matchMedia("(forced-colors: active)")

    const handleChange = (e: MediaQueryListEvent) => {
      setIsHighContrast(e.matches)
    }

    // Add event listener (with compatibility check)
    if (mediaQueryList.addEventListener) {
      mediaQueryList.addEventListener("change", handleChange)
    } else {
      // Fallback for older browsers
      mediaQueryList.addListener(handleChange)
    }

    // Clean up
    return () => {
      if (mediaQueryList.removeEventListener) {
        mediaQueryList.removeEventListener("change", handleChange)
      } else {
        // Fallback for older browsers
        mediaQueryList.removeListener(handleChange)
      }
    }
  }, [])

  return isHighContrast
}

/**
 * Generates an accessible label for a chart or graph
 * @param title The title of the chart
 * @param description A description of what the chart shows
 * @param data The data represented in the chart
 * @returns An accessible label for the chart
 */
export function generateChartA11yLabel(
  title: string,
  description: string,
  data: { label: string; value: number }[],
): string {
  let label = `${title}. ${description}. `

  // Add data points to the label
  data.forEach((point, index) => {
    label += `${point.label}: ${point.value}`

    if (index < data.length - 2) {
      label += ", "
    } else if (index === data.length - 2) {
      label += ", and "
    }
  })

  return label
}

/**
 * Checks if reduced motion is preferred
 * @returns Whether reduced motion is preferred
 */
export function prefersReducedMotion(): boolean {
  if (typeof window === "undefined") return false

  return window.matchMedia("(prefers-reduced-motion: reduce)").matches
}

/**
 * Hook to detect reduced motion preference
 * @returns Whether reduced motion is preferred
 */
export function useReducedMotion(): boolean {
  const [prefersReduced, setPrefersReduced] = useState(false)

  useEffect(() => {
    // Check initial state
    setPrefersReduced(prefersReducedMotion())

    // Listen for changes
    const mediaQueryList = window.matchMedia("(prefers-reduced-motion: reduce)")

    const handleChange = (e: MediaQueryListEvent) => {
      setPrefersReduced(e.matches)
    }

    // Add event listener (with compatibility check)
    if (mediaQueryList.addEventListener) {
      mediaQueryList.addEventListener("change", handleChange)
    } else {
      // Fallback for older browsers
      mediaQueryList.addListener(handleChange)
    }

    // Clean up
    return () => {
      if (mediaQueryList.removeEventListener) {
        mediaQueryList.removeEventListener("change", handleChange)
      } else {
        // Fallback for older browsers
        mediaQueryList.removeListener(handleChange)
      }
    }
  }, [])

  return prefersReduced
}

// Import React's useState for the hooks
import { useState } from "react"

