"use client"

import { useQuery, useQueryClient } from "@tanstack/react-query"
import { useEffect, useState } from "react"
import { getCacheData, setCacheData } from "@/lib/cache/cookie-cache"
import { CACHE_KEYS } from "@/lib/cache/cache-keys"
import { createBrowserClient } from "@supabase/ssr"

interface AuthUser {
  id: string
  email: string
  username: string
  display_name: string | null
  avatar_url: string | null
  banner_url: string | null
  bio: string | null
  role: "listener" | "artist" | "both"
  is_verified: boolean
  location: string | null
  website_url: string | null
  spotify_url: string | null
  instagram_url: string | null
  created_at: string
}

/**
 * Fetch user data from Supabase
 */
async function fetchAuthUser(): Promise<AuthUser | null> {
  try {
    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    )

    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (!session?.user?.id) {
      return null
    }

    const { data: profile, error } = await supabase.from("profiles").select("*").eq("id", session.user.id).single()

    if (error) throw error

    return profile as AuthUser
  } catch (error) {
    console.error("[useCachedAuthUser] Error fetching user:", error)
    return null
  }
}

/**
 * Hook that loads user data from cache first, then syncs with DB
 * Dramatically reduces page load time by avoiding initial DB query
 */
export function useCachedAuthUser() {
  const queryClient = useQueryClient()
  const [isHydrated, setIsHydrated] = useState(false)

  useEffect(() => {
    const cachedUser = getCacheData<AuthUser>(CACHE_KEYS.AUTH_USER)
    if (cachedUser) {
      queryClient.setQueryData([CACHE_KEYS.AUTH_USER], cachedUser)
    }
    setIsHydrated(true)
  }, [queryClient])

  // Query for actual data (with SWR pattern)
  const {
    data: user,
    isLoading,
    refetch,
    status,
  } = useQuery({
    queryKey: [CACHE_KEYS.AUTH_USER],
    queryFn: fetchAuthUser,
    staleTime: 1000 * 60 * 10, // 10 minutes
    gcTime: 1000 * 60 * 60, // 1 hour cache
    enabled: isHydrated, // Only fetch after hydration
  })

  useEffect(() => {
    if (user) {
      setCacheData(CACHE_KEYS.AUTH_USER, user, { expirationMinutes: 24 * 60 })
    }
  }, [user])

  return {
    user: user ?? null,
    isLoading: isLoading && status === "pending" && !isHydrated,
    isHydrated,
    refetch,
  }
}
