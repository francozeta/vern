"use client"

import { useQuery } from "@tanstack/react-query"
import { createBrowserSupabaseClient } from "@/lib/supabase/client"

interface Profile {
  id: string
  username: string
  display_name: string | null
  avatar_url: string | null
  bio: string | null
  role: "listener" | "artist" | "both"
}

interface HomeData {
  profile: Profile
  reviewCount: number
  followingCount: number
  followersCount: number
  recentSongs: any[]
}

async function fetchHomeData(userId: string): Promise<HomeData> {
  const supabase = createBrowserSupabaseClient()

  const [profileResult, reviewCountResult, followingResult, followersResult, songsResult] = await Promise.all([
    supabase.from("profiles").select("id, username, display_name, avatar_url, bio, role").eq("id", userId).single(),
    supabase.from("reviews").select("*", { count: "exact", head: true }).eq("user_id", userId),
    supabase.from("follows").select("*", { count: "exact", head: true }).eq("follower_id", userId),
    supabase.from("follows").select("*", { count: "exact", head: true }).eq("following_id", userId),
    supabase.from("songs").select("*").limit(8),
  ])

  const profile: Profile = profileResult.data
    ? {
        id: profileResult.data.id,
        username: profileResult.data.username,
        display_name: profileResult.data.display_name,
        avatar_url: profileResult.data.avatar_url,
        bio: profileResult.data.bio,
        role: profileResult.data.role,
      }
    : {
        id: userId,
        username: "Unknown",
        display_name: null,
        avatar_url: null,
        bio: null,
        role: "listener",
      }

  return {
    profile,
    reviewCount: reviewCountResult.count || 0,
    followingCount: followingResult.count || 0,
    followersCount: followersResult.count || 0,
    recentSongs: songsResult.data || [],
  }
}

export function useHomeData(userId?: string) {
  return useQuery({
    queryKey: ["home", userId],
    queryFn: () => fetchHomeData(userId!),
    enabled: !!userId,
    staleTime: 1000 * 60 * 2,
    gcTime: 1000 * 60 * 10,
  })
}
