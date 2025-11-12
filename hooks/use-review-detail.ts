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
      `id,user_id,title,content,rating,created_at,song_title,song_artist,song_album,song_cover_url,song_preview_url,song_deezer_url,song_duration,
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

  const [likesResult, commentsResult, relatedReviewsResult, userMetricsResult] = await Promise.all([
    supabase.from("likes").select("id", { count: "exact" }).eq("review_id", reviewId),

    supabase.from("review_comments").select("id", { count: "exact" }).eq("review_id", reviewId),

    supabase
      .from("reviews")
      .select(
        `id,title,rating,content,created_at,song_title,song_artist,
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
      .limit(3),

    currentUserId
      ? Promise.all([
          supabase.from("likes").select("id").eq("review_id", reviewId).eq("user_id", currentUserId).single(),

          supabase
            .from("follows")
            .select("id")
            .eq("follower_id", currentUserId)
            .eq("following_id", review.user_id)
            .single(),
        ])
      : Promise.resolve([{ data: null }, { data: null }]),
  ])

  const [likedByUserResult, followResult] = userMetricsResult

  return {
    review,
    likeCount: likesResult.count || 0,
    isLiked: !!likedByUserResult.data,
    commentCount: commentsResult.count || 0,
    isFollowing: !!followResult.data,
    relatedReviews: relatedReviewsResult.data || [],
  }
}

export function useReviewDetail(reviewId: string, currentUserId: string | null) {
  return useQuery({
    queryKey: ["review-detail", reviewId, currentUserId],
    queryFn: () => fetchReviewDetail(reviewId, currentUserId),
    staleTime: 1000 * 60 * 30,
    gcTime: 1000 * 60 * 60,
  })
}
