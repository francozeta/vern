import { useQuery } from "@tanstack/react-query"
import { getComments } from "@/app/actions/comments"

interface Comment {
  id: string
  user_id: string
  review_id: string
  content: string
  created_at: string
  updated_at: string
  profiles: {
    username: string
    display_name: string | null
    avatar_url: string | null
    is_verified: boolean
  }
}

async function fetchComments(reviewId: string): Promise<Comment[]> {
  const result = await getComments(reviewId)
  if (result.success && result.comments) {
    return result.comments
  }
  throw new Error(result.error || "Failed to load comments")
}

export function useComments(reviewId: string, enabled = true) {
  return useQuery({
    queryKey: ["comments", reviewId],
    queryFn: () => fetchComments(reviewId),
    enabled: enabled && !!reviewId,
    staleTime: 1000 * 60 * 2,
  })
}
