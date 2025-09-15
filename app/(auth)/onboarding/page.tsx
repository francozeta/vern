import { OnboardingForm } from "@/components/auth/onboarding-form"
import { createServerSupabaseClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"

export default async function OnboardingPage() {
  const supabase = await createServerSupabaseClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login")
  }

  // Check if user has already completed onboarding
  const { data: profile } = await supabase.from("profiles").select("onboarding_completed").eq("id", user.id).single()

  if (profile?.onboarding_completed) {
    redirect("/")
  }

  return <OnboardingForm user={user} />
}
