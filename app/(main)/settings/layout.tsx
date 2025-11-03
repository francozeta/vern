"use client"

import type React from "react"
import { Suspense } from "react"
import { SettingsSkeleton } from "@/components/skeletons/settings-skeleton"

export default function SettingsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="w-full">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <Suspense fallback={<SettingsSkeleton />}>{children}</Suspense>
      </div>
    </div>
  )
}
