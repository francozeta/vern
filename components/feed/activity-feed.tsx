"use client"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ReviewCard } from "@/components/feed/review-card"
import { getEnhancedActivity } from "@/app/actions/activity"
import { useQuery } from "@tanstack/react-query"
import { Music, RefreshCw } from "lucide-react"
import { CACHE_KEYS } from "@/lib/cache/cache-keys"
import { ActivityFeedSkeleton } from "@/components/skeletons/activity-feed-skeleton"

interface ActivityFeedProps {
  currentUserId?: string | null
  showFollowingOnly?: boolean
}

export function ActivityFeed({ currentUserId, showFollowingOnly = false }: ActivityFeedProps) {
  const { data, isLoading, refetch } = useQuery({
    queryKey: CACHE_KEYS.ACTIVITY_FEED(currentUserId ?? ""),
    queryFn: () => getEnhancedActivity(currentUserId ?? null, 10, 0, showFollowingOnly),
    staleTime: 1000 * 60 * 3, // 3 minutes
    gcTime: 1000 * 60 * 15, // 15 minutes
    refetchOnWindowFocus: true,
  })

  const activities = data?.activities || []

  const handleRefresh = () => {
    refetch()
  }

  if (isLoading) {
    return <ActivityFeedSkeleton />
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-foreground">
          {showFollowingOnly ? "Following Activity" : "Recent Activity"}
        </h2>
        <Button
          onClick={handleRefresh}
          variant="ghost"
          size="sm"
          className="text-muted-foreground hover:text-foreground"
        >
          <RefreshCw className="h-4 w-4" />
        </Button>
      </div>

      {activities.length > 0 ? (
        <div className="space-y-6">
          {activities.map((activity: any) => (
            <ReviewCard
              key={activity.id}
              review={{
                id: activity.content.review_id,
                title: activity.content.title,
                content: activity.content.content,
                rating: activity.content.rating,
                created_at: activity.created_at,
                song_title: activity.content.song_title,
                song_artist: activity.content.song_artist,
                song_cover_url: activity.content.song_cover_url,
                song_preview_url: activity.content.song_preview_url,
                user: {
                  id: activity.user.id,
                  username: activity.user.username,
                  display_name: activity.user.display_name,
                  avatar_url: activity.user.avatar_url,
                  is_verified: activity.user.is_verified,
                  role: activity.user.role,
                },
              }}
              currentUserId={currentUserId}
              likeCount={activity.likeCount}
              isLiked={activity.isLiked}
              commentCount={activity.commentCount}
              isFollowing={activity.isFollowing}
            />
          ))}
        </div>
      ) : (
        <Card className="bg-card border-border border-dashed">
          <CardContent className="p-12 text-center">
            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
              <Music className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">
              {showFollowingOnly ? "No activity from people you follow" : "No recent activity"}
            </h3>
            <p className="text-muted-foreground text-sm max-w-md mx-auto">
              {showFollowingOnly
                ? "Follow some users to see their reviews and activity here"
                : "Be the first to write a review and start the conversation"}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
