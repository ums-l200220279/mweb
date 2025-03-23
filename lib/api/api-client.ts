/**
 * API Client
 *
 * This file provides a centralized client for making API requests.
 * It handles authentication, error handling, and request formatting.
 */

import { getSession } from "next-auth/react"

interface FetchOptions extends RequestInit {
  params?: Record<string, string | number | boolean | undefined>
}

class ApiError extends Error {
  status: number
  data: any

  constructor(message: string, status: number, data?: any) {
    super(message)
    this.name = "ApiError"
    this.status = status
    this.data = data
  }
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "/api"

async function fetchWithAuth(endpoint: string, options: FetchOptions = {}) {
  const { params, ...fetchOptions } = options

  // Add query parameters if provided
  let url = `${API_BASE_URL}${endpoint}`
  if (params) {
    const searchParams = new URLSearchParams()
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) {
        searchParams.append(key, String(value))
      }
    })
    url += `?${searchParams.toString()}`
  }

  // Get authentication token
  const session = await getSession()
  const headers = new Headers(fetchOptions.headers)

  // Add auth header if session exists
  if (session?.accessToken) {
    headers.set("Authorization", `Bearer ${session.accessToken}`)
  }

  // Add default headers
  if (!headers.has("Content-Type") && !(fetchOptions.body instanceof FormData)) {
    headers.set("Content-Type", "application/json")
  }
  headers.set("Accept", "application/json")

  // Make the request
  const response = await fetch(url, {
    ...fetchOptions,
    headers,
  })

  // Handle non-JSON responses
  const contentType = response.headers.get("content-type")
  if (contentType && !contentType.includes("application/json")) {
    if (!response.ok) {
      throw new ApiError(response.statusText, response.status)
    }
    return response
  }

  // Parse JSON response
  const data = await response.json()

  // Handle error responses
  if (!response.ok) {
    throw new ApiError(data.message || response.statusText, response.status, data)
  }

  return data
}

export const apiClient = {
  get: <T>(endpoint: string, options?: FetchOptions) => 
    fetchWithAuth(endpoint, { ...options, method: 'GET' }) as Promise<T>,
    
  post: <T>(endpoint: string, data?: any, options?: FetchOptions) =>
    fetchWithAuth(endpoint, {
      ...options,
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    }) as Promise<T>,
    
  put: <T>(endpoint: string, data?: any, options?: FetchOptions) =>
    fetchWithAuth(endpoint, {
      ...options,
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    }) as Promise<T>,
    
  patch: <T>(endpoint: string, data?: any, options?: FetchOptions) =>
    fetchWithAuth(endpoint, {
      ...options,
      method: 'PATCH',
      body: data ? JSON.stringify(data) : undefined,
    }) as Promise<T>,
    
  delete: <T>(endpoint: string, options?: FetchOptions) =>
    fetchWithAuth(endpoint, { ...options, method: 'DELETE' }) as Promise<T>,
    
  upload: <T>(endpoint: string, formData: FormData, options?: FetchOptions) =>
    fetchWithAuth(endpoint, {
      ...options,
      method: 'POST',
      body: formData,
    }) as Promise<T>,
}

export { ApiError }

