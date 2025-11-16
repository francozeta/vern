"use client"

import type React from "react"

import { useState, useEffect, useCallback } from "react"
import {
  Credenza,
  CredenzaContent,
  CredenzaHeader,
  CredenzaTitle,
  CredenzaBody,
  CredenzaDescription,
} from "@/components/ui/credenza"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { GradientAvatar } from "@/components/user/gradient-avatar"
import { MessageCircle, Trash2, Verified, Send } from "lucide-react"
import { createComment, deleteComment } from "@/app/actions/comments"
import { toast } from "sonner"
import { cn } from "@/lib/utils"
import { createBrowserSupabaseClient } from "@/lib/supabase/client"
import { useComments } from "@/hooks/use-comments"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { useAuthUser } from "@/components/providers/auth-user-provider"

interface CommentsModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  reviewId: string
  onCommentAdded?: () => void
  onCommentDeleted?: () => void
}

export function CommentsModal({ open, onOpenChange, reviewId, onCommentAdded, onCommentDeleted }: CommentsModalProps) {

  const [newComment, setNewComment] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const maxCommentLength = 500
  const queryClient = useQueryClient()
  const { user } = useAuthUser()
  const currentUserId = user?.id ?? null

  const { data: comments = [], isLoading, error } = useComments(reviewId, open)

  useEffect(() => {
    if (error) {
      toast.error("Error loading comments")
    }
  }, [error])

  const createCommentMutation = useMutation({
    mutationFn: (content: string) => createComment(reviewId, content),
    onMutate: async (content) => {
      await queryClient.cancelQueries({ queryKey: ["comments", reviewId] })
      const previousComments = queryClient.getQueryData(["comments", reviewId])

      queryClient.setQueryData(["comments", reviewId], (old: any) => [
        ...old,
        {
          id: `temp-${Date.now()}`,
          content,
          created_at: new Date().toISOString(),
          user_id: currentUserId,
          profiles: {
            username: "You",
            display_name: null,
            avatar_url: null,
            is_verified: false,
          },
        },
      ])

      return { previousComments }
    },
    onSuccess: (result) => {
      if (result.success) {
        queryClient.invalidateQueries({ queryKey: ["comments", reviewId] })
        setNewComment("")
        onCommentAdded?.()
        toast.success("Comment added!")
      } else {
        toast.error(result.error || "Failed to add comment")
      }
    },
    onError: (error, variables, context) => {
      if (context?.previousComments) {
        queryClient.setQueryData(["comments", reviewId], context.previousComments)
      }
      toast.error("Error adding comment")
    },
  })

  const deleteCommentMutation = useMutation({
    mutationFn: (commentId: string) => deleteComment(commentId),
    onMutate: async (commentId) => {
      await queryClient.cancelQueries({ queryKey: ["comments", reviewId] })
      const previousComments = queryClient.getQueryData(["comments", reviewId])

      queryClient.setQueryData(["comments", reviewId], (old: any) =>
        old.filter((comment: any) => comment.id !== commentId),
      )

      return { previousComments }
    },
    onSuccess: (result) => {
      if (result.success) {
        queryClient.invalidateQueries({ queryKey: ["comments", reviewId] })
        onCommentDeleted?.()
        toast.success("Comment deleted")
      } else {
        toast.error(result.error || "Failed to delete comment")
      }
    },
    onError: (error, variables, context) => {
      if (context?.previousComments) {
        queryClient.setQueryData(["comments", reviewId], context.previousComments)
      }
      toast.error("Error deleting comment")
    },
  })

  const handleCommentChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setNewComment(e.target.value)
  }, [])

  const handleSubmitComment = useCallback(async () => {
    if (!newComment.trim() || createCommentMutation.isPending) return
    createCommentMutation.mutate(newComment)
  }, [newComment, createCommentMutation])

  const handleDeleteComment = async (commentId: string) => {
    deleteCommentMutation.mutate(commentId)
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
    <Credenza open={open} onOpenChange={onOpenChange}>
      <CredenzaContent className="sm:max-w-[500px] w-full max-w-full max-h-[85vh] p-0 gap-0 bg-background border-border flex flex-col overflow-hidden">
        <CredenzaHeader className="sr-only">
          <CredenzaTitle>Comments</CredenzaTitle>
          <CredenzaDescription>Share your thoughts about this review</CredenzaDescription>
        </CredenzaHeader>

        <div className="flex items-center justify-between p-3 sm:p-4 border-b border-border bg-background/80 backdrop-blur-sm flex-shrink-0">
          <div className="hidden sm:flex items-center justify-between w-full">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onOpenChange(false)}
              className="text-muted-foreground hover:text-foreground text-sm"
            >
              Close
            </Button>
            <h2 className="text-lg font-semibold">Comments ({comments.length})</h2>
            <Button
              onClick={handleSubmitComment}
              disabled={!newComment.trim() || createCommentMutation.isPending}
              size="sm"
              className="px-6 font-medium"
            >
              {createCommentMutation.isPending ? "Posting..." : "Post"}
            </Button>
          </div>

          <div className="flex sm:hidden items-center justify-center w-full">
            <h2 className="text-lg font-semibold">Comments ({comments.length})</h2>
          </div>
        </div>

        <CredenzaBody className="flex-1 overflow-hidden p-0">
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
                          disabled={deleteCommentMutation.isPending}
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

          {currentUserId && (
            <div className="p-4 border-t border-border bg-background/50">
              <div className="flex gap-2 items-center">
                <Input
                  key={`comment-input-${reviewId}`}
                  placeholder="Add a comment..."
                  value={newComment}
                  onChange={handleCommentChange}
                  className="flex-1 h-10 text-sm border-muted-foreground/20 focus:border-primary bg-background"
                  maxLength={maxCommentLength}
                  disabled={createCommentMutation.isPending}
                  aria-label="Write a comment"
                  aria-describedby="comment-counter"
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault()
                      handleSubmitComment()
                    }
                  }}
                />
                <Button
                  onClick={handleSubmitComment}
                  disabled={!newComment.trim() || createCommentMutation.isPending}
                  size="sm"
                  className="h-10 px-3 flex-shrink-0"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>

              <div className="flex justify-start mt-2">
                <span
                  id="comment-counter"
                  className={cn(
                    "text-xs",
                    newComment.length > maxCommentLength * 0.8 ? "text-destructive" : "text-muted-foreground",
                  )}
                >
                  {newComment.length}/{maxCommentLength}
                </span>
              </div>
            </div>
          )}

          {!currentUserId && (
            <div className="p-4 border-t border-border text-center bg-muted/20">
              <p className="text-sm text-muted-foreground">Please log in to comment</p>
            </div>
          )}
        </CredenzaBody>
      </CredenzaContent>
    </Credenza>
  )
}
