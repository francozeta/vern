"use client"

import { useEffect, useState } from "react"
import { createBrowserSupabaseClient } from "@/lib/supabase/client"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ProfileTab } from "@/components/settings/profile-tab"
import { AccountTab } from "@/components/settings/account-tab"
import { GeneralTab } from "@/components/settings/general-tab"
import { BillingTab } from "@/components/settings/billing-tab"
import { ArtistTab } from "@/components/settings/artist-tab"
import { SettingsSkeleton } from "@/components/skeletons/settings-skeleton"
import { User, Link, Settings, CreditCard, Music } from "lucide-react"
import { useRouter } from "next/navigation"

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

export default function SettingsPage() {
  const router = useRouter()
  const [profile, setProfile] = useState<Profile | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const loadSettings = async () => {
      const supabase = createBrowserSupabaseClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        router.push("/login")
        return
      }

      const { data: profileData, error } = await supabase.from("profiles").select("*").eq("id", user.id).single()

      if (error || !profileData) {
        router.push("/")
        return
      }

      setProfile(profileData as Profile)
      setIsLoading(false)
    }

    loadSettings()
  }, [router])

  if (isLoading) return <SettingsSkeleton />

  if (!profile) return null

  const isArtist = profile.role === "artist" || profile.role === "both"

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 pt-1">
      <div className="mx-auto w-full max-w-6xl">
        <div className="flex flex-col gap-6">
          <Tabs defaultValue="profile" className="w-full">
            <TabsList
              className="grid w-full h-auto p-1 bg-muted"
              style={{ gridTemplateColumns: isArtist ? "repeat(6, 1fr)" : "repeat(4, 1fr)" }}
            >
              <TabsTrigger value="profile" className="flex items-center gap-2 py-3 px-2 text-xs sm:text-sm">
                <User className="h-4 w-4" />
                <span className="hidden sm:inline">Profile</span>
              </TabsTrigger>
              <TabsTrigger value="account" className="flex items-center gap-2 py-3 px-2 text-xs sm:text-sm">
                <Link className="h-4 w-4" />
                <span className="hidden sm:inline">Account</span>
              </TabsTrigger>
              <TabsTrigger value="general" className="flex items-center gap-2 py-3 px-2 text-xs sm:text-sm">
                <Settings className="h-4 w-4" />
                <span className="hidden sm:inline">General</span>
              </TabsTrigger>
              <TabsTrigger value="billing" className="flex items-center gap-2 py-3 px-2 text-xs sm:text-sm">
                <CreditCard className="h-4 w-4" />
                <span className="hidden sm:inline">Billing</span>
              </TabsTrigger>
              {isArtist && (
                <TabsTrigger value="artist" className="flex items-center gap-2 py-3 px-2 text-xs sm:text-sm col-span-2">
                  <Music className="h-4 w-4" />
                  <span className="hidden sm:inline">My Songs</span>
                </TabsTrigger>
              )}
            </TabsList>

            <div className="mt-6">
              <TabsContent value="profile" className="space-y-6">
                <ProfileTab profile={profile} />
              </TabsContent>

              <TabsContent value="account" className="space-y-6">
                <AccountTab profile={profile} />
              </TabsContent>

              <TabsContent value="general" className="space-y-6">
                <GeneralTab />
              </TabsContent>

              <TabsContent value="billing" className="space-y-6">
                <BillingTab />
              </TabsContent>

              {isArtist && (
                <TabsContent value="artist" className="space-y-6">
                  <ArtistTab userId={profile.id} />
                </TabsContent>
              )}
            </div>
          </Tabs>
        </div>
      </div>
    </div>
  )
}
