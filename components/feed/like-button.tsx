"use client"

import { useState, useRef } from "react"
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
  const debounceRef = useRef<NodeJS.Timeout>()

  const handleToggleLike = () => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current)
    }

    const previousIsLiked = isLiked
    const previousLikeCount = likeCount

    const newIsLiked = !isLiked
    const newLikeCount = newIsLiked ? likeCount + 1 : likeCount - 1

    setIsLiked(newIsLiked)
    setLikeCount(newLikeCount)

    debounceRef.current = setTimeout(() => {
      toggleLike(reviewId)
        .then((result) => {
          if (!result.success) {
            setIsLiked(previousIsLiked)
            setLikeCount(previousLikeCount)
            toast.error("No se pudo dar like")
          }
        })
        .catch(() => {
          setIsLiked(previousIsLiked)
          setLikeCount(previousLikeCount)
          toast.error("Error de conexión")
        })
    }, 150)
  }

  return (
    <button
      onClick={handleToggleLike}
      className={cn(
        "flex items-center gap-1 hover:text-red-500 transition-all duration-200 group",
        isLiked ? "text-red-500" : "text-muted-foreground",
        className,
      )}
    >
      <Heart
        className={cn(
          "h-3 w-3 transition-all duration-200 group-hover:scale-110",
          isLiked ? "fill-current scale-110" : "",
        )}
      />
      <span className="text-xs font-medium">{likeCount}</span>
    </button>
  )
}
