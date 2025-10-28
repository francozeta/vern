"use client"

import type React from "react"
import { useEffect, useRef } from "react"
import { usePlayerStore } from "@/lib/store/player-store"

declare global {
  interface Window {
    __vernAudio?: HTMLAudioElement
  }
}

export function PlayerProvider({ children }: { children: React.ReactNode }) {
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const lastSongIdRef = useRef<string | null>(null)
  const pendingSeekRef = useRef<number | null>(null)

  const {
    currentSong,
    isPlaying,
    volume,
    currentTime,
    repeatMode,
    setDuration,
    setCurrentTime,
    setIsPlaying,
    nextTrack,
  } = usePlayerStore()

  useEffect(() => {
    if (typeof window === "undefined") return

    // Reuse existing audio element if it exists (singleton pattern)
    if (!window.__vernAudio) {
      const audio = document.createElement("audio")
      audio.crossOrigin = "anonymous"
      audio.preload = "metadata"
      audio.setAttribute("playsinline", "true")
      document.body.appendChild(audio)
      window.__vernAudio = audio
    }

    audioRef.current = window.__vernAudio

    return () => {
      // Audio persists globally, no cleanup needed
    }
  }, [])

  useEffect(() => {
    if (!audioRef.current || !currentSong) return

    const audio = audioRef.current
    const songChanged = lastSongIdRef.current !== currentSong.id

    if (songChanged) {
      lastSongIdRef.current = currentSong.id
      audio.src = currentSong.audio_url
      audio.load()

      if (isPlaying) {
        audio.play().catch(() => {
          // Autoplay prevented by browser
        })
      }
    }
  }, [currentSong, isPlaying])

  useEffect(() => {
    if (!audioRef.current || !currentSong) return

    const audio = audioRef.current

    if (isPlaying && audio.paused) {
      audio.play().catch(() => {
        // Play failed, likely due to browser autoplay policy
      })
    } else if (!isPlaying && !audio.paused) {
      audio.pause()
    }
  }, [isPlaying, currentSong])

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume
    }
  }, [volume])

  useEffect(() => {
    if (!audioRef.current || !Number.isFinite(currentTime)) return

    const audio = audioRef.current
    const timeDiff = Math.abs(audio.currentTime - currentTime)

    // Only seek if difference is significant (> 1 second)
    if (timeDiff > 1) {
      if (!Number.isFinite(audio.duration) || audio.duration === 0) {
        pendingSeekRef.current = currentTime
        return
      }

      audio.currentTime = currentTime
    }
  }, [currentTime])

  useEffect(() => {
    if (!audioRef.current) return

    const audio = audioRef.current

    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime)
    }

    const handleLoadedMetadata = () => {
      const duration = Number.isFinite(audio.duration) ? audio.duration : 0
      setDuration(duration)

      // Apply pending seek if exists
      if (pendingSeekRef.current !== null) {
        audio.currentTime = pendingSeekRef.current
        setCurrentTime(pendingSeekRef.current)
        pendingSeekRef.current = null
      }
    }

    const handleEnded = () => {
      if (repeatMode === "one") {
        audio.currentTime = 0
        audio.play().catch(() => {})
      } else {
        nextTrack()
      }
    }

    const handlePlay = () => {
      setIsPlaying(true)
    }

    const handlePause = () => {
      setIsPlaying(false)
    }

    const handleError = (e: Event) => {
      // Audio error occurred, but player continues
    }

    audio.addEventListener("timeupdate", handleTimeUpdate)
    audio.addEventListener("loadedmetadata", handleLoadedMetadata)
    audio.addEventListener("ended", handleEnded)
    audio.addEventListener("play", handlePlay)
    audio.addEventListener("pause", handlePause)
    audio.addEventListener("error", handleError)

    return () => {
      audio.removeEventListener("timeupdate", handleTimeUpdate)
      audio.removeEventListener("loadedmetadata", handleLoadedMetadata)
      audio.removeEventListener("ended", handleEnded)
      audio.removeEventListener("play", handlePlay)
      audio.removeEventListener("pause", handlePause)
      audio.removeEventListener("error", handleError)
    }
  }, [setCurrentTime, setDuration, setIsPlaying, repeatMode, nextTrack])

  useEffect(() => {
    if (!currentSong || typeof navigator === "undefined" || !("mediaSession" in navigator)) return

    navigator.mediaSession.metadata = new MediaMetadata({
      title: currentSong.title,
      artist: currentSong.artists?.name || "Unknown Artist",
      artwork: currentSong.cover_url
        ? [
            { src: currentSong.cover_url, sizes: "96x96", type: "image/jpeg" },
            { src: currentSong.cover_url, sizes: "128x128", type: "image/jpeg" },
            { src: currentSong.cover_url, sizes: "192x192", type: "image/jpeg" },
            { src: currentSong.cover_url, sizes: "256x256", type: "image/jpeg" },
            { src: currentSong.cover_url, sizes: "384x384", type: "image/jpeg" },
            { src: currentSong.cover_url, sizes: "512x512", type: "image/jpeg" },
          ]
        : [],
    })
  }, [currentSong])

  useEffect(() => {
    if (typeof navigator === "undefined" || !("mediaSession" in navigator)) return

    const { togglePlay, nextTrack: next, previousTrack: prev } = usePlayerStore.getState()

    navigator.mediaSession.setActionHandler("play", () => {
      togglePlay()
    })
    navigator.mediaSession.setActionHandler("pause", () => {
      togglePlay()
    })
    navigator.mediaSession.setActionHandler("nexttrack", () => {
      next()
    })
    navigator.mediaSession.setActionHandler("previoustrack", () => {
      prev()
    })

    return () => {
      navigator.mediaSession.setActionHandler("play", null)
      navigator.mediaSession.setActionHandler("pause", null)
      navigator.mediaSession.setActionHandler("nexttrack", null)
      navigator.mediaSession.setActionHandler("previoustrack", null)
    }
  }, [])

  return <>{children}</>
}
