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
