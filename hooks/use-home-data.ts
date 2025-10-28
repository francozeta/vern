"use client"

import { useQuery } from "@tanstack/react-query"
import { createBrowserSupabaseClient } from "@/lib/supabase/client"

interface HomeData {
  profile: {
    id: string
    username: string
    display_name: string | null
    avatar_url: string | null
    bio: string | null
    role: "listener" | "artist" | "both"
  }
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

  return {
    profile: profileResult.data || {},
    reviewCount: reviewCountResult.count || 0,
    followingCount: followingResult.count || 0,
    followersCount: followersResult.count || 0,
    recentSongs: songsResult.data || [],
  }
}

export function useHomeData(userId: string | null) {
  return useQuery({
    queryKey: ["home", userId],
    queryFn: () => fetchHomeData(userId!),
    enabled: !!userId,
    staleTime: 60_000,
  })
}
