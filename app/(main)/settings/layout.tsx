import type React from "react"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Settings | VERN",
  description: "Manage your VERN account settings, profile, and preferences",
}

export default function SettingsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="w-full">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">{children}</div>
    </div>
  )
}
