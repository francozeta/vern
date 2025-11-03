"use client"

import { useState, useCallback } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useQueryClient } from "@tanstack/react-query"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { AvatarUpload } from "@/components/user/avatar-upload"
import { BannerUpload } from "@/components/user/banner-upload"
import { AlertCircle, MapPin } from "lucide-react"
import { cn } from "@/lib/utils"
import { updateProfileSettings } from "@/app/actions/settings"
import { uploadProfileImageClient } from "@/lib/supabase/upload"
import { uploadBannerImageClient } from "@/lib/supabase/upload"
import { profileSettingsSchema, type ProfileSettingsInput } from "@/lib/validations/settings"
import { SettingsCard } from "@/components/settings/settings-card"
import { useRouter } from "next/navigation"

interface ProfileTabClientProps {
  profile: {
    id: string
    username: string
    display_name: string | null
    bio: string | null
    avatar_url: string | null
    banner_url: string | null
    role: "listener" | "artist" | "both"
    location: string | null
  }
}

export function ProfileTabClient({ profile }: ProfileTabClientProps) {
  const qc = useQueryClient()
  const router = useRouter()
  const [selectedImage, setSelectedImage] = useState<File | null>(null)
  const [selectedBanner, setSelectedBanner] = useState<File | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [submitSuccess, setSubmitSuccess] = useState<string | null>(null)
  const [uploadProgress, setUploadProgress] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isValid, isDirty },
  } = useForm<ProfileSettingsInput>({
    resolver: zodResolver(profileSettingsSchema),
    defaultValues: {
      display_name: profile.display_name || "",
      username: profile.username,
      bio: profile.bio || "",
      role: profile.role,
      location: profile.location || "",
      avatar_url: profile.avatar_url || "",
      banner_url: profile.banner_url || "",
    },
    mode: "onChange",
  })

  const watchedRole = watch("role")

  const handleImageSelect = (file: File | null) => {
    setSelectedImage(file)
    if (file) {
      const previewUrl = URL.createObjectURL(file)
      setValue("avatar_url", previewUrl, { shouldDirty: true })
      return () => URL.revokeObjectURL(previewUrl)
    }
  }

  const handleBannerSelect = (file: File | null) => {
    setSelectedBanner(file)
    if (file) {
      const previewUrl = URL.createObjectURL(file)
      setValue("banner_url", previewUrl, { shouldDirty: true })
      return () => URL.revokeObjectURL(previewUrl)
    }
  }

  const onSubmit = useCallback(
    async (data: ProfileSettingsInput) => {
      setIsSubmitting(true)
      setSubmitError(null)
      setSubmitSuccess(null)
      setUploadProgress(null)

      try {
        let finalAvatarUrl = data.avatar_url || ""
        let finalBannerUrl = data.banner_url || ""

        if (selectedImage) {
          setUploadProgress("Uploading avatar...")
          const { url, error: uploadError } = await uploadProfileImageClient(selectedImage, profile.id)
          if (uploadError) {
            throw new Error(`Avatar upload failed: ${uploadError}`)
          }
          finalAvatarUrl = url || ""
        } else if (!data.avatar_url?.startsWith("blob:")) {
          // Keep existing URL if no new upload and not a temporary blob
          finalAvatarUrl = data.avatar_url || ""
        }

        if (selectedBanner) {
          setUploadProgress("Uploading banner...")
          const { url, error: uploadError } = await uploadBannerImageClient(selectedBanner, profile.id)
          if (uploadError) {
            throw new Error(`Banner upload failed: ${uploadError}`)
          }
          finalBannerUrl = url || ""
        } else if (!data.banner_url?.startsWith("blob:")) {
          // Keep existing URL if no new upload and not a temporary blob
          finalBannerUrl = data.banner_url || ""
        }

        setUploadProgress("Updating profile...")
        const formData = new FormData()
        if (data.display_name !== undefined) formData.append("display_name", data.display_name)
        if (data.username !== undefined) formData.append("username", data.username)
        if (data.bio !== undefined) formData.append("bio", data.bio)
        if (data.role !== undefined) formData.append("role", data.role)
        if (data.location !== undefined) formData.append("location", data.location)
        formData.append("avatar_url", finalAvatarUrl)
        formData.append("banner_url", finalBannerUrl)

        const response = await updateProfileSettings(formData)
        setSubmitSuccess(response.message)

        qc.setQueryData(["auth-user"], (prev: any) => ({
          ...prev,
          display_name: data.display_name || null,
          username: data.username,
          bio: data.bio || null,
          role: data.role,
          location: data.location || null,
          avatar_url: finalAvatarUrl || null,
          banner_url: finalBannerUrl || null,
        }))

        // Clear temp files and invalidate queries
        setSelectedImage(null)
        setSelectedBanner(null)
        qc.invalidateQueries({ queryKey: ["user-profile"] })

        setTimeout(() => {
          router.push(`/user/${profile.username}`)
        }, 1500)
      } catch (error) {
        console.error("Error updating profile:", error)
        setSubmitError(error instanceof Error ? error.message : "An unexpected error occurred")
      } finally {
        setIsSubmitting(false)
        setUploadProgress(null)
      }
    },
    [profile.id, profile.username, qc, router, selectedImage, selectedBanner],
  )

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <SettingsCard
        title="Profile Pictures"
        description="Upload your profile and banner images"
        footerText="Images help personalize your profile"
        onSave={handleSubmit(onSubmit)}
        isSaving={isSubmitting}
      >
        <div className="space-y-6">
          <div className="space-y-4">
            <Label>Banner Image</Label>
            <BannerUpload currentBannerUrl={profile.banner_url} onImageSelect={handleBannerSelect} />
          </div>

          <div className="space-y-4">
            <Label>Profile Picture</Label>
            <AvatarUpload userId={profile.id} currentAvatarUrl={profile.avatar_url} onImageSelect={handleImageSelect} />
          </div>
        </div>
      </SettingsCard>

      <SettingsCard
        title="Basic Information"
        description="Update your profile details"
        footerText="Keep your information up to date"
        onSave={handleSubmit(onSubmit)}
        isSaving={isSubmitting}
      >
        <div className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="display_name">Display Name</Label>
            <Input
              id="display_name"
              {...register("display_name")}
              placeholder="Your full name"
              className={cn(errors.display_name && "border-destructive focus-visible:ring-destructive/20")}
            />
            {errors.display_name && (
              <div className="flex items-center gap-2 text-sm text-destructive">
                <AlertCircle className="size-4" />
                {errors.display_name.message}
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="username">Username</Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">
                vern.app/user/
              </span>
              <Input
                id="username"
                {...register("username")}
                className={cn("pl-28", errors.username && "border-destructive focus-visible:ring-destructive/20")}
              />
            </div>
            {errors.username && (
              <div className="flex items-center gap-2 text-sm text-destructive">
                <AlertCircle className="size-4" />
                {errors.username.message}
              </div>
            )}
            <p className="text-xs text-muted-foreground">This will be your profile URL</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="bio">Bio</Label>
            <Textarea
              id="bio"
              {...register("bio")}
              placeholder="Tell us about yourself"
              className={cn("min-h-[100px]", errors.bio && "border-destructive focus-visible:ring-destructive/20")}
            />
            {errors.bio && (
              <div className="flex items-center gap-2 text-sm text-destructive">
                <AlertCircle className="size-4 flex-shrink-0" />
                {errors.bio.message}
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="location">Location</Label>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="location"
                {...register("location")}
                placeholder="City, Country"
                className={cn("pl-10", errors.location && "border-destructive focus-visible:ring-destructive/20")}
              />
            </div>
            {errors.location && (
              <div className="flex items-center gap-2 text-sm text-destructive">
                <AlertCircle className="size-4 flex-shrink-0" />
                {errors.location.message}
              </div>
            )}
          </div>

          <div className="space-y-3">
            <Label>I'm here as a...</Label>
            <div className="grid grid-cols-3 gap-2">
              {(["listener", "artist", "both"] as const).map((role) => (
                <Button
                  key={role}
                  type="button"
                  variant={watchedRole === role ? "default" : "outline"}
                  size="sm"
                  onClick={() => setValue("role", role, { shouldValidate: true, shouldDirty: true })}
                  className="capitalize"
                >
                  {role}
                </Button>
              ))}
            </div>
            {errors.role && (
              <div className="flex items-center gap-2 text-sm text-destructive">
                <AlertCircle className="size-4 flex-shrink-0" />
                {errors.role.message}
              </div>
            )}
          </div>
        </div>
      </SettingsCard>

      {uploadProgress && (
        <div className="flex items-center gap-2 p-3 text-sm text-primary bg-primary/10 rounded-md">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current" />
          {uploadProgress}
        </div>
      )}

      {submitError && (
        <div className="flex items-center gap-2 p-3 text-sm text-destructive bg-destructive/10 rounded-md">
          <AlertCircle className="size-4 flex-shrink-0" />
          {submitError}
        </div>
      )}

      {submitSuccess && (
        <div className="flex items-center gap-2 p-3 text-sm text-green-600 bg-green-50 dark:bg-green-900/20 rounded-md">
          <AlertCircle className="size-4 flex-shrink-0" />
          {submitSuccess}
        </div>
      )}
    </form>
  )
}
