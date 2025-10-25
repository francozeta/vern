"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Spinner } from "@/components/ui/spinner"
import { Music, UploadIcon } from "lucide-react"
import { toast } from "sonner"
import { uploadSongAudioClient, uploadSongCoverClient } from "@/lib/supabase/upload"
import { createSong } from "@/app/actions/songs"
import { createClient } from "@/lib/supabase/client"

interface UploadModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  userId: string
}

export function UploadModal({ open, onOpenChange, userId }: UploadModalProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [audioFile, setAudioFile] = useState<File | null>(null)
  const [coverFile, setCoverFile] = useState<File | null>(null)
  const [audioPreview, setAudioPreview] = useState<string | null>(null)
  const [coverPreview, setCoverPreview] = useState<string | null>(null)
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [durationMs, setDurationMs] = useState<number | null>(null)
  const [artistId, setArtistId] = useState<string | null>(null)
  const [displayName, setDisplayName] = useState<string>("")

  useEffect(() => {
    const fetchArtistInfo = async () => {
      const supabase = createClient()
      const { data: profile } = await supabase.from("profiles").select("display_name").eq("id", userId).single()

      if (profile?.display_name) {
        setDisplayName(profile.display_name)
        setArtistId(userId)
      }
    }

    if (open) {
      fetchArtistInfo()
    }
  }, [open, userId])

  const handleAudioChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setAudioFile(file)
      setAudioPreview(file.name)

      const audio = new Audio()
      audio.onloadedmetadata = () => {
        setDurationMs(Math.round(audio.duration * 1000))
      }
      audio.src = URL.createObjectURL(file)
    }
  }

  const handleCoverChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setCoverFile(file)
      const reader = new FileReader()
      reader.onload = (e) => {
        setCoverPreview(e.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!audioFile || !title) {
      toast.error("Please provide title and audio file")
      return
    }

    const supabase = createClient()
    const { data: artist } = await supabase.from("artists").select("id").eq("id", userId).single()

    if (!artist) {
      toast.error("Please switch to artist mode in your profile before uploading songs")
      return
    }

    setIsLoading(true)

    try {
      // Upload audio
      const { url: audioUrl, error: audioError } = await uploadSongAudioClient(audioFile, userId)
      if (audioError) {
        toast.error(audioError)
        setIsLoading(false)
        return
      }

      // Upload cover if provided
      let coverUrl: string | undefined
      if (coverFile) {
        const { url, error: coverError } = await uploadSongCoverClient(coverFile, userId)
        if (coverError) {
          console.warn("Cover upload failed:", coverError)
        } else {
          coverUrl = url
        }
      }

      // Create song record
      const result = await createSong({
        title,
        artist: displayName,
        description,
        audioUrl: audioUrl!,
        coverUrl,
        durationMs: durationMs || undefined,
      })

      if (result.error) {
        toast.error(result.error)
      } else {
        toast.success("Your song has been uploaded")
        onOpenChange(false)
        // Reset form
        setAudioFile(null)
        setCoverFile(null)
        setAudioPreview(null)
        setCoverPreview(null)
        setTitle("")
        setDescription("")
        setDurationMs(null)
      }
    } catch (error) {
      console.error("Upload error:", error)
      toast.error("An unexpected error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Music className="h-5 w-5" />
            Upload Your Song
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Audio File */}
          <div className="space-y-2">
            <Label htmlFor="audio">Audio File *</Label>
            <div className="relative">
              <input
                id="audio"
                type="file"
                accept="audio/*"
                onChange={handleAudioChange}
                disabled={isLoading}
                className="hidden"
              />
              <label
                htmlFor="audio"
                className="flex items-center justify-center gap-2 p-4 border-2 border-dashed border-border rounded-lg cursor-pointer hover:bg-muted/50 transition-colors"
              >
                <UploadIcon className="h-4 w-4" />
                <span className="text-sm text-muted-foreground">
                  {audioPreview ? audioPreview : "Click to upload audio"}
                </span>
              </label>
            </div>
            {durationMs && (
              <p className="text-xs text-muted-foreground">
                Duration: {Math.floor(durationMs / 1000 / 60)}:
                {String(Math.floor((durationMs / 1000) % 60)).padStart(2, "0")}
              </p>
            )}
          </div>

          {/* Cover Image */}
          <div className="space-y-2">
            <Label htmlFor="cover">Cover Image</Label>
            <div className="relative">
              <input
                id="cover"
                type="file"
                accept="image/*"
                onChange={handleCoverChange}
                disabled={isLoading}
                className="hidden"
              />
              <label
                htmlFor="cover"
                className="flex items-center justify-center p-4 border-2 border-dashed border-border rounded-lg cursor-pointer hover:bg-muted/50 transition-colors"
              >
                {coverPreview ? (
                  <img
                    src={coverPreview || "/placeholder.svg"}
                    alt="Cover preview"
                    className="h-20 w-20 object-cover rounded"
                  />
                ) : (
                  <span className="text-sm text-muted-foreground">Click to upload cover</span>
                )}
              </label>
            </div>
          </div>

          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title">Song Title *</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter song title"
              disabled={isLoading}
            />
          </div>

          <div className="space-y-2">
            <Label>Uploading as</Label>
            <div className="p-3 rounded-md bg-blue-500/10 border border-blue-500/30 text-sm">
              <p className="font-medium text-blue-100">{displayName || "Loading..."}</p>
              <p className="text-xs text-blue-200/70 mt-1">
                Your music will be published under this name. Update your display name in settings to change it.
              </p>
            </div>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Add a description (optional)"
              disabled={isLoading}
              rows={3}
            />
          </div>

          {/* Submit Button */}
          <Button type="submit" disabled={isLoading} className="w-full">
            {isLoading ? (
              <>
                <Spinner className="h-4 w-4 mr-2" />
                Uploading...
              </>
            ) : (
              <>
                <UploadIcon className="h-4 w-4 mr-2" />
                Upload Song
              </>
            )}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}
