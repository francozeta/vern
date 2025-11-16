"use client"

import { useQuery } from "@tanstack/react-query"
import { createBrowserSupabaseClient } from "@/lib/supabase/client"

interface UserProfileData {
  profile: any
  reviews: any[]
  isFollowing: boolean
  followersCount: number
  followingCount: number
  followers: any[]
  following: any[]
}

async function fetchUserProfile(username: string, currentUserId: string | null): Promise<UserProfileData> {
  const supabase = createBrowserSupabaseClient()

  const { data: profile, error } = await supabase
    .from("profiles")
    .select(
      "id,username,display_name,bio,avatar_url,banner_url,role,is_verified,website_url,spotify_url,instagram_url,created_at",
    )
    .eq("username", username)
    .single()

  if (error || !profile) {
    throw new Error("Profile not found")
  }

  const [reviewsResult, followCountsResult, followersResult, followingResult, followStatusResult] = await Promise.all([
    supabase
      .from("reviews")
      .select("id,title,rating,content,created_at,song_title,song_artist,song_album,song_cover_url")
      .eq("user_id", profile.id)
      .order("created_at", { ascending: false })
      .limit(6),

    supabase.from("follows").select("id", { count: "exact" }).eq("following_id", profile.id),

    supabase
      .from("follows")
      .select(
        `
        follower_id,
        profiles:follower_id(id, username, display_name, avatar_url, role, is_verified)
      `,
      )
      .eq("following_id", profile.id)
      .limit(20),

    supabase
      .from("follows")
      .select(
        `
        following_id,
        profiles:following_id(id, username, display_name, avatar_url, role, is_verified)
      `,
      )
      .eq("follower_id", profile.id)
      .limit(20),

    currentUserId && currentUserId !== profile.id
      ? supabase.from("follows").select("id").eq("follower_id", currentUserId).eq("following_id", profile.id).single()
      : Promise.resolve({ data: null }),
  ])

  return {
    profile,
    reviews: reviewsResult.data || [],
    isFollowing: !!followStatusResult.data,
    followersCount: followCountsResult.count || 0,
    followingCount: followingResult.data?.length || 0,
    followers: followersResult.data || [],
    following: followingResult.data || [],
  }
}

export function useUserProfile(username: string, currentUserId: string | null) {
  return useQuery({
    queryKey: ["user-profile", username, currentUserId],
    queryFn: () => fetchUserProfile(username, currentUserId),
    // Users will see cached data instantly on navigation, bg refetch happens every 15min
    staleTime: 1000 * 60 * 15,
    gcTime: 1000 * 60 * 60,
  })
}
