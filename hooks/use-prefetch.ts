"use client"

import { useQueryClient } from "@tanstack/react-query"
import { useCallback } from "react"
import { CACHE_KEYS } from "@/lib/cache/cache-keys"

export function usePrefetchUserProfile(username: string) {
  const queryClient = useQueryClient()

  return useCallback(() => {
    queryClient.prefetchQuery({
      queryKey: CACHE_KEYS.USER_PROFILE(username),
      staleTime: 1000 * 60 * 10,
    })
  }, [queryClient, username])
}

export function usePrefetchReviews() {
  const queryClient = useQueryClient()

  return useCallback(() => {
    queryClient.prefetchQuery({
      queryKey: CACHE_KEYS.REVIEWS_ALL(null),
      staleTime: 1000 * 60 * 5,
    })
  }, [queryClient])
}

export function usePrefetchUserReviews(userId: string) {
  const queryClient = useQueryClient()

  return useCallback(() => {
    if (!userId) return
    queryClient.prefetchQuery({
      queryKey: CACHE_KEYS.USER_REVIEWS(userId),
      staleTime: 1000 * 60 * 5,
    })
  }, [queryClient, userId])
}

export function usePrefetchSongs(userId?: string) {
  const queryClient = useQueryClient()

  return useCallback(() => {
    queryClient.prefetchQuery({
      queryKey: CACHE_KEYS.SONGS(userId),
      staleTime: 1000 * 60 * 10,
    })
  }, [queryClient, userId])
}
