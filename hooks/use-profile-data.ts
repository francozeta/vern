"use client"

import { useState, useEffect } from "react"
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

export function useProfileData(
  username: string,
  initialData?: {
    profile: ProfileData
    stats: ProfileStats
    reviews: any[]
  },
): UseProfileDataReturn {
  const [profile, setProfile] = useState<ProfileData | null>(initialData?.profile || null)
  const [stats, setStats] = useState<ProfileStats | null>(initialData?.stats || null)
  const [reviews, setReviews] = useState<any[]>(initialData?.reviews || [])
  const [isLoading, setIsLoading] = useState(!initialData)
  const [error, setError] = useState<string | null>(null)

  const fetchProfileData = async () => {
    if (!username) return

    try {
      setIsLoading(true)
      setError(null)

      const supabase = createBrowserSupabaseClient()

      // Fetch profile data
      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select("*")
        .eq("username", username)
        .single()

      if (profileError) {
        throw new Error("Profile not found")
      }

      setProfile(profileData)

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

      setStats({
        followersCount: followersResult.count || 0,
        followingCount: followingResult.count || 0,
        reviewsCount: reviewsCountResult.count || 0,
      })

      setReviews(reviewsResult.data || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  const refetch = async () => {
    await fetchProfileData()
  }

  useEffect(() => {
    if (!initialData) {
      fetchProfileData()
    }
  }, [username])

  return {
    profile,
    stats,
    reviews,
    isLoading,
    error,
    refetch,
  }
}
