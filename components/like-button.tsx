"use client"

import { useState, useTransition } from "react"
import { Heart } from "lucide-react"
import { toggleLike } from "@/app/actions/likes"
import { toast } from "sonner"
import { cn } from "@/lib/utils"

interface LikeButtonProps {
  reviewId: string
  initialLikeCount: number
  initialIsLiked: boolean
  className?: string
}

export function LikeButton({ reviewId, initialLikeCount, initialIsLiked, className }: LikeButtonProps) {
  const [likeCount, setLikeCount] = useState(initialLikeCount)
  const [isLiked, setIsLiked] = useState(initialIsLiked)
  const [isPending, startTransition] = useTransition()

  const handleToggleLike = () => {
    if (isPending) return

    const newIsLiked = !isLiked
    const newLikeCount = newIsLiked ? likeCount + 1 : likeCount - 1

    setIsLiked(newIsLiked)
    setLikeCount(newLikeCount)

    startTransition(async () => {
      const result = await toggleLike(reviewId)

      if (!result.success) {
        setIsLiked(!newIsLiked)
        setLikeCount(likeCount)
        toast.error("Error adding like")
      } else {
        const actionIsLiked = result.action === "liked"
        toast.success(actionIsLiked ? "Review liked!" : "Like removed")
        setIsLiked(actionIsLiked)
      }
    })
  }

  return (
    <button
      onClick={handleToggleLike}
      disabled={isPending}
      className={cn(
        "flex items-center gap-1 hover:text-red-500 transition-colors disabled:opacity-50",
        isLiked ? "text-red-500" : "text-muted-foreground",
        className,
      )}
    >
      <Heart className={cn("h-3 w-3 transition-all", isLiked ? "fill-current" : "", isPending ? "scale-110" : "")} />
      <span className="text-xs">{likeCount}</span>
    </button>
  )
}
