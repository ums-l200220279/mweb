/**
 * Infinite API Query Hook
 *
 * This file provides a custom hook for making paginated API queries using React Query.
 * It handles loading more data and infinite scrolling scenarios.
 */

import { useInfiniteQuery, type UseInfiniteQueryOptions } from "@tanstack/react-query"
import { apiClient, type ApiError } from "../api-client"

interface PaginatedResponse<TData> {
  data: TData[]
  meta: {
    currentPage: number
    totalPages: number
    totalItems: number
    itemsPerPage: number
  }
}

interface UseInfiniteApiQueryOptions<TData, TError>
  extends Omit<
    UseInfiniteQueryOptions<
      PaginatedResponse<TData>,
      TError,
      PaginatedResponse<TData>,
      PaginatedResponse<TData>,
      string[]
    >,
    "queryKey" | "queryFn" | "getNextPageParam"
  > {
  pageParam?: string
  limit?: number
}

export function useInfiniteApiQuery<TData = unknown, TError = ApiError>(
  endpoint: string,
  options?: UseInfiniteApiQueryOptions<TData, TError>,
) {
  const { pageParam = "page", limit = 10, ...queryOptions } = options || {}

  return useInfiniteQuery<PaginatedResponse<TData>, TError, PaginatedResponse<TData>, string[]>({
    queryKey: [endpoint, String(limit)],
    queryFn: ({ pageParam = 1 }) => {
      return apiClient.get<PaginatedResponse<TData>>(endpoint, {
        params: {
          [pageParam]: pageParam,
          limit,
        },
      })
    },
    getNextPageParam: (lastPage) => {
      const { currentPage, totalPages } = lastPage.meta
      return currentPage < totalPages ? currentPage + 1 : undefined
    },
    ...queryOptions,
  })
}

