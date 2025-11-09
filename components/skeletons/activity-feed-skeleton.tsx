import { ReviewCardSkeleton } from "./review-card-skeleton"

export function ActivityFeedSkeleton() {
  return (
    <div className="space-y-6">
      {[...Array(3)].map((_, i) => (
        <ReviewCardSkeleton key={i} />
      ))}
    </div>
  )
}
