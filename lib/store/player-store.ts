import { create } from "zustand"
import { persist } from "zustand/middleware"
import type { Song, PlayerStore } from "@/types/player"

export const usePlayerStore = create<PlayerStore>()(
  persist(
    (set, get) => ({
      // Initial state
      currentSong: null,
      isPlaying: false,
      currentTime: 0,
      duration: 0,
      volume: 1,
      queue: [],
      queueIndex: -1,
      repeatMode: "off",
      isShuffle: false,

      // Playback controls
      playSong: (song: Song) => {
        set({
          currentSong: song,
          isPlaying: true,
          currentTime: 0,
          queueIndex: -1,
        })
      },

      togglePlay: () => {
        set((state) => ({
          isPlaying: !state.isPlaying,
        }))
      },

      pause: () => {
        set({ isPlaying: false })
      },

      play: () => {
        set({ isPlaying: true })
      },

      setCurrentTime: (time: number) => {
        set({ currentTime: time })
      },

      setVolume: (volume: number) => {
        set({ volume: Math.max(0, Math.min(1, volume)) })
      },

      // Queue controls
      addToQueue: (song: Song) => {
        set((state) => ({
          queue: [...state.queue, song],
        }))
      },

      removeFromQueue: (index: number) => {
        set((state) => ({
          queue: state.queue.filter((_, i) => i !== index),
        }))
      },

      clearQueue: () => {
        set({ queue: [], queueIndex: -1 })
      },

      nextTrack: () => {
        const state = get()
        if (state.queue.length === 0) return

        let nextIndex = state.queueIndex + 1

        if (state.isShuffle) {
          nextIndex = Math.floor(Math.random() * state.queue.length)
        } else if (nextIndex >= state.queue.length) {
          if (state.repeatMode === "all") {
            nextIndex = 0
          } else {
            return
          }
        }

        const nextSong = state.queue[nextIndex]
        set({
          currentSong: nextSong,
          queueIndex: nextIndex,
          isPlaying: true,
          currentTime: 0,
        })
      },

      previousTrack: () => {
        const state = get()
        if (state.queue.length === 0) return

        const prevIndex = Math.max(0, state.queueIndex - 1)
        const prevSong = state.queue[prevIndex]

        set({
          currentSong: prevSong,
          queueIndex: prevIndex,
          isPlaying: true,
          currentTime: 0,
        })
      },

      setQueue: (songs: Song[]) => {
        set({
          queue: songs,
          queueIndex: -1,
        })
      },

      // Playback modes
      setRepeatMode: (mode: "off" | "one" | "all") => {
        set({ repeatMode: mode })
      },

      toggleShuffle: () => {
        set((state) => ({
          isShuffle: !state.isShuffle,
        }))
      },

      // Internal setters
      setDuration: (duration: number) => {
        set({ duration })
      },

      setIsPlaying: (playing: boolean) => {
        set({ isPlaying: playing })
      },

      setCurrentSong: (song: Song | null) => {
        set({ currentSong: song })
      },
    }),
    {
      name: "vern-player-store",
      partialize: (state) => ({
        volume: state.volume,
        repeatMode: state.repeatMode,
        isShuffle: state.isShuffle,
      }),
    },
  ),
)
