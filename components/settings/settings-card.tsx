import type React from "react"
import { cn } from "@/lib/utils"

interface SettingsCardProps {
  title: string
  description?: string
  children: React.ReactNode
  className?: string
}

export function SettingsCard({ title, description, children, className }: SettingsCardProps) {
  return (
    <div className={cn("border border-border/40 rounded-lg p-6 bg-card/50 backdrop-blur-sm", className)}>
      <div className="mb-6">
        <h3 className="text-lg font-semibold">{title}</h3>
        {description && <p className="text-sm text-muted-foreground mt-1">{description}</p>}
      </div>
      {children}
    </div>
  )
}
