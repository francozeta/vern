"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { GradientAvatar } from "@/components/user/gradient-avatar"
import { MessageCircle, Send, Trash2, Verified } from "lucide-react"
import { createComment, getComments, deleteComment } from "@/app/actions/comments"
import { toast } from "sonner"
import { cn } from "@/lib/utils"
import { createBrowserSupabaseClient } from "@/lib/supabase/client"

interface Comment {
  id: string
  user_id: string
  review_id: string
  content: string
  created_at: string
  updated_at: string
  profiles: {
    username: string
    display_name: string | null
    avatar_url: string | null
    is_verified: boolean
  }
}

interface CommentsModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  reviewId: string
  onCommentAdded?: () => void
  onCommentDeleted?: () => void
}

export function CommentsModal({ open, onOpenChange, reviewId, onCommentAdded, onCommentDeleted }: CommentsModalProps) {
  const [comments, setComments] = useState<Comment[]>([])
  const [newComment, setNewComment] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [currentUserId, setCurrentUserId] = useState<string | null>(null)

  const maxCommentLength = 500

  // Get current user
  useEffect(() => {
    const getCurrentUser = async () => {
      const supabase = createBrowserSupabaseClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()
      setCurrentUserId(user?.id || null)
    }
    getCurrentUser()
  }, [])

  // Load comments when modal opens
  useEffect(() => {
    if (open) {
      loadComments()
    }
  }, [open, reviewId])

  const loadComments = async () => {
    setIsLoading(true)
    try {
      const result = await getComments(reviewId)
      if (result.success && result.comments) {
        setComments(result.comments)
      } else {
        toast.error("Error loading comments")
      }
    } catch (error) {
      console.error("Error loading comments:", error)
      toast.error("Error loading comments")
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmitComment = async () => {
    if (!newComment.trim() || isSubmitting) return

    setIsSubmitting(true)
    try {
      const result = await createComment(reviewId, newComment)

      if (result.success && result.comment) {
        setComments((prev) => [...prev, result.comment])
        setNewComment("")
        onCommentAdded?.()
        toast.success("Comment added!")
      } else {
        toast.error(result.error || "Failed to add comment")
      }
    } catch (error) {
      console.error("Error submitting comment:", error)
      toast.error("Error adding comment")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDeleteComment = async (commentId: string) => {
    try {
      const result = await deleteComment(commentId)

      if (result.success) {
        setComments((prev) => prev.filter((comment) => comment.id !== commentId))
        onCommentDeleted?.()
        toast.success("Comment deleted")
      } else {
        toast.error(result.error || "Failed to delete comment")
      }
    } catch (error) {
      console.error("Error deleting comment:", error)
      toast.error("Error deleting comment")
    }
  }

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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] max-h-[80vh] p-0 gap-0 bg-background border-border flex flex-col">
        <DialogHeader className="p-4 border-b border-border">
          <DialogTitle className="flex items-center gap-2">
            <MessageCircle className="h-5 w-5" />
            Comments ({comments.length})
          </DialogTitle>
        </DialogHeader>

        {/* Comments List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 min-h-[200px] max-h-[400px]">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary" />
            </div>
          ) : comments.length > 0 ? (
            comments.map((comment) => (
              <div key={comment.id} className="flex gap-3 group">
                <div className="w-8 h-8 rounded-full overflow-hidden flex-shrink-0">
                  {comment.profiles.avatar_url ? (
                    <Avatar className="w-full h-full">
                      <AvatarImage
                        src={comment.profiles.avatar_url || "/placeholder.svg"}
                        alt={comment.profiles.display_name || comment.profiles.username}
                      />
                      <AvatarFallback>
                        <GradientAvatar userId={comment.user_id} size="sm" />
                      </AvatarFallback>
                    </Avatar>
                  ) : (
                    <GradientAvatar userId={comment.user_id} size="sm" className="w-full h-full" />
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium text-sm">
                      {comment.profiles.display_name || comment.profiles.username}
                    </span>
                    {comment.profiles.is_verified && <Verified className="h-3 w-3 text-blue-500 fill-current" />}
                    <span className="text-xs text-muted-foreground">{formatTimeAgo(comment.created_at)}</span>
                    {currentUserId === comment.user_id && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteComment(comment.id)}
                        className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity ml-auto"
                      >
                        <Trash2 className="h-3 w-3 text-muted-foreground hover:text-destructive" />
                      </Button>
                    )}
                  </div>
                  <p className="text-sm text-foreground leading-relaxed">{comment.content}</p>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <MessageCircle className="h-8 w-8 mx-auto mb-2 opacity-40" />
              <p className="text-sm">No comments yet</p>
              <p className="text-xs">Be the first to share your thoughts!</p>
            </div>
          )}
        </div>

        {/* Comment Input */}
        {currentUserId && (
          <div className="p-4 border-t border-border">
            <div className="space-y-3">
              <Textarea
                placeholder="Write a comment..."
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                className="min-h-[80px] resize-none text-sm"
                maxLength={maxCommentLength}
                disabled={isSubmitting}
              />
              <div className="flex items-center justify-between">
                <span
                  className={cn(
                    "text-xs",
                    newComment.length > maxCommentLength * 0.8 ? "text-destructive" : "text-muted-foreground",
                  )}
                >
                  {newComment.length}/{maxCommentLength}
                </span>
                <Button
                  onClick={handleSubmitComment}
                  disabled={!newComment.trim() || isSubmitting}
                  size="sm"
                  className="gap-2"
                >
                  {isSubmitting ? (
                    <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-current" />
                  ) : (
                    <Send className="h-3 w-3" />
                  )}
                  {isSubmitting ? "Posting..." : "Post"}
                </Button>
              </div>
            </div>
          </div>
        )}

        {!currentUserId && (
          <div className="p-4 border-t border-border text-center">
            <p className="text-sm text-muted-foreground">Please log in to comment</p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
