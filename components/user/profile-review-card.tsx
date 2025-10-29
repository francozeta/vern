"use client"

import { useState } from "react"
import { Star, Play, Heart, MessageCircle, MoreHorizontal, Music } from "lucide-react"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { formatDistanceToNow } from "date-fns"
import Image from "next/image"

interface ProfileReviewCardProps {
  review: {
    id: string
    song_title: string
    song_artist: string
    song_album: string
    song_cover_url?: string | null
    title: string
    content: string
    rating: number
    created_at: string
    slug: string
  }
  isOwnProfile?: boolean
  onDelete?: (reviewId: string) => void
}

export function ProfileReviewCard({ review, isOwnProfile = false, onDelete }: ProfileReviewCardProps) {
  const [isHovered, setIsHovered] = useState(false)

  const handleDelete = () => {
    if (onDelete) {
      onDelete(review.id)
    }
  }

  const handleEdit = () => {
    // Navigate to edit review page or open edit modal
    window.location.href = `/reviews/${review.id}/edit`
  }

  const handleViewReview = () => {
    window.location.href = `/reviews/${review.slug}`
  }

  return (
    <div
      className="group cursor-pointer bg-zinc-900/30 hover:bg-zinc-900/50 rounded-xl p-4 transition-all duration-300 border border-zinc-800/30 hover:border-zinc-700/50"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={handleViewReview}
    >
      <div className="flex gap-4">
        {/* Album Cover */}
        <div className="relative flex-shrink-0">
          <div className="w-16 h-16 rounded-lg overflow-hidden bg-zinc-800">
            {review.song_cover_url ? (
              <Image
                src={review.song_cover_url || "/placeholder.svg"}
                alt={review.song_title}
                fill
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <Music className="h-6 w-6 text-zinc-600" />
              </div>
            )}
          </div>

          {/* Play button overlay */}
          <div
            className={`absolute inset-0 bg-black/40 rounded-lg flex items-center justify-center transition-opacity duration-200 ${
              isHovered ? "opacity-100" : "opacity-0"
            }`}
          >
            <Play className="h-4 w-4 text-white" />
          </div>
        </div>

        {/* Review Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between mb-2">
            <div className="min-w-0 flex-1">
              <h3 className="font-semibold text-white text-sm truncate">{review.title}</h3>
              <p className="text-xs text-zinc-400 truncate">
                {review.song_title} • {review.song_artist}
              </p>
            </div>

            {isOwnProfile && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 p-0 text-zinc-400 hover:text-white opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="bg-zinc-900 border-zinc-700">
                  <DropdownMenuItem
                    onClick={(e) => {
                      e.stopPropagation()
                      handleEdit()
                    }}
                  >
                    Edit review
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={(e) => {
                      e.stopPropagation()
                      handleDelete()
                    }}
                    className="text-red-400 hover:text-red-300"
                  >
                    Delete review
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>

          {/* Rating */}
          <div className="flex items-center gap-1 mb-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star
                key={star}
                className={`w-3 h-3 ${star <= review.rating ? "fill-yellow-400 text-yellow-400" : "text-zinc-600"}`}
              />
            ))}
          </div>

          {/* Review excerpt */}
          <p className="text-xs text-zinc-300 line-clamp-2 mb-3">{review.content}</p>

          {/* Footer */}
          <div className="flex items-center justify-between text-xs text-zinc-500">
            <span>{formatDistanceToNow(new Date(review.created_at), { addSuffix: true })}</span>

            <div className="flex items-center gap-3">
              <button
                className="flex items-center gap-1 hover:text-red-400 transition-colors"
                onClick={(e) => e.stopPropagation()}
              >
                <Heart className="h-3 w-3" />
                <span>0</span>
              </button>
              <button
                className="flex items-center gap-1 hover:text-blue-400 transition-colors"
                onClick={(e) => e.stopPropagation()}
              >
                <MessageCircle className="h-3 w-3" />
                <span>0</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
