"use client"

import { createBrowserSupabaseClient } from "@/lib/supabase/client"
import { ReviewCard } from "@/components/feed/review-card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Music, Search, Filter, Star, TrendingUp, Clock } from "lucide-react"
import { getAllReviews } from "@/app/actions/reviews"
import { getLikeStatus } from "@/app/actions/likes"
import { getCommentCount } from "@/app/actions/comments"
import { checkFollowStatus } from "@/app/actions/follows"
import { useEffect, useState, useCallback, useRef } from "react"
import type { User } from "@supabase/supabase-js"

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

export default function ReviewsPage() {
  const [reviews, setReviews] = useState<Review[]>([])
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const loadingRef = useRef(false)

  const loadReviews = useCallback(async () => {
    if (loadingRef.current) {
      console.log("[v0] Reviews already loading, skipping")
      return
    }

    loadingRef.current = true
    console.log("[v0] Starting to load reviews...")

    try {
      const supabase = createBrowserSupabaseClient()
      const {
        data: { user: currentUser },
      } = await supabase.auth.getUser()
      console.log("[v0] Current user:", currentUser?.id)
      setUser(currentUser)

      const reviewsResult = await getAllReviews(20, 0)
      const reviewsList = reviewsResult.reviews || []
      console.log("[v0] Fetched reviews count:", reviewsList.length)

      const enhancedReviews = await Promise.all(
        reviewsList.map(async (review) => {
          if (currentUser) {
            const [likeStatus, commentCount, followStatus] = await Promise.all([
              getLikeStatus(review.id, currentUser.id),
              getCommentCount(review.id),
              checkFollowStatus(currentUser.id, review.user_id),
            ])

            return {
              ...review,
              likeCount: likeStatus.success && likeStatus.data ? likeStatus.data.totalLikes : 0,
              isLiked: likeStatus.success && likeStatus.data ? likeStatus.data.isLiked : false,
              commentCount: commentCount.success ? commentCount.count : 0,
              isFollowing: followStatus.success ? followStatus.isFollowing : false,
            }
          }
          return review
        }),
      )

      console.log("[v0] Enhanced reviews count:", enhancedReviews.length)
      setReviews(enhancedReviews)
    } catch (error) {
      console.error("[v0] Failed to load reviews:", error)
    } finally {
      setLoading(false)
      loadingRef.current = false
    }
  }, [])

  useEffect(() => {
    loadReviews()
  }, [loadReviews])

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Music className="h-12 w-12 text-muted-foreground mx-auto mb-4 animate-pulse" />
          <p className="text-muted-foreground">Loading reviews...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Music Reviews</h1>
          <p className="text-muted-foreground">Discover what the community is saying about the latest music</p>
        </div>

        {/* Filters */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search reviews, songs, or artists..." className="pl-10 bg-card border-border" />
            </div>
            <Select defaultValue="recent">
              <SelectTrigger className="w-full sm:w-48 bg-card border-border">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="recent">Most Recent</SelectItem>
                <SelectItem value="popular">Most Popular</SelectItem>
                <SelectItem value="rating-high">Highest Rated</SelectItem>
                <SelectItem value="rating-low">Lowest Rated</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" size="icon" className="bg-card border-border">
              <Filter className="h-4 w-4" />
            </Button>
          </div>

          <Tabs defaultValue="all" className="w-full">
            <TabsList className="grid w-full grid-cols-4 bg-muted">
              <TabsTrigger value="all" className="flex items-center gap-2">
                <Music className="h-4 w-4" />
                <span className="hidden sm:inline">All</span>
              </TabsTrigger>
              <TabsTrigger value="trending" className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                <span className="hidden sm:inline">Trending</span>
              </TabsTrigger>
              <TabsTrigger value="top-rated" className="flex items-center gap-2">
                <Star className="h-4 w-4" />
                <span className="hidden sm:inline">Top Rated</span>
              </TabsTrigger>
              <TabsTrigger value="recent" className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                <span className="hidden sm:inline">Recent</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="all" className="mt-6">
              <div className="space-y-6">
                {reviews.length > 0 ? (
                  reviews.map((review) => (
                    <ReviewCard
                      key={review.id}
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
                          display_name: review.profiles?.display_name,
                          avatar_url: review.profiles?.avatar_url,
                          is_verified: review.profiles?.is_verified,
                          role: review.profiles?.role || "listener",
                        },
                      }}
                      currentUserId={user?.id}
                      likeCount={review.likeCount}
                      isLiked={review.isLiked}
                      commentCount={review.commentCount}
                      isFollowing={review.isFollowing}
                    />
                  ))
                ) : (
                  <div className="text-center py-16">
                    <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                      <Music className="h-8 w-8 text-muted-foreground" />
                    </div>
                    <h3 className="text-xl font-semibold text-foreground mb-2">No reviews yet</h3>
                    <p className="text-muted-foreground max-w-md mx-auto">
                      Be the first to share your thoughts about music with the community
                    </p>
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="trending" className="mt-6">
              <div className="text-center py-16">
                <TrendingUp className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-foreground mb-2">Coming Soon</h3>
                <p className="text-muted-foreground">Trending reviews will be available soon</p>
              </div>
            </TabsContent>

            <TabsContent value="top-rated" className="mt-6">
              <div className="text-center py-16">
                <Star className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-foreground mb-2">Coming Soon</h3>
                <p className="text-muted-foreground">Top rated reviews will be available soon</p>
              </div>
            </TabsContent>

            <TabsContent value="recent" className="mt-6">
              <div className="text-center py-16">
                <Clock className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-foreground mb-2">Coming Soon</h3>
                <p className="text-muted-foreground">Recent reviews filtering will be available soon</p>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}
