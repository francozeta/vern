"use client"

import { useQuery } from "@tanstack/react-query"
import { createBrowserSupabaseClient } from "@/lib/supabase/client"

interface ReviewDetailData {
  review: any
  likeCount: number
  isLiked: boolean
  commentCount: number
  isFollowing: boolean
  relatedReviews: any[]
}

async function fetchReviewDetail(reviewId: string, currentUserId: string | null): Promise<ReviewDetailData> {
  const supabase = createBrowserSupabaseClient()

  const { data: review, error } = await supabase
    .from("reviews")
    .select(
      `*,
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
    .eq("id", reviewId)
    .single()

  if (error || !review) {
    throw new Error("Review not found")
  }

  let likeCount = 0
  let isLiked = false
  let commentCount = 0
  let isFollowing = false

  // This ensures public engagement metrics are always visible
  const [likesResult, commentsResult] = await Promise.all([
    supabase.from("likes").select("id", { count: "exact" }).eq("review_id", reviewId),
    supabase.from("review_comments").select("id", { count: "exact" }).eq("review_id", reviewId),
  ])

  likeCount = likesResult.count || 0
  commentCount = commentsResult.count || 0

  if (currentUserId) {
    const likedByUser = await supabase
      .from("likes")
      .select("id")
      .eq("review_id", reviewId)
      .eq("user_id", currentUserId)
      .single()

    const followResult = await supabase
      .from("follows")
      .select("id")
      .eq("follower_id", currentUserId)
      .eq("following_id", review.user_id)
      .single()

    isLiked = !!likedByUser.data
    isFollowing = !!followResult.data
  }

  const { data: relatedReviews } = await supabase
    .from("reviews")
    .select(
      `*,
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
    .eq("song_artist", review.song_artist)
    .neq("id", review.id)
    .limit(3)

  return {
    review,
    likeCount,
    isLiked,
    commentCount,
    isFollowing,
    relatedReviews: relatedReviews || [],
  }
}

export function useReviewDetail(reviewId: string, currentUserId: string | null) {
  return useQuery({
    queryKey: ["review-detail", reviewId, currentUserId],
    queryFn: () => fetchReviewDetail(reviewId, currentUserId),
    staleTime: 60_000,
  })
}
