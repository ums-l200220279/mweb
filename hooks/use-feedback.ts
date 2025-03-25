"use client"

import { useToast } from "@/components/ui/use-toast"
import { useCallback } from "react"

/**
 * Hook untuk sistem feedback yang konsisten di seluruh aplikasi
 */
export function useFeedback() {
  const { toast } = useToast()

  const success = useCallback(
    (message: string, title = "Success") => {
      toast({
        title,
        description: message,
        variant: "default",
        className: "bg-success text-success-foreground",
        duration: 3000,
      })
    },
    [toast],
  )

  const error = useCallback(
    (message: string, title = "Error") => {
      toast({
        title,
        description: message,
        variant: "destructive",
        duration: 5000,
      })
    },
    [toast],
  )

  const warning = useCallback(
    (message: string, title = "Warning") => {
      toast({
        title,
        description: message,
        variant: "default",
        className: "bg-warning text-warning-foreground",
        duration: 4000,
      })
    },
    [toast],
  )

  const info = useCallback(
    (message: string, title = "Information") => {
      toast({
        title,
        description: message,
        variant: "default",
        duration: 4000,
      })
    },
    [toast],
  )

  return {
    success,
    error,
    warning,
    info,
  }
}

