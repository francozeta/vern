"use server"

import { createServerSupabaseClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

function isValidUUID(str: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
  return uuidRegex.test(str)
}

export async function toggleLike(reviewId: string) {
  try {
    console.log("[v0] toggleLike called with reviewId:", reviewId)

    const supabase = await createServerSupabaseClient()

    // Get current user
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()

    console.log("[v0] User authentication:", { user: user?.id, error: userError })

    if (userError || !user) {
      console.log("[v0] Authentication failed")
      return { success: false, error: "User not authenticated" }
    }

    console.log("[v0] Checking existing like for user:", user.id, "review:", reviewId)

    const { data: existingLike, error: checkError } = await supabase
      .from("likes")
      .select("id")
      .eq("user_id", user.id)
      .eq("review_id", reviewId)
      .maybeSingle()

    console.log("[v0] Existing like check result:", { existingLike, checkError })

    if (checkError) {
      console.log("[v0] Error checking like status:", checkError)
      return { success: false, error: "Error checking like status" }
    }

    if (existingLike) {
      console.log("[v0] Removing existing like:", existingLike.id)

      const { error: deleteError } = await supabase.from("likes").delete().eq("id", existingLike.id)

      console.log("[v0] Delete result:", { deleteError })

      if (deleteError) {
        console.log("[v0] Error removing like:", deleteError)
        return { success: false, error: "Error removing like" }
      }

      console.log("[v0] Like removed successfully")
      revalidatePath("/")
      return { success: true, action: "unliked" }
    } else {
      console.log("[v0] Adding new like for user:", user.id, "review:", reviewId)

      const insertData = {
        user_id: user.id,
        review_id: reviewId,
      }

      console.log("[v0] Insert data:", insertData)

      const { error: insertError, data: insertResult } = await supabase.from("likes").insert(insertData)

      console.log("[v0] Insert result:", { insertError, insertResult })

      if (insertError) {
        console.log("[v0] Error adding like:", insertError)
        return { success: false, error: "Error adding like" }
      }

      console.log("[v0] Like added successfully")
      revalidatePath("/")
      return { success: true, action: "liked" }
    }
  } catch (error) {
    console.log("[v0] Unexpected error in toggleLike:", error)
    return { success: false, error: "Unexpected error occurred" }
  }
}

export async function getLikeStatus(reviewId: string, userId?: string) {
  try {
    const supabase = await createServerSupabaseClient()

    // Get total likes count
    const { count: totalLikes, error: countError } = await supabase
      .from("likes")
      .select("*", { count: "exact", head: true })
      .eq("review_id", reviewId)

    if (countError) {
      return { success: false, error: "Error getting likes count" }
    }

    // Check if current user liked this review (if user is provided)
    let isLiked = false
    if (userId) {
      const { data: userLike, error: userLikeError } = await supabase
        .from("likes")
        .select("id")
        .eq("user_id", userId)
        .eq("review_id", reviewId)
        .maybeSingle()

      if (userLikeError) {
        return { success: false, error: "Error checking user like status" }
      }

      isLiked = !!userLike
    }

    return {
      success: true,
      data: {
        totalLikes: totalLikes || 0,
        isLiked,
      },
    }
  } catch (error) {
    console.error("Error getting like status:", error)
    return { success: false, error: "Unexpected error occurred" }
  }
}
