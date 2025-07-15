"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { GradientAvatar } from "@/components/gradient-avatar"
import { updateProfile } from "@/app/actions/auth"
import { SiVercel } from "react-icons/si"
import type { User } from "@supabase/supabase-js"

interface OnboardingFormProps {
  user: User
}

export function OnboardingForm({ user }: OnboardingFormProps) {
  const [selectedRole, setSelectedRole] = useState<"listener" | "artist" | "both">("listener")

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-6">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <SiVercel className="size-8" />
          </div>
          <CardTitle className="text-2xl">Welcome to VERN</CardTitle>
          <p className="text-muted-foreground">Let's set up your profile</p>
        </CardHeader>
        <CardContent>
          <form action={updateProfile} className="space-y-6">
            <div className="flex flex-col items-center gap-4">
              <GradientAvatar userId={user.id} size="lg" />
              <p className="text-sm text-muted-foreground">Your unique avatar has been generated</p>
            </div>

            <div className="space-y-4">
              <div>
                <Label htmlFor="username">Username</Label>
                <Input id="username" name="username" placeholder="Choose a username" required />
              </div>

              <div>
                <Label htmlFor="bio">Bio (Optional)</Label>
                <Input id="bio" name="bio" placeholder="Tell us about yourself" />
              </div>

              <div>
                <Label>I'm here as a...</Label>
                <div className="grid grid-cols-3 gap-2 mt-2">
                  {(["listener", "artist", "both"] as const).map((role) => (
                    <Button
                      key={role}
                      type="button"
                      variant={selectedRole === role ? "default" : "outline"}
                      size="sm"
                      onClick={() => setSelectedRole(role)}
                      className="capitalize"
                    >
                      {role}
                    </Button>
                  ))}
                </div>
                <input type="hidden" name="role" value={selectedRole} />
              </div>
            </div>

            <Button type="submit" className="w-full">
              Complete Setup
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
