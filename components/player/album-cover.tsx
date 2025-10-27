"use client"

import { usePlayerStore } from "@/lib/store/player-store"
import { SiVercel } from "react-icons/si"

interface AlbumCoverProps {
  size?: "sm" | "md" | "lg"
}

export function AlbumCover({ size = "md" }: AlbumCoverProps) {
  const { currentSong } = usePlayerStore()

  const sizeClasses = {
    sm: "h-10 w-10",
    md: "h-12 w-12",
    lg: "h-16 w-16",
  }

  const iconSizes = {
    sm: 20,
    md: 24,
    lg: 32,
  }

  return (
    <div
      className={`${sizeClasses[size]} rounded-lg flex-shrink-0 overflow-hidden shadow-lg border border-white/20 flex items-center justify-center bg-gradient-to-br from-white/10 to-white/5 transition-all duration-300 hover:border-white/30`}
    >
      {currentSong?.cover_url ? (
        <img
          src={currentSong.cover_url || "/placeholder.svg"}
          alt={currentSong.title}
          className="h-full w-full object-cover"
        />
      ) : (
        <SiVercel className="text-white/50" size={iconSizes[size]} />
      )}
    </div>
  )
}
