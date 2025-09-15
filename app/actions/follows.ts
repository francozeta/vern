"use server"

import { createServerSupabaseClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

export async function followUser(followingId: string) {
  const supabase = await createServerSupabaseClient()

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    return { error: "User not authenticated" }
  }

  if (user.id === followingId) {
    return { error: "Cannot follow yourself" }
  }

  // Check if already following
  const { data: existingFollow } = await supabase
    .from("follows")
    .select("id")
    .eq("follower_id", user.id)
    .eq("following_id", followingId)
    .single()

  if (existingFollow) {
    return { error: "Already following this user" }
  }

  // Create follow relationship
  const { error } = await supabase.from("follows").insert({
    follower_id: user.id,
    following_id: followingId,
  })

  if (error) {
    console.error("Follow error:", error)
    return { error: "Failed to follow user" }
  }

  // Revalidate relevant paths
  revalidatePath("/")
  revalidatePath(`/user/[username]`, "page")

  return { success: true }
}

export async function unfollowUser(followingId: string) {
  const supabase = await createServerSupabaseClient()

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    return { error: "User not authenticated" }
  }

  // Remove follow relationship
  const { error } = await supabase.from("follows").delete().eq("follower_id", user.id).eq("following_id", followingId)

  if (error) {
    console.error("Unfollow error:", error)
    return { error: "Failed to unfollow user" }
  }

  // Revalidate relevant paths
  revalidatePath("/")
  revalidatePath(`/user/[username]`, "page")

  return { success: true }
}

export async function getFollowStatus(currentUserId: string, targetUserId: string) {
  const supabase = await createServerSupabaseClient()

  if (!currentUserId || currentUserId === targetUserId) {
    return { isFollowing: false }
  }

  const { data: follow } = await supabase
    .from("follows")
    .select("id")
    .eq("follower_id", currentUserId)
    .eq("following_id", targetUserId)
    .single()

  return { isFollowing: !!follow }
}

export async function checkFollowStatus(currentUserId: string, targetUserId: string) {
  const supabase = await createServerSupabaseClient()

  if (!currentUserId || currentUserId === targetUserId) {
    return { success: true, isFollowing: false }
  }

  const { data: follow, error } = await supabase
    .from("follows")
    .select("id")
    .eq("follower_id", currentUserId)
    .eq("following_id", targetUserId)
    .single()

  if (error && error.code !== "PGRST116") {
    // PGRST116 is "not found" error
    console.error("Check follow status error:", error)
    return { success: false, isFollowing: false }
  }

  return { success: true, isFollowing: !!follow }
}

export async function getFollowCounts(userId: string) {
  const supabase = await createServerSupabaseClient()

  // Get followers count
  const { count: followersCount } = await supabase
    .from("follows")
    .select("*", { count: "exact", head: true })
    .eq("following_id", userId)

  // Get following count
  const { count: followingCount } = await supabase
    .from("follows")
    .select("*", { count: "exact", head: true })
    .eq("follower_id", userId)

  return {
    followersCount: followersCount || 0,
    followingCount: followingCount || 0,
  }
}

export async function getFollowers(userId: string, limit = 20, offset = 0) {
  const supabase = await createServerSupabaseClient()

  const { data: followers, error } = await supabase
    .from("follows")
    .select(`
      follower_id,
      created_at,
      profiles!follows_follower_id_fkey (
        id,
        username,
        display_name,
        avatar_url,
        is_verified,
        role
      )
    `)
    .eq("following_id", userId)
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1)

  if (error) {
    console.error("Get followers error:", error)
    return { followers: [], error: "Failed to fetch followers" }
  }

  return { followers: followers || [] }
}

export async function getFollowing(userId: string, limit = 20, offset = 0) {
  const supabase = await createServerSupabaseClient()

  const { data: following, error } = await supabase
    .from("follows")
    .select(`
      following_id,
      created_at,
      profiles!follows_following_id_fkey (
        id,
        username,
        display_name,
        avatar_url,
        is_verified,
        role
      )
    `)
    .eq("follower_id", userId)
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1)

  if (error) {
    console.error("Get following error:", error)
    return { following: [], error: "Failed to fetch following" }
  }

  return { following: following || [] }
}

export async function getSuggestedUsers(currentUserId: string, limit = 5) {
  const supabase = await createServerSupabaseClient()

  // Get users that the current user is not following
  const { data: suggestedUsers, error } = await supabase
    .from("profiles")
    .select("id, username, display_name, avatar_url, is_verified, role")
    .neq("id", currentUserId)
    .limit(limit * 2) // Get more to filter out already followed users

  if (error) {
    console.error("Get suggested users error:", error)
    return { users: [] }
  }

  // Get users that current user is already following
  const { data: followingData } = await supabase.from("follows").select("following_id").eq("follower_id", currentUserId)

  const followingIds = followingData?.map((f) => f.following_id) || []

  // Filter out already followed users
  const filtered = suggestedUsers?.filter((user) => !followingIds.includes(user.id)).slice(0, limit) || []

  return { users: filtered }
}
