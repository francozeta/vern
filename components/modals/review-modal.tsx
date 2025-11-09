"use client"

import { useState, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Star, Search, X, Music, Clock, Play } from "lucide-react"
import { cn } from "@/lib/utils"
import { useDebounce } from "@/hooks/use-debounce"
import {
  searchDeezer,
  convertToSelectedSong,
  formatDuration,
  formatSearchQuery,
  type SelectedSong,
  type DeezerTrack,
} from "@/lib/deezer"
import { createReview, type CreateReviewData } from "@/app/actions/reviews"
import { toast } from "sonner"
import { useQuery } from "@tanstack/react-query"
import Image from "next/image"
import { CACHE_KEYS } from "@/lib/cache/cache-keys"

interface ReviewModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  userId: string
  userAvatar?: string | null
}

export function ReviewModal({ open, onOpenChange, userId, userAvatar }: ReviewModalProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedSong, setSelectedSong] = useState<SelectedSong | null>(null)
  const [reviewTitle, setReviewTitle] = useState("")
  const [reviewContent, setReviewContent] = useState("")
  const [rating, setRating] = useState(0)
  const [hoveredRating, setHoveredRating] = useState(0)
  const [showResults, setShowResults] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const maxTitleLength = 100
  const maxContentLength = 500
  const isValid = selectedSong && reviewTitle.trim().length > 0 && reviewContent.trim().length > 0 && rating > 0

  const debouncedSearchQuery = useDebounce(searchQuery, 400)

  const { data: searchData, isLoading: isSearching } = useQuery({
    queryKey: CACHE_KEYS.SONGS_SEARCH(debouncedSearchQuery),
    queryFn: async () => {
      if (!debouncedSearchQuery.trim()) return { data: [] }
      const formattedQuery = formatSearchQuery(debouncedSearchQuery)
      return await searchDeezer(formattedQuery, 15)
    },
    enabled: debouncedSearchQuery.trim().length > 0,
    staleTime: 1000 * 60 * 10, // 10 minutes - increased
  })

  const searchResults = searchData?.data || []

  const handleSearchChange = useCallback((value: string) => {
    setSearchQuery(value)
    setShowResults(value.trim().length > 0)
  }, [])

  const handleSongSelect = (track: DeezerTrack) => {
    const song = convertToSelectedSong(track)
    setSelectedSong(song)
    setShowResults(false)
    setSearchQuery("")
  }

  const handleSubmit = async () => {
    if (!isValid || isSubmitting) return

    setIsSubmitting(true)

    try {
      const reviewData: CreateReviewData = {
        song_id: selectedSong!.id,
        song_title: selectedSong!.title,
        song_artist: selectedSong!.artist,
        song_album: selectedSong!.album,
        song_cover_url: selectedSong!.coverArt,
        song_duration: selectedSong!.duration,
        song_preview_url: selectedSong!.previewUrl,
        song_deezer_url: selectedSong!.deezerUrl,
        title: reviewTitle.trim(),
        content: reviewContent.trim(),
        rating,
      }

      const result = await createReview(reviewData)

      if (result.error) {
        toast.error("Error creating review", {
          description: result.error,
        })
      } else {
        toast.success("Review created!", {
          description: "Your review has been published successfully.",
        })
        resetForm()
        onOpenChange(false)
      }
    } catch (error) {
      console.error("Error submitting review:", error)
      toast.error("Error creating review", {
        description: "Failed to create review. Please try again.",
      })
    } finally {
      setIsSubmitting(false)
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
      <DialogContent
        className="sm:max-w-[650px] max-h-[95vh] sm:max-h-[90vh] p-0 gap-0 bg-background border-border flex flex-col overflow-hidden"
        showCloseButton={false}
      >
        <DialogHeader className="sr-only">
          <DialogTitle>Create Music Review</DialogTitle>
        </DialogHeader>
        {/* Header */}
        <div className="flex items-center justify-between p-3 sm:p-4 border-b border-border bg-background/80 backdrop-blur-sm flex-shrink-0">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClose}
            className="text-muted-foreground hover:text-foreground text-sm sm:text-base"
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <h2 className="text-base sm:text-lg font-semibold">Create Review</h2>
          <Button
            size="sm"
            disabled={!isValid || isSubmitting}
            onClick={handleSubmit}
            className="px-4 sm:px-6 font-medium text-sm sm:text-base"
          >
            {isSubmitting ? "Posting..." : "Post"}
          </Button>
        </div>
        <div className="flex-1 overflow-y-auto">
          {!selectedSong ? (
            /* Search Phase */
            <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
              {/* Search Bar */}
              <div className="space-y-2">
                <h3 className="text-lg sm:text-xl font-semibold">Find a Song</h3>
                <div className="relative">
                  <Search className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground" />
                  <Input
                    placeholder="Search for songs, artists, or albums..."
                    value={searchQuery}
                    onChange={(e) => handleSearchChange(e.target.value)}
                    className="pl-10 sm:pl-12 h-10 sm:h-12 text-sm sm:text-base bg-muted/30 border-muted-foreground/20 focus:border-primary"
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
                <div className="space-y-2 sm:space-y-3">
                  <h4 className="text-xs sm:text-sm font-medium text-muted-foreground">Search Results</h4>
                  <div className="space-y-1 sm:space-y-2 max-h-80 sm:max-h-96 overflow-y-auto">
                    {searchResults.length > 0 ? (
                      searchResults.map((track) => (
                        <button
                          key={track.id}
                          onClick={() => handleSongSelect(track)}
                          className="w-full p-3 sm:p-4 text-left hover:bg-accent/50 rounded-lg sm:rounded-xl transition-all border border-transparent hover:border-border/50 group"
                        >
                          <div className="flex items-center gap-3 sm:gap-4">
                            <div className="relative w-12 h-12 sm:w-14 sm:h-14 rounded-md sm:rounded-lg overflow-hidden bg-muted flex-shrink-0">
                              <Image
                                src={track.album.cover_medium || "/placeholder.svg"}
                                alt={`${track.title} cover`}
                                width={56}
                                height={56}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                              />
                              <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                <Play className="h-4 w-4 text-white" />
                              </div>
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-semibold text-sm sm:text-base truncate">{track.title}</p>
                              <p className="text-xs sm:text-sm text-muted-foreground truncate">{track.artist.name}</p>
                              <p className="text-xs sm:text-sm text-muted-foreground/80 truncate">
                                {track.album.title}
                              </p>
                            </div>
                            <div className="text-xs sm:text-sm text-muted-foreground flex items-center gap-1.5">
                              <Clock className="h-3 w-3" />
                              {formatDuration(track.duration)}
                            </div>
                          </div>
                        </button>
                      ))
                    ) : debouncedSearchQuery.trim() && !isSearching ? (
                      <div className="text-center py-8 sm:py-12 text-muted-foreground">
                        <Music className="h-8 w-8 sm:h-10 sm:w-10 mx-auto mb-2 sm:mb-3 opacity-40" />
                        <p className="text-sm sm:text-base font-medium">No songs found</p>
                        <p className="text-xs sm:text-sm">Try a different search term</p>
                      </div>
                    ) : null}
                  </div>
                </div>
              )}

              {!searchQuery && (
                <div className="text-center py-12 sm:py-16 text-muted-foreground">
                  <Search className="h-12 w-12 sm:h-16 sm:w-16 mx-auto mb-3 sm:mb-4 opacity-30" />
                  <p className="text-lg sm:text-xl font-semibold mb-1 sm:mb-2">Search for Music</p>
                  <p className="text-sm sm:text-base">Find the song you want to review</p>
                </div>
              )}
            </div>
          ) : (
            /* Review Phase */
            <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
              {/* Selected Song Display */}
              <div className="flex items-center gap-3 sm:gap-4 p-3 sm:p-4 bg-accent/30 rounded-lg sm:rounded-xl border border-border/50">
                <div className="w-16 h-16 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                  <Image
                    src={selectedSong.coverArt || "/placeholder.svg"}
                    alt={`${selectedSong.title} cover`}
                    width={64}
                    height={64}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-base sm:text-lg leading-tight truncate">{selectedSong.title}</h3>
                  <p className="text-muted-foreground text-sm sm:text-base truncate">{selectedSong.artist}</p>
                  <p className="text-xs sm:text-sm text-muted-foreground/80 truncate">{selectedSong.album}</p>
                  <p className="text-xs sm:text-sm text-muted-foreground flex items-center gap-1 mt-1">
                    <Clock className="h-3 w-3" />
                    {formatDuration(selectedSong.duration)}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setSelectedSong(null)}
                  className="h-8 w-8 text-muted-foreground hover:text-foreground"
                  disabled={isSubmitting}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>

              {/* Rating */}
              <div className="space-y-2 sm:space-y-3">
                <label className="text-sm sm:text-base font-semibold">Rating</label>
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      onMouseEnter={() => setHoveredRating(star)}
                      onMouseLeave={() => setHoveredRating(0)}
                      className="p-1 hover:scale-110 transition-transform"
                      disabled={isSubmitting}
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
              <div className="space-y-2 sm:space-y-3">
                <label className="text-sm sm:text-base font-semibold">Review Title</label>
                <Input
                  placeholder="Give your review a catchy title..."
                  value={reviewTitle}
                  onChange={(e) => setReviewTitle(e.target.value)}
                  className="text-sm sm:text-base h-10 sm:h-12"
                  maxLength={maxTitleLength}
                  disabled={isSubmitting}
                />
                <div className="flex justify-end">
                  <span
                    className={cn(
                      "text-xs sm:text-sm",
                      reviewTitle.length > maxTitleLength * 0.8 ? "text-destructive" : "text-muted-foreground",
                    )}
                  >
                    {reviewTitle.length}/{maxTitleLength}
                  </span>
                </div>
              </div>

              {/* Review Content */}
              <div className="space-y-2 sm:space-y-3">
                <label className="text-sm sm:text-base font-semibold">Your Review</label>
                <Textarea
                  placeholder="Share your thoughts about this song. What did you like? How did it make you feel?"
                  value={reviewContent}
                  onChange={(e) => setReviewContent(e.target.value)}
                  className="min-h-[100px] sm:min-h-[120px] resize-none text-sm sm:text-base leading-relaxed"
                  maxLength={maxContentLength}
                  disabled={isSubmitting}
                />
                <div className="flex justify-end">
                  <span
                    className={cn(
                      "text-xs sm:text-sm",
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
