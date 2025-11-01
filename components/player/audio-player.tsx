"use client"

import { useRef, useState } from "react"
import { AlertCircle, Volume2, VolumeX } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface AudioPlayerProps {
  src: string
  title?: string
  className?: string
}

/**
 * New component: Audio player with CORS support
 * Handles crossOrigin="anonymous" and error states properly
 */
export function AudioPlayer({ src, title, className = "" }: AudioPlayerProps) {
  const audioRef = useRef<HTMLAudioElement>(null)
  const [error, setError] = useState<string | null>(null)
  const [isMuted, setIsMuted] = useState(false)

  const handleError = (event: any) => {
    const audio = audioRef.current
    if (!audio) return

    switch (audio.error?.code) {
      case audio.error?.MEDIA_ERR_ABORTED:
        setError("Playback aborted")
        break
      case audio.error?.MEDIA_ERR_NETWORK:
        setError("Network error - check your connection")
        break
      case audio.error?.MEDIA_ERR_DECODE:
        setError("Could not decode audio file")
        break
      case audio.error?.MEDIA_ERR_SRC_NOT_SUPPORTED:
        setError("Audio format not supported")
        break
      default:
        setError("Error loading audio preview")
    }
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    )
  }

  return (
    <div className={`space-y-3 ${className}`}>
      {title && <p className="text-sm font-medium text-muted-foreground">{title}</p>}
      <div className="flex items-center gap-2">
        <audio
          ref={audioRef}
          controls
          crossOrigin="anonymous"
          onError={handleError}
          className="flex-1 h-8"
          style={{
            filter: isMuted ? "brightness(0.7)" : "brightness(1)",
          }}
        >
          <source src={src} type="audio/mpeg" />
          Your browser does not support the audio element.
        </audio>
        <button
          onClick={() => setIsMuted(!isMuted)}
          className="p-2 hover:bg-muted rounded-lg transition-colors"
          aria-label="Toggle mute"
        >
          {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
        </button>
      </div>
    </div>
  )
}
