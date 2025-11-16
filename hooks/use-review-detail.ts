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

  const { data: reviewRow, error } = await supabase
    .from("reviews")
    .select(
      `
      id,
      user_id,
      title,
      content,
      rating,
      created_at,
      song_id,
      song:song_id (
        id,
        title,
        cover_url,
        preview_url,
        duration_ms,
        provider,
        external_id,
        artist:artist_id (
          id,
          name
        ),
        album:album_id (
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
    .eq("id", reviewId)
    .single()

  if (error || !reviewRow) {
    throw new Error("Review not found")
  }

  const song = (reviewRow as any).song
  const artist = song?.artist
  const album = song?.album

  const normalizedReview: any = {
    ...reviewRow,
    song_title: song?.title ?? "",
    song_artist: artist?.name ?? "",
    song_album: album?.title ?? "",
    song_cover_url: song?.cover_url ?? null,
    song_preview_url: song?.preview_url ?? null,
  }

  const [likesResult, commentsResult, relatedReviewsResult, userMetricsResult] = await Promise.all([
    supabase.from("likes").select("id", { count: "exact" }).eq("review_id", reviewId),
    supabase.from("review_comments").select("id", { count: "exact" }).eq("review_id", reviewId),
    supabase
      .from("reviews")
      .select(
        `
        id,
        user_id,
        title,
        rating,
        content,
        created_at,
        song_id,
        song:song_id (
          id,
          title,
          cover_url,
          preview_url,
          artist:artist_id (
            id,
            name
          ),
          album:album_id (
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
      .eq("song_id", normalizedReview.song_id)
      .neq("id", normalizedReview.id)
      .limit(3),
    currentUserId
      ? Promise.all([
          supabase.from("likes").select("id").eq("review_id", reviewId).eq("user_id", currentUserId).single(),
          supabase
            .from("follows")
            .select("id")
            .eq("follower_id", currentUserId)
            .eq("following_id", normalizedReview.user_id)
            .single(),
        ])
      : Promise.resolve([{ data: null }, { data: null }]),
  ])

  const [likedByUserResult, followResult] = userMetricsResult as any

  const relatedRows = ((relatedReviewsResult as any).data || []) as any[]
  const relatedReviews = relatedRows.map((r) => {
    const s = r.song
    const a = s?.artist
    const al = s?.album
    return {
      ...r,
      song_title: s?.title ?? "",
      song_artist: a?.name ?? "",
      song_album: al?.title ?? "",
      song_cover_url: s?.cover_url ?? null,
      song_preview_url: s?.preview_url ?? null,
    }
  })

  return {
    review: normalizedReview,
    likeCount: (likesResult as any).count || 0,
    isLiked: !!(likedByUserResult as any)?.data,
    commentCount: (commentsResult as any).count || 0,
    isFollowing: !!(followResult as any)?.data,
    relatedReviews,
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
