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

  const { data: reviews, error } = await supabase
    .from("reviews")
    .select(`
      id,
      title,
      content,
      rating,
      created_at,
      song_title,
      song_artist,
      song_cover_url,
      song_preview_url,
      user_id,
      profiles (
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
    return await getFollowingActivityFallback(followingIds, limit, offset)
  }

  // Transform reviews into activity items
  const activities = (reviews || []).map((review: any) => ({
    id: review.id,
    type: "review" as const,
    user: review.profiles,
    content: {
      review_id: review.id,
      song_title: review.song_title,
      song_artist: review.song_artist,
      song_cover_url: review.song_cover_url,
      song_preview_url: review.song_preview_url,
      rating: review.rating,
      title: review.title,
      content: review.content,
    },
    created_at: review.created_at,
  }))

  return { activities }
}

async function getFollowingActivityFallback(followingIds: string[], limit: number, offset: number) {
  const supabase = await createServerSupabaseClient()

  const { data: reviews, error } = await supabase
    .from("reviews")
    .select("*")
    .in("user_id", followingIds)
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1)

  if (error) {
    console.error("Fallback following activity error:", error)
    return { activities: [], error: "Failed to fetch activity" }
  }

  if (!reviews || reviews.length === 0) {
    return { activities: [] }
  }

  // Get unique user IDs
  const userIds = [...new Set(reviews.map((review: any) => review.user_id))]

  // Fetch profiles separately
  const { data: profiles } = await supabase
    .from("profiles")
    .select("id, username, display_name, avatar_url, is_verified, role")
    .in("id", userIds)

  // Create profile map
  const profileMap = new Map()
  profiles?.forEach((profile: any) => {
    profileMap.set(profile.id, profile)
  })

  // Combine reviews with profiles
  const activities = reviews.map((review: any) => ({
    id: review.id,
    type: "review" as const,
    user: profileMap.get(review.user_id) || null,
    content: {
      review_id: review.id,
      song_title: review.song_title,
      song_artist: review.song_artist,
      song_cover_url: review.song_cover_url,
      song_preview_url: review.song_preview_url,
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

  const { data: reviews, error } = await supabase
    .from("reviews")
    .select(`
      id,
      title,
      content,
      rating,
      created_at,
      song_title,
      song_artist,
      song_cover_url,
      song_preview_url,
      user_id,
      profiles (
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

  // If foreign key relationship works, return the result
  if (!error) {
    const activities = (reviews || []).map((review: any) => ({
      id: review.id,
      type: "review" as const,
      user: review.profiles,
      content: {
        review_id: review.id,
        song_title: review.song_title,
        song_artist: review.song_artist,
        song_cover_url: review.song_cover_url,
        song_preview_url: review.song_preview_url,
        rating: review.rating,
        title: review.title,
        content: review.content,
      },
      created_at: review.created_at,
    }))

    return { activities }
  }

  console.log("Using fallback method for recent activity")
  const { data: fallbackReviews, error: fallbackError } = await supabase
    .from("reviews")
    .select("*")
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1)

  if (fallbackError) {
    console.error("Get recent activity error:", fallbackError)
    return { activities: [], error: "Failed to fetch activity" }
  }

  if (!fallbackReviews || fallbackReviews.length === 0) {
    return { activities: [] }
  }

  // Get unique user IDs
  const userIds = [...new Set(fallbackReviews.map((review: any) => review.user_id))]

  // Fetch profiles separately
  const { data: profiles } = await supabase
    .from("profiles")
    .select("id, username, display_name, avatar_url, is_verified, role")
    .in("id", userIds)

  // Create profile map
  const profileMap = new Map()
  profiles?.forEach((profile: any) => {
    profileMap.set(profile.id, profile)
  })

  // Combine reviews with profiles
  const activities = fallbackReviews.map((review: any) => ({
    id: review.id,
    type: "review" as const,
    user: profileMap.get(review.user_id) || null,
    content: {
      review_id: review.id,
      song_title: review.song_title,
      song_artist: review.song_artist,
      song_cover_url: review.song_cover_url,
      song_preview_url: review.song_preview_url,
      rating: review.rating,
      title: review.title,
      content: review.content,
    },
    created_at: review.created_at,
  }))

  return { activities }
}

export async function getEnhancedActivity(userId: string, limit = 10, offset = 0, showFollowingOnly = false) {
  const supabase = await createServerSupabaseClient()

  // Step 1: Get base activities
  let result
  if (showFollowingOnly) {
    result = await getFollowingActivity(userId, limit, offset)
  } else {
    result = await getRecentActivity(limit, offset)
  }

  if (!result.activities || result.activities.length === 0) {
    return { activities: [] }
  }

  // Step 2: Extract review IDs for batch queries
  const reviewIds = result.activities.map((a: any) => a.content?.review_id).filter((id: any) => id !== undefined)

  const userIds = result.activities.map((a: any) => a.user?.id).filter((id: any) => id !== undefined)

  if (reviewIds.length === 0 || userIds.length === 0) {
    console.warn("[v0] No valid review or user IDs found in activities")
    return { activities: result.activities }
  }

  // Step 3: Batch fetch likes, comments, and follows (3 queries instead of 30+)
  const [likesData, commentsData, followsData] = await Promise.all([
    supabase
      .from("likes")
      .select("review_id, count(*)")
      .in("review_id", reviewIds)
      .then((res) => {
        if (res.error) return {}
        const map: Record<string, number> = {}
        res.data?.forEach((item: any) => {
          map[item.review_id] = item.count || 0
        })
        return map
      }),
    supabase
      .from("review_comments")
      .select("review_id, count(*)")
      .in("review_id", reviewIds)
      .then((res) => {
        if (res.error) return {}
        const map: Record<string, number> = {}
        res.data?.forEach((item: any) => {
          map[item.review_id] = item.count || 0
        })
        return map
      }),
    supabase
      .from("follows")
      .select("following_id")
      .eq("follower_id", userId)
      .in("following_id", userIds)
      .then((res) => {
        if (res.error) return new Set()
        return new Set(res.data?.map((f: any) => f.following_id) || [])
      }),
  ])

  // Step 4: Merge data with activities
  const enhancedActivities = result.activities.map((activity: any) => ({
    ...activity,
    likeCount: likesData[activity.content.review_id] || 0,
    isLiked: false, // Will be set by client if needed
    commentCount: commentsData[activity.content.review_id] || 0,
    isFollowing: followsData.has(activity.user?.id),
  }))

  return { activities: enhancedActivities }
}
