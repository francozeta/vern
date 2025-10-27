"use client"

import type React from "react"

import { useEffect, useRef } from "react"
import { usePlayerStore } from "@/lib/store/player-store"

export function PlayerProvider({ children }: { children: React.ReactNode }) {
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const {
    currentSong,
    isPlaying,
    volume,
    currentTime,
    duration,
    repeatMode,
    setDuration,
    setCurrentTime,
    setIsPlaying,
    nextTrack,
  } = usePlayerStore()

  useEffect(() => {
    if (!audioRef.current) {
      const audio = document.createElement("audio")
      audio.crossOrigin = "anonymous"
      audio.preload = "metadata"
      audioRef.current = audio
      document.body.appendChild(audio)
    }

    return () => {
      if (audioRef.current && audioRef.current.parentNode) {
        audioRef.current.parentNode.removeChild(audioRef.current)
      }
    }
  }, [])

  useEffect(() => {
    if (!audioRef.current || !currentSong) return

    audioRef.current.src = currentSong.audio_url
    audioRef.current.load()

    if (isPlaying) {
      audioRef.current.play().catch(() => {
        console.log("[v0] Autoplay prevented")
      })
    }
  }, [currentSong, isPlaying])

  useEffect(() => {
    if (!audioRef.current) return

    if (isPlaying && audioRef.current.paused) {
      audioRef.current.play().catch(() => {
        console.log("[v0] Play failed")
      })
    } else if (!isPlaying && !audioRef.current.paused) {
      audioRef.current.pause()
    }
  }, [isPlaying])

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume
    }
  }, [volume])

  useEffect(() => {
    if (!audioRef.current || !Number.isFinite(currentTime)) return

    if (Math.abs(audioRef.current.currentTime - currentTime) > 0.5) {
      audioRef.current.currentTime = currentTime
    }
  }, [currentTime])

  useEffect(() => {
    if (!audioRef.current) return

    const audio = audioRef.current

    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime)
    }

    const handleLoadedMetadata = () => {
      setDuration(Number.isFinite(audio.duration) ? audio.duration : 0)
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

    audio.addEventListener("timeupdate", handleTimeUpdate)
    audio.addEventListener("loadedmetadata", handleLoadedMetadata)
    audio.addEventListener("ended", handleEnded)
    audio.addEventListener("play", handlePlay)
    audio.addEventListener("pause", handlePause)

    return () => {
      audio.removeEventListener("timeupdate", handleTimeUpdate)
      audio.removeEventListener("loadedmetadata", handleLoadedMetadata)
      audio.removeEventListener("ended", handleEnded)
      audio.removeEventListener("play", handlePlay)
      audio.removeEventListener("pause", handlePause)
    }
  }, [setCurrentTime, setDuration, setIsPlaying, repeatMode, nextTrack])

  return <>{children}</>
}
