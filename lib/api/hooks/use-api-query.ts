/**
 * API Query Hook
 *
 * This file provides a custom hook for making API queries using React Query.
 * It handles loading, error, and success states.
 */

import { useQuery, type UseQueryOptions } from "@tanstack/react-query"
import { apiClient, type ApiError } from "../api-client"

interface UseApiQueryOptions<TData, TError>
  extends Omit<UseQueryOptions<TData, TError, TData, string[]>, "queryKey" | "queryFn"> {
  params?: Record<string, string | number | boolean | undefined>
}

export function useApiQuery<TData = unknown, TError = ApiError>(
  endpoint: string,
  options?: UseApiQueryOptions<TData, TError>,
) {
  const { params, ...queryOptions } = options || {}

  return useQuery<TData, TError, TData, string[]>({
    queryKey: [endpoint, JSON.stringify(params)],
    queryFn: () => apiClient.get<TData>(endpoint, { params }),
    ...queryOptions,
  })
}

