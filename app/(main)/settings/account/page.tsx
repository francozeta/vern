import { Suspense } from "react"
import type { Metadata } from "next"
import { createServerSupabaseClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { AccountTab } from "@/components/settings/account-tab"
import { SettingsSkeleton } from "@/components/skeletons/settings-skeleton"

export const metadata: Metadata = {
  title: "Account Settings | VERN",
  description: "Manage your social links and connections",
}

interface Profile {
  id: string
  website_url: string | null
  spotify_url: string | null
  instagram_url: string | null
}

async function AccountContent() {
  const supabase = await createServerSupabaseClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login")
  }

  const { data: profileData, error } = await supabase
    .from("profiles")
    .select("id, website_url, spotify_url, instagram_url")
    .eq("id", user.id)
    .single()

  if (error || !profileData) {
    redirect("/")
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Account</h1>
        <p className="text-muted-foreground mt-2">Manage your social links and connections</p>
      </div>
      <AccountTab profile={profileData as Profile} />
    </div>
  )
}

export default function AccountPage() {
  return (
    <Suspense fallback={<SettingsSkeleton />}>
      <AccountContent />
    </Suspense>
  )
}
