import { Skeleton } from "@/components/ui/skeleton"

export function SettingsSkeleton() {
  return (
    <div className="flex flex-1 flex-col gap-4 p-4 pt-1">
      <div className="mx-auto w-full max-w-6xl">
        <div className="flex flex-col gap-6 animate-pulse">
          {/* Tabs skeleton */}
          <div className="flex gap-2 border-b border-border">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-10 w-24" />
            ))}
          </div>

          {/* Content skeleton */}
          <div className="space-y-6">
            <Skeleton className="h-8 w-32" />
            <div className="space-y-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="space-y-2">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-10 w-full" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
