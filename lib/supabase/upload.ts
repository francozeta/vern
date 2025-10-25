import { createClient } from "./client"

export async function uploadProfileImageClient(file: File, userId: string): Promise<{ url?: string; error?: string }> {
  // Use browser client which maintains auth session
  const supabase = createClient()

  // Validate file
  if (!file.type.startsWith("image/")) {
    return { error: "File must be an image" }
  }

  if (file.size > 5 * 1024 * 1024) {
    return { error: "File size must be less than 5MB" }
  }

  // Check authentication
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    return { error: "User not authenticated" }
  }

  // Generate unique filename
  const fileExt = file.name.split(".").pop()?.toLowerCase() || "jpg"
  const fileName = `avatar_${userId}_${Date.now()}.${fileExt}`

  try {
    // Delete existing avatars for this user
    const { data: existingFiles } = await supabase.storage.from("avatars").list("", {
      limit: 100,
      search: `avatar_${userId}_`,
    })

    if (existingFiles && existingFiles.length > 0) {
      const filesToDelete = existingFiles.map((file) => file.name)
      await supabase.storage.from("avatars").remove(filesToDelete)
    }

    // Upload new file using browser client
    const { data: uploadData, error: uploadError } = await supabase.storage.from("avatars").upload(fileName, file, {
      cacheControl: "3600",
      upsert: true,
    })

    if (uploadError) {
      console.error("Upload error:", uploadError)
      return { error: `Upload failed: ${uploadError.message}` }
    }

    // Get public URL
    const {
      data: { publicUrl },
    } = supabase.storage.from("avatars").getPublicUrl(fileName)

    return { url: publicUrl }
  } catch (error) {
    console.error("Upload error:", error)
    return { error: "Failed to upload image. Please try again." }
  }
}

export async function uploadBannerImageClient(file: File, userId: string): Promise<{ url?: string; error?: string }> {
  // Use browser client which maintains auth session
  const supabase = createClient()

  // Validate file
  if (!file.type.startsWith("image/")) {
    return { error: "File must be an image" }
  }

  if (file.size > 10 * 1024 * 1024) {
    return { error: "File size must be less than 10MB" }
  }

  // Check authentication
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    return { error: "User not authenticated" }
  }

  // Generate unique filename
  const fileExt = file.name.split(".").pop()?.toLowerCase() || "jpg"
  const fileName = `banner_${userId}_${Date.now()}.${fileExt}`

  try {
    // Delete existing banners for this user
    const { data: existingFiles } = await supabase.storage.from("banners").list("", {
      limit: 100,
      search: `banner_${userId}_`,
    })

    if (existingFiles && existingFiles.length > 0) {
      const filesToDelete = existingFiles.map((file) => file.name)
      await supabase.storage.from("banners").remove(filesToDelete)
    }

    // Upload new file using browser client
    const { data: uploadData, error: uploadError } = await supabase.storage.from("banners").upload(fileName, file, {
      cacheControl: "3600",
      upsert: true,
    })

    if (uploadError) {
      console.error("Upload error:", uploadError)
      return { error: `Upload failed: ${uploadError.message}` }
    }

    // Get public URL
    const {
      data: { publicUrl },
    } = supabase.storage.from("banners").getPublicUrl(fileName)

    return { url: publicUrl }
  } catch (error) {
    console.error("Upload error:", error)
    return { error: "Failed to upload banner image. Please try again." }
  }
}

export async function uploadSongAudioClient(file: File, userId: string): Promise<{ url?: string; error?: string }> {
  const supabase = createClient()

  // Validate file
  const validAudioTypes = ["audio/mpeg", "audio/wav", "audio/ogg", "audio/mp4", "audio/webm"]
  if (!validAudioTypes.includes(file.type)) {
    return { error: "File must be an audio file (MP3, WAV, OGG, MP4, or WebM)" }
  }

  if (file.size > 100 * 1024 * 1024) {
    return { error: "File size must be less than 100MB" }
  }

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    return { error: "User not authenticated" }
  }

  const fileExt = file.name.split(".").pop()?.toLowerCase() || "mp3"
  const fileName = `${userId}/${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`

  try {
    const { data: uploadData, error: uploadError } = await supabase.storage.from("song-audio").upload(fileName, file, {
      cacheControl: "3600",
      upsert: false,
    })

    if (uploadError) {
      console.error("Upload error:", uploadError)
      return { error: `Upload failed: ${uploadError.message}` }
    }

    const {
      data: { publicUrl },
    } = supabase.storage.from("song-audio").getPublicUrl(fileName)

    return { url: publicUrl }
  } catch (error) {
    console.error("Upload error:", error)
    return { error: "Failed to upload audio. Please try again." }
  }
}

export async function uploadSongCoverClient(file: File, userId: string): Promise<{ url?: string; error?: string }> {
  const supabase = createClient()

  // Validate file
  if (!file.type.startsWith("image/")) {
    return { error: "File must be an image" }
  }

  if (file.size > 10 * 1024 * 1024) {
    return { error: "File size must be less than 10MB" }
  }

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    return { error: "User not authenticated" }
  }

  const fileExt = file.name.split(".").pop()?.toLowerCase() || "jpg"
  const fileName = `${userId}/${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`

  try {
    const { data: uploadData, error: uploadError } = await supabase.storage.from("song-covers").upload(fileName, file, {
      cacheControl: "3600",
      upsert: false,
    })

    if (uploadError) {
      console.error("Upload error:", uploadError)
      return { error: `Upload failed: ${uploadError.message}` }
    }

    const {
      data: { publicUrl },
    } = supabase.storage.from("song-covers").getPublicUrl(fileName)

    return { url: publicUrl }
  } catch (error) {
    console.error("Upload error:", error)
    return { error: "Failed to upload cover. Please try again." }
  }
}
