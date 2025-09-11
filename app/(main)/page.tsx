import { createServerSupabaseClient } from "@/lib/supabase/server"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Music, Star, Users, TrendingUp, Play, Plus } from "lucide-react"
import { LikeButton } from "@/components/like-button"
import { CommentButton } from "@/components/comment-button"
import { getLikeStatus } from "@/app/actions/likes"
import { getCommentCount } from "@/app/actions/comments"

export default async function DashboardPage() {
  const supabase = await createServerSupabaseClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return null
  }

  // Fetch user profile
  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single()

  // Fetch recent reviews
  const { data: recentReviews } = await supabase
    .from("reviews")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(6)

  const reviewsWithLikesAndComments = await Promise.all(
    (recentReviews || []).map(async (review) => {
      const [likeStatus, commentCount] = await Promise.all([
        getLikeStatus(review.id, user.id),
        getCommentCount(review.id),
      ])

      return {
        ...review,
        likeCount: likeStatus.success && likeStatus.data ? likeStatus.data.totalLikes : 0,
        isLiked: likeStatus.success && likeStatus.data ? likeStatus.data.isLiked : false,
        commentCount: commentCount.success ? commentCount.count : 0,
      }
    }),
  )

  const breadcrumbs = [{ label: "Dashboard", isLink: false }]

  return (
    <div className="space-y-8 p-6">
      {/* Welcome Section */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold text-foreground">
          Welcome back, {profile?.display_name || profile?.username || "Music Lover"}
        </h1>
        <p className="text-muted-foreground">
          Discover new music, share your thoughts, and connect with fellow music enthusiasts.
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Your Reviews</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{recentReviews?.length || 0}</div>
            <p className="text-xs text-muted-foreground">Total reviews written</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Following</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">24</div>
            <p className="text-xs text-muted-foreground">Artists & reviewers</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">This Month</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">8</div>
            <p className="text-xs text-muted-foreground">New discoveries</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Listening Time</CardTitle>
            <Play className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">42h</div>
            <p className="text-xs text-muted-foreground">This week</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Activity */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Recent Reviews</h2>
            <Button variant="outline" size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Write Review
            </Button>
          </div>

          {reviewsWithLikesAndComments && reviewsWithLikesAndComments.length > 0 ? (
            <div className="space-y-4">
              {reviewsWithLikesAndComments.slice(0, 3).map((review) => (
                <Card key={review.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <div className="w-16 h-16 bg-muted rounded-lg flex-shrink-0 flex items-center justify-center overflow-hidden">
                        {review.song_cover_url ? (
                          <img
                            src={review.song_cover_url || "/placeholder.svg"}
                            alt={review.song_title}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <Music className="h-8 w-8 text-muted-foreground" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between">
                          <div>
                            <h3 className="font-semibold text-foreground">{review.song_title}</h3>
                            <p className="text-sm text-muted-foreground">{review.song_artist}</p>
                            <div className="flex items-center gap-1 mt-1">
                              {[1, 2, 3, 4, 5].map((star) => (
                                <Star
                                  key={star}
                                  className={`w-4 h-4 ${
                                    star <= review.rating ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground"
                                  }`}
                                />
                              ))}
                            </div>
                          </div>
                          <span className="text-xs text-muted-foreground">
                            {new Date(review.created_at).toLocaleDateString()}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground mt-2 line-clamp-2">{review.content}</p>
                        <div className="flex items-center gap-4 mt-3 text-xs text-muted-foreground">
                          <LikeButton
                            reviewId={review.id}
                            initialLikeCount={review.likeCount}
                            initialIsLiked={review.isLiked}
                          />
                          <CommentButton reviewId={review.id} initialCommentCount={review.commentCount} />
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="border-dashed border-2 border-muted-foreground/20">
              <CardContent className="p-12 text-center">
                <Music className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium text-foreground mb-2">No reviews yet</h3>
                <p className="text-muted-foreground mb-4">Start your musical journey by writing your first review</p>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Write Your First Review
                </Button>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Trending */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Trending Now</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-muted rounded-lg flex-shrink-0 flex items-center justify-center">
                    <Music className="h-6 w-6 text-muted-foreground" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-foreground truncate">Trending Song {i}</p>
                    <p className="text-sm text-muted-foreground truncate">Popular Artist</p>
                  </div>
                  <Button variant="ghost" size="sm">
                    <Play className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button className="w-full justify-start bg-transparent" variant="outline">
                <Star className="h-4 w-4 mr-2" />
                Write a Review
              </Button>
              <Button className="w-full justify-start bg-transparent" variant="outline">
                <Music className="h-4 w-4 mr-2" />
                Discover Music
              </Button>
              <Button className="w-full justify-start bg-transparent" variant="outline">
                <Users className="h-4 w-4 mr-2" />
                Find Friends
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
