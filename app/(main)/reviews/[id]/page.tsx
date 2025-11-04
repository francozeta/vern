"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { createBrowserSupabaseClient } from "@/lib/supabase/client"
import { useReviewDetail } from "@/hooks/use-review-detail"
import { ReviewCard } from "@/components/feed/review-card"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Play, ExternalLink } from "lucide-react"
import { SettingsSkeleton } from "@/components/skeletons/settings-skeleton"
import Link from "next/link"
import Image from "next/image"
import { PageContainer } from "@/components/layout/page-container"
import { AudioPlayer } from "@/components/player/audio-player"

export default function ReviewDetailPage() {
  const params = useParams()
  const supabase = createBrowserSupabaseClient()
  const [user, setUser] = useState<any>(null)
  const [isLoadingAuth, setIsLoadingAuth] = useState(true)

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user)
      setIsLoadingAuth(false)
    })
  }, [supabase])

  const { data, isLoading, error } = useReviewDetail(params.id as string, user?.id || null)

  if (isLoadingAuth || isLoading) return <SettingsSkeleton />

  if (error) {
    return (
      <PageContainer>
        <div className="text-center py-16">
          <h1 className="text-2xl font-bold text-foreground mb-4">Review not found</h1>
          <Button asChild>
            <Link href="/reviews">Back to Reviews</Link>
          </Button>
        </div>
      </PageContainer>
    )
  }

  if (!data) return null

  const review = data.review

  return (
    <div className="min-h-screen bg-background">
      <PageContainer maxWidth="lg">
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
            likeCount={data.likeCount || 0}
            isLiked={data.isLiked || false}
            commentCount={data.commentCount || 0}
            isFollowing={data.isFollowing || false}
            showActions={true}
          />
        </div>

        {/* Song Preview Player - Using new AudioPlayer with CORS fix */}
        {review.song_preview_url && (
          <div className="mb-8">
            <div className="bg-card rounded-xl border border-border p-6">
              <h3 className="font-semibold text-lg text-foreground mb-4">Listen to Preview</h3>
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-lg overflow-hidden bg-muted">
                  {review.song_cover_url ? (
                    <Image
                      src={review.song_cover_url || "/placeholder.svg"}
                      alt={review.song_title}
                      width={64}
                      height={64}
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
                  <AudioPlayer src={review.song_preview_url} className="mt-3" />
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
        {data.relatedReviews && data.relatedReviews.length > 0 && (
          <div className="mb-8">
            <h3 className="font-semibold text-xl text-foreground mb-6">More reviews of {review.song_artist}</h3>
            <div className="space-y-6">
              {data.relatedReviews.map((relatedReview: any) => (
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
      </PageContainer>
    </div>
  )
}
