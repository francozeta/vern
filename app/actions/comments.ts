"use server"

import { createServerSupabaseClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

export async function createComment(reviewId: string, content: string) {
  try {
    const supabase = await createServerSupabaseClient()

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()

    if (userError || !user) {
      return { success: false, error: "User not authenticated" }
    }

    if (!content.trim()) {
      return { success: false, error: "Comment content is required" }
    }

    if (content.trim().length > 500) {
      return { success: false, error: "Comment is too long (max 500 characters)" }
    }

    const { data: comment, error: insertError } = await supabase
      .from("review_comments")
      .insert({
        user_id: user.id,
        review_id: reviewId,
        content: content.trim(),
      })
      .select("*")
      .single()

    if (insertError) {
      console.error("Error creating comment:", insertError)
      return { success: false, error: "Failed to create comment" }
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("username, display_name, avatar_url, is_verified")
      .eq("id", user.id)
      .single()

    const commentWithProfile = {
      ...comment,
      profiles: profile,
    }

    revalidatePath("/")
    revalidatePath("/reviews")

    return { success: true, comment: commentWithProfile }
  } catch (error) {
    console.error("Unexpected error creating comment:", error)
    return { success: false, error: "Unexpected error occurred" }
  }
}

export async function getComments(reviewId: string) {
  try {
    const supabase = await createServerSupabaseClient()

    // Try optimized query first
    const { data: comments, error } = await supabase
      .from("review_comments")
      .select(`
        *,
        profiles (
          username,
          display_name,
          avatar_url,
          is_verified
        )
      `)
      .eq("review_id", reviewId)
      .order("created_at", { ascending: true })

    // If foreign key relationship works, return the result
    if (!error) {
      return { success: true, comments: comments || [] }
    }

    // Fallback to current method if foreign keys aren't ready
    console.log("Using fallback method for comments")
    const { data: fallbackComments, error: fallbackError } = await supabase
      .from("review_comments")
      .select("*")
      .eq("review_id", reviewId)
      .order("created_at", { ascending: true })

    if (fallbackError) {
      console.error("Error fetching comments:", fallbackError)
      return { success: false, error: "Failed to fetch comments" }
    }

    if (!fallbackComments || fallbackComments.length === 0) {
      return { success: true, comments: [] }
    }

    const userIds = [...new Set(fallbackComments.map((comment) => comment.user_id))]

    const { data: profiles } = await supabase
      .from("profiles")
      .select("id, username, display_name, avatar_url, is_verified")
      .in("id", userIds)

    const profileMap = new Map()
    profiles?.forEach((profile) => {
      profileMap.set(profile.id, profile)
    })

    const commentsWithProfiles = fallbackComments.map((comment) => ({
      ...comment,
      profiles: profileMap.get(comment.user_id) || null,
    }))

    return { success: true, comments: commentsWithProfiles }
  } catch (error) {
    console.error("Unexpected error fetching comments:", error)
    return { success: false, error: "Unexpected error occurred" }
  }
}

export async function deleteComment(commentId: string) {
  try {
    const supabase = await createServerSupabaseClient()

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()

    if (userError || !user) {
      return { success: false, error: "User not authenticated" }
    }

    const { error: deleteError } = await supabase
      .from("review_comments")
      .delete()
      .eq("id", commentId)
      .eq("user_id", user.id)

    if (deleteError) {
      console.error("Error deleting comment:", deleteError)
      return { success: false, error: "Failed to delete comment" }
    }

    revalidatePath("/")
    revalidatePath("/reviews")

    return { success: true }
  } catch (error) {
    console.error("Unexpected error deleting comment:", error)
    return { success: false, error: "Unexpected error occurred" }
  }
}

export async function getCommentCount(reviewId: string) {
  try {
    const supabase = await createServerSupabaseClient()

    const { count, error } = await supabase
      .from("review_comments")
      .select("*", { count: "exact", head: true })
      .eq("review_id", reviewId)

    if (error) {
      console.error("Error getting comment count:", error)
      return { success: false, error: "Failed to get comment count" }
    }

    return { success: true, count: count || 0 }
  } catch (error) {
    console.error("Unexpected error getting comment count:", error)
    return { success: false, error: "Unexpected error occurred" }
  }
}
