import { createClient } from "./client"

export async function uploadProfileImage(file: File, userId: string): Promise<{ url?: string; error?: string }> {
  const supabase = createClient()

  // Generate unique filename
  const fileExt = file.name.split(".").pop()
  const fileName = `${userId}-${Date.now()}.${fileExt}`
  const filePath = `profiles/${fileName}`

  try {
    // Upload file to Supabase Storage
    const { data: uploadData, error: uploadError } = await supabase.storage.from("avatars").upload(filePath, file, {
      cacheControl: "3600",
      upsert: true,
    })

    if (uploadError) {
      return { error: uploadError.message }
    }

    // Get public URL
    const {
      data: { publicUrl },
    } = supabase.storage.from("avatars").getPublicUrl(filePath)

    return { url: publicUrl }
  } catch (error) {
    return { error: "Failed to upload image" }
  }
}

export async function deleteProfileImage(url: string): Promise<{ error?: string }> {
  const supabase = createClient()

  try {
    // Extract file path from URL
    const urlParts = url.split("/")
    const filePath = urlParts.slice(-2).join("/")

    const { error } = await supabase.storage.from("avatars").remove([filePath])

    if (error) {
      return { error: error.message }
    }

    return {}
  } catch (error) {
    return { error: "Failed to delete image" }
  }
}
