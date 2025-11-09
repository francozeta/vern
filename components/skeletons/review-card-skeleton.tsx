import { Skeleton } from "@/components/ui/skeleton"

export function ReviewCardSkeleton() {
  return (
    <div className="group bg-card rounded-2xl border border-border/50 overflow-hidden animate-pulse">
      {/* Header */}
      <div className="p-4 pb-3">
        <div className="flex items-start gap-3">
          <Skeleton className="w-10 h-10 rounded-full flex-shrink-0" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-48" />
            <Skeleton className="h-5 w-3/4" />
          </div>
          <Skeleton className="w-8 h-8 rounded" />
        </div>
      </div>

      {/* Album Info & Cover */}
      <div className="px-4 pb-4">
        <div className="flex gap-4">
          <Skeleton className="w-20 h-20 rounded-xl flex-shrink-0" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-3 w-1/2" />
            <Skeleton className="h-3 w-full" />
            <div className="flex gap-1 pt-1">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="w-4 h-4 rounded" />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Review Content */}
      <div className="px-4 pb-4 space-y-2">
        <Skeleton className="h-3 w-full" />
        <Skeleton className="h-3 w-5/6" />
        <Skeleton className="h-3 w-4/5" />
      </div>

      {/* Actions */}
      <div className="px-4 pb-4 pt-2 border-t border-border/50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-6">
            <Skeleton className="h-4 w-12" />
            <Skeleton className="h-4 w-12" />
          </div>
          <Skeleton className="w-8 h-8 rounded" />
        </div>
      </div>
    </div>
  )
}
