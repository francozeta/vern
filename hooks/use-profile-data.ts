"use client"

import { useQuery, useQueryClient } from "@tanstack/react-query"
import { useEffect } from "react"
import { createBrowserSupabaseClient } from "@/lib/supabase/client"

export interface ProfileData {
  id: string
  username: string
  display_name: string | null
  bio: string | null
  avatar_url: string | null
  banner_url: string | null
  role: "listener" | "artist" | "both"
  is_verified: boolean
  location: string | null
  website_url: string | null
  spotify_url: string | null
  instagram_url: string | null
  created_at: string
}

export interface ProfileStats {
  followersCount: number
  followingCount: number
  reviewsCount: number
}

export interface UseProfileDataReturn {
  profile: ProfileData | null
  stats: ProfileStats | null
  reviews: any[]
  isLoading: boolean
  error: string | null
  refetch: () => Promise<void>
}

async function fetchProfileData(
  username: string,
  supabase: any,
): Promise<{
  profile: ProfileData
  stats: ProfileStats
  reviews: any[]
}> {
  if (!username) throw new Error("Username is required")

  const { data: profileData, error: profileError } = await supabase
    .from("profiles")
    .select("*")
    .eq("username", username)
    .single()

  if (profileError) {
    throw new Error("Profile not found")
  }

  const [followersResult, followingResult, reviewsResult, reviewsCountResult] = await Promise.all([
    supabase.from("follows").select("id", { count: "exact" }).eq("following_id", profileData.id),
    supabase.from("follows").select("id", { count: "exact" }).eq("follower_id", profileData.id),
    supabase
      .from("reviews")
      .select("*")
      .eq("user_id", profileData.id)
      .order("created_at", { ascending: false })
      .limit(20),
    supabase.from("reviews").select("id", { count: "exact" }).eq("user_id", profileData.id),
  ])

  return {
    profile: profileData,
    stats: {
      followersCount: followersResult.count || 0,
      followingCount: followingResult.count || 0,
      reviewsCount: reviewsCountResult.count || 0,
    },
    reviews: reviewsResult.data || [],
  }
}

export function useProfileData(
  username: string,
  initialData?: {
    profile: ProfileData
    stats: ProfileStats
    reviews: any[]
  },
): UseProfileDataReturn {
  const supabase = createBrowserSupabaseClient()
  const qc = useQueryClient()
  const queryKey = ["user-profile", username]

  const { data, isLoading, error } = useQuery({
    queryKey,
    queryFn: () => fetchProfileData(username, supabase),
    initialData,
    staleTime: 1000 * 60 * 2, // 2 minutes
    refetchOnWindowFocus: false,
    retry: 1,
  })

  useEffect(() => {
    if (!data?.profile?.id) return

    const channel = supabase
      .channel(`profile-${data.profile.id}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "profiles",
          filter: `id=eq.${data.profile.id}`,
        },
        (payload: any) => {
          if (payload.new) {
            qc.setQueryData(queryKey, (prev: any) => ({
              ...prev,
              profile: payload.new,
            }))
          }
        },
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [data?.profile?.id, qc, supabase])

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        qc.invalidateQueries({ queryKey, refetchType: "active" })
      }
    }

    document.addEventListener("visibilitychange", handleVisibilityChange)
    return () => document.removeEventListener("visibilitychange", handleVisibilityChange)
  }, [qc])

  const refetch = async () => {
    await qc.invalidateQueries({ queryKey })
  }

  return {
    profile: data?.profile || null,
    stats: data?.stats || null,
    reviews: data?.reviews || [],
    isLoading,
    error: error ? (error instanceof Error ? error.message : "An error occurred") : null,
    refetch,
  }
}
