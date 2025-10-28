"use client"

import { useState, useEffect, useCallback, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ReviewCard } from "@/components/feed/review-card"
import { getFollowingActivity, getRecentActivity } from "@/app/actions/activity"
import { getLikeStatus } from "@/app/actions/likes"
import { getCommentCount } from "@/app/actions/comments"
import { checkFollowStatus } from "@/app/actions/follows"
import { Music, RefreshCw } from "lucide-react"

interface ActivityFeedProps {
  currentUserId?: string | null
  showFollowingOnly?: boolean
}

export function ActivityFeed({ currentUserId, showFollowingOnly = false }: ActivityFeedProps) {
  const [activities, setActivities] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)

  const loadActivities = useCallback(async () => {
    try {
      let result
      if (showFollowingOnly && currentUserId) {
        result = await getFollowingActivity(currentUserId, 10)
      } else {
        result = await getRecentActivity(10)
      }

      if (result.activities) {
        if (currentUserId) {
          const enhancedActivities = await Promise.all(
            result.activities.map(async (activity) => {
              if (activity.type === "review") {
                try {
                  const [likeStatus, commentCount, followStatus] = await Promise.all([
                    getLikeStatus(activity.content.review_id, currentUserId),
                    getCommentCount(activity.content.review_id),
                    checkFollowStatus(currentUserId, activity.user.id),
                  ])

                  return {
                    ...activity,
                    likeCount: likeStatus.success && likeStatus.data ? likeStatus.data.totalLikes : 0,
                    isLiked: likeStatus.success && likeStatus.data ? likeStatus.data.isLiked : false,
                    commentCount: commentCount.success ? commentCount.count : 0,
                    isFollowing: followStatus.success ? followStatus.isFollowing : false,
                  }
                } catch (error) {
                  console.error("Error enhancing activity:", error)
                  return activity
                }
              }
              return activity
            }),
          )
          setActivities(enhancedActivities)
        } else {
          setActivities(result.activities)
        }
      }
    } catch (error) {
      console.error("Error loading activities:", error)
    } finally {
      setIsLoading(false)
      setIsRefreshing(false)
    }
  }, [currentUserId, showFollowingOnly])

  useEffect(() => {
    loadActivities()
  }, []) // Empty dependency array - load once on mount

  const handleRefresh = useCallback(() => {
    setIsRefreshing(true)
    loadActivities()
  }, [loadActivities])

  const ActivityItem = useMemo(() => {
    return ({ activity }: { activity: any }) => {
      if (activity.type === "review") {
        return (
          <ReviewCard
            review={{
              id: activity.content.review_id,
              title: activity.content.title,
              content: activity.content.content,
              rating: activity.content.rating,
              created_at: activity.created_at,
              song_title: activity.content.song_title,
              song_artist: activity.content.song_artist,
              song_album: activity.content.song_album,
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
            likeCount={activity.likeCount || 0}
            isLiked={activity.isLiked || false}
            commentCount={activity.commentCount || 0}
            isFollowing={activity.isFollowing || false}
          />
        )
      }
      return null
    }
  }, [currentUserId])

  if (isLoading) {
    return (
      <div className="space-y-6">
        {[...Array(3)].map((_, i) => (
          <Card key={i} className="bg-card border-border">
            <CardContent className="p-6">
              <div className="flex items-start gap-4 animate-pulse">
                <div className="w-10 h-10 bg-muted rounded-full" />
                <div className="flex-1 space-y-3">
                  <div className="h-4 bg-muted rounded w-1/3" />
                  <div className="h-6 bg-muted rounded w-3/4" />
                  <div className="flex gap-4">
                    <div className="w-20 h-20 bg-muted rounded-xl" />
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-muted rounded w-3/4" />
                      <div className="h-3 bg-muted rounded w-1/2" />
                      <div className="h-3 bg-muted rounded w-full" />
                      <div className="h-3 bg-muted rounded w-2/3" />
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-foreground">
          {showFollowingOnly ? "Following Activity" : "Recent Activity"}
        </h2>
        <Button
          onClick={handleRefresh}
          disabled={isRefreshing}
          variant="ghost"
          size="sm"
          className="text-muted-foreground hover:text-foreground"
        >
          <RefreshCw className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`} />
        </Button>
      </div>

      {activities.length > 0 ? (
        <div className="space-y-6">
          {activities.map((activity) => (
            <ActivityItem key={activity.id} activity={activity} />
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
