// lib/artist/getArtistFull.ts

import { createServerSupabaseClient } from "@/lib/supabase/server"

export async function getArtistFromDB(deezerArtistId: string) {
  const supabase = await createServerSupabaseClient()

  // 1. Buscar el artista en tu tabla usando external_id + provider
  const { data: artist, error } = await supabase
    .from("artists")
    .select("id, name, external_id, provider, image_url, bio")
    .eq("external_id", deezerArtistId)
    .eq("provider", "deezer")
    .maybeSingle()

  if (error) {
    console.error("Error fetching artist from DB:", error)
  }

  if (!artist) return null

  // 2. Canciones de ese artista en tu DB
  const { data: songs, error: songsError } = await supabase
    .from("songs")
    .select(
      `
      id,
      title,
      cover_url,
      duration_ms,
      album:album_id (
        id,
        name
      )
    `,
    )
    .eq("artist_id", artist.id)

  if (songsError) {
    console.error("Error fetching artist songs:", songsError)
  }

  return {
    ...artist,
    songs: songs ?? [],
  }
}
