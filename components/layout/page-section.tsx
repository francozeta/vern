import type React from "react"

interface PageSectionProps {
  children: React.ReactNode
  className?: string
  title?: React.ReactNode
  description?: React.ReactNode
  spacing?: "sm" | "md" | "lg"
}

/**
 * New component: Consistent section spacing for page content
 * Groups related content with standardized margins and optional title/description
 */
export function PageSection({ children, className = "", title, description, spacing = "md" }: PageSectionProps) {
  const spacingMap = {
    sm: "mb-4 sm:mb-6",
    md: "mb-6 sm:mb-8",
    lg: "mb-8 sm:mb-12",
  }

  return (
    <section className={`${spacingMap[spacing]} ${className}`}>
      {(title || description) && (
        <div className="mb-6">
          {title && <h2 className="text-2xl sm:text-3xl font-semibold text-foreground">{title}</h2>}
          {description && <p className="text-muted-foreground mt-2">{description}</p>}
        </div>
      )}
      {children}
    </section>
  )
}
