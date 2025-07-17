"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Star, Search, X, Music, Clock, Play } from "lucide-react"
import { cn } from "@/lib/utils"
import {
  searchDeezer,
  convertToSelectedSong,
  formatDuration,
  formatSearchQuery,
  type SelectedSong,
  type DeezerTrack,
} from "@/lib/deezer"

interface ReviewModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  userId: string
  userAvatar?: string | null
}

export function ReviewModal({ open, onOpenChange, userId, userAvatar }: ReviewModalProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [searchResults, setSearchResults] = useState<DeezerTrack[]>([])
  const [selectedSong, setSelectedSong] = useState<SelectedSong | null>(null)
  const [reviewTitle, setReviewTitle] = useState("")
  const [reviewContent, setReviewContent] = useState("")
  const [rating, setRating] = useState(0)
  const [hoveredRating, setHoveredRating] = useState(0)
  const [isSearching, setIsSearching] = useState(false)
  const [showResults, setShowResults] = useState(false)

  const maxTitleLength = 100
  const maxContentLength = 500
  const isValid = selectedSong && reviewTitle.trim().length > 0 && reviewContent.trim().length > 0 && rating > 0

  // Search function with debounce
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([])
      setShowResults(false)
      return
    }

    const timeoutId = setTimeout(async () => {
      setIsSearching(true)
      try {
        const formattedQuery = formatSearchQuery(searchQuery)
        const results = await searchDeezer(formattedQuery, 15)
        setSearchResults(results.data || [])
        setShowResults(true)
      } catch (error) {
        console.error("Search error:", error)
        setSearchResults([])
      } finally {
        setIsSearching(false)
      }
    }, 400)

    return () => clearTimeout(timeoutId)
  }, [searchQuery])

  const handleSongSelect = (track: DeezerTrack) => {
    const song = convertToSelectedSong(track)
    setSelectedSong(song)
    setShowResults(false)
    setSearchQuery("")
  }

  const handleSubmit = async () => {
    if (isValid) {
      // TODO: Submit review to API
      console.log({
        song: selectedSong,
        title: reviewTitle,
        content: reviewContent,
        rating,
        userId,
      })

      // Reset and close
      resetForm()
      onOpenChange(false)
    }
  }

  const resetForm = () => {
    setSelectedSong(null)
    setReviewTitle("")
    setReviewContent("")
    setRating(0)
    setSearchQuery("")
    setShowResults(false)
  }

  const handleClose = () => {
    resetForm()
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[650px] max-h-[90vh] p-0 gap-0 bg-background border-border overflow-hidden" showCloseButton={false}>
        <DialogHeader className="sr-only">
          <DialogTitle>Create Music Review</DialogTitle>
        </DialogHeader>

        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border bg-background/80 backdrop-blur-sm">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClose}
            className="text-muted-foreground hover:text-foreground"
          >
            Cancel
          </Button>
          <h2 className="text-lg font-semibold">Create Review</h2>
          <Button size="sm" disabled={!isValid} onClick={handleSubmit} className="px-6 font-medium">
            Post
          </Button>
        </div>

        <div className="flex-1 overflow-y-auto">
          {!selectedSong ? (
            /* Search Phase */
            <div className="p-6 space-y-6">
              {/* Search Bar */}
              <div className="space-y-2">
                <h3 className="text-xl font-semibold">Find a Song</h3>
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  <Input
                    placeholder="Search for songs, artists, or albums..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-12 h-12 text-base bg-muted/30 border-muted-foreground/20 focus:border-primary"
                    autoFocus
                  />
                  {isSearching && (
                    <div className="absolute right-4 top-1/2 -translate-y-1/2">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary" />
                    </div>
                  )}
                </div>
              </div>

              {/* Search Results */}
              {showResults && (
                <div className="space-y-3">
                  <h4 className="text-sm font-medium text-muted-foreground">Search Results</h4>
                  <div className="space-y-2 max-h-96 overflow-y-auto">
                    {searchResults.length > 0 ? (
                      searchResults.map((track) => (
                        <button
                          key={track.id}
                          onClick={() => handleSongSelect(track)}
                          className="w-full p-4 text-left hover:bg-accent/50 rounded-xl transition-all border border-transparent hover:border-border/50 group"
                        >
                          <div className="flex items-center gap-4">
                            <div className="relative w-14 h-14 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                              <img
                                src={track.album.cover_medium || "/placeholder.svg"}
                                alt={`${track.title} cover`}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                              />
                              <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                <Play className="h-4 w-4 text-white" />
                              </div>
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-semibold text-base truncate">{track.title}</p>
                              <p className="text-sm text-muted-foreground truncate">{track.artist.name}</p>
                              <p className="text-xs text-muted-foreground/80 truncate">{track.album.title}</p>
                            </div>
                            <div className="text-xs text-muted-foreground flex items-center gap-1.5">
                              <Clock className="h-3 w-3" />
                              {formatDuration(track.duration)}
                            </div>
                          </div>
                        </button>
                      ))
                    ) : (
                      <div className="text-center py-12 text-muted-foreground">
                        <Music className="h-10 w-10 mx-auto mb-3 opacity-40" />
                        <p className="text-base font-medium">No songs found</p>
                        <p className="text-sm">Try a different search term</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {!searchQuery && (
                <div className="text-center py-16 text-muted-foreground">
                  <Search className="h-16 w-16 mx-auto mb-4 opacity-30" />
                  <p className="text-xl font-semibold mb-2">Search for Music</p>
                  <p className="text-base">Find the song you want to review</p>
                </div>
              )}
            </div>
          ) : (
            /* Review Phase */
            <div className="p-6 space-y-6">
              {/* Selected Song Display */}
              <div className="flex items-center gap-4 p-4 bg-accent/30 rounded-xl border border-border/50">
                <div className="w-16 h-16 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                  <img
                    src={selectedSong.coverArt || "/placeholder.svg"}
                    alt={`${selectedSong.title} cover`}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-lg leading-tight truncate">{selectedSong.title}</h3>
                  <p className="text-muted-foreground text-base truncate">{selectedSong.artist}</p>
                  <p className="text-sm text-muted-foreground/80 truncate">{selectedSong.album}</p>
                  <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                    <Clock className="h-3 w-3" />
                    {formatDuration(selectedSong.duration)}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setSelectedSong(null)}
                  className="h-8 w-8 text-muted-foreground hover:text-foreground"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>

              {/* Rating */}
              <div className="space-y-3">
                <label className="text-base font-semibold">Rating</label>
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      onMouseEnter={() => setHoveredRating(star)}
                      onMouseLeave={() => setHoveredRating(0)}
                      className="p-1 hover:scale-110 transition-transform"
                    >
                      <Star
                        className={cn(
                          "w-6 h-6 sm:w-7 sm:h-7 transition-colors",
                          hoveredRating >= star || rating >= star
                            ? "fill-yellow-400 text-yellow-400"
                            : "text-muted-foreground hover:text-yellow-400",
                        )}
                      />
                    </button>
                  ))}
                </div>
              </div>

              {/* Review Title */}
              <div className="space-y-3">
                <label className="text-base font-semibold">Review Title</label>
                <Input
                  placeholder="Give your review a catchy title..."
                  value={reviewTitle}
                  onChange={(e) => setReviewTitle(e.target.value)}
                  className="text-base h-12"
                  maxLength={maxTitleLength}
                />
                <div className="flex justify-end">
                  <span
                    className={cn(
                      "text-xs",
                      reviewTitle.length > maxTitleLength * 0.8 ? "text-destructive" : "text-muted-foreground",
                    )}
                  >
                    {reviewTitle.length}/{maxTitleLength}
                  </span>
                </div>
              </div>

              {/* Review Content */}
              <div className="space-y-3">
                <label className="text-base font-semibold">Your Review</label>
                <Textarea
                  placeholder="Share your thoughts about this song. What did you like? How did it make you feel?"
                  value={reviewContent}
                  onChange={(e) => setReviewContent(e.target.value)}
                  className="min-h-[120px] resize-none text-base leading-relaxed"
                  maxLength={maxContentLength}
                />
                <div className="flex justify-end">
                  <span
                    className={cn(
                      "text-xs",
                      reviewContent.length > maxContentLength * 0.8 ? "text-destructive" : "text-muted-foreground",
                    )}
                  >
                    {reviewContent.length}/{maxContentLength}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
