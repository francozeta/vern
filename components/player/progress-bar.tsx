"use client"

import { usePlayerStore } from "@/lib/store/player-store"

function formatTime(seconds: number): string {
  if (!seconds || isNaN(seconds)) return "0:00"
  const mins = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)
  return `${mins}:${secs.toString().padStart(2, "0")}`
}

export function ProgressBar() {
  const { currentTime, duration, setCurrentTime, currentSong } = usePlayerStore()

  const percentage = duration && duration > 0 ? (currentTime / duration) * 100 : 0
  const safeDuration = Number.isFinite(duration) && duration > 0 ? duration : Math.max(currentTime, 0)

  return (
    <div className="w-full px-3 sm:px-4 py-2 sm:py-3 flex items-center gap-2 sm:gap-3 bg-black/40">
      <span className="text-xs text-white/60 w-8 sm:w-10 text-right tabular-nums flex-shrink-0">
        {formatTime(currentTime)}
      </span>

      <div className="flex-1 relative h-1 bg-white/10 rounded-full overflow-hidden group cursor-pointer hover:h-1.5 transition-all duration-200">
        {/* Progress fill */}
        <div
          className="absolute h-full bg-white/80 rounded-full transition-all duration-100 group-hover:bg-white"
          style={{ width: `${percentage}%` }}
        />

        {/* Interactive range input */}
        <input
          type="range"
          min="0"
          max={safeDuration}
          value={currentTime}
          onChange={(e) => {
            if (currentSong) {
              const newTime = Number.parseFloat(e.target.value)
              setCurrentTime(newTime)
            }
          }}
          disabled={!currentSong}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
          aria-label="Song progress"
        />
      </div>

      <span className="text-xs text-white/60 w-8 sm:w-10 tabular-nums flex-shrink-0">{formatTime(duration)}</span>
    </div>
  )
}
