"use client"

import type React from "react"

import { useState } from "react"
import { z } from "zod"
import { formatZodErrors } from "@/lib/validation"

interface UseFormValidationOptions<T> {
  onSuccess?: (data: T) => void
  onError?: (errors: Record<string, string>) => void
}

/**
 * Hook untuk validasi form yang konsisten
 */
export function useFormValidation<T extends z.ZodType>(schema: T, options?: UseFormValidationOptions<z.infer<T>>) {
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  const validateField = (name: string, value: unknown) => {
    try {
      // Buat skema parsial untuk validasi field tunggal
      const fieldSchema = z.object({ [name]: schema.shape[name] })
      fieldSchema.parse({ [name]: value })

      // Hapus error jika validasi berhasil
      setErrors((prev) => {
        const newErrors = { ...prev }
        delete newErrors[name]
        return newErrors
      })

      return true
    } catch (error) {
      if (error instanceof z.ZodError) {
        const fieldErrors = formatZodErrors(error)

        setErrors((prev) => ({
          ...prev,
          ...fieldErrors,
        }))
      }

      return false
    }
  }

  const validateForm = (data: unknown): data is z.infer<T> => {
    try {
      schema.parse(data)
      setErrors({})
      return true
    } catch (error) {
      if (error instanceof z.ZodError) {
        const formattedErrors = formatZodErrors(error)
        setErrors(formattedErrors)
        options?.onError?.(formattedErrors)
      }

      return false
    }
  }

  const handleSubmit = async (onSubmit: (data: z.infer<T>) => Promise<void> | void) => {
    return async (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault()
      setIsSubmitting(true)

      try {
        const formData = new FormData(event.currentTarget)
        const data = Object.fromEntries(formData.entries())

        // Validasi form
        if (validateForm(data)) {
          await onSubmit(data as z.infer<T>)
          options?.onSuccess?.(data as z.infer<T>)
        }
      } finally {
        setIsSubmitting(false)
      }
    }
  }

  return {
    errors,
    isSubmitting,
    validateField,
    validateForm,
    handleSubmit,
  }
}

