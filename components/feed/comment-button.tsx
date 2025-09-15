"use client"

import { useState } from "react"
import { MessageCircle } from "lucide-react"
import { cn } from "@/lib/utils"
import { CommentsModal } from "../modals/comments-modal"

interface CommentButtonProps {
  reviewId: string
  initialCommentCount: number
  className?: string
}

export function CommentButton({ reviewId, initialCommentCount, className }: CommentButtonProps) {
  const [commentCount, setCommentCount] = useState(initialCommentCount)
  const [showComments, setShowComments] = useState(false)

  const handleCommentAdded = () => {
    setCommentCount((prev) => prev + 1)
  }

  const handleCommentDeleted = () => {
    setCommentCount((prev) => Math.max(0, prev - 1))
  }

  return (
    <>
      <button
        onClick={() => setShowComments(true)}
        className={cn(
          "flex items-center gap-1 hover:text-blue-500 transition-all duration-200 group",
          "text-muted-foreground",
          className,
        )}
      >
        <MessageCircle className="h-3 w-3 transition-all duration-200 group-hover:scale-110" />
        <span className="text-xs font-medium">{commentCount}</span>
      </button>

      <CommentsModal
        open={showComments}
        onOpenChange={setShowComments}
        reviewId={reviewId}
        onCommentAdded={handleCommentAdded}
        onCommentDeleted={handleCommentDeleted}
      />
    </>
  )
}
