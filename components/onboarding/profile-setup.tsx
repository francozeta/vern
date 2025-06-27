"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Camera, MapPin, Globe, Instagram, Music } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { toast } from "sonner"
import type { Profile } from "@/lib/supabase/database.types"

interface ProfileSetupProps {
  profile: Profile
  onComplete: (profile: Profile) => void
}

export default function ProfileSetup({ profile, onComplete }: ProfileSetupProps) {
  const [formData, setFormData] = useState({
    display_name: profile.display_name || "",
    bio: profile.bio || "",
    location: profile.location || "",
    website_url: profile.website_url || "",
    instagram_url: profile.instagram_url || "",
    spotify_url: profile.spotify_url || "",
  })
  const [avatarFile, setAvatarFile] = useState<File | null>(null)
  const [avatarPreview, setAvatarPreview] = useState<string | null>(profile.avatar_url)
  const [isLoading, setIsLoading] = useState(false)

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      // Validate file size (2MB max)
      if (file.size > 2 * 1024 * 1024) {
        toast.error("Image must be less than 2MB")
        return
      }

      // Validate file type
      const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp", "image/gif"]
      if (!allowedTypes.includes(file.type)) {
        toast.error("Please upload a valid image file (JPEG, PNG, WebP, or GIF)")
        return
      }

      setAvatarFile(file)
      const reader = new FileReader()
      reader.onload = (e) => {
        setAvatarPreview(e.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const uploadAvatar = async (file: File): Promise<string> => {
    const supabase = createClient()

    // Create a unique filename
    const fileExt = file.name.split(".").pop()?.toLowerCase()
    const fileName = `${profile.id}-${Date.now()}.${fileExt}`

    try {
      // Upload the file
      const { data, error: uploadError } = await supabase.storage.from("avatars").upload(fileName, file, {
        cacheControl: "3600",
        upsert: true,
      })

      if (uploadError) {
        console.error("Upload error:", uploadError)
        throw new Error(`Upload failed: ${uploadError.message}`)
      }

      // Get the public URL
      const { data: urlData } = supabase.storage.from("avatars").getPublicUrl(fileName)

      if (!urlData?.publicUrl) {
        throw new Error("Failed to get public URL")
      }

      return urlData.publicUrl
    } catch (error) {
      console.error("Avatar upload error:", error)
      throw error
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const supabase = createClient()
      let avatarUrl = profile.avatar_url

      // Upload avatar if changed
      if (avatarFile) {
        try {
          avatarUrl = await uploadAvatar(avatarFile)
          toast.success("Avatar uploaded successfully!")
        } catch (error: any) {
          console.error("Avatar upload failed:", error)
          toast.error(`Failed to upload avatar: ${error.message}`)
          // Continue with profile update even if avatar upload fails
        }
      }

      // Update profile
      const { data: updatedProfile, error } = await supabase
        .from("profiles")
        .update({
          ...formData,
          avatar_url: avatarUrl,
        })
        .eq("id", profile.id)
        .select()
        .single()

      if (error) {
        console.error("Profile update error:", error)
        throw new Error(`Failed to update profile: ${error.message}`)
      }

      toast.success("Profile updated successfully!")
      onComplete(updatedProfile)
    } catch (error: any) {
      console.error("Profile setup error:", error)
      toast.error(error.message || "Failed to update profile")
    } finally {
      setIsLoading(false)
    }
  }

  const handleSkip = () => {
    // Skip with minimal required data
    const updatedProfile = { ...profile, display_name: profile.username }
    onComplete(updatedProfile)
  }

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((word) => word[0])
      .join("")
      .toUpperCase()
      .slice(0, 2)
  }

  return (
    <div className="max-w-lg mx-auto space-y-6">
      <div className="text-center space-y-3">
        <h1 className="text-2xl md:text-3xl font-bold text-white">Complete Your Profile</h1>
        <p className="text-neutral-400 text-sm">Tell the VERN community about yourself.</p>
      </div>

      <Card className="bg-neutral-900 border-neutral-700">
        <CardHeader className="pb-4">
          <CardTitle className="text-white text-lg">Profile Information</CardTitle>
          <CardDescription className="text-neutral-400 text-sm">Make your profile stand out.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Avatar Upload */}
            <div className="flex flex-col items-center space-y-3">
              <div className="relative">
                <Avatar className="w-20 h-20">
                  <AvatarImage src={avatarPreview || undefined} />
                  <AvatarFallback className="bg-neutral-800 text-white text-lg">
                    {formData.display_name
                      ? getInitials(formData.display_name)
                      : profile.username.slice(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <label
                  htmlFor="avatar-upload"
                  className="absolute -bottom-1 -right-1 bg-white text-black p-1.5 rounded-full cursor-pointer hover:bg-neutral-100 transition-colors"
                >
                  <Camera className="w-3 h-3" />
                </label>
                <input
                  id="avatar-upload"
                  type="file"
                  accept="image/jpeg,image/jpg,image/png,image/webp,image/gif"
                  onChange={handleAvatarChange}
                  className="hidden"
                  disabled={isLoading}
                />
              </div>
              <p className="text-xs text-neutral-400 text-center">
                Click to upload profile picture
                <br />
                <span className="text-neutral-500">Max 2MB • JPEG, PNG, WebP, GIF</span>
              </p>
            </div>

            {/* Display Name */}
            <div className="space-y-1">
              <Label htmlFor="display_name" className="text-white text-sm">
                Display Name *
              </Label>
              <Input
                id="display_name"
                value={formData.display_name}
                onChange={(e) => setFormData((prev) => ({ ...prev, display_name: e.target.value }))}
                placeholder="How should people know you?"
                className="bg-neutral-800 border-neutral-600 text-white placeholder-neutral-400 h-10"
                required
                disabled={isLoading}
              />
            </div>

            {/* Bio */}
            <div className="space-y-1">
              <Label htmlFor="bio" className="text-white text-sm">
                Bio
              </Label>
              <Textarea
                id="bio"
                value={formData.bio}
                onChange={(e) => setFormData((prev) => ({ ...prev, bio: e.target.value }))}
                placeholder={
                  profile.role === "artist"
                    ? "Tell people about your music and influences..."
                    : "Share your music taste and what you love about music..."
                }
                className="bg-neutral-800 border-neutral-600 text-white placeholder-neutral-400 min-h-[80px] text-sm"
                maxLength={300}
                disabled={isLoading}
              />
              <p className="text-xs text-neutral-500">{formData.bio.length}/300 characters</p>
            </div>

            {/* Location */}
            <div className="space-y-1">
              <Label htmlFor="location" className="text-white flex items-center text-sm">
                <MapPin className="w-3 h-3 mr-1" />
                Location
              </Label>
              <Input
                id="location"
                value={formData.location}
                onChange={(e) => setFormData((prev) => ({ ...prev, location: e.target.value }))}
                placeholder="City, Country"
                className="bg-neutral-800 border-neutral-600 text-white placeholder-neutral-400 h-10"
                disabled={isLoading}
              />
            </div>

            {/* Social Links - Collapsible */}
            <details className="group">
              <summary className="text-white font-medium text-sm cursor-pointer list-none flex items-center">
                Social Links (Optional)
                <span className="ml-auto group-open:rotate-180 transition-transform">▼</span>
              </summary>
              <div className="mt-3 space-y-3">
                <div className="space-y-1">
                  <Label htmlFor="website_url" className="text-white flex items-center text-sm">
                    <Globe className="w-3 h-3 mr-1" />
                    Website
                  </Label>
                  <Input
                    id="website_url"
                    type="url"
                    value={formData.website_url}
                    onChange={(e) => setFormData((prev) => ({ ...prev, website_url: e.target.value }))}
                    placeholder="https://yourwebsite.com"
                    className="bg-neutral-800 border-neutral-600 text-white placeholder-neutral-400 h-10"
                    disabled={isLoading}
                  />
                </div>

                <div className="space-y-1">
                  <Label htmlFor="instagram_url" className="text-white flex items-center text-sm">
                    <Instagram className="w-3 h-3 mr-1" />
                    Instagram
                  </Label>
                  <Input
                    id="instagram_url"
                    type="url"
                    value={formData.instagram_url}
                    onChange={(e) => setFormData((prev) => ({ ...prev, instagram_url: e.target.value }))}
                    placeholder="https://instagram.com/yourusername"
                    className="bg-neutral-800 border-neutral-600 text-white placeholder-neutral-400 h-10"
                    disabled={isLoading}
                  />
                </div>

                <div className="space-y-1">
                  <Label htmlFor="spotify_url" className="text-white flex items-center text-sm">
                    <Music className="w-3 h-3 mr-1" />
                    Spotify
                  </Label>
                  <Input
                    id="spotify_url"
                    type="url"
                    value={formData.spotify_url}
                    onChange={(e) => setFormData((prev) => ({ ...prev, spotify_url: e.target.value }))}
                    placeholder="https://open.spotify.com/artist/..."
                    className="bg-neutral-800 border-neutral-600 text-white placeholder-neutral-400 h-10"
                    disabled={isLoading}
                  />
                </div>
              </div>
            </details>

            <div className="flex justify-between pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={handleSkip}
                className="bg-transparent border-neutral-600 text-neutral-400 hover:bg-neutral-800"
                disabled={isLoading}
              >
                Skip for now
              </Button>
              <Button
                type="submit"
                disabled={isLoading || !formData.display_name}
                className="bg-white text-black hover:bg-neutral-100"
              >
                {isLoading ? "Saving..." : "Continue"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
