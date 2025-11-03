"use server"

import { createServerSupabaseClient } from "@/lib/supabase/server"
import { revalidateTag, revalidatePath } from "next/cache"
import { profileSettingsSchema, accountSettingsSchema } from "@/lib/validations/settings"
import { createOrUpdateArtist } from "@/app/actions/auth"

export async function updateProfileSettings(formData: FormData) {
  const supabase = await createServerSupabaseClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    throw new Error("Not authenticated")
  }

  const { data: currentProfile } = await supabase.from("profiles").select("username").eq("id", user.id).single()

  // Validate input
  const result = profileSettingsSchema.safeParse({
    display_name: formData.get("display_name"),
    username: formData.get("username"),
    bio: formData.get("bio"),
    role: formData.get("role"),
    location: formData.get("location"),
    avatar_url: formData.get("avatar_url"),
    banner_url: formData.get("banner_url"),
  })

  if (!result.success) {
    const firstError = result.error.issues[0]
    throw new Error(firstError.message)
  }

  const { display_name, username, bio, role, location, avatar_url, banner_url } = result.data

  // Check if username is already taken (but not by current user)
  if (username && username !== currentProfile?.username) {
    const { data: existingUser } = await supabase
      .from("profiles")
      .select("id")
      .eq("username", username)
      .neq("id", user.id)
      .single()

    if (existingUser) {
      throw new Error("Username is already taken")
    }
  }

  const updateData: any = {}
  if (display_name !== undefined) updateData.display_name = display_name || null
  if (username !== undefined) updateData.username = username
  if (bio !== undefined) updateData.bio = bio || null
  if (role !== undefined) updateData.role = role
  if (location !== undefined) updateData.location = location || null
  if (avatar_url !== undefined) updateData.avatar_url = avatar_url || null
  if (banner_url !== undefined) updateData.banner_url = banner_url || null

  const { error } = await supabase.from("profiles").update(updateData).eq("id", user.id)

  if (error) {
    console.error("Profile update error:", error)
    throw new Error("Failed to update profile. Please try again.")
  }

  revalidateTag(`profile-${user.id}`)
  revalidatePath(`/user/${currentProfile?.username}`)
  revalidatePath("/settings")

  if (role === "artist" || role === "both") {
    await createOrUpdateArtist(user.id, display_name || username)
  }

  if (display_name) {
    const { data: artist } = await supabase.from("artists").select("id").eq("id", user.id).single()

    if (artist) {
      await supabase.from("artists").update({ name: display_name }).eq("id", user.id)
    }
  }

  return { success: true, message: "Profile updated successfully!" }
}

export async function updateAccountSettings(formData: FormData) {
  const supabase = await createServerSupabaseClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    throw new Error("Not authenticated")
  }

  // Validate input
  const result = accountSettingsSchema.safeParse({
    website_url: formData.get("website_url"),
    spotify_url: formData.get("spotify_url"),
    instagram_url: formData.get("instagram_url"),
  })

  if (!result.success) {
    const firstError = result.error.issues[0]
    throw new Error(firstError.message)
  }

  const { website_url, spotify_url, instagram_url } = result.data

  const updateData: any = {}
  if (website_url !== undefined) updateData.website_url = website_url || null
  if (spotify_url !== undefined) updateData.spotify_url = spotify_url || null
  if (instagram_url !== undefined) updateData.instagram_url = instagram_url || null

  const { error } = await supabase.from("profiles").update(updateData).eq("id", user.id)

  if (error) {
    console.error("Account settings update error:", error)
    throw new Error("Failed to update account settings. Please try again.")
  }

  revalidateTag(`profile-${user.id}`)
  revalidatePath("/settings")

  return { success: true, message: "Account settings updated successfully!" }
}
