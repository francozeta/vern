"use client"

import { usePlayerStore } from "@/lib/store/player-store"
import { Button } from "@/components/ui/button"
import { Play } from "lucide-react"
import type { Song } from "@/types/player"

interface RecentSongsProps {
  songs: Song[]
}

export function RecentSongs({ songs }: RecentSongsProps) {
  const { addToQueue, play } = usePlayerStore()

  const handlePlaySong = (song: Song) => {
    addToQueue(song)
    play()
  }

  if (!songs || songs.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-zinc-400">No songs uploaded yet. Be the first to share your music!</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold text-white">Recently Uploaded</h2>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {songs.map((song) => (
          <div
            key={song.id}
            className="group relative bg-zinc-900/50 rounded-lg overflow-hidden hover:bg-zinc-800/50 transition-colors"
          >
            {/* Cover Image */}
            <div className="relative aspect-square overflow-hidden bg-zinc-800">
              {song.cover_url ? (
                <img
                  src={song.cover_url || "/placeholder.svg"}
                  alt={song.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-zinc-700 to-zinc-900 flex items-center justify-center">
                  <span className="text-xs text-zinc-500">No cover</span>
                </div>
              )}

              {/* Play Button Overlay */}
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <Button
                  size="lg"
                  className="h-12 w-12 rounded-full bg-white text-black hover:bg-white/90 p-0"
                  onClick={() => handlePlaySong(song)}
                >
                  <Play className="h-5 w-5 fill-current" />
                </Button>
              </div>
            </div>

            {/* Song Info */}
            <div className="p-3">
              <p className="text-sm font-semibold text-white truncate">{song.title}</p>
              <p className="text-xs text-zinc-400 truncate">{song.artists?.name || "Unknown Artist"}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
