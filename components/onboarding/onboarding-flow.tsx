"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import RoleSelection from "./role-selection"
import ProfileSetup from "./profile-setup"
import WelcomeComplete from "./welcome-complete"
import type { Profile } from "@/lib/supabase/database.types"

type OnboardingStep = "role" | "profile" | "complete"
type UserRole = "listener" | "artist" | "both"

export default function OnboardingFlow() {
  const [currentStep, setCurrentStep] = useState<OnboardingStep>("role")
  const [profile, setProfile] = useState<Profile | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    checkUserProfile()
  }, [])

  const checkUserProfile = async () => {
    try {
      const supabase = createClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        router.push("/login")
        return
      }

      const { data: profile, error } = await supabase.from("profiles").select("*").eq("id", user.id).single()

      if (error) throw error

      setProfile(profile)

      // Check if onboarding is already completed
      if (profile.onboarding_completed) {
        router.push("/")
        return
      }

      // Determine current step based on profile completeness
      if (!profile.role || profile.role === "listener") {
        setCurrentStep("role")
      } else if (!profile.bio || !profile.display_name) {
        setCurrentStep("profile")
      } else {
        setCurrentStep("complete")
      }
    } catch (error) {
      console.error("Error checking profile:", error)
      router.push("/login")
    } finally {
      setIsLoading(false)
    }
  }

  const handleRoleComplete = (role: UserRole) => {
    setProfile((prev) => (prev ? { ...prev, role } : null))
    setCurrentStep("profile")
  }

  const handleProfileComplete = (updatedProfile: Profile) => {
    setProfile(updatedProfile)
    setCurrentStep("complete")
  }

  const handleOnboardingComplete = () => {
    router.push("/")
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-neutral-950 flex items-center justify-center">
        <div className="text-white text-lg">Setting up your experience...</div>
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-neutral-950 flex items-center justify-center">
        <div className="text-white text-lg">Something went wrong. Please try again.</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-neutral-950 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Progress indicator */}
        <div className="mb-8">
          <div className="flex items-center justify-center space-x-4">
            {["role", "profile", "complete"].map((step, index) => (
              <div key={step} className="flex items-center">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                    currentStep === step
                      ? "bg-white text-black"
                      : index < ["role", "profile", "complete"].indexOf(currentStep)
                        ? "bg-neutral-600 text-white"
                        : "bg-neutral-800 text-neutral-400"
                  }`}
                >
                  {index + 1}
                </div>
                {index < 2 && (
                  <div
                    className={`w-16 h-0.5 mx-2 ${
                      index < ["role", "profile", "complete"].indexOf(currentStep) ? "bg-neutral-600" : "bg-neutral-800"
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Step content */}
        {currentStep === "role" && <RoleSelection userId={profile.id} onComplete={handleRoleComplete} />}

        {currentStep === "profile" && <ProfileSetup profile={profile} onComplete={handleProfileComplete} />}

        {currentStep === "complete" && <WelcomeComplete profile={profile} onComplete={handleOnboardingComplete} />}
      </div>
    </div>
  )
}
