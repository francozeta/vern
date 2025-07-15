"use client"

import { useMemo } from "react"
import { cn } from "@/lib/utils"

interface GradientAvatarProps {
  userId: string
  size?: "sm" | "md" | "lg"
  className?: string
}

const gradients = [
  "from-pink-500 to-orange-400",
  "from-green-400 to-blue-500",
  "from-purple-500 to-pink-500",
  "from-yellow-400 to-red-500",
  "from-blue-500 to-purple-600",
  "from-green-500 to-teal-400",
  "from-red-500 to-pink-500",
  "from-indigo-500 to-blue-500",
  "from-orange-400 to-pink-400",
  "from-teal-400 to-blue-500",
]

const sizeClasses = {
  sm: "w-8 h-8",
  md: "w-12 h-12",
  lg: "w-16 h-16",
}

export function GradientAvatar({ userId, size = "md", className }: GradientAvatarProps) {
  const gradient = useMemo(() => {
    // Create a simple hash from userId to consistently select a gradient
    let hash = 0
    for (let i = 0; i < userId.length; i++) {
      const char = userId.charCodeAt(i)
      hash = (hash << 5) - hash + char
      hash = hash & hash // Convert to 32-bit integer
    }
    return gradients[Math.abs(hash) % gradients.length]
  }, [userId])

  return <div className={cn("rounded-full bg-gradient-to-br flex-shrink-0", gradient, sizeClasses[size], className)} />
}
