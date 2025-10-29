import { Suspense } from "react"
import { createServerSupabaseClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { ArtistTab } from "@/components/settings/artist-tab"
import { SettingsSkeleton } from "@/components/skeletons/settings-skeleton"

async function ArtistContent() {
  const supabase = await createServerSupabaseClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login")
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">My Songs</h2>
        <p className="text-muted-foreground">Manage your uploaded music</p>
      </div>
      <ArtistTab userId={user.id} />
    </div>
  )
}

export default function ArtistPage() {
  return (
    <Suspense fallback={<SettingsSkeleton />}>
      <ArtistContent />
    </Suspense>
  )
}
