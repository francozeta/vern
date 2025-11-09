"use client"

import { useEffect, useRef } from "react"
import { useQueryClient } from "@tanstack/react-query"
import { CACHE_KEYS } from "@/lib/cache/cache-keys"

type PrefetchType = "profile" | "reviews" | "songs" | "home-data"

interface PrefetchConfig {
  type: PrefetchType
  params?: Record<string, string | string[]>
  delay?: number
}

export function useRouterPrefetch() {
  const queryClient = useQueryClient()
  const prefetchTimeoutRef = useRef<Map<string, NodeJS.Timeout>>(new Map())

  const prefetch = async (config: PrefetchConfig) => {
    const { type, params = {}, delay = 0 } = config

    const executePrefetch = async () => {
      try {
        switch (type) {
          case "profile": {
            const username = params.username as string
            if (!username) return

            await queryClient.prefetchQuery({
              queryKey: CACHE_KEYS.USER_PROFILE(username),
              queryFn: async () => {
                const res = await fetch(`/api/users/${username}`)
                if (!res.ok) throw new Error("Failed to fetch profile")
                return res.json()
              },
              staleTime: 1000 * 60 * 5,
            })
            break
          }

          case "reviews": {
            const id = params.id as string
            if (!id) return

            await queryClient.prefetchQuery({
              queryKey: CACHE_KEYS.REVIEWS_BY_SONG(id),
              queryFn: async () => {
                const res = await fetch(`/api/reviews?songId=${id}`)
                if (!res.ok) throw new Error("Failed to fetch reviews")
                return res.json()
              },
              staleTime: 1000 * 60 * 3,
            })
            break
          }

          case "songs": {
            const artistId = params.artistId as string
            if (!artistId) return

            await queryClient.prefetchQuery({
              queryKey: CACHE_KEYS.SONGS(artistId),
              queryFn: async () => {
                const res = await fetch(`/api/songs?artistId=${artistId}`)
                if (!res.ok) throw new Error("Failed to fetch songs")
                return res.json()
              },
              staleTime: 1000 * 60 * 5,
            })
            break
          }

          case "home-data": {
            const userId = params.userId as string
            if (!userId) return

            await queryClient.prefetchQuery({
              queryKey: CACHE_KEYS.HOME_DATA(userId),
              queryFn: async () => {
                const res = await fetch(`/api/home?userId=${userId}`)
                if (!res.ok) throw new Error("Failed to fetch home data")
                return res.json()
              },
              staleTime: 1000 * 60 * 3,
            })
            break
          }

          default:
            break
        }
      } catch (error) {
        console.error(`[v0] Prefetch error for ${type}:`, error)
      }
    }

    if (delay > 0) {
      const key = `${type}:${JSON.stringify(params)}`
      const existingTimeout = prefetchTimeoutRef.current.get(key)
      if (existingTimeout) clearTimeout(existingTimeout)

      const timeout = setTimeout(() => {
        executePrefetch()
        prefetchTimeoutRef.current.delete(key)
      }, delay)

      prefetchTimeoutRef.current.set(key, timeout)
    } else {
      await executePrefetch()
    }
  }

  useEffect(() => {
    return () => {
      prefetchTimeoutRef.current.forEach((timeout) => clearTimeout(timeout))
      prefetchTimeoutRef.current.clear()
    }
  }, [])

  return { prefetch }
}
