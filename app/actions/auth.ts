"use server"

import { createServerSupabaseClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { uploadProfileImage } from "@/lib/supabase/upload"

export async function signUp(formData: FormData) {
  const supabase = await createServerSupabaseClient()

  const email = formData.get("email") as string
  const password = formData.get("password") as string
  const name = formData.get("name") as string

  if (!email || !password || !name) {
    throw new Error("All fields are required")
  }

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
    }
  }

  redirect("/onboarding")
}

export async function signIn(formData: FormData) {
  const supabase = await createServerSupabaseClient()

  const email = formData.get("email") as string
  const password = formData.get("password") as string

  if (!email || !password) {
    throw new Error("Email and password are required")
  }

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

export async function updateProfile(formData: FormData) {
  const supabase = await createServerSupabaseClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    throw new Error("Not authenticated")
  }

  const username = formData.get("username") as string
  const bio = formData.get("bio") as string
  const role = formData.get("role") as "listener" | "artist" | "both"
  const profileImage = formData.get("profile_image") as File

  let avatarUrl: string | null = null

  // Handle profile image upload
  if (profileImage && profileImage.size > 0) {
    const { url, error: uploadError } = await uploadProfileImage(profileImage, user.id)
    if (uploadError) {
      throw new Error(uploadError)
    }
    avatarUrl = url || null
  }

  const { error } = await supabase
    .from("profiles")
    .update({
      username,
      bio,
      role,
      avatar_url: avatarUrl,
      onboarding_completed: true,
    })
    .eq("id", user.id)

  if (error) {
    throw new Error(error.message)
  }

  redirect("/")
}
