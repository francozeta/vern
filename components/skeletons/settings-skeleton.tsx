import { Skeleton } from "@/components/ui/skeleton"

export function SettingsSkeleton() {
  return (
    <div className="flex flex-1 flex-col gap-4 p-4 pt-1">
      <div className="mx-auto w-full max-w-7xl">
        <div className="flex flex-col gap-6">
          {/* Header Skeleton */}
          <div className="space-y-2 animate-pulse">
            <Skeleton className="h-9 w-48" />
            <Skeleton className="h-4 w-72" />
          </div>

          {/* Separator */}
          <div className="h-px bg-border" />

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 animate-pulse">
            {/* Sidebar Skeleton */}
            <aside className="md:col-span-1 space-y-8">
              {Array.from({ length: 2 }).map((_, sectionIdx) => (
                <div key={sectionIdx} className="space-y-3">
                  <Skeleton className="h-3 w-20" />
                  {Array.from({ length: 2 }).map((_, itemIdx) => (
                    <Skeleton key={itemIdx} className="h-9 w-full rounded-md" />
                  ))}
                </div>
              ))}
            </aside>

            {/* Main Content Skeleton */}
            <main className="md:col-span-3 space-y-6">
              {/* Page Title */}
              <div className="space-y-2">
                <Skeleton className="h-8 w-40" />
                <Skeleton className="h-4 w-64" />
              </div>

              {/* Form Fields */}
              <div className="space-y-6">
                {Array.from({ length: 3 }).map((_, sectionIdx) => (
                  <div key={sectionIdx} className="space-y-4">
                    <Skeleton className="h-5 w-32" />
                    {Array.from({ length: 2 }).map((_, fieldIdx) => (
                      <div key={fieldIdx} className="space-y-2">
                        <Skeleton className="h-4 w-24" />
                        <Skeleton className="h-10 w-full rounded-md" />
                      </div>
                    ))}
                  </div>
                ))}
              </div>

              {/* Submit Button */}
              <Skeleton className="h-10 w-32 rounded-md" />
            </main>
          </div>
        </div>
      </div>
    </div>
  )
}
