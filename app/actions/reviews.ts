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

/**
 * Normaliza canción:
 * - Si song_id ya es UUID → se asume songs.id
 * - Si NO es UUID → se toma como external_id de Deezer
 *   - Si ya existe song con ese external_id+provider="deezer" → se usa
 *   - Si no existe → se inserta una nueva song "importada" desde Deezer
 */
async function ensureSongIdFromData(supabase: any, data: CreateReviewData): Promise<string> {
  // Caso 1: ya es UUID => es songs.id
  if (isUUID(data.song_id)) {
    return data.song_id
  }

  const externalId = data.song_id

  // Caso 2: buscar canción Deezer ya normalizada
  const { data: existingSong, error: existingError } = await supabase
    .from("songs")
    .select("id")
    .eq("external_id", externalId)
    .eq("provider", "deezer")
    .maybeSingle()

  if (existingError) {
    console.error("Error checking existing Deezer song:", existingError)
  }

  if (existingSong?.id) {
    return existingSong.id
  }

  // Caso 3: crear nueva canción Deezer en nuestra tabla songs
  const { data: newSong, error: insertError } = await supabase
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
    })
    .select("id")
    .single()

  if (insertError || !newSong) {
    console.error("Error inserting Deezer song:", insertError)
    throw new Error("Failed to create song from Deezer data")
  }

  return newSong.id
}

export async function createReview(data: CreateReviewData) {
  const supabase = await createServerSupabaseClient()

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    return { error: "User not authenticated" }
  }

  if (!data.title.trim() || !data.content.trim()) {
    return { error: "Title and content are required" }
  }

  if (data.rating < 1 || data.rating > 5) {
    return { error: "Rating must be between 1 and 5" }
  }

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("id")
    .eq("id", user.id)
    .single()

  if (profileError || !profile) {
    return { error: "User profile not found" }
  }

  let songId: string
  try {
    songId = await ensureSongIdFromData(supabase, data)
  } catch (error) {
    console.error("Error ensuring song id:", error)
    return { error: "Failed to normalize song data" }
  }

  const { data: review, error: insertError } = await supabase
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

  if (insertError || !review) {
    console.error("Error creating review:", insertError)
    return { error: "Failed to create review" }
  }

  revalidatePath("/")
  revalidatePath("/reviews")
  revalidatePath(`/user/${user.id}`)
  revalidatePath(`/reviews/${review.id}`)

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
