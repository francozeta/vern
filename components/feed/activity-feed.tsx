"use client"

import { useState, useEffect } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { GradientAvatar } from "@/components/user/gradient-avatar"
import { LikeButton } from "@/components/feed/like-button"
import { CommentButton } from "@/components/feed/comment-button"
import { FollowButton } from "@/components/user/follow-button"
import { getFollowingActivity, getRecentActivity } from "@/app/actions/activity"
import { getLikeStatus } from "@/app/actions/likes"
import { getCommentCount } from "@/app/actions/comments"
import { checkFollowStatus } from "@/app/actions/follows"
import { Verified, Mic, Headphones, Star, Music, RefreshCw } from "lucide-react"
import Link from "next/link"

interface ActivityFeedProps {
  currentUserId?: string | null
  showFollowingOnly?: boolean
}

export function ActivityFeed({ currentUserId, showFollowingOnly = false }: ActivityFeedProps) {
  const [activities, setActivities] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)

  useEffect(() => {
    loadActivities()
  }, [currentUserId, showFollowingOnly])

  const loadActivities = async () => {
    try {
      let result
      if (showFollowingOnly && currentUserId) {
        result = await getFollowingActivity(currentUserId, 10)
      } else {
        result = await getRecentActivity(10)
      }

      if (result.activities) {
        // Enhance activities with like and comment data
        const enhancedActivities = await Promise.all(
          result.activities.map(async (activity) => {
            if (activity.type === "review" && currentUserId) {
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
            }
            return activity
          }),
        )

        setActivities(enhancedActivities)
      }
    } catch (error) {
      console.error("Error loading activities:", error)
    } finally {
      setIsLoading(false)
      setIsRefreshing(false)
    }
  }

  const handleRefresh = () => {
    setIsRefreshing(true)
    loadActivities()
  }

  const ActivityItem = ({ activity }: { activity: any }) => {
    if (activity.type === "review") {
      return (
        <Card className="bg-zinc-900/50 border-zinc-800/50 hover:bg-zinc-800/30 transition-colors">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              {/* User Avatar */}
              <Link href={`/user/${activity.user.username}`} className="flex-shrink-0">
                <div className="w-10 h-10 rounded-full overflow-hidden bg-zinc-800">
                  {activity.user.avatar_url ? (
                    <Avatar className="w-full h-full">
                      <AvatarImage
                        src={activity.user.avatar_url || "/placeholder.svg"}
                        alt={activity.user.display_name || activity.user.username}
                      />
                      <AvatarFallback>
                        <GradientAvatar userId={activity.user.id} size="sm" />
                      </AvatarFallback>
                    </Avatar>
                  ) : (
                    <GradientAvatar userId={activity.user.id} size="sm" className="w-full h-full" />
                  )}
                </div>
              </Link>

              <div className="flex-1 min-w-0">
                {/* User Info */}
                <div className="flex items-center gap-2 mb-2">
                  <Link href={`/user/${activity.user.username}`} className="flex items-center gap-2 hover:underline">
                    <span className="text-white text-sm font-medium">
                      {activity.user.display_name || activity.user.username}
                    </span>
                    {activity.user.is_verified && (
                      <div className="bg-blue-500 rounded-full p-0.5">
                        <Verified className="h-2.5 w-2.5 text-white fill-white" />
                      </div>
                    )}
                    {activity.user.role === "artist" && (
                      <div className="bg-white/10 rounded-full p-0.5">
                        <Mic className="h-2 w-2 text-white" />
                      </div>
                    )}
                    {activity.user.role === "listener" && (
                      <div className="bg-white/10 rounded-full p-0.5">
                        <Headphones className="h-2 w-2 text-white" />
                      </div>
                    )}
                  </Link>
                  <span className="text-zinc-400 text-xs">reviewed</span>
                  <span className="text-zinc-500 text-xs">{new Date(activity.created_at).toLocaleDateString()}</span>
                </div>

                {/* Review Content */}
                <div className="flex gap-3">
                  {/* Album Cover */}
                  <div className="w-16 h-16 bg-zinc-800 rounded-lg flex-shrink-0 overflow-hidden">
                    {activity.content.song_cover_url ? (
                      <img
                        src={activity.content.song_cover_url || "/placeholder.svg"}
                        alt={activity.content.song_title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Music className="h-6 w-6 text-zinc-600" />
                      </div>
                    )}
                  </div>

                  {/* Review Details */}
                  <div className="flex-1 min-w-0">
                    <h3 className="text-white text-sm font-medium truncate">{activity.content.song_title}</h3>
                    <p className="text-zinc-400 text-xs truncate mb-1">{activity.content.song_artist}</p>

                    {/* Rating */}
                    <div className="flex items-center gap-1 mb-2">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={`w-3 h-3 ${
                            star <= activity.content.rating ? "fill-yellow-400 text-yellow-400" : "text-zinc-600"
                          }`}
                        />
                      ))}
                    </div>

                    {/* Review Text */}
                    <p className="text-zinc-300 text-xs line-clamp-2 mb-3">{activity.content.content}</p>

                    {/* Actions */}
                    <div className="flex items-center gap-4">
                      <LikeButton
                        reviewId={activity.content.review_id}
                        initialLikeCount={activity.likeCount || 0}
                        initialIsLiked={activity.isLiked || false}
                        className="text-xs"
                      />
                      <CommentButton
                        reviewId={activity.content.review_id}
                        initialCommentCount={activity.commentCount || 0}
                        className="text-xs"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Follow Button */}
              {currentUserId && currentUserId !== activity.user.id && (
                <FollowButton
                  targetUserId={activity.user.id}
                  initialIsFollowing={activity.isFollowing || false}
                  currentUserId={currentUserId}
                  variant="compact"
                />
              )}
            </div>
          </CardContent>
        </Card>
      )
    }

    return null
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <Card key={i} className="bg-zinc-900/50 border-zinc-800/50">
            <CardContent className="p-4">
              <div className="flex items-start gap-3 animate-pulse">
                <div className="w-10 h-10 bg-zinc-800 rounded-full" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-zinc-800 rounded w-1/3" />
                  <div className="flex gap-3">
                    <div className="w-16 h-16 bg-zinc-800 rounded-lg" />
                    <div className="flex-1 space-y-2">
                      <div className="h-3 bg-zinc-800 rounded w-3/4" />
                      <div className="h-3 bg-zinc-800 rounded w-1/2" />
                      <div className="h-3 bg-zinc-800 rounded w-full" />
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
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-white">
          {showFollowingOnly ? "Following Activity" : "Recent Activity"}
        </h2>
        <Button
          onClick={handleRefresh}
          disabled={isRefreshing}
          variant="ghost"
          size="sm"
          className="text-zinc-400 hover:text-white"
        >
          <RefreshCw className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`} />
        </Button>
      </div>

      {activities.length > 0 ? (
        <div className="space-y-4">
          {activities.map((activity) => (
            <ActivityItem key={activity.id} activity={activity} />
          ))}
        </div>
      ) : (
        <Card className="bg-zinc-900/50 border-zinc-800/50 border-dashed">
          <CardContent className="p-8 text-center">
            <div className="w-12 h-12 bg-zinc-800 rounded-full flex items-center justify-center mx-auto mb-4">
              <Music className="h-6 w-6 text-zinc-600" />
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">
              {showFollowingOnly ? "No activity from people you follow" : "No recent activity"}
            </h3>
            <p className="text-zinc-400 text-sm">
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
