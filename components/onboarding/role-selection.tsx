"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Music, Headphones, Users } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { toast } from "sonner"

type UserRole = "listener" | "artist" | "both"

interface RoleSelectionProps {
  userId: string
  onComplete: (role: UserRole) => void
}

export default function RoleSelection({ userId, onComplete }: RoleSelectionProps) {
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const roles = [
    {
      id: "listener" as UserRole,
      title: "Listener",
      description: "Discover and review music",
      icon: Headphones,
      features: ["Browse new music", "Write reviews", "Create playlists", "Follow artists"],
    },
    {
      id: "artist" as UserRole,
      title: "Artist",
      description: "Share your music with fans",
      icon: Music,
      features: ["Upload your music", "Build your profile", "Get feedback", "Connect with fans"],
    },
    {
      id: "both" as UserRole,
      title: "Both",
      description: "Complete VERN experience",
      icon: Users,
      features: ["All listener features", "All artist features", "Switch roles seamlessly"],
    },
  ]

  const handleRoleSelect = async () => {
    if (!selectedRole) return

    setIsLoading(true)
    try {
      const supabase = createClient()

      const { error } = await supabase.from("profiles").update({ role: selectedRole }).eq("id", userId)

      if (error) throw error

      toast.success(`Welcome as a ${selectedRole}!`)
      onComplete(selectedRole)
    } catch (error: any) {
      toast.error(error.message || "Failed to update role")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="text-center space-y-3">
        <h1 className="text-2xl md:text-3xl font-bold text-white">Choose Your Role</h1>
        <p className="text-neutral-400 max-w-2xl mx-auto">
          How would you like to experience VERN? You can change this later.
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        {roles.map((role) => {
          const Icon = role.icon
          const isSelected = selectedRole === role.id

          return (
            <Card
              key={role.id}
              className={`cursor-pointer transition-all duration-200 ${
                isSelected
                  ? "bg-white text-black border-white"
                  : "bg-neutral-900 text-white border-neutral-700 hover:border-neutral-600 hover:bg-neutral-800"
              }`}
              onClick={() => setSelectedRole(role.id)}
            >
              <CardHeader className="text-center pb-3">
                <div
                  className={`w-12 h-12 mx-auto rounded-full flex items-center justify-center mb-3 ${
                    isSelected ? "bg-black text-white" : "bg-neutral-800 text-white"
                  }`}
                >
                  <Icon className="w-6 h-6" />
                </div>
                <CardTitle className="text-lg">{role.title}</CardTitle>
                <CardDescription className={`text-sm ${isSelected ? "text-neutral-600" : "text-neutral-400"}`}>
                  {role.description}
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                <ul className="space-y-1">
                  {role.features.map((feature, index) => (
                    <li
                      key={index}
                      className={`text-xs flex items-center ${isSelected ? "text-neutral-700" : "text-neutral-300"}`}
                    >
                      <div
                        className={`w-1 h-1 rounded-full mr-2 ${isSelected ? "bg-neutral-600" : "bg-neutral-500"}`}
                      />
                      {feature}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )
        })}
      </div>

      <div className="flex justify-center">
        <Button
          onClick={handleRoleSelect}
          disabled={!selectedRole || isLoading}
          className="px-8 bg-white text-black hover:bg-neutral-100 disabled:opacity-50"
        >
          {isLoading ? "Setting up..." : "Continue"}
        </Button>
      </div>
    </div>
  )
}
