"use client"

import { useQueryClient } from "@tanstack/react-query"
import { useCallback } from "react"
import { CACHE_KEYS } from "@/lib/cache/cache-keys"

export function usePrefetchUserProfile(username: string) {
  const queryClient = useQueryClient()

  return useCallback(() => {
    queryClient.prefetchQuery({
      queryKey: CACHE_KEYS.USER_PROFILE(username),
      queryFn: () => fetch(`/api/users/profile/${username}`).then((r) => r.json()),
      staleTime: 1000 * 60 * 20,
    })
  }, [queryClient, username])
}

export function usePrefetchReviews() {
  const queryClient = useQueryClient()

  return useCallback(() => {
    queryClient.prefetchQuery({
      queryKey: CACHE_KEYS.REVIEWS_ALL(null),
      queryFn: () => fetch("/api/reviews").then((r) => r.json()),
      staleTime: 1000 * 60 * 15,
    })
  }, [queryClient])
}

export function usePrefetchUserReviews(userId: string) {
  const queryClient = useQueryClient()

  return useCallback(() => {
    if (!userId) return
    queryClient.prefetchQuery({
      queryKey: CACHE_KEYS.USER_REVIEWS(userId),
      queryFn: () => fetch(`/api/users/${userId}/reviews`).then((r) => r.json()),
      staleTime: 1000 * 60 * 15,
    })
  }, [queryClient, userId])
}

export function usePrefetchSongs(userId?: string) {
  const queryClient = useQueryClient()

  return useCallback(() => {
    queryClient.prefetchQuery({
      queryKey: CACHE_KEYS.SONGS(userId),
      queryFn: () => {
        const url = userId ? `/api/songs?artistId=${userId}` : "/api/songs"
        return fetch(url).then((r) => r.json())
      },
      staleTime: 1000 * 60 * 20,
    })
  }, [queryClient, userId])
}

export function usePrefetchDeezerSearch(query: string) {
  const queryClient = useQueryClient()

  return useCallback(() => {
    if (!query) return
    queryClient.prefetchQuery({
      queryKey: CACHE_KEYS.SEARCH_DEEZER(query),
      queryFn: () => fetch(`/api/deezer/search?q=${encodeURIComponent(query)}&limit=20`).then((r) => r.json()),
      staleTime: 1000 * 60 * 30,
    })
  }, [queryClient, query])
}
