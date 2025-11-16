// lib/artist/fetchArtist.ts

export async function fetchArtistDeezerData(artistId: string) {
  try {
    // Datos principales del artista
    const artistRes = await fetch(`https://api.deezer.com/artist/${artistId}`)
    const artist = await artistRes.json()

    if (artist.error) {
      console.error("Deezer artist error:", artist.error)
      return null
    }

    // Top tracks
    const topRes = await fetch(
      `https://api.deezer.com/artist/${artistId}/top?limit=20`,
    )
    const topJson = await topRes.json()

    // Álbumes
    const albumsRes = await fetch(
      `https://api.deezer.com/artist/${artistId}/albums`,
    )
    const albumsJson = await albumsRes.json()

    return {
      ...artist,
      topTracks: topJson?.data ?? [],
      albums: albumsJson?.data ?? [],
    }
  } catch (error) {
    console.error("Error fetching artist from Deezer:", error)
    return null
  }
}
