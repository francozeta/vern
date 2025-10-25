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
    <div className="bg-sidebar/80 backdrop-blur-md border-t border-border/40">
      <div className="max-w-7xl mx-auto px-4 py-4">
        {/* Progress Bar */}
        <div className="mb-4 flex items-center gap-2">
          <span className="text-xs text-white/60 w-10 text-right">{formatTime(currentTime)}</span>
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
          <span className="text-xs text-white/60 w-10">{formatTime(duration)}</span>
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
              <div className="h-14 w-14 rounded-lg bg-white/5 flex-shrink-0 flex items-center justify-center shadow-lg border border-white/10">
                <span className="text-xs text-white/40">No song</span>
              </div>
            )}
            <div className="min-w-0">
              <p className="text-sm font-semibold text-white truncate">{currentSong?.title || "No song playing"}</p>
              <p className="text-xs text-white/60 truncate">{currentSong?.artists?.name || "Select a song to start"}</p>
            </div>
          </div>

          {/* Controls */}
          <div className="flex items-center gap-3">
            <Button
              size="sm"
              variant="ghost"
              disabled={!currentSong}
              className="h-9 w-9 p-0 hover:bg-white/10 transition-all duration-200 border border-white/20 hover:border-white/30 disabled:opacity-40 rounded-full"
            >
              <SkipBack className="h-4 w-4" />
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={togglePlay}
              disabled={!currentSong}
              className="h-9 w-9 p-0 hover:bg-white/10 transition-all duration-200 border border-white/20 hover:border-white/30 disabled:opacity-40 rounded-full"
            >
              {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
            </Button>
            <Button
              size="sm"
              variant="ghost"
              disabled={!currentSong}
              className="h-9 w-9 p-0 hover:bg-white/10 transition-all duration-200 border border-white/20 hover:border-white/30 disabled:opacity-40 rounded-full"
            >
              <SkipForward className="h-4 w-4" />
            </Button>
          </div>

          {/* Volume */}
          <div className="flex items-center gap-2 w-32">
            {volume === 0 ? (
              <VolumeX className="h-4 w-4 text-white/60 flex-shrink-0" />
            ) : (
              <Volume2 className="h-4 w-4 text-white/60 flex-shrink-0" />
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
