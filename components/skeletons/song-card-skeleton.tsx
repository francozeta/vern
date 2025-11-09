import { Skeleton } from "@/components/ui/skeleton"

export function SongCardSkeleton() {
  return (
    <div className="bg-card rounded-xl border border-border/50 overflow-hidden hover:border-border transition-colors animate-pulse">
      <div className="relative w-full aspect-square bg-muted">
        <Skeleton className="w-full h-full" />
        <div className="absolute inset-0 flex items-center justify-center">
          <Skeleton className="w-12 h-12 rounded-full" />
        </div>
      </div>
      <div className="p-4 space-y-3">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-3 w-1/2" />
        <Skeleton className="h-3 w-2/3" />
        <div className="flex gap-2 pt-2">
          <Skeleton className="flex-1 h-8 rounded" />
          <Skeleton className="flex-1 h-8 rounded" />
        </div>
      </div>
    </div>
  )
}
