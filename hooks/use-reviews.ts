import { useQuery } from "@tanstack/react-query"
import { createBrowserSupabaseClient } from "@/lib/supabase/client"

interface Review {
  id: string
  title: string
  content: string
  rating: number | null
  created_at: string
  user_id: string
  song_id: string
  song_title: string
  song_artist: string
  song_album: string
  song_cover_url: string | null
  song_preview_url: string | null
  profiles?: {
    id: string
    username: string
    display_name?: string | null
    avatar_url?: string | null
    is_verified?: boolean | null
    role?: string | null
  }
  likeCount?: number
  isLiked?: boolean
  commentCount?: number
  isFollowing?: boolean
}

async function fetchReviews(userId: string | null): Promise<Review[]> {
  const supabase = createBrowserSupabaseClient()

  const { data, error } = await supabase
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
    .order("created_at", { ascending: false })
    .limit(50)

  if (error) throw error

  const baseReviews: Review[] =
    (data || []).map((r: any) => {
      const song = r.song
      const artist = song?.artist
      const album = song?.album

      return {
        id: r.id,
        title: r.title,
        content: r.content,
        rating: r.rating,
        created_at: r.created_at,
        user_id: r.user_id,
        song_id: r.song_id,
        song_title: song?.title ?? "",
        song_artist: artist?.name ?? "",
        song_album: album?.title ?? "",
        song_cover_url: song?.cover_url ?? null,
        song_preview_url: song?.preview_url ?? null,
        profiles: r.profiles,
      }
    }) || []

  const reviewIds = baseReviews.map((r) => r.id)
  if (reviewIds.length === 0) return baseReviews

  const [likesRes, commentsRes, userLikesRes, followsRes] = await Promise.allSettled([
    supabase.from("likes").select("review_id, user_id").in("review_id", reviewIds),
    supabase.from("review_comments").select("review_id").in("review_id", reviewIds),
    userId
      ? supabase.from("likes").select("review_id").eq("user_id", userId).in("review_id", reviewIds)
      : Promise.resolve({ data: [] as any[] }),
    userId
      ? supabase
          .from("follows")
          .select("following_id")
          .eq("follower_id", userId)
          .in(
            "following_id",
            baseReviews.map((r) => r.user_id),
          )
      : Promise.resolve({ data: [] as any[] }),
  ])

  const allLikes = likesRes.status === "fulfilled" ? ((likesRes.value as any).data || []) : []
  const allComments = commentsRes.status === "fulfilled" ? ((commentsRes.value as any).data || []) : []
  const userLikes = userLikesRes.status === "fulfilled" ? ((userLikesRes.value as any).data || []) : []
  const following = followsRes.status === "fulfilled" ? ((followsRes.value as any).data || []) : []

  const likesByReview: Record<string, number> = {}
  for (const like of allLikes) {
    likesByReview[like.review_id] = (likesByReview[like.review_id] ?? 0) + 1
  }

  const commentsByReview: Record<string, number> = {}
  for (const comment of allComments) {
    commentsByReview[comment.review_id] = (commentsByReview[comment.review_id] ?? 0) + 1
  }

  const userLikeSet = new Set(userLikes.map((l: any) => l.review_id))
  const followingSet = new Set(following.map((f: any) => f.following_id))

  const enhancedReviews = baseReviews.map((review) => ({
    ...review,
    likeCount: likesByReview[review.id] ?? 0,
    isLiked: userLikeSet.has(review.id),
    commentCount: commentsByReview[review.id] ?? 0,
    isFollowing: followingSet.has(review.user_id),
  }))

  return enhancedReviews
}

export function useReviews(userId: string | null) {
  return useQuery({
    queryKey: ["reviews", userId],
    queryFn: () => fetchReviews(userId),
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 15,
  })
}
