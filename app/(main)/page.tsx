import { redirect } from "next/navigation"
import { getSupabaseClient } from "@/lib/supabase/server"

export default async function HomePage() {
  const supabase = await getSupabaseClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login")
  }

  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single()

  if (!profile?.onboarding_completed) {
    redirect("/onboarding")
  }

  return (
    <div className="min-h-screen bg-neutral-950 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold text-white">Welcome to VERN</h1>
          <p className="text-neutral-400 text-lg">
            Hello {profile.display_name || profile.username}! Your musical journey starts here.
          </p>
          <div className="bg-neutral-900 rounded-lg p-8 mt-8">
            <p className="text-white">Discover amazing music and share your reviews</p>
            <p className="text-neutral-400 mt-2">Role: {profile.role}</p>
          </div>
        </div>
      </div>
    </div>
  )
}
