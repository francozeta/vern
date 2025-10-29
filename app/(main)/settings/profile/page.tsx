import { Suspense } from "react"
import type { Metadata } from "next"
import { createServerSupabaseClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { ProfileTab } from "@/components/settings/profile-tab"
import { SettingsSkeleton } from "@/components/skeletons/settings-skeleton"

export const metadata: Metadata = {
  title: "Profile Settings | VERN",
  description: "Edit your profile information, avatar, and bio",
}

interface Profile {
  id: string
  username: string
  display_name: string | null
  avatar_url: string | null
  bio: string | null
  banner_url: string | null
  role: "listener" | "artist" | "both"
  is_verified: boolean
  onboarding_completed: boolean
  location: string | null
  website_url: string | null
  spotify_url: string | null
  instagram_url: string | null
}

async function ProfileContent() {
  const supabase = await createServerSupabaseClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login")
  }

  const { data: profileData, error } = await supabase.from("profiles").select("*").eq("id", user.id).single()

  if (error || !profileData) {
    redirect("/")
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Profile</h1>
        <p className="text-muted-foreground mt-2">Manage your profile information and appearance</p>
      </div>
      <ProfileTab profile={profileData as Profile} />
    </div>
  )
}

export default function ProfilePage() {
  return (
    <Suspense fallback={<SettingsSkeleton />}>
      <ProfileContent />
    </Suspense>
  )
}
