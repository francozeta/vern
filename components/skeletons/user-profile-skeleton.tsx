import { Skeleton } from "@/components/ui/skeleton"

export function UserProfileSkeleton() {
  return (
    <div className="space-y-8 animate-pulse">
      {/* Banner */}
      <Skeleton className="w-full h-32 rounded-lg" />

      {/* Profile Section */}
      <div className="px-4 space-y-4">
        <div className="flex gap-4 items-end -mt-12 mb-4">
          <Skeleton className="w-24 h-24 rounded-full border-4 border-background flex-shrink-0" />
          <div className="flex-1 space-y-2 mb-2">
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-4 w-32" />
          </div>
        </div>

        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-5/6" />

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 py-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="space-y-2">
              <Skeleton className="h-5 w-full" />
              <Skeleton className="h-4 w-3/4" />
            </div>
          ))}
        </div>

        {/* Buttons */}
        <div className="flex gap-3">
          <Skeleton className="flex-1 h-10 rounded-lg" />
          <Skeleton className="flex-1 h-10 rounded-lg" />
        </div>
      </div>

      {/* Tabs content */}
      <div className="px-4 space-y-4">
        {[...Array(3)].map((_, i) => (
          <Skeleton key={i} className="h-32 w-full rounded-lg" />
        ))}
      </div>
    </div>
  )
}
