"use server"

import { createServerSupabaseClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { uploadProfileImageClient } from "@/lib/supabase/upload"
import { signUpSchema, signInSchema, onboardingSchema, editProfileSchema } from "@/lib/validations/auth"

export async function signUp(formData: FormData) {
  const supabase = await createServerSupabaseClient()

  // Validate input
  const result = signUpSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
    name: formData.get("name"),
  })

  if (!result.success) {
    const firstError = result.error.issues[0]
    throw new Error(firstError.message)
  }

  const { email, password, name } = result.data

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        display_name: name,
      },
    },
  })

  if (error) {
    throw new Error(error.message)
  }

  if (data.user) {
    // Create profile after successful signup
    const { error: profileError } = await supabase.from("profiles").insert({
      id: data.user.id,
      username: email.split("@")[0], // temporary username
      display_name: name,
      role: "listener",
      onboarding_completed: false,
    })

    if (profileError) {
      console.error("Profile creation error:", profileError)
      throw new Error("Failed to create user profile")
    }
  }

  redirect("/onboarding")
}

export async function signIn(formData: FormData) {
  const supabase = await createServerSupabaseClient()

  // Validate input
  const result = signInSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  })

  if (!result.success) {
    const firstError = result.error.issues[0]
    throw new Error(firstError.message)
  }

  const { email, password } = result.data

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    throw new Error(error.message)
  }

  // Check if user has completed onboarding
  const { data: profile } = await supabase
    .from("profiles")
    .select("onboarding_completed")
    .eq("id", (await supabase.auth.getUser()).data.user?.id)
    .single()

  if (profile && !profile.onboarding_completed) {
    redirect("/onboarding")
  } else {
    redirect("/")
  }
}

export async function signOut() {
  const supabase = await createServerSupabaseClient()
  await supabase.auth.signOut()
  redirect("/login")
}

// Original function for backward compatibility
export async function updateProfile(formData: FormData) {
  const supabase = await createServerSupabaseClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    throw new Error("Not authenticated")
  }

  // Validate input
  const result = onboardingSchema.safeParse({
    username: formData.get("username"),
    bio: formData.get("bio"),
    role: formData.get("role"),
  })

  if (!result.success) {
    const firstError = result.error.issues[0]
    throw new Error(firstError.message)
  }

  const { username, bio, role } = result.data
  const profileImage = formData.get("profile_image") as File

  // Check if username is already taken
  const { data: existingUser } = await supabase
    .from("profiles")
    .select("id")
    .eq("username", username)
    .neq("id", user.id)
    .single()

  if (existingUser) {
    throw new Error("Username is already taken")
  }

  let avatarUrl: string | null = null

  // Handle profile image upload (server-side - problematic)
  if (profileImage && profileImage.size > 0) {
    const { url, error: uploadError } = await uploadProfileImageClient(profileImage, user.id)
    if (uploadError) {
      throw new Error(`Image upload failed: ${uploadError}`)
    }
    avatarUrl = url || null
  }

  const { error } = await supabase
    .from("profiles")
    .update({
      username,
      bio: bio || null,
      role,
      avatar_url: avatarUrl,
      onboarding_completed: true,
    })
    .eq("id", user.id)

  if (error) {
    console.error("Profile update error:", error)
    throw new Error("Failed to update profile. Please try again.")
  }

  redirect("/")
}

// New function that accepts avatar URL from client-side upload
export async function updateProfileWithAvatar(formData: FormData) {
  const supabase = await createServerSupabaseClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    throw new Error("Not authenticated")
  }

  // Validate input
  const result = onboardingSchema.safeParse({
    username: formData.get("username"),
    bio: formData.get("bio"),
    role: formData.get("role"),
  })

  if (!result.success) {
    const firstError = result.error.issues[0]
    throw new Error(firstError.message)
  }

  const { username, bio, role } = result.data
  const avatarUrl = formData.get("avatar_url") as string | null

  // Check if username is already taken
  const { data: existingUser } = await supabase
    .from("profiles")
    .select("id")
    .eq("username", username)
    .neq("id", user.id)
    .single()

  if (existingUser) {
    throw new Error("Username is already taken")
  }

  const { error } = await supabase
    .from("profiles")
    .update({
      username,
      bio: bio || null,
      role,
      avatar_url: avatarUrl,
      onboarding_completed: true,
    })
    .eq("id", user.id)

  if (error) {
    console.error("Profile update error:", error)
    throw new Error("Failed to update profile. Please try again.")
  }

  redirect("/")
}

// New function to update user profile from edit modal
export async function updateUserProfile(formData: FormData) {
  const supabase = await createServerSupabaseClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    throw new Error("Not authenticated")
  }

  // Validate input
  const result = editProfileSchema.safeParse({
    display_name: formData.get("display_name"),
    username: formData.get("username"),
    bio: formData.get("bio"),
    role: formData.get("role"),
    avatar_url: formData.get("avatar_url"),
  })

  if (!result.success) {
    const firstError = result.error.issues[0]
    throw new Error(firstError.message)
  }

  const { display_name, username, bio, role, avatar_url } = result.data

  // Check if username is already taken, only if it's being changed
  if (username) {
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

  const updateData: {
    display_name?: string | null
    username?: string
    bio?: string | null
    role?: "listener" | "artist" | "both"
    avatar_url?: string | null
  } = {}

  if (display_name !== undefined) updateData.display_name = display_name || null
  if (username !== undefined) updateData.username = username
  if (bio !== undefined) updateData.bio = bio || null
  if (role !== undefined) updateData.role = role
  if (avatar_url !== undefined) updateData.avatar_url = avatar_url || null

  const { error } = await supabase.from("profiles").update(updateData).eq("id", user.id)

  if (error) {
    console.error("Profile update error:", error)
    throw new Error("Failed to update profile. Please try again.")
  }

  return { success: true, message: "Profile updated successfully!" }
}
