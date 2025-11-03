"use client"

import { useState, useRef, useTransition } from "react"
import { Button } from "@/components/ui/button"
import { followUser, unfollowUser } from "@/app/actions/follows"
import { toast } from "sonner"
import { useQueryClient } from "@tanstack/react-query"

interface FollowButtonProps {
  targetUserId: string
  initialIsFollowing: boolean
  currentUserId?: string | null
  variant?: "default" | "compact"
  className?: string
  onFollowChange?: (isFollowing: boolean) => void
}

export function FollowButton({
  targetUserId,
  initialIsFollowing,
  currentUserId,
  variant = "default",
  className = "",
  onFollowChange,
}: FollowButtonProps) {
  const [isFollowing, setIsFollowing] = useState(initialIsFollowing)
  const [isPending, startTransition] = useTransition()
  const debounceRef = useRef<NodeJS.Timeout>()
  const queryClient = useQueryClient()

  // Don't show button if not authenticated or trying to follow self
  if (!currentUserId || currentUserId === targetUserId) {
    return null
  }

  const handleToggleFollow = () => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current)
    }

    const previousIsFollowing = isFollowing

    const newIsFollowing = !isFollowing
    setIsFollowing(newIsFollowing)
    onFollowChange?.(newIsFollowing)

    debounceRef.current = setTimeout(() => {
      startTransition(async () => {
        try {
          const action = newIsFollowing ? followUser : unfollowUser
          const result = await action(targetUserId)

          if (result.error) {
            setIsFollowing(previousIsFollowing)
            onFollowChange?.(previousIsFollowing)
            toast.error(result.error)
          } else {
            queryClient.invalidateQueries({ queryKey: ["follow-status"] })
            queryClient.invalidateQueries({ queryKey: ["suggested-users"] })
            toast.success(newIsFollowing ? "Following!" : "Unfollowed")
          }
        } catch (error) {
          setIsFollowing(previousIsFollowing)
          onFollowChange?.(previousIsFollowing)
          toast.error("Error de conexión")
        }
      })
    }, 150)
  }

  if (variant === "compact") {
    return (
      <Button
        onClick={handleToggleFollow}
        disabled={isPending}
        className={`text-xs px-3 py-1 h-7 rounded-full font-medium transition-all duration-200 ${
          isFollowing ? "bg-zinc-800/80 hover:bg-zinc-700 text-white" : "bg-white text-black hover:bg-zinc-100"
        } ${className}`}
      >
        {isFollowing ? "Following" : "Follow"}
      </Button>
    )
  }

  return (
    <Button
      onClick={handleToggleFollow}
      disabled={isPending}
      className={`rounded-full h-10 md:h-11 lg:h-12 font-semibold border-0 px-6 md:px-7 lg:px-8 transition-all text-sm md:text-sm lg:text-base ${
        isFollowing
          ? "bg-zinc-800/80 backdrop-blur-sm hover:bg-zinc-700 text-white"
          : "bg-white text-black hover:bg-zinc-100"
      } ${className}`}
    >
      {isFollowing ? "Following" : "Follow"}
    </Button>
  )
}
