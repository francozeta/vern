export interface Song {
  id: string
  title: string
  cover_url: string | null
  audio_url: string
  duration_ms: number | null
  created_at: string
  is_published: boolean
  source: string
  artist_id: string | null
  artists?: {
    id: string
    name: string
    image_url?: string | null
  } | null
}

export interface PlaybackState {
  currentSong: Song | null
  isPlaying: boolean
  currentTime: number
  duration: number
  volume: number
  queue: Song[]
  queueIndex: number
  repeatMode: "off" | "one" | "all"
  isShuffle: boolean
}

export interface PlayerStore extends PlaybackState {
  // Playback controls
  playSong: (song: Song) => void
  togglePlay: () => void
  pause: () => void
  play: () => void
  setCurrentTime: (time: number) => void
  setVolume: (volume: number) => void

  // Queue controls
  addToQueue: (song: Song) => void
  removeFromQueue: (index: number) => void
  clearQueue: () => void
  nextTrack: () => void
  previousTrack: () => void
  setQueue: (songs: Song[]) => void

  // Playback modes
  setRepeatMode: (mode: "off" | "one" | "all") => void
  toggleShuffle: () => void

  // Internal
  setDuration: (duration: number) => void
  setIsPlaying: (playing: boolean) => void
  setCurrentSong: (song: Song | null) => void
}
