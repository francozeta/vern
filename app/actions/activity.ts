"use server"

import { createServerSupabaseClient } from "@/lib/supabase/server"

type Activity = {
  id: string
  type: "review"
  user: any
  created_at: string
  content: {
    review_id: string
    song_title: string
    song_artist: string
    song_cover_url: string | null
    song_preview_url: string | null
    rating: number | null
    title: string
    content: string
  }
  likeCount?: number
  isLiked?: boolean
  commentCount?: number
  isFollowing?: boolean
}

function mapReviewToActivity(review: any): Activity {
  const song = review.song ?? review.songs
  const artist = song?.artist ?? song?.artists

  return {
    id: review.id,
    type: "review",
    created_at: review.created_at,
    user: review.profiles ?? review.user ?? null,
    content: {
      review_id: review.id,
      song_title: song?.title ?? "",
      song_artist: artist?.name ?? "",
      song_cover_url: song?.cover_url ?? null,
      song_preview_url: song?.preview_url ?? null,
      rating: review.rating,
      title: review.title,
      content: review.content,
    },
  }
}

export async function getFollowingActivity(userId: string, limit = 10, offset = 0) {
  const supabase = await createServerSupabaseClient()

  const { data: followingData, error: followError } = await supabase
    .from("follows")
    .select("following_id")
    .eq("follower_id", userId)

  if (followError) {
    console.error("Get following activity error:", followError)
    return { activities: [] as Activity[] }
  }

  if (!followingData || followingData.length === 0) {
    return { activities: [] as Activity[] }
  }

  const followingIds = followingData.map((f) => f.following_id)

  const { data: reviews, error } = await supabase
    .from("reviews")
    .select(
      `
      id,
      title,
      content,
      rating,
      created_at,
      user_id,
      song_id,
      song:song_id (
        id,
        title,
        cover_url,
        preview_url,
        provider,
        external_id,
        artist:artist_id (
          id,
          name
        )
      ),
      profiles:user_id (
        id,
        username,
        display_name,
        avatar_url,
        is_verified,
        role
      )
    `,
    )
    .in("user_id", followingIds)
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1)

  if (error || !reviews) {
    console.error("Get following activity error:", error)
    return { activities: [] as Activity[] }
  }

  const activities = (reviews || []).map(mapReviewToActivity)
  return { activities }
}

export async function getRecentActivity(limit = 20, offset = 0) {
  const supabase = await createServerSupabaseClient()

  const { data: reviews, error } = await supabase
    .from("reviews")
    .select(
      `
      id,
      title,
      content,
      rating,
      created_at,
      user_id,
      song_id,
      song:song_id (
        id,
        title,
        cover_url,
        preview_url,
        provider,
        external_id,
        artist:artist_id (
          id,
          name
        )
      ),
      profiles:user_id (
        id,
        username,
        display_name,
        avatar_url,
        is_verified,
        role
      )
    `,
    )
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1)

  if (error || !reviews) {
    console.error("Get recent activity error:", error)
    return { activities: [] as Activity[] }
  }

  const activities = (reviews || []).map(mapReviewToActivity)
  return { activities }
}

export async function getEnhancedActivity(
  userId: string | null,
  limit = 10,
  offset = 0,
  showFollowingOnly = false,
) {
  const supabase = await createServerSupabaseClient()

  const base =
    showFollowingOnly && userId
      ? await getFollowingActivity(userId, limit, offset)
      : await getRecentActivity(limit, offset)

  if (!base.activities || base.activities.length === 0) {
    return { activities: [] as Activity[] }
  }

  const reviewIds = base.activities.map((a) => a.content.review_id)
  const userIds = base.activities.map((a) => a.user?.id).filter(Boolean)

  const [likesRes, commentsRes, userLikesRes, followsRes] = await Promise.all([
    supabase.from("likes").select("review_id").in("review_id", reviewIds),
    supabase.from("review_comments").select("review_id").in("review_id", reviewIds),
    userId
      ? supabase.from("likes").select("review_id").eq("user_id", userId).in("review_id", reviewIds)
      : Promise.resolve({ data: [] as any[] }),
    userId
      ? supabase.from("follows").select("following_id").eq("follower_id", userId).in("following_id", userIds as string[])
      : Promise.resolve({ data: [] as any[] }),
  ])

  const likes = ((likesRes as any).data || []) as any[]
  const comments = ((commentsRes as any).data || []) as any[]
  const userLikes = ((userLikesRes as any).data || []) as any[]
  const follows = ((followsRes as any).data || []) as any[]

  const likesByReview: Record<string, number> = {}
  for (const l of likes) {
    likesByReview[l.review_id] = (likesByReview[l.review_id] ?? 0) + 1
  }

  const commentsByReview: Record<string, number> = {}
  for (const c of comments) {
    commentsByReview[c.review_id] = (commentsByReview[c.review_id] ?? 0) + 1
  }

  const userLikesSet = new Set(userLikes.map((l: any) => l.review_id))
  const followsSet = new Set(follows.map((f: any) => f.following_id))

  const activities = base.activities.map((activity) => ({
    ...activity,
    likeCount: likesByReview[activity.content.review_id] ?? 0,
    isLiked: userLikesSet.has(activity.content.review_id),
    commentCount: commentsByReview[activity.content.review_id] ?? 0,
    isFollowing: activity.user?.id ? followsSet.has(activity.user.id) : false,
  }))

  return { activities }
}
