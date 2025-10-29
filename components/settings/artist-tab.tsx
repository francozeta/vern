"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Spinner } from "@/components/ui/spinner"
import { Music, Trash2, Eye, EyeOff } from "lucide-react"
import { toast } from "sonner"
import { getUserSongs, deleteSong, publishSong } from "@/app/actions/songs"
import { UploadModal } from "@/components/modals/upload-modal"
import { SettingsCard } from "@/components/settings/settings-card"
import type { Song } from "@/lib/validations/songs"

interface ArtistTabProps {
  userId: string
}

export function ArtistTab({ userId }: ArtistTabProps) {
  const [songs, setSongs] = useState<Song[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showUploadModal, setShowUploadModal] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [publishingId, setPublishingId] = useState<string | null>(null)

  useEffect(() => {
    loadSongs()
  }, [])

  const loadSongs = async () => {
    setIsLoading(true)
    const result = await getUserSongs()
    if (result.error) {
      toast.error(result.error)
    } else {
      setSongs(result.data || [])
    }
    setIsLoading(false)
  }

  const handleDelete = async (songId: string) => {
    if (!confirm("Are you sure you want to delete this song?")) return

    setDeletingId(songId)
    const result = await deleteSong(songId)
    setDeletingId(null)

    if (result.error) {
      toast.error(result.error)
    } else {
      setSongs(songs.filter((s) => s.id !== songId))
      toast.success("Your song has been removed")
    }
  }

  const handlePublish = async (songId: string, currentStatus: boolean) => {
    setPublishingId(songId)
    const result = await publishSong(songId, !currentStatus)
    setPublishingId(null)

    if (result.error) {
      toast.error(result.error)
    } else {
      setSongs(songs.map((s) => (s.id === songId ? { ...s, is_published: !currentStatus } : s)))
      toast.success(`Song is now ${!currentStatus ? "published" : "unpublished"}`)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Spinner className="h-6 w-6" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <SettingsCard
        title="My Songs"
        description="Manage your uploaded music"
        footerText={`${songs.length} song${songs.length !== 1 ? "s" : ""} uploaded`}
      >
        <div className="space-y-4">
          <Button onClick={() => setShowUploadModal(true)} className="gap-2 w-full sm:w-auto">
            <Music className="h-4 w-4" />
            Upload Song
          </Button>

          {songs.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Music className="h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-muted-foreground">No songs uploaded yet</p>
                <p className="text-sm text-muted-foreground mb-4">Start by uploading your first song</p>
                <Button onClick={() => setShowUploadModal(true)} variant="outline">
                  Upload Song
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {songs.map((song) => (
                <Card key={song.id} className="overflow-hidden">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-semibold truncate">{song.title}</h4>
                          <Badge variant={song.is_published ? "default" : "secondary"}>
                            {song.is_published ? "Published" : "Draft"}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground truncate">
                          {song.artist_id ? "Artist" : "Unknown"}
                        </p>
                        <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                          <span>{song.review_count || 0} reviews</span>
                          <span>{song.play_count || 0} plays</span>
                          {song.average_rating && <span>⭐ {song.average_rating.toFixed(1)}</span>}
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handlePublish(song.id, song.is_published)}
                          disabled={publishingId === song.id}
                        >
                          {song.is_published ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(song.id)}
                          disabled={deletingId === song.id}
                          className="text-destructive hover:text-destructive"
                        >
                          {deletingId === song.id ? <Spinner className="h-4 w-4" /> : <Trash2 className="h-4 w-4" />}
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </SettingsCard>

      <UploadModal open={showUploadModal} onOpenChange={setShowUploadModal} userId={userId} />
    </div>
  )
}
