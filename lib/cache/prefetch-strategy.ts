"use client"

import type { QueryClient } from "@tanstack/react-query"

/**
 * Prefetching strategy for common routes
 * Loads data in background to make navigation instant
 */

export async function prefetchAuthUser(
  queryClient: QueryClient,
  fetchFn: () => Promise<any>,
  queryKey: readonly unknown[],
) {
  await queryClient.prefetchQuery({
    queryKey: queryKey as any,
    queryFn: fetchFn,
    staleTime: 1000 * 60 * 10, // 10 minutes
  })
}

export async function prefetchHomeData(
  queryClient: QueryClient,
  userId: string,
  fetchFn: (userId: string) => Promise<any>,
  queryKey: readonly unknown[],
) {
  await queryClient.prefetchQuery({
    queryKey: queryKey as any,
    queryFn: () => fetchFn(userId),
    staleTime: 1000 * 60 * 5, // 5 minutes
  })
}
