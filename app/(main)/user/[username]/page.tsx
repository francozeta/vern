"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { createBrowserSupabaseClient } from "@/lib/supabase/client"
import { ProfilePageClient } from "@/components/user/profile-page-client"
import { SettingsSkeleton } from "@/components/skeletons/settings-skeleton"

interface Profile {
  id: string
  username: string
  display_name: string | null
  avatar_url: string | null
  bio: string | null
  banner_url: string | null
  role: "listener" | "artist" | "both"
  is_verified: boolean
  location: string | null
  website_url: string | null
  spotify_url: string | null
  instagram_url: string | null
  created_at: string
}

interface Review {
  id: string
  title: string
  content: string
  rating: number
  created_at: string
}

interface UserData {
  profile: Profile
  currentUserId: string | null
  reviews: Review[]
  isFollowing: boolean
  followersCount: number
  followingCount: number
  followers: Array<{ following_id: string }>
  following: Array<{ following_id: string }>
}

export default function UserProfilePage() {
  const params = useParams()
  const router = useRouter()
  const [data, setData] = useState<UserData | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const loadProfile = async () => {
      const supabase = createBrowserSupabaseClient()
      const {
        data: { user: currentUser },
      } = await supabase.auth.getUser()

      const { data: profile, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("username", params.username)
        .single()

      if (error || !profile) {
        router.push("/")
        return
      }

      const [reviewsResult, followStatusResult, followCountsResult, followersResult, followingResult] =
        await Promise.all([
          supabase
            .from("reviews")
            .select("*")
            .eq("user_id", profile.id)
            .order("created_at", { ascending: false })
            .limit(6),
          currentUser
            ? supabase
                .from("follows")
                .select("id")
                .eq("follower_id", currentUser.id)
                .eq("following_id", profile.id)
                .single()
            : Promise.resolve({ data: null }),
          supabase.from("follows").select("id", { count: "exact" }).eq("following_id", profile.id),
          supabase.from("follows").select("following_id").eq("follower_id", profile.id).limit(20),
          supabase.from("follows").select("following_id").eq("follower_id", profile.id).limit(20),
        ])

      setData({
        profile: profile as Profile,
        currentUserId: currentUser?.id || null,
        reviews: reviewsResult.data || [],
        isFollowing: !!followStatusResult.data,
        followersCount: followCountsResult.count || 0,
        followingCount: followingResult.data?.length || 0,
        followers: followersResult.data || [],
        following: followingResult.data || [],
      })

      setIsLoading(false)
    }

    loadProfile()
  }, [params.username, router])

  if (isLoading) return <SettingsSkeleton />

  if (!data) return null

  return (
    <ProfilePageClient
      initialProfileData={data.profile}
      currentUserId={data.currentUserId}
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
