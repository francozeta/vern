"use server"

import { createServerSupabaseClient } from "@/lib/supabase/server"
import { songUploadSchema, type SongUploadInput } from "@/lib/validations/songs"
import { revalidatePath } from "next/cache"

export async function createSong(data: SongUploadInput & { audioUrl: string; coverUrl?: string }) {
  try {
    const supabase = await createServerSupabaseClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return { error: "User not authenticated" }
    }

    // Validate input
    const validatedData = songUploadSchema.parse(data)

    // Create song record
    const { data: song, error } = await supabase
      .from("songs")
      .insert({
        title: validatedData.title,
        artist_id: null, // Will be linked to artist later if needed
        uploader_id: user.id,
        audio_url: data.audioUrl,
        cover_url: data.coverUrl || null,
        description: validatedData.description || null,
        genre_id: null,
        duration_ms: null,
        is_published: true,
        source: "native",
      })
      .select()
      .single()

    if (error) {
      console.error("Error creating song:", error)
      return { error: "Failed to create song" }
    }

    revalidatePath("/settings")
    revalidatePath("/artist/[id]")

    return { data: song }
  } catch (error) {
    console.error("Error in createSong:", error)
    return { error: "Failed to create song" }
  }
}

export async function getUserSongs() {
  try {
    const supabase = await createServerSupabaseClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return { error: "User not authenticated" }
    }

    const { data: songs, error } = await supabase
      .from("songs")
      .select("*")
      .eq("uploader_id", user.id)
      .eq("source", "native")
      .order("created_at", { ascending: false })

    if (error) {
      console.error("Error fetching songs:", error)
      return { error: "Failed to fetch songs" }
    }

    return { data: songs }
  } catch (error) {
    console.error("Error in getUserSongs:", error)
    return { error: "Failed to fetch songs" }
  }
}

export async function deleteSong(songId: string) {
  try {
    const supabase = await createServerSupabaseClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return { error: "User not authenticated" }
    }

    // Get song to verify ownership
    const { data: song, error: fetchError } = await supabase
      .from("songs")
      .select("uploader_id, audio_url, cover_url")
      .eq("id", songId)
      .single()

    if (fetchError || !song) {
      return { error: "Song not found" }
    }

    if (song.uploader_id !== user.id) {
      return { error: "Unauthorized" }
    }

    // Delete from storage
    if (song.audio_url) {
      const audioPath = song.audio_url.split("/").pop()
      if (audioPath) {
        await supabase.storage.from("song-audio").remove([audioPath])
      }
    }

    if (song.cover_url) {
      const coverPath = song.cover_url.split("/").pop()
      if (coverPath) {
        await supabase.storage.from("song-covers").remove([coverPath])
      }
    }

    // Delete from database
    const { error: deleteError } = await supabase.from("songs").delete().eq("id", songId)

    if (deleteError) {
      console.error("Error deleting song:", deleteError)
      return { error: "Failed to delete song" }
    }

    revalidatePath("/settings")
    revalidatePath("/artist/[id]")

    return { success: true }
  } catch (error) {
    console.error("Error in deleteSong:", error)
    return { error: "Failed to delete song" }
  }
}

export async function publishSong(songId: string, isPublished: boolean) {
  try {
    const supabase = await createServerSupabaseClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return { error: "User not authenticated" }
    }

    // Verify ownership
    const { data: song, error: fetchError } = await supabase
      .from("songs")
      .select("uploader_id")
      .eq("id", songId)
      .single()

    if (fetchError || !song) {
      return { error: "Song not found" }
    }

    if (song.uploader_id !== user.id) {
      return { error: "Unauthorized" }
    }

    const { error } = await supabase.from("songs").update({ is_published: isPublished }).eq("id", songId)

    if (error) {
      console.error("Error updating song:", error)
      return { error: "Failed to update song" }
    }

    revalidatePath("/settings")

    return { success: true }
  } catch (error) {
    console.error("Error in publishSong:", error)
    return { error: "Failed to update song" }
  }
}

export async function getRecentSongs(limit = 10) {
  try {
    const supabase = await createServerSupabaseClient()

    const { data: songs, error } = await supabase
      .from("songs")
      .select("*")
      .eq("is_published", true)
      .eq("source", "native")
      .order("created_at", { ascending: false })
      .limit(limit)

    if (error) {
      console.error("Error fetching recent songs:", error)
      return { error: "Failed to fetch songs" }
    }

    return { data: songs }
  } catch (error) {
    console.error("Error in getRecentSongs:", error)
    return { error: "Failed to fetch songs" }
  }
}
