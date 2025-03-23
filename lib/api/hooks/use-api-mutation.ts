/**
 * API Mutation Hook
 *
 * This file provides a custom hook for making API mutations using React Query.
 * It handles loading, error, and success states for data modifications.
 */

import { useMutation, type UseMutationOptions, useQueryClient } from "@tanstack/react-query"
import { apiClient, type ApiError } from "../api-client"

type HttpMethod = "POST" | "PUT" | "PATCH" | "DELETE"

interface UseApiMutationOptions<TData, TVariables, TError>
  extends Omit<UseMutationOptions<TData, TError, TVariables>, "mutationFn"> {
  method?: HttpMethod
  invalidateQueries?: string[]
}

export function useApiMutation<TData = unknown, TVariables = unknown, TError = ApiError>(
  endpoint: string,
  options?: UseApiMutationOptions<TData, TVariables, TError>,
) {
  const { method = "POST", invalidateQueries, ...mutationOptions } = options || {}
  const queryClient = useQueryClient()

  return useMutation<TData, TError, TVariables>({
    mutationFn: async (variables) => {
      switch (method) {
        case "POST":
          return apiClient.post<TData>(endpoint, variables)
        case "PUT":
          return apiClient.put<TData>(endpoint, variables)
        case "PATCH":
          return apiClient.patch<TData>(endpoint, variables)
        case "DELETE":
          return apiClient.delete<TData>(endpoint)
        default:
          return apiClient.post<TData>(endpoint, variables)
      }
    },
    onSuccess: (data, variables, context) => {
      // Invalidate relevant queries after successful mutation
      if (invalidateQueries) {
        invalidateQueries.forEach((query) => {
          queryClient.invalidateQueries({ queryKey: [query] })
        })
      }

      // Call the original onSuccess if provided
      if (mutationOptions.onSuccess) {
        mutationOptions.onSuccess(data, variables, context)
      }
    },
    ...mutationOptions,
  })
}

