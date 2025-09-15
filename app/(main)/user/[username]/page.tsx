import { notFound } from "next/navigation"
import { createServerSupabaseClient } from "@/lib/supabase/server"
import { ProfilePageClient } from "@/components/profile-page-client"
import { getFollowStatus, getFollowCounts, getFollowers, getFollowing } from "@/app/actions/follows"

export default async function UserProfilePage({ params }: { params: Promise<{ username: string }> }) {
  const supabase = await createServerSupabaseClient()
  const {
    data: { user: currentUser },
  } = await supabase.auth.getUser()

  const resolvedParams = await params
  const { data: profile, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("username", resolvedParams.username)
    .single()

  if (error || !profile) {
    console.error("Error fetching profile:", error)
    notFound()
  }

  const { data: reviews } = await supabase
    .from("reviews")
    .select("*")
    .eq("user_id", profile.id)
    .order("created_at", { ascending: false })
    .limit(6)

  const followStatus = currentUser ? await getFollowStatus(currentUser.id, profile.id) : { isFollowing: false }
  const followCounts = await getFollowCounts(profile.id)
  const { followers } = await getFollowers(profile.id, 20)
  const { following } = await getFollowing(profile.id, 20)

  const breadcrumbs = [
    { label: "User", isLink: false },
    { label: `${profile.display_name || profile.username}'s Profile` },
  ]

  return (
    <ProfilePageClient
      initialProfileData={profile}
      currentUserId={currentUser?.id || null}
      breadcrumbs={breadcrumbs}
      initialReviews={reviews || []}
      initialIsFollowing={followStatus.isFollowing}
      followersCount={followCounts.followersCount}
      followingCount={followCounts.followingCount}
      followers={followers}
      following={following}
    />
  )
}
