import type React from "react"
import { cn } from "@/lib/utils"

interface SettingsCardProps {
  title: string
  description?: string
  children: React.ReactNode
  footer?: React.ReactNode
  className?: string
}

export function SettingsCard({ title, description, children, footer, className }: SettingsCardProps) {
  return (
    <div className={cn("border border-border/40 rounded-lg bg-card/50 backdrop-blur-sm overflow-hidden", className)}>
      {/* Header */}
      <div className="p-6 border-b border-border/40">
        <h3 className="text-lg font-semibold">{title}</h3>
        {description && <p className="text-sm text-muted-foreground mt-1">{description}</p>}
      </div>

      {/* Content */}
      <div className="p-6">{children}</div>

      {/* Footer - Optional */}
      {footer && (
        <div className="px-6 py-4 border-t border-border/40 bg-muted/30 flex items-center justify-between">
          {footer}
        </div>
      )}
    </div>
  )
}
