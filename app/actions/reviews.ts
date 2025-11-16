"use server"

import { createServerSupabaseClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

export interface CreateReviewData {
  // ⚠ Puede ser:
  // - UUID de songs.id (canción nativa)
  // - external_id de Deezer (ej: "3135556")
  song_id: string

  // Datos de canción (para normalizar si viene de Deezer)
  song_title: string
  song_artist: string
  song_album: string
  song_cover_url?: string | null
  song_duration?: number | null // en segundos
  song_preview_url?: string | null
  song_deezer_url?: string | null
  artist_external_id?: string
  album_external_id?: string

  // Datos de la reseña
  title: string
  content: string
  rating: number

}

function isUUID(value: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value)
}

/* ----------------------------------------------------
   ENSURE ARTIST
---------------------------------------------------- */
async function ensureArtist(supabase: any, name: string, external_id?: string | null) {
  if (!name) return null

  // Buscar si ya existe ese artista
  const { data: existing } = await supabase
    .from("artists")
    .select("id")
    .eq("name", name)
    .maybeSingle()

  if (existing?.id) return existing.id

  // Insertar nuevo artista (no requiere external_id)
  const { data: inserted, error } = await supabase
    .from("artists")
    .insert({
      name,
      provider: external_id ? "deezer" : "native",
      external_id: external_id || null,
    })
    .select("id")
    .single()

  if (error) {
    console.error("Error inserting artist:", error)
    return null
  }

  return inserted?.id ?? null
}

/* ----------------------------------------------------
   ENSURE ALBUM
---------------------------------------------------- */
async function ensureAlbum(
  supabase: any,
  title: string,
  artist_id: string | null,
  external_id?: string | null
) {
  if (!title) return null

  // Buscar si existe el álbum
  const { data: existing } = await supabase
    .from("albums")
    .select("id")
    .eq("name", title)
    .maybeSingle()

  if (existing?.id) return existing.id

  // Insertar
  const { data: inserted, error } = await supabase
    .from("albums")
    .insert({
      name: title,
      artist_id: artist_id,
      provider: external_id ? "deezer" : "native",
      external_id: external_id || null,
    })
    .select("id")
    .single()

  if (error) {
    console.error("Error inserting album:", error)
    return null
  }

  return inserted?.id ?? null
}

/* ----------------------------------------------------
   ENSURE SONG
---------------------------------------------------- */
async function ensureSongIdFromData(supabase: any, data: CreateReviewData): Promise<string> {
  if (isUUID(data.song_id)) {
    return data.song_id
  }

  const externalId = data.song_id

  // Buscar canción Deezer ya normalizada
  const { data: existingSong } = await supabase
    .from("songs")
    .select("id")
    .eq("external_id", externalId)
    .eq("provider", "deezer")
    .maybeSingle()

  if (existingSong?.id) return existingSong.id

  // === Normalizar Artista ===
  const artist_id = await ensureArtist(
    supabase,
    data.song_artist,
    data.artist_external_id ?? externalId
  )

  // === Normalizar Álbum ===
  const album_id = await ensureAlbum(
    supabase,
    data.song_album,
    artist_id,
    data.album_external_id ?? null
  )

  // === Insertar canción ===
  const { data: newSong, error } = await supabase
    .from("songs")
    .insert({
      title: data.song_title,
      provider: "deezer",
      external_id: externalId,
      cover_url: data.song_cover_url ?? null,
      duration_ms: data.song_duration ? data.song_duration * 1000 : null,
      preview_url: data.song_preview_url ?? null,
      source: "deezer",
      is_published: true,
      artist_id,
      album_id,
    })
    .select("id")
    .single()

  if (error || !newSong) {
    console.error("Error inserting Deezer song:", error)
    throw new Error("Failed to create song from Deezer data")
  }

  return newSong.id
}

/* ----------------------------------------------------
   CREATE REVIEW
---------------------------------------------------- */
export async function createReview(data: CreateReviewData) {
  const supabase = await createServerSupabaseClient()

  const { data: auth } = await supabase.auth.getUser()
  const user = auth?.user

  if (!user) return { error: "User not authenticated" }

  if (!data.title.trim() || !data.content.trim()) {
    return { error: "Title and content are required" }
  }

  if (data.rating < 1 || data.rating > 5) {
    return { error: "Rating must be between 1 and 5" }
  }

  const songId = await ensureSongIdFromData(supabase, data)

  const { data: review, error } = await supabase
    .from("reviews")
    .insert({
      user_id: user.id,
      song_id: songId,
      title: data.title.trim(),
      content: data.content.trim(),
      rating: data.rating,
    })
    .select("id")
    .single()

  if (error || !review) {
    console.error("Error creating review:", error)
    return { error: "Failed to create review" }
  }

  revalidatePath("/")
  revalidatePath("/reviews")
  revalidatePath(`/reviews/${review.id}`)
  revalidatePath(`/user/${user.id}`)

  return { success: true, review }
}
// ---------- HELPERS DE LECTURA ----------

function mapReviewWithSong(row: any) {
  const song = row.song ?? row.songs
  const artist = song?.artist ?? song?.artists
  const album = song?.album ?? song?.albums

  return {
    id: row.id,
    title: row.title,
    content: row.content,
    rating: row.rating,
    created_at: row.created_at,
    user_id: row.user_id,
    song_id: row.song_id,
    song_title: song?.title ?? "",
    song_artist: artist?.name ?? "",
    song_album: album?.title ?? "",
    song_cover_url: song?.cover_url ?? null,
    song_preview_url: song?.preview_url ?? null,
    profiles: row.profiles,
  }
}



export async function getUserReviews(userId: string) {
  const supabase = await createServerSupabaseClient()

  const { data, error } = await supabase
    .from("reviews")
    .select(
      `
      id,
      title,
      content,
      rating,
      created_at,
      user_id,
      song_id,
      song:song_id (
      id,
      title,
      cover_url,
      preview_url,
      duration_ms,
      provider,
      external_id,
      artist:artist_id (
        id,
        name
      ),
      album:album_id (
        id,
        name
      )
      ),
      profiles:user_id (
        id,
        username,
        display_name,
        avatar_url,
        is_verified,
        role
      )
    `,
    )
    .eq("user_id", userId)
    .order("created_at", { ascending: false })

  if (error) {
    console.error("Error getting user reviews:", error)
    return { error: "Failed to get user reviews", reviews: [] }
  }

  const reviews = (data || []).map(mapReviewWithSong)
  return { reviews }
}

export async function getAllReviews(limit = 20, offset = 0) {
  const supabase = await createServerSupabaseClient()

  const { data, error } = await supabase
    .from("reviews")
    .select(
      `
      id,
      title,
      content,
      rating,
      created_at,
      user_id,
      song_id,
      song:song_id (
        id,
        title,
        cover_url,
        preview_url,
        duration_ms,
        provider,
        external_id,
        artist:artist_id (
          id,
          name
        ),
        album:album_id (
          id,
          name
        )
      ),
      profiles:user_id (
        id,
        username,
        display_name,
        avatar_url,
        is_verified,
        role
      )
    `,
    )
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1)

  if (error) {
    console.error("Error getting all reviews:", error)
    return { error: "Failed to get reviews", reviews: [] }
  }

  const reviews = (data || []).map(mapReviewWithSong)
  return { reviews }
}

export async function deleteReview(reviewId: string) {
  const supabase = await createServerSupabaseClient()

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    return { error: "User not authenticated" }
  }

  const { error: deleteError } = await supabase
    .from("reviews")
    .delete()
    .eq("id", reviewId)
    .eq("user_id", user.id)

  if (deleteError) {
    console.error("Error deleting review:", deleteError)
    return { error: "Failed to delete review" }
  }

  revalidatePath("/")
  revalidatePath("/reviews")
  revalidatePath(`/user/${user.id}`)

  return { success: true }
}
