import { useQuery } from "@tanstack/react-query"
import { createBrowserSupabaseClient } from "@/lib/supabase/client"

interface Review {
  id: string
  title: string
  content: string
  rating: number
  created_at: string
  song_title: string
  song_artist: string
  song_album: string
  song_cover_url: string
  song_preview_url: string
  profiles?: {
    id: string
    username?: string
    display_name?: string
    avatar_url?: string
    is_verified?: boolean
    role?: "listener" | "artist" | "both"
  }
  user_id: string
  likeCount?: number
  isLiked?: boolean
  commentCount?: number
  isFollowing?: boolean
}

async function fetchReviews(userId: string | null): Promise<Review[]> {
  const supabase = createBrowserSupabaseClient()

  const { data: reviews, error } = await supabase
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
    .order("created_at", { ascending: false })
    .limit(20)

  if (error) throw error

  if (!userId) return reviews || []

  const reviewIds = (reviews || []).map((r) => r.id)

  const results = await Promise.allSettled([
    supabase.from("likes").select("review_id, user_id").in("review_id", reviewIds),
    supabase.from("review_comments").select("review_id").in("review_id", reviewIds),
    supabase.from("likes").select("review_id").in("review_id", reviewIds).eq("user_id", userId),
    supabase
      .from("follows")
      .select("following_id")
      .eq("follower_id", userId)
      .in(
        "following_id",
        (reviews || []).map((r) => r.user_id),
      ),
  ])

  const allLikes = results[0].status === "fulfilled" ? results[0].value.data : []
  const allComments = results[1].status === "fulfilled" ? results[1].value.data : []
  const userLikes = results[2].status === "fulfilled" ? results[2].value.data : []
  const followingData = results[3].status === "fulfilled" ? results[3].value.data : []

  const likesByReview = Object.groupBy(allLikes || [], (l: any) => l.review_id)
  const commentsByReview = Object.groupBy(allComments || [], (c: any) => c.review_id)
  const userLikeSet = new Set((userLikes || []).map((l: any) => l.review_id))
  const followingSet = new Set((followingData || []).map((f: any) => f.following_id))

  const enhancedReviews = (reviews || []).map((review) => ({
    ...review,
    likeCount: (likesByReview[review.id] || []).length,
    isLiked: userLikeSet.has(review.id),
    commentCount: (commentsByReview[review.id] || []).length,
    isFollowing: followingSet.has(review.user_id),
  }))

  return enhancedReviews
}

export function useReviews(userId: string | null) {
  return useQuery({
    queryKey: ["reviews", userId],
    queryFn: () => fetchReviews(userId),
    enabled: true,
  })
}
