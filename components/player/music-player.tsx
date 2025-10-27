"use client"

import { usePlayerStore } from "@/lib/store/player-store"
import { Button } from "@/components/ui/button"
import { Play, Pause, SkipBack, SkipForward, Volume2, VolumeX, Repeat, Repeat1, Shuffle } from "lucide-react"
import { ProgressBar } from "./progress-bar"
import { AlbumCover } from "./album-cover"

export function MusicPlayer() {
  const {
    currentSong,
    isPlaying,
    volume,
    repeatMode,
    isShuffle,
    togglePlay,
    setVolume,
    nextTrack,
    previousTrack,
    setRepeatMode,
    toggleShuffle,
  } = usePlayerStore()

  return (
    <div className="w-full bg-gradient-to-t from-black/95 to-black/80 backdrop-blur-md border-t border-white/10">
      {/* Progress Bar */}
      <ProgressBar />

      {/* Main Player Container */}
      <div className="max-w-7xl mx-auto px-3 sm:px-4 py-3 sm:py-4">
        <div className="flex items-center justify-between gap-3 sm:gap-4">
          {/* Left: Album Cover + Song Info */}
          <div className="flex items-center gap-3 sm:gap-4 min-w-0 flex-1">
            <AlbumCover size="md" />

            <div className="min-w-0 hidden sm:flex flex-col justify-center">
              <p className="text-sm font-semibold text-white truncate leading-tight">
                {currentSong?.title || "No song playing"}
              </p>
              <p className="text-xs text-white/60 truncate leading-tight">
                {currentSong?.artists?.name || "Select a song"}
              </p>
            </div>
          </div>

          {/* Center: Playback Controls */}
          <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
            <Button
              size="sm"
              variant="ghost"
              onClick={previousTrack}
              disabled={!currentSong}
              className="h-8 w-8 sm:h-9 sm:w-9 p-0 hover:bg-white/10 transition-all duration-200 border border-white/20 hover:border-white/30 disabled:opacity-40 disabled:hover:bg-transparent disabled:hover:border-white/20 rounded-full"
              aria-label="Previous track"
            >
              <SkipBack className="h-4 w-4 sm:h-5 sm:w-5" />
            </Button>

            <Button
              size="sm"
              variant="ghost"
              onClick={togglePlay}
              disabled={!currentSong}
              className="h-8 w-8 sm:h-9 sm:w-9 p-0 hover:bg-white/10 transition-all duration-200 border border-white/20 hover:border-white/30 disabled:opacity-40 disabled:hover:bg-transparent disabled:hover:border-white/20 rounded-full"
              aria-label={isPlaying ? "Pause" : "Play"}
            >
              {isPlaying ? (
                <Pause className="h-4 w-4 sm:h-5 sm:w-5" />
              ) : (
                <Play className="h-4 w-4 sm:h-5 sm:w-5 ml-0.5" />
              )}
            </Button>

            <Button
              size="sm"
              variant="ghost"
              onClick={nextTrack}
              disabled={!currentSong}
              className="h-8 w-8 sm:h-9 sm:w-9 p-0 hover:bg-white/10 transition-all duration-200 border border-white/20 hover:border-white/30 disabled:opacity-40 disabled:hover:bg-transparent disabled:hover:border-white/20 rounded-full"
              aria-label="Next track"
            >
              <SkipForward className="h-4 w-4 sm:h-5 sm:w-5" />
            </Button>
          </div>

          {/* Right: Volume Control + Playback Modes - Hidden on mobile */}
          <div className="hidden sm:flex items-center gap-4 flex-shrink-0">
            <Button
              size="sm"
              variant="ghost"
              onClick={() => {
                const modes: Array<"off" | "one" | "all"> = ["off", "one", "all"]
                const currentIndex = modes.indexOf(repeatMode)
                const nextMode = modes[(currentIndex + 1) % modes.length]
                setRepeatMode(nextMode)
              }}
              disabled={!currentSong}
              className={`h-8 w-8 p-0 hover:bg-white/10 transition-all duration-200 border rounded-full ${
                repeatMode !== "off" ? "border-white/50 bg-white/10" : "border-white/20 hover:border-white/30"
              } disabled:opacity-40 disabled:hover:bg-transparent disabled:hover:border-white/20`}
              aria-label="Repeat mode"
            >
              {repeatMode === "one" ? <Repeat1 className="h-4 w-4" /> : <Repeat className="h-4 w-4" />}
            </Button>

            <Button
              size="sm"
              variant="ghost"
              onClick={toggleShuffle}
              disabled={!currentSong}
              className={`h-8 w-8 p-0 hover:bg-white/10 transition-all duration-200 border rounded-full ${
                isShuffle ? "border-white/50 bg-white/10" : "border-white/20 hover:border-white/30"
              } disabled:opacity-40 disabled:hover:bg-transparent disabled:hover:border-white/20`}
              aria-label="Shuffle"
            >
              <Shuffle className="h-4 w-4" />
            </Button>

            {/* Volume Control */}
            <div className="flex items-center gap-2 w-32">
              {volume === 0 ? (
                <VolumeX className="h-4 w-4 text-white/60 flex-shrink-0" />
              ) : (
                <Volume2 className="h-4 w-4 text-white/60 flex-shrink-0" />
              )}

              <div className="flex-1 relative h-1 bg-white/10 rounded-full overflow-hidden group cursor-pointer">
                <div
                  className="absolute h-full bg-white/80 rounded-full transition-all duration-100 group-hover:bg-white"
                  style={{ width: `${volume * 100}%` }}
                />
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.01"
                  value={volume}
                  onChange={(e) => setVolume(Number.parseFloat(e.target.value))}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  aria-label="Volume"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
