"use server"

import { createServerSupabaseClient } from "@/lib/supabase/server"

function isValidUUID(str: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
  return uuidRegex.test(str)
}

export async function toggleLike(reviewId: string) {
  try {
    const supabase = await createServerSupabaseClient()

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()

    if (userError || !user) {
      return { success: false, error: "User not authenticated" }
    }

    const { data: existingLike } = await supabase
      .from("likes")
      .select("id")
      .eq("user_id", user.id)
      .eq("review_id", reviewId)
      .maybeSingle()

    if (existingLike) {
      await supabase.from("likes").delete().eq("id", existingLike.id)
      return { success: true, action: "unliked" }
    } else {
      await supabase.from("likes").insert({
        user_id: user.id,
        review_id: reviewId,
      })
      return { success: true, action: "liked" }
    }
  } catch (error) {
    return { success: false, error: "Unexpected error occurred" }
  }
}

export async function getLikeStatus(reviewId: string, userId?: string) {
  try {
    const supabase = await createServerSupabaseClient()

    const { count: totalLikes, error: countError } = await supabase
      .from("likes")
      .select("*", { count: "exact", head: true })
      .eq("review_id", reviewId)

    if (countError) {
      return { success: false, error: "Error getting likes count" }
    }

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
