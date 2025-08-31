import { notFound } from "next/navigation"
import { createServerSupabaseClient } from "@/lib/supabase/server"
import { ProfilePageClient } from "@/components/profile-page-client"

export default async function UserProfilePage({ params }: { params: { username: string } }) {
  const supabase = await createServerSupabaseClient()
  const {
    data: { user: currentUser },
  } = await supabase.auth.getUser()

  const { data: profile, error } = await supabase.from("profiles").select("*").eq("username", params.username).single()

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
    />
  )
}
