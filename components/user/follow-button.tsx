"use client"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { followUser, unfollowUser } from "@/app/actions/follows"
import { toast } from "sonner"

interface FollowButtonProps {
  targetUserId: string
  initialIsFollowing: boolean
  currentUserId?: string | null
  variant?: "default" | "compact"
  className?: string
}

export function FollowButton({
  targetUserId,
  initialIsFollowing,
  currentUserId,
  variant = "default",
  className = "",
}: FollowButtonProps) {
  const [isFollowing, setIsFollowing] = useState(initialIsFollowing)
  const debounceRef = useRef<NodeJS.Timeout>()

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

    debounceRef.current = setTimeout(() => {
      const action = newIsFollowing ? followUser : unfollowUser

      action(targetUserId)
        .then((result) => {
          if (result.error) {
            setIsFollowing(previousIsFollowing)
            toast.error(result.error)
          }
        })
        .catch(() => {
          setIsFollowing(previousIsFollowing)
          toast.error("Error de conexión")
        })
    }, 150)
  }

  if (variant === "compact") {
    return (
      <Button
        onClick={handleToggleFollow}
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
