import type React from "react"

interface ContentGridProps {
  children: React.ReactNode
  className?: string
  columns?: "1" | "2" | "3" | "4"
  gap?: "sm" | "md" | "lg"
}

/**
 * New component: Responsive grid for consistent content layouts
 * Handles responsive columns with standardized gaps
 */
export function ContentGrid({ children, className = "", columns = "2", gap = "md" }: ContentGridProps) {
  const columnsMap = {
    "1": "grid-cols-1",
    "2": "md:grid-cols-2 lg:grid-cols-2",
    "3": "md:grid-cols-2 lg:grid-cols-3",
    "4": "md:grid-cols-2 lg:grid-cols-4",
  }

  const gapMap = {
    sm: "gap-4",
    md: "gap-6",
    lg: "gap-8",
  }

  return <div className={`grid ${columnsMap[columns]} ${gapMap[gap]} ${className}`}>{children}</div>
}
