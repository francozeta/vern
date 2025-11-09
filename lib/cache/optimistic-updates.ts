/**
 * Optimistic Updates Pattern
 * ==========================
 *
 * Muestra cambios al instante mientras se sincroniza con el servidor.
 * Si falla, revierte los cambios automáticamente.
 *
 * Uso:
 * const mutation = useMutation({
 *   mutationFn: likeReview,
 *   ...useOptimisticUpdate('reviews', updateReviewInCache)
 * })
 */

import { useQueryClient } from "@tanstack/react-query"

export function useOptimisticUpdate<T>(queryKey: string[], updateFn: (data: T, mutation: any) => T) {
  const queryClient = useQueryClient()

  return {
    onMutate: async (variables: any) => {
      // Cancel outgoing refetches for this query
      await queryClient.cancelQueries({ queryKey })

      // Snapshot current data
      const previousData = queryClient.getQueryData<T>(queryKey)

      // Optimistically update cache
      queryClient.setQueryData<T>(queryKey, (old) => {
        if (!old) return old
        return updateFn(old, variables)
      })

      // Return context for rollback
      return { previousData }
    },

    onError: (err: Error, variables: any, context: any) => {
      // Rollback on error
      if (context?.previousData) {
        queryClient.setQueryData(queryKey, context.previousData)
      }
    },

    onSuccess: () => {
      // Refresh data after success (optional, for validation)
      queryClient.invalidateQueries({ queryKey })
    },
  }
}

export function createOptimisticReviewLike(reviewId: string, isLiking: boolean) {
  return (data: any[], mutation: any) => {
    return data.map((review) => {
      if (review.id === reviewId) {
        return {
          ...review,
          likes_count: isLiking ? review.likes_count + 1 : review.likes_count - 1,
          is_liked_by_current_user: isLiking,
        }
      }
      return review
    })
  }
}

export function createOptimisticFollow(userId: string, isFollowing: boolean) {
  return (data: any[], mutation: any) => {
    return data.map((user) => {
      if (user.id === userId) {
        return {
          ...user,
          followers_count: isFollowing ? user.followers_count + 1 : user.followers_count - 1,
          is_followed_by_current_user: isFollowing,
        }
      }
      return user
    })
  }
}
