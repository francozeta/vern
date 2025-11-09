"use client"

import { useQuery } from "@tanstack/react-query"
import { getUserProfile } from "@/app/actions/users"
import { CACHE_KEYS } from "@/lib/cache/cache-keys"
import { getCacheData, setCacheData } from "@/lib/cache/cookie-cache"

interface UserProfile {
  id: string
  username: string
  display_name: string | null
  bio: string | null
  avatar_url: string | null
  banner_url: string | null
  role: "listener" | "artist" | "both"
  location: string | null
  is_verified: boolean
  followers_count?: number
  following_count?: number
  review_count?: number
}

export function useCachedUserProfile(username: string, enabled = true) {
  const cacheKey = CACHE_KEYS.USER_PROFILE(username)
  const cacheNamespace = `user-profile-${username}`

  const cachedData = enabled ? getCacheData<UserProfile>(cacheNamespace) : null

  const query = useQuery({
    queryKey: cacheKey,
    queryFn: async () => {
      const data = await getUserProfile(username)
      if (data) {
        setCacheData(cacheNamespace, data)
      }
      return data
    },
    enabled,
    staleTime: 1000 * 60 * 10,
    gcTime: 1000 * 60 * 30,
    initialData: cachedData || null,
  })

  return {
    ...query,
    data: query.data || cachedData,
  }
}
