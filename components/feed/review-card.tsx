"use client"

import { useState } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { GradientAvatar } from "@/components/user/gradient-avatar"
import { LikeButton } from "@/components/feed/like-button"
import { CommentButton } from "@/components/feed/comment-button"
import { FollowButton } from "@/components/user/follow-button"
import { Verified, Mic, Headphones, Star, Music, Play, MoreHorizontal, Share, ExternalLink, Trash2 } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { deleteReview } from "@/app/actions/reviews"
import { toast } from "sonner"
import Link from "next/link"
import { cn } from "@/lib/utils"

interface ReviewCardProps {
  review: {
    id: string
    title: string
    content: string
    rating: number
    created_at: string
    song_title: string
    song_artist: string
    song_album?: string
    song_cover_url?: string
    song_preview_url?: string
    user: {
      id: string
      username: string
      display_name?: string
      avatar_url?: string
      is_verified?: boolean
      role?: "listener" | "artist" | "both"
    }
  }
  currentUserId?: string | null
  likeCount?: number
  isLiked?: boolean
  commentCount?: number
  isFollowing?: boolean
  variant?: "default" | "compact"
  showActions?: boolean
}

export function ReviewCard({
  review,
  currentUserId,
  likeCount = 0,
  isLiked = false,
  commentCount = 0,
  isFollowing = false,
  variant = "default",
  showActions = true,
}: ReviewCardProps) {
  const [imageLoaded, setImageLoaded] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const isOwnReview = currentUserId === review.user.id

  const reviewUrl = `/reviews/${review.id}`

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)

    if (diffInSeconds < 60) return "now"
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m`
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h`
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d`
    return date.toLocaleDateString()
  }

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: `${review.title} - Review by ${review.user.display_name || review.user.username}`,
        text: review.content.slice(0, 100) + "...",
        url: reviewUrl,
      })
    } else {
      navigator.clipboard.writeText(`${window.location.origin}${reviewUrl}`)
      toast.success("Link copied to clipboard!")
    }
  }

  const handleDelete = async () => {
    setIsDeleting(true)
    try {
      const result = await deleteReview(review.id)
      if (result.success) {
        toast.success("Review deleted successfully")
        window.location.reload()
      } else {
        toast.error(result.error || "Failed to delete review")
      }
    } catch (error) {
      toast.error("Failed to delete review")
    } finally {
      setIsDeleting(false)
    }
  }

  if (variant === "compact") {
    return (
      <Link href={reviewUrl}>
        <div className="group cursor-pointer bg-card hover:bg-accent/50 rounded-xl p-4 transition-all duration-300 hover:shadow-lg border border-border/50 hover:border-border">
          <div className="flex gap-3">
            {/* Album Cover */}
            <div className="relative w-16 h-16 rounded-lg overflow-hidden bg-muted flex-shrink-0">
              {review.song_cover_url ? (
                <img
                  src={review.song_cover_url || "/placeholder.svg"}
                  alt={review.song_title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  onLoad={() => setImageLoaded(true)}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Music className="h-6 w-6 text-muted-foreground" />
                </div>
              )}
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                <Play className="h-4 w-4 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-sm text-foreground truncate mb-1">{review.title}</h3>
              <p className="text-xs text-muted-foreground truncate mb-1">
                {review.song_title} • {review.song_artist}
              </p>
              <div className="flex items-center gap-1 mb-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={cn(
                      "w-3 h-3",
                      star <= review.rating ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground/30",
                    )}
                  />
                ))}
              </div>
              <p className="text-xs text-muted-foreground line-clamp-2">{review.content}</p>
            </div>
          </div>
        </div>
      </Link>
    )
  }

  return (
    <div className="group bg-card rounded-2xl border border-border/50 hover:border-border transition-all duration-300 hover:shadow-xl overflow-hidden">
      {/* Header */}
      <div className="p-4 pb-3">
        <div className="flex items-start gap-3">
          {/* User Avatar */}
          <Link href={`/user/${review.user.username}`} className="flex-shrink-0">
            <div className="w-10 h-10 rounded-full overflow-hidden">
              {review.user.avatar_url ? (
                <Avatar className="w-full h-full">
                  <AvatarImage
                    src={review.user.avatar_url || "/placeholder.svg"}
                    alt={review.user.display_name || review.user.username}
                  />
                  <AvatarFallback>
                    <GradientAvatar userId={review.user.id} size="sm" />
                  </AvatarFallback>
                </Avatar>
              ) : (
                <GradientAvatar userId={review.user.id} size="sm" className="w-full h-full" />
              )}
            </div>
          </Link>

          <div className="flex-1 min-w-0">
            {/* User Info */}
            <div className="flex items-center gap-2 mb-1">
              <Link href={`/user/${review.user.username}`} className="flex items-center gap-2 hover:underline">
                <span className="font-medium text-sm text-foreground">
                  {review.user.display_name || review.user.username}
                </span>
                {review.user.is_verified && <Verified className="h-3.5 w-3.5 text-blue-500 fill-current" />}
                {review.user.role === "artist" && (
                  <div className="bg-muted rounded-full p-0.5">
                    <Mic className="h-2.5 w-2.5 text-muted-foreground" />
                  </div>
                )}
                {review.user.role === "listener" && (
                  <div className="bg-muted rounded-full p-0.5">
                    <Headphones className="h-2.5 w-2.5 text-muted-foreground" />
                  </div>
                )}
              </Link>
              <span className="text-xs text-muted-foreground">•</span>
              <span className="text-xs text-muted-foreground">{formatTimeAgo(review.created_at)}</span>
            </div>

            {/* Review Title */}
            <Link href={reviewUrl}>
              <h2 className="font-semibold text-base text-foreground hover:text-primary transition-colors line-clamp-2 mb-2">
                {review.title}
              </h2>
            </Link>
          </div>

          {/* Actions Menu */}
          <div className="flex items-center gap-2">
            {!isOwnReview && currentUserId && (
              <FollowButton
                targetUserId={review.user.id}
                initialIsFollowing={isFollowing}
                currentUserId={currentUserId}
                variant="compact"
              />
            )}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem onClick={handleShare}>
                  <Share className="h-4 w-4 mr-2" />
                  Share review
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href={reviewUrl}>
                    <ExternalLink className="h-4 w-4 mr-2" />
                    View details
                  </Link>
                </DropdownMenuItem>
                {isOwnReview && (
                  <>
                    <DropdownMenuSeparator />
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <DropdownMenuItem
                          onSelect={(e) => e.preventDefault()}
                          className="text-destructive focus:text-destructive"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete review
                        </DropdownMenuItem>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete Review</AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to delete this review? This action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={handleDelete}
                            disabled={isDeleting}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                          >
                            {isDeleting ? "Deleting..." : "Delete"}
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>

      {/* Album Info & Cover */}
      <Link href={reviewUrl} className="block">
        <div className="px-4 pb-4">
          <div className="flex gap-4">
            {/* Album Cover */}
            <div className="relative w-20 h-20 rounded-xl overflow-hidden bg-muted flex-shrink-0 group-hover:shadow-lg transition-shadow">
              {review.song_cover_url ? (
                <img
                  src={review.song_cover_url || "/placeholder.svg"}
                  alt={review.song_title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  onLoad={() => setImageLoaded(true)}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Music className="h-8 w-8 text-muted-foreground" />
                </div>
              )}
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                <Play className="h-5 w-5 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            </div>

            {/* Song Info */}
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-sm text-foreground truncate mb-1">{review.song_title}</h3>
              <p className="text-sm text-muted-foreground truncate mb-2">{review.song_artist}</p>
              {review.song_album && <p className="text-xs text-muted-foreground truncate mb-2">{review.song_album}</p>}

              {/* Rating */}
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={cn(
                      "w-4 h-4",
                      star <= review.rating ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground/30",
                    )}
                  />
                ))}
                <span className="text-sm font-medium text-foreground ml-1">{review.rating}/5</span>
              </div>
            </div>
          </div>
        </div>
      </Link>

      {/* Review Content */}
      <div className="px-4 pb-4">
        <Link href={reviewUrl}>
          <p className="text-sm text-foreground leading-relaxed line-clamp-3 hover:text-muted-foreground transition-colors">
            {review.content}
          </p>
        </Link>
      </div>

      {/* Actions */}
      {showActions && (
        <div className="px-4 pb-4 pt-2 border-t border-border/50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              <LikeButton
                reviewId={review.id}
                initialLikeCount={likeCount}
                initialIsLiked={isLiked}
                className="text-sm"
                currentUserId={currentUserId}
              />
              <CommentButton
                reviewId={review.id}
                initialCommentCount={commentCount}
                className="text-sm"
                currentUserId={currentUserId}
              />
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleShare}
              className="text-muted-foreground hover:text-foreground"
            >
              <Share className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
