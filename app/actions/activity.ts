"use server"

import { createServerSupabaseClient } from "@/lib/supabase/server"

export async function getFollowingActivity(userId: string, limit = 10, offset = 0) {
  const supabase = await createServerSupabaseClient()

  // Get users that the current user is following
  const { data: followingData } = await supabase.from("follows").select("following_id").eq("follower_id", userId)

  if (!followingData || followingData.length === 0) {
    return { activities: [] }
  }

  const followingIds = followingData.map((f) => f.following_id)

  // Get recent reviews from followed users
  const { data: reviews, error } = await supabase
    .from("reviews")
    .select(`
      *,
      profiles!reviews_user_id_fkey (
        id,
        username,
        display_name,
        avatar_url,
        is_verified,
        role
      )
    `)
    .in("user_id", followingIds)
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1)

  if (error) {
    console.error("Get following activity error:", error)
    return { activities: [], error: "Failed to fetch activity" }
  }

  // Transform reviews into activity items
  const activities = (reviews || []).map((review) => ({
    id: review.id,
    type: "review" as const,
    user: review.profiles,
    content: {
      review_id: review.id,
      song_title: review.song_title,
      song_artist: review.song_artist,
      song_cover_url: review.song_cover_url,
      rating: review.rating,
      title: review.title,
      content: review.content,
    },
    created_at: review.created_at,
  }))

  return { activities }
}

export async function getRecentActivity(limit = 20, offset = 0) {
  const supabase = await createServerSupabaseClient()

  // Get recent reviews from all users
  const { data: reviews, error } = await supabase
    .from("reviews")
    .select(`
      *,
      profiles!reviews_user_id_fkey (
        id,
        username,
        display_name,
        avatar_url,
        is_verified,
        role
      )
    `)
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1)

  if (error) {
    console.error("Get recent activity error:", error)
    return { activities: [], error: "Failed to fetch activity" }
  }

  // Transform reviews into activity items
  const activities = (reviews || []).map((review) => ({
    id: review.id,
    type: "review" as const,
    user: review.profiles,
    content: {
      review_id: review.id,
      song_title: review.song_title,
      song_artist: review.song_artist,
      song_cover_url: review.song_cover_url,
      rating: review.rating,
      title: review.title,
      content: review.content,
    },
    created_at: review.created_at,
  }))

  return { activities }
}
