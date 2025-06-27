"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Music, Headphones, Users, CheckCircle } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { toast } from "sonner"
import type { Profile } from "@/lib/supabase/database.types"
import confetti from "canvas-confetti"

interface WelcomeCompleteProps {
  profile: Profile
  onComplete: () => void
}

export default function WelcomeComplete({ profile, onComplete }: WelcomeCompleteProps) {
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    // Minimal confetti animation
    const triggerConfetti = () => {
      confetti({
        particleCount: 30,
        spread: 60,
        origin: { y: 0.6 },
        colors: ["#ffffff", "#f5f5f5"],
      })
    }

    // Trigger once after a short delay
    const timer = setTimeout(triggerConfetti, 500)
    return () => clearTimeout(timer)
  }, [])

  const handleComplete = async () => {
    setIsLoading(true)
    try {
      const supabase = createClient()

      // Mark onboarding as completed
      const { error } = await supabase.from("profiles").update({ onboarding_completed: true }).eq("id", profile.id)

      if (error) throw error

      toast.success("Welcome to VERN! 🎉")
      onComplete()
    } catch (error: any) {
      toast.error(error.message || "Something went wrong")
    } finally {
      setIsLoading(false)
    }
  }

  const getRoleIcon = (role: string) => {
    switch (role) {
      case "artist":
        return <Music className="w-4 h-4" />
      case "listener":
        return <Headphones className="w-4 h-4" />
      case "both":
        return <Users className="w-4 h-4" />
      default:
        return <Headphones className="w-4 h-4" />
    }
  }

  const getRoleColor = (role: string) => {
    switch (role) {
      case "artist":
        return "bg-purple-100 text-purple-800 border-purple-200"
      case "listener":
        return "bg-blue-100 text-blue-800 border-blue-200"
      case "both":
        return "bg-green-100 text-green-800 border-green-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((word) => word[0])
      .join("")
      .toUpperCase()
      .slice(0, 2)
  }

  const getWelcomeMessage = (role: string) => {
    switch (role) {
      case "artist":
        return "Ready to share your music with the world!"
      case "listener":
        return "Ready to discover amazing music!"
      case "both":
        return "Ready for the complete VERN experience!"
      default:
        return "Welcome to VERN!"
    }
  }

  const getNextSteps = (role: string) => {
    switch (role) {
      case "artist":
        return ["Upload your first track", "Get your first review"]
      case "listener":
        return ["Discover new music", "Write your first review"]
      case "both":
        return ["Explore music", "Upload a track", "Write a review"]
      default:
        return ["Explore VERN", "Discover music"]
    }
  }

  return (
    <div className="max-w-lg mx-auto space-y-6">
      <div className="text-center space-y-3">
        <div className="flex justify-center">
          <CheckCircle className="w-12 h-12 text-green-400" />
        </div>
        <h1 className="text-2xl md:text-3xl font-bold text-white">Welcome to VERN!</h1>
        <p className="text-neutral-400">Your profile is complete and you're ready to start.</p>
      </div>

      <Card className="bg-neutral-900 border-neutral-700">
        <CardHeader className="text-center pb-4">
          <div className="flex justify-center mb-3">
            <Avatar className="w-16 h-16">
              <AvatarImage src={profile.avatar_url || undefined} />
              <AvatarFallback className="bg-neutral-800 text-white text-lg">
                {profile.display_name ? getInitials(profile.display_name) : profile.username.slice(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
          </div>
          <CardTitle className="text-white text-xl">{profile.display_name || profile.username}</CardTitle>
          <div className="flex justify-center mt-2">
            <Badge className={`${getRoleColor(profile.role)} flex items-center gap-1 text-xs`}>
              {getRoleIcon(profile.role)}
              {profile.role.charAt(0).toUpperCase() + profile.role.slice(1)}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4 pt-0">
          <div className="text-center">
            <p className="text-neutral-300 text-sm">{getWelcomeMessage(profile.role)}</p>
          </div>

          <div>
            <h3 className="text-white font-medium mb-2 text-sm">What's Next?</h3>
            <div className="space-y-2">
              {getNextSteps(profile.role).map((step, index) => (
                <div key={index} className="flex items-center space-x-2 text-sm">
                  <div className="w-5 h-5 bg-white text-black rounded-full flex items-center justify-center text-xs font-medium">
                    {index + 1}
                  </div>
                  <span className="text-neutral-300">{step}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-2">
            <Button
              onClick={handleComplete}
              disabled={isLoading}
              className="w-full bg-white text-black hover:bg-neutral-100"
            >
              {isLoading ? "Setting up..." : "Enter VERN 🚀"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
