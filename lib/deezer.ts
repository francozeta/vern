// Deezer API types
export interface DeezerTrack {
  id: number
  title: string
  title_short: string
  duration: number
  rank: number
  explicit_lyrics: boolean
  preview: string
  artist: {
    id: number
    name: string
    picture: string
    picture_small: string
    picture_medium: string
    picture_big: string
  }
  album: {
    id: number
    title: string
    cover: string
    cover_small: string
    cover_medium: string
    cover_big: string
    cover_xl: string
  }
}

export interface DeezerSearchResult {
  data: DeezerTrack[]
  total: number
  next?: string
}

export interface DeezerArtist {
  id: number
  name: string
  link: string
  picture: string
  picture_small: string
  picture_medium: string
  picture_big: string
  picture_xl: string
  nb_album: number
  nb_fan: number
  radio: boolean
  tracklist: string
  type: "artist"
}

export interface DeezerArtistSearchResult {
  data: DeezerArtist[]
  total: number
  next?: string
}

export interface SelectedSong {
  id: string
  title: string
  artist: string
  album: string
  coverArt: string
  duration: number
  previewUrl?: string
  deezerUrl?: string
}

// Search tracks in Deezer using the Next.js API proxy
export async function searchDeezer(query: string, limit = 10): Promise<DeezerSearchResult> {
  try {
    // Call your Next.js API route
    const url = `/api/deezer/search?q=${encodeURIComponent(query)}&limit=${limit}`

    const response = await fetch(url)

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(`Deezer API proxy error: ${response.status} - ${errorData.error || "Unknown error"}`)
    }

    const data = await response.json()
    return data
  } catch (error) {
    console.error("Error searching Deezer via proxy:", error)
    throw error
  }
}

// Convert Deezer track to our SelectedSong format
export function convertToSelectedSong(track: DeezerTrack): SelectedSong {
  return {
    id: track.id.toString(),
    title: track.title,
    artist: track.artist.name,
    album: track.album.title,
    coverArt: track.album.cover_medium || track.album.cover,
    duration: track.duration,
    previewUrl: track.preview,
    deezerUrl: `https://www.deezer.com/track/${track.id}`,
  }
}

// Helper function to format duration
export function formatDuration(seconds: number): string {
  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = seconds % 60
  return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`
}

// Search with better query formatting
export function formatSearchQuery(input: string): string {
  // Clean the input and make it more search-friendly
  return input
    .trim()
    .replace(/[^\w\s-]/g, "") // Remove special characters except hyphens
    .replace(/\s+/g, " ") // Normalize spaces
}

// Search artists in Deezer using the Next.js API proxy
export async function searchDeezerArtists(query: string, limit = 10): Promise<DeezerArtistSearchResult> {
  try {
    const url = `/api/deezer/search?q=${encodeURIComponent(query)}&type=artist&limit=${limit}`

    const response = await fetch(url)

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(`Deezer Artist API proxy error: ${response.status} - ${errorData.error || "Unknown error"}`)
    }

    const data = await response.json()
    return data
  } catch (error) {
    console.error("Error searching Deezer artists via proxy:", error)
    throw error
  }
}
