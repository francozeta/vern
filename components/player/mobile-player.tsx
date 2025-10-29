"use client"

import { usePlayerStore } from "@/lib/store/player-store"
import { Button } from "@/components/ui/button"
import { Play, Pause, SkipBack, SkipForward } from "lucide-react"
import { AlbumCover } from "./album-cover"
import { useIsMobile } from "@/hooks/use-mobile"

export function MobilePlayer() {
  const isMobile = useIsMobile()
  const { currentSong, isPlaying, togglePlay, nextTrack, previousTrack } = usePlayerStore()

  if (!isMobile || !currentSong) return null

  return (
    <div className="fixed bottom-21 left-4 right-4 z-40 md:hidden">
      <div className="bg-black/90 backdrop-blur-xl rounded-2xl border border-gray-600/30 shadow-2xl ring-1 ring-white/10 p-4">
        <div className="flex items-center justify-between gap-4">
          {/* Album Cover + Song Info */}
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <div className="w-12 h-12 rounded-lg overflow-hidden flex-shrink-0">
              <AlbumCover size="sm" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-white truncate">{currentSong?.title || "No song"}</p>
              <p className="text-xs text-white/60 truncate">{currentSong?.artists?.name || "Unknown"}</p>
            </div>
          </div>

          {/* Playback Controls */}
          <div className="flex items-center gap-2 flex-shrink-0">
            <Button
              size="sm"
              variant="ghost"
              onClick={previousTrack}
              className="h-8 w-8 p-0 hover:bg-white/10 transition-all duration-200 border border-white/20 hover:border-white/30 rounded-full"
              aria-label="Previous"
            >
              <SkipBack className="h-4 w-4" />
            </Button>

            <Button
              size="sm"
              variant="ghost"
              onClick={togglePlay}
              className="h-8 w-8 p-0 hover:bg-white/10 transition-all duration-200 border border-white/20 hover:border-white/30 rounded-full"
              aria-label={isPlaying ? "Pause" : "Play"}
            >
              {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4 ml-0.5" />}
            </Button>

            <Button
              size="sm"
              variant="ghost"
              onClick={nextTrack}
              className="h-8 w-8 p-0 hover:bg-white/10 transition-all duration-200 border border-white/20 hover:border-white/30 rounded-full"
              aria-label="Next"
            >
              <SkipForward className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
