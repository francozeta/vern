"use server"

import { createServerSupabaseClient } from "@/lib/supabase/server"

export async function getUserProfile(username: string) {
  const supabase = await createServerSupabaseClient()

  const { data: profile, error } = await supabase
    .from("profiles")
    .select(`
      id,
      username,
      display_name,
      bio,
      avatar_url,
      banner_url,
      role,
      location,
      is_verified,
      created_at
    `)
    .eq("username", username)
    .single()

  if (error) {
    console.error("Error fetching user profile:", error)
    return null
  }

  return profile
}

export async function getUserById(userId: string) {
  const supabase = await createServerSupabaseClient()

  const { data: profile, error } = await supabase
    .from("profiles")
    .select(`
      id,
      username,
      display_name,
      bio,
      avatar_url,
      banner_url,
      role,
      location,
      is_verified,
      created_at
    `)
    .eq("id", userId)
    .single()

  if (error) {
    console.error("Error fetching user by ID:", error)
    return null
  }

  return profile
}

export async function searchUsers(query: string, limit = 10) {
  const supabase = await createServerSupabaseClient()

  const { data: users, error } = await supabase
    .from("profiles")
    .select(`
      id,
      username,
      display_name,
      avatar_url,
      role,
      is_verified
    `)
    .or(`username.ilike.%${query}%,display_name.ilike.%${query}%`)
    .limit(limit)

  if (error) {
    console.error("Error searching users:", error)
    return []
  }

  return users || []
}
