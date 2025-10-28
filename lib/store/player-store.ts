import { create } from "zustand"
import { persist } from "zustand/middleware"
import type { Song, PlayerStore } from "@/types/player"
import { getNextIndex, getPreviousIndex } from "@/lib/utils/queue-manager"

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
      shuffleHistory: [],

      playSong: (song: Song, addToQueue = true) => {
        const state = get()

        const existingIndex = state.queue.findIndex((s) => s.id === song.id)

        if (existingIndex !== -1) {
          set({
            queueIndex: existingIndex,
            currentSong: song,
            isPlaying: true,
          })
        } else if (addToQueue) {
          const newQueue = [...state.queue, song]
          set({
            queue: newQueue,
            queueIndex: newQueue.length - 1,
            currentSong: song,
            isPlaying: true,
          })
        } else {
          set({
            currentSong: song,
            isPlaying: true,
          })
        }
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

      addToQueue: (song: Song) => {
        set((state) => {
          if (state.queue.some((s) => s.id === song.id)) {
            return state
          }
          return {
            queue: [...state.queue, song],
          }
        })
      },

      removeFromQueue: (index: number) => {
        set((state) => {
          const newQueue = state.queue.filter((_, i) => i !== index)
          let newQueueIndex = state.queueIndex

          if (index < state.queueIndex) {
            newQueueIndex = state.queueIndex - 1
          } else if (index === state.queueIndex) {
            newQueueIndex = -1
          }

          return {
            queue: newQueue,
            queueIndex: newQueueIndex,
          }
        })
      },

      clearQueue: () => {
        set({ queue: [], queueIndex: -1 })
      },

      nextTrack: () => {
        const state = get()
        if (state.queue.length === 0) return

        const nextIndex = getNextIndex(
          state.queueIndex,
          state.queue.length,
          state.repeatMode,
          state.isShuffle,
          state.shuffleHistory,
        )

        if (nextIndex === -1) {
          set({ isPlaying: false })
          return
        }

        const nextSong = state.queue[nextIndex]
        const newShuffleHistory = state.isShuffle ? [...state.shuffleHistory, state.queueIndex].slice(-10) : []

        set({
          currentSong: nextSong,
          queueIndex: nextIndex,
          isPlaying: true,
          shuffleHistory: newShuffleHistory,
        })
      },

      previousTrack: () => {
        const state = get()
        if (state.queue.length === 0) return

        if (state.currentTime > 3) {
          set({ currentTime: 0 })
          return
        }

        const prevIndex = getPreviousIndex(state.queueIndex, state.queue.length)
        const prevSong = state.queue[prevIndex]

        set({
          currentSong: prevSong,
          queueIndex: prevIndex,
          isPlaying: true,
        })
      },

      setQueue: (songs: Song[], startIndex = 0) => {
        const firstSong = songs[startIndex]
        set({
          queue: songs,
          queueIndex: startIndex,
          currentSong: firstSong || null,
          isPlaying: !!firstSong,
        })
      },

      // Playback modes
      setRepeatMode: (mode: "off" | "one" | "all") => {
        set({ repeatMode: mode })
      },

      toggleShuffle: () => {
        set((state) => ({
          isShuffle: !state.isShuffle,
          shuffleHistory: [],
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
        queue: state.queue,
        queueIndex: state.queueIndex,
        currentSong: state.currentSong,
      }),
    },
  ),
)
