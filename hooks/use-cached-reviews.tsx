"use client"

import { useQuery, useInfiniteQuery } from "@tanstack/react-query"
import { getUserReviews, getAllReviews } from "@/app/actions/reviews"
import { CACHE_KEYS } from "@/lib/cache/cache-keys"
import { getCacheData, setCacheData } from "@/lib/cache/cookie-cache"

interface Review {
  id: string
  title: string
  content: string
  rating: number | null
  created_at: string
  user_id: string
  song_id: string
  song_title: string
  song_artist: string
  song_album: string
  song_cover_url: string | null
  song_preview_url: string | null
  profiles?: { [key: string]: any }
  likeCount: number
  isLiked: boolean
  commentCount: number
  isFollowing: boolean
}

export function useCachedUserReviews(userId: string | null, enabled = true) {
  const cacheKey = CACHE_KEYS.USER_REVIEWS(userId || "")
  const cacheNamespace = `user-reviews-${userId}`

  const cachedData = enabled && userId ? getCacheData<Review[]>(cacheNamespace) : null

  const query = useQuery({
    queryKey: cacheKey,
    queryFn: async () => {
      if (!userId) return []
      const result = await getUserReviews(userId)
      const data = result.reviews || []
      if (data && Array.isArray(data)) {
        setCacheData(cacheNamespace, data)
      }
      return data
    },
    enabled: enabled && !!userId,
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 15, // 15 minutes
    initialData: cachedData || undefined,
    initialDataUpdatedAt: cachedData ? Date.now() : undefined,
  })

  return {
    ...query,
    data: query.data || cachedData || [],
  }
}

export function useCachedAllReviews(enabled = true) {
  const cacheKey = CACHE_KEYS.REVIEWS_ALL(null)
  const cacheNamespace = "reviews-all"

  const cachedData = enabled ? getCacheData<Review[]>(cacheNamespace) : null

  const query = useInfiniteQuery({
    queryKey: cacheKey,
    queryFn: async ({ pageParam = 0 }) => {
      const result = await getAllReviews(10, pageParam * 10)
      const data = result.reviews || []
      if (data && Array.isArray(data) && pageParam === 0) {
        // Only cache first page
        setCacheData(cacheNamespace, data)
      }
      return data
    },
    initialPageParam: 0,
    getNextPageParam: (lastPage, allPages) => {
      return lastPage.length === 10 ? allPages.length : undefined
    },
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 15,
  })

  return query
}
