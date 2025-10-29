"use client"

import { GeneralTab } from "@/components/settings/general-tab"

export default function PreferencesPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Preferences</h2>
        <p className="text-muted-foreground">Customize your experience</p>
      </div>
      <GeneralTab />
    </div>
  )
}
