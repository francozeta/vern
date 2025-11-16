"use client"

import { useParams, useRouter } from "next/navigation"
import { useAuthUser } from "@/components/providers/auth-user-provider"
import { useUserProfile } from "@/hooks/use-user-profile"

import { ProfilePageClient } from "@/components/user/profile-page-client"
import { SettingsSkeleton } from "@/components/skeletons/settings-skeleton"

export default function UserProfilePage() {
  const params = useParams()
  const router = useRouter()
  const { user, isLoading: isLoadingAuth } = useAuthUser()
  const currentUserId = user?.id ?? null

  const { data, isLoading, error } = useUserProfile(params.username as string, currentUserId)

  if (isLoadingAuth || isLoading) return <SettingsSkeleton />
  if (error) {
    router.push("/")
    return null
  }

  if (!data) return null

  return (
    <ProfilePageClient
      initialProfileData={data.profile}
      currentUserId={currentUserId}
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
