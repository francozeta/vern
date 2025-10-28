"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { createBrowserSupabaseClient } from "@/lib/supabase/client"
import { useUserProfile } from "@/hooks/use-user-profile"
import { ProfilePageClient } from "@/components/user/profile-page-client"
import { SettingsSkeleton } from "@/components/skeletons/settings-skeleton"

export default function UserProfilePage() {
  const params = useParams()
  const router = useRouter()
  const supabase = createBrowserSupabaseClient()
  const [user, setUser] = useState<any>(null)
  const [isLoadingAuth, setIsLoadingAuth] = useState(true)

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user)
      setIsLoadingAuth(false)
    })
  }, [supabase])

  const { data, isLoading, error } = useUserProfile(params.username as string, user?.id || null)

  if (isLoadingAuth || isLoading) return <SettingsSkeleton />

  if (error) {
    router.push("/")
    return null
  }

  if (!data) return null

  return (
    <ProfilePageClient
      initialProfileData={data.profile}
      currentUserId={data.profile.id === user?.id ? user.id : null}
      breadcrumbs={[
        { label: "User", isLink: false },
        { label: `${data.profile.display_name || data.profile.username}'s Profile` },
      ]}
      initialReviews={data.reviews}
      initialIsFollowing={data.isFollowing}
      followersCount={data.followersCount}
      followingCount={data.followingCount}
      followers={data.followers}
      following={data.following}
    />
  )
}
