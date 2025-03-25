"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"

interface CsrfFormProps {
  children: React.ReactNode
  action: string
  method?: "GET" | "POST"
  onSubmit?: (e: React.FormEvent<HTMLFormElement>) => void
  className?: string
}

export function CsrfForm({ children, action, method = "POST", onSubmit, className }: CsrfFormProps) {
  const [csrfToken, setCsrfToken] = useState<string>("")
  const router = useRouter()

  useEffect(() => {
    // Fetch CSRF token when component mounts
    const fetchCsrfToken = async () => {
      try {
        const response = await fetch("/api/auth/csrf")
        const data = await response.json()
        setCsrfToken(data.csrfToken)
      } catch (error) {
        console.error("Failed to fetch CSRF token:", error)
      }
    }

    fetchCsrfToken()
  }, [])

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    if (onSubmit) {
      onSubmit(e)
      return
    }

    // Default form submission with CSRF token
    const formData = new FormData(e.currentTarget)

    try {
      const response = await fetch(action, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(Object.fromEntries(formData)),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || "Something went wrong")
      }

      const data = await response.json()

      // Handle redirect if provided
      if (data.redirect) {
        router.push(data.redirect)
      }
    } catch (error) {
      console.error("Form submission error:", error)
    }
  }

  return (
    <form onSubmit={handleSubmit} className={className} method={method} action={action}>
      <input type="hidden" name="csrfToken" value={csrfToken} />
      {children}
    </form>
  )
}

