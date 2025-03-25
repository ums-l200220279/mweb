"use client"

import { useState } from "react"
import { toast } from "@/components/ui/use-toast"

interface ApiOptions<T> {
  onSuccess?: (data: T) => void
  onError?: (error: Error) => void
  successMessage?: string
}

/**
 * Hook untuk penanganan error yang konsisten di sisi klien
 */
export function useApi<T>() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)
  const [data, setData] = useState<T | null>(null)

  const execute = async <U>(\
    apiCall: () => Promise<U>,
    options?: ApiOptions<U>
  )
  : Promise<U | null> =>
  setIsLoading(true)
  setError(null)

  try {
    const result = await apiCall()
    setData(result as unknown as T)

    if (options?.successMessage) {
      toast({
        title: "Success",
        description: options.successMessage,
        variant: "success",
      })
    }

    options?.onSuccess?.(result)
    return result
  } catch (err) {
    // Ekstrak pesan error dari respons API
    let errorMessage = "An unexpected error occurred"
    let errorDetails: Record<string, any> | undefined

    if (err instanceof Response) {
      try {
        const errorData = await err.json()
        errorMessage = errorData.error || errorMessage
        errorDetails = errorData.details
      } catch {
        // Fallback jika respons tidak dapat di-parse sebagai JSON
        errorMessage = err.statusText || errorMessage
      }
    } else if (err instanceof Error) {
      errorMessage = err.message
    }

    const error = new Error(errorMessage)
    setError(error)

    // Tampilkan toast error
    toast({
      title: "Error",
      description: errorMessage,
      variant: "destructive",
    })

    options?.onError?.(error)
    return null
  } finally {
    setIsLoading(false)
  }

  return {
    execute,
    isLoading,
    error,
    data,
  }
}

