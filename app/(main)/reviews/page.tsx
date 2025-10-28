"use client"

import { createBrowserSupabaseClient } from "@/lib/supabase/client"
import { ReviewCard } from "@/components/feed/review-card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Music, Search, Filter, Star, TrendingUp, Clock } from "lucide-react"
import { useEffect, useState } from "react"
import type { User } from "@supabase/supabase-js"
import useSWR from "swr"

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

const fetchReviews = async (userId: string | null) => {
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

  const enhancedReviews = await Promise.all(
    (reviews || []).map(async (review) => {
      const [likesData, commentsData, followData] = await Promise.all([
        supabase.from("likes").select("id", { count: "exact" }).eq("review_id", review.id),
        supabase.from("review_comments").select("id", { count: "exact" }).eq("review_id", review.id),
        supabase.from("follows").select("id").eq("follower_id", userId).eq("following_id", review.user_id).single(),
      ])

      const userLike = await supabase
        .from("likes")
        .select("id")
        .eq("review_id", review.id)
        .eq("user_id", userId)
        .single()

      return {
        ...review,
        likeCount: likesData.count || 0,
        isLiked: !!userLike.data,
        commentCount: commentsData.count || 0,
        isFollowing: !!followData.data,
      }
    }),
  )

  return enhancedReviews
}

export default function ReviewsPage() {
  const [user, setUser] = useState<User | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [sortBy, setSortBy] = useState("recent")

  useEffect(() => {
    const getUser = async () => {
      const supabase = createBrowserSupabaseClient()
      const {
        data: { user: currentUser },
      } = await supabase.auth.getUser()
      setUser(currentUser)
    }
    getUser()
  }, [])

  const { data: reviews = [], isLoading } = useSWR(
    user ? `reviews-${user.id}` : "reviews-guest",
    () => fetchReviews(user?.id || null),
    {
      revalidateOnFocus: false,
      dedupingInterval: 30000,
    },
  )

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Music Reviews</h1>
          <p className="text-muted-foreground">Discover what the community is saying about the latest music</p>
        </div>

        <div className="mb-8">
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search reviews, songs, or artists..."
                className="pl-10 bg-card border-border"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Select value={sortBy} onValueChange={setSortBy}>
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
              {isLoading ? (
                <div className="text-center py-16">
                  <Music className="h-12 w-12 text-muted-foreground mx-auto mb-4 animate-pulse" />
                  <p className="text-muted-foreground">Loading reviews...</p>
                </div>
              ) : (
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
              )}
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
