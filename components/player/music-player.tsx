"use client"

import { usePlayer } from "@/lib/contexts/player-context"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { Play, Pause, Volume2, VolumeX, SkipBack, SkipForward } from "lucide-react"

function formatTime(seconds: number): string {
  if (!seconds || isNaN(seconds)) return "0:00"
  const mins = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)
  return `${mins}:${secs.toString().padStart(2, "0")}`
}

export function MusicPlayer() {
  const { currentSong, isPlaying, currentTime, duration, volume, togglePlay, setCurrentTime, setVolume } = usePlayer()

  return (
    <div className="bg-gradient-to-r from-zinc-900 via-zinc-950 to-black border-t border-zinc-800/50 z-40">
      <div className="max-w-7xl mx-auto px-4 py-4">
        {/* Progress Bar */}
        <div className="mb-4 flex items-center gap-2">
          <span className="text-xs text-zinc-400 w-10 text-right">{formatTime(currentTime)}</span>
          <Slider
            value={[currentTime]}
            max={duration || 100}
            step={0.1}
            onValueChange={(value) => {
              if (currentSong) {
                setCurrentTime(value[0])
              }
            }}
            className="flex-1"
            disabled={!currentSong}
          />
          <span className="text-xs text-zinc-400 w-10">{formatTime(duration)}</span>
        </div>

        {/* Main Player */}
        <div className="flex items-center justify-between gap-6">
          {/* Song Info */}
          <div className="flex items-center gap-4 min-w-0 flex-1">
            {currentSong?.cover_url ? (
              <img
                src={currentSong.cover_url || "/placeholder.svg"}
                alt={currentSong.title}
                className="h-14 w-14 rounded-lg object-cover flex-shrink-0 shadow-lg"
              />
            ) : (
              <div className="h-14 w-14 rounded-lg bg-gradient-to-br from-zinc-800 to-zinc-900 flex-shrink-0 flex items-center justify-center shadow-lg">
                <span className="text-xs text-zinc-500">No song</span>
              </div>
            )}
            <div className="min-w-0">
              <p className="text-sm font-semibold text-white truncate">{currentSong?.title || "No song playing"}</p>
              <p className="text-xs text-zinc-400 truncate">{currentSong?.artist || "Select a song to start"}</p>
            </div>
          </div>

          {/* Controls */}
          <div className="flex items-center gap-3">
            <Button
              size="sm"
              variant="ghost"
              disabled={!currentSong}
              className="h-9 w-9 p-0 hover:bg-white/10 disabled:opacity-40 transition-colors"
            >
              <SkipBack className="h-4 w-4" />
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={togglePlay}
              disabled={!currentSong}
              className="h-9 w-9 p-0 hover:bg-white/10 disabled:opacity-40 transition-colors"
            >
              {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
            </Button>
            <Button
              size="sm"
              variant="ghost"
              disabled={!currentSong}
              className="h-9 w-9 p-0 hover:bg-white/10 disabled:opacity-40 transition-colors"
            >
              <SkipForward className="h-4 w-4" />
            </Button>
          </div>

          {/* Volume */}
          <div className="flex items-center gap-2 w-32">
            {volume === 0 ? (
              <VolumeX className="h-4 w-4 text-zinc-400 flex-shrink-0" />
            ) : (
              <Volume2 className="h-4 w-4 text-zinc-400 flex-shrink-0" />
            )}
            <Slider
              value={[volume]}
              max={1}
              step={0.01}
              onValueChange={(value) => setVolume(value[0])}
              className="flex-1"
            />
          </div>
        </div>
      </div>
    </div>
  )
}
