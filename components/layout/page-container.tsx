import type React from "react"

interface PageContainerProps {
  children: React.ReactNode
  className?: string
  maxWidth?: "sm" | "md" | "lg" | "xl" | "2xl" | "full"
}

/**
 * New component: Standardized page container for consistent padding/spacing
 * Ensures all pages have uniform max-width and padding regardless of route
 */
export function PageContainer({ children, className = "", maxWidth = "lg" }: PageContainerProps) {
  const maxWidthMap = {
    sm: "max-w-2xl",
    md: "max-w-3xl",
    lg: "max-w-5xl",
    xl: "max-w-6xl",
    "2xl": "max-w-7xl",
    full: "max-w-none",
  }

  return (
    <div className={`mx-auto w-full px-4 sm:px-6 lg:px-8 py-6 sm:py-8 ${maxWidthMap[maxWidth]} ${className}`}>
      {children}
    </div>
  )
}
