"use server"

import { createServerSupabaseClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import { createReviewSlug, generateUniqueSlug } from "@/lib/utils/slugs"

export interface CreateReviewData {
  song_id: string
  song_title: string
  song_artist: string
  song_album: string
  song_cover_url?: string | null
  song_duration?: number | null
  song_preview_url?: string | null
  song_deezer_url?: string | null
  title: string
  content: string
  rating: number
}

export async function createReview(data: CreateReviewData) {
  const supabase = await createServerSupabaseClient()

  // Verificar autenticación
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    return { error: "User not authenticated" }
  }

  // Validar datos
  if (!data.title.trim() || !data.content.trim()) {
    return { error: "Title and content are required" }
  }

  if (data.rating < 1 || data.rating > 5) {
    return { error: "Rating must be between 1 and 5" }
  }

  // Verificar que el usuario tenga un perfil
  const { data: profile, error: profileError } = await supabase.from("profiles").select("id").eq("id", user.id).single()

  if (profileError || !profile) {
    return { error: "User profile not found" }
  }

  const baseSlug = createReviewSlug(data.title, data.song_artist)

  const checkSlugExists = async (slug: string): Promise<boolean> => {
    const { data } = await supabase.from("reviews").select("id").eq("slug", slug).single()
    return !!data
  }

  const uniqueSlug = await generateUniqueSlug(baseSlug, checkSlugExists)

  const { data: review, error: insertError } = await supabase
    .from("reviews")
    .insert({
      user_id: user.id,
      song_id: data.song_id,
      song_title: data.song_title,
      song_artist: data.song_artist,
      song_album: data.song_album,
      song_cover_url: data.song_cover_url,
      song_duration: data.song_duration,
      song_preview_url: data.song_preview_url,
      song_deezer_url: data.song_deezer_url,
      title: data.title.trim(),
      content: data.content.trim(),
      rating: data.rating,
    })
    .select()
    .single()

  if (insertError) {
    console.error("Error creating review:", insertError)
    return { error: "Failed to create review" }
  }

  // Revalidar las páginas que muestran reseñas
  revalidatePath("/")
  revalidatePath("/reviews")
  revalidatePath(`/user/${user.id}`)
  revalidatePath(`/reviews/${review.id}`)

  return { success: true, review }
}

export async function getReviewById(id: string) {
  const supabase = await createServerSupabaseClient()

  const { data: review, error } = await supabase
    .from("reviews")
    .select(`
      *,
      profiles:user_id (
        id,
        username,
        display_name,
        avatar_url,
        is_verified,
        role
      )
    `)
    .eq("id", id)
    .single()

  if (error) {
    console.error("Error fetching review by ID:", error)
    return { error: "Review not found" }
  }

  return { review }
}

export async function getUserReviews(userId: string) {
  const supabase = await createServerSupabaseClient()

  const { data: reviews, error } = await supabase
    .from("reviews")
    .select(`
      *,
      profiles:user_id (
        username,
        display_name,
        avatar_url
      )
    `)
    .eq("user_id", userId)
    .order("created_at", { ascending: false })

  if (error) {
    console.error("Error fetching user reviews:", error)
    return { error: "Failed to fetch reviews" }
  }

  return { reviews }
}

export async function getAllReviews(limit = 20, offset = 0) {
  const supabase = await createServerSupabaseClient()

  const { data: reviews, error } = await supabase
    .from("reviews")
    .select(`
      *,
      profiles:user_id (
        id,
        username,
        display_name,
        avatar_url,
        is_verified,
        role
      )
    `)
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1)

  if (error) {
    console.error("Error fetching reviews:", error)
    return { error: "Failed to fetch reviews" }
  }

  return { reviews }
}

export async function deleteReview(reviewId: string) {
  const supabase = await createServerSupabaseClient()

  // Verificar autenticación
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    return { error: "User not authenticated" }
  }

  // Eliminar la reseña (RLS se encarga de verificar que sea del usuario)
  const { error: deleteError } = await supabase.from("reviews").delete().eq("id", reviewId).eq("user_id", user.id) // Doble verificación

  if (deleteError) {
    console.error("Error deleting review:", deleteError)
    return { error: "Failed to delete review" }
  }

  // Revalidar páginas
  revalidatePath("/")
  revalidatePath("/reviews")
  revalidatePath(`/user/${user.id}`)

  return { success: true }
}
