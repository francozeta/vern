import { createServerSupabaseClient } from "@/lib/supabase/server"
import { ReviewCard } from "@/components/feed/review-card"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Play, ExternalLink } from "lucide-react"
import { getLikeStatus } from "@/app/actions/likes"
import { getCommentCount } from "@/app/actions/comments"
import { checkFollowStatus } from "@/app/actions/follows"
import { getReviewById } from "@/app/actions/reviews"
import Link from "next/link"
import { notFound } from "next/navigation"

interface ReviewDetailPageProps {
  params: Promise<{
    id: string
  }>
}

export default async function ReviewDetailPage({ params }: ReviewDetailPageProps) {
  const { id } = await params

  console.log("[v0] Attempting to fetch review with id:", id)

  const supabase = await createServerSupabaseClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const reviewResult = await getReviewById(id)

  console.log("[v0] Review result:", reviewResult)

  if (reviewResult.error || !reviewResult.review) {
    console.log("[v0] Review not found, returning 404")
    notFound()
  }

  const review = reviewResult.review

  // Get interaction data
  let likeCount = 0
  let isLiked = false
  let commentCount = 0
  let isFollowing = false

  if (user) {
    const [likeStatus, commentCountResult, followStatus] = await Promise.all([
      getLikeStatus(review.id, user.id),
      getCommentCount(review.id),
      checkFollowStatus(user.id, review.user_id),
    ])

    likeCount = likeStatus.success && likeStatus.data ? likeStatus.data.totalLikes : 0
    isLiked = likeStatus.success && likeStatus.data ? likeStatus.data.isLiked : false
    commentCount = commentCountResult.success ? commentCountResult.count || 0 : 0
    isFollowing = followStatus.success ? followStatus.isFollowing : false
  }

  // Get related reviews from the same artist
  const { data: relatedReviews } = await supabase
    .from("reviews")
    .select(`
      *,
      profiles:user_id (
        id,
        username,
        display_name,
        avatar_url,
        is_verified,
        role
      )
    `)
    .eq("song_artist", review.song_artist)
    .neq("id", review.id)
    .limit(3)

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <div className="mb-6">
          <Button variant="ghost" asChild className="gap-2">
            <Link href="/reviews">
              <ArrowLeft className="h-4 w-4" />
              Back to Reviews
            </Link>
          </Button>
        </div>

        {/* Main Review */}
        <div className="mb-8">
          <ReviewCard
            review={{
              id: review.id,
              title: review.title,
              content: review.content,
              rating: review.rating,
              created_at: review.created_at,
              song_title: review.song_title,
              song_artist: review.song_artist,
              song_album: review.song_album,
              song_cover_url: review.song_cover_url,
              song_preview_url: review.song_preview_url,
              user: {
                id: review.profiles?.id || review.user_id,
                username: review.profiles?.username || "Unknown",
                display_name: review.profiles?.display_name || "Unknown User",
                avatar_url: review.profiles?.avatar_url || null,
                is_verified: review.profiles?.is_verified || false,
                role: review.profiles?.role || "listener",
              },
            }}
            currentUserId={user?.id}
            likeCount={likeCount}
            isLiked={isLiked}
            commentCount={commentCount}
            isFollowing={isFollowing}
          />
        </div>

        {/* Song Preview Player */}
        {review.song_preview_url && (
          <div className="mb-8">
            <div className="bg-card rounded-xl border border-border p-6">
              <h3 className="font-semibold text-lg text-foreground mb-4">Listen to Preview</h3>
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-lg overflow-hidden bg-muted">
                  {review.song_cover_url ? (
                    <img
                      src={review.song_cover_url || "/placeholder.svg"}
                      alt={review.song_title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Play className="h-6 w-6 text-muted-foreground" />
                    </div>
                  )}
                </div>
                <div className="flex-1">
                  <h4 className="font-medium text-foreground">{review.song_title}</h4>
                  <p className="text-sm text-muted-foreground">{review.song_artist}</p>
                  <audio controls className="mt-2 w-full">
                    <source src={review.song_preview_url} type="audio/mpeg" />
                    Your browser does not support the audio element.
                  </audio>
                </div>
                {review.song_deezer_url && (
                  <Button variant="outline" asChild>
                    <a href={review.song_deezer_url} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="h-4 w-4 mr-2" />
                      Open in Deezer
                    </a>
                  </Button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Related Reviews */}
        {relatedReviews && relatedReviews.length > 0 && (
          <div className="mb-8">
            <h3 className="font-semibold text-xl text-foreground mb-6">More reviews of {review.song_artist}</h3>
            <div className="space-y-6">
              {relatedReviews.map((relatedReview) => (
                <ReviewCard
                  key={relatedReview.id}
                  review={{
                    id: relatedReview.id,
                    title: relatedReview.title,
                    content: relatedReview.content,
                    rating: relatedReview.rating,
                    created_at: relatedReview.created_at,
                    song_title: relatedReview.song_title,
                    song_artist: relatedReview.song_artist,
                    song_album: relatedReview.song_album,
                    song_cover_url: relatedReview.song_cover_url,
                    song_preview_url: relatedReview.song_preview_url,
                    user: {
                      id: relatedReview.profiles?.id || relatedReview.user_id,
                      username: relatedReview.profiles?.username || "Unknown",
                      display_name: relatedReview.profiles?.display_name || "Unknown User",
                      avatar_url: relatedReview.profiles?.avatar_url || null,
                      is_verified: relatedReview.profiles?.is_verified || false,
                      role: relatedReview.profiles?.role || "listener",
                    },
                  }}
                  currentUserId={user?.id}
                  variant="compact"
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
