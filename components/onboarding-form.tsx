"use client"

import type React from "react"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { updateProfileWithAvatar } from "@/app/actions/auth"
import { uploadProfileImageClient } from "@/lib/supabase/upload"
import { onboardingSchema, type OnboardingInput } from "@/lib/validations/auth"
import { SiVercel } from "react-icons/si"
import { AlertCircle, X } from "lucide-react"
import { cn } from "@/lib/utils"
import { GradientAvatar } from "@/components/gradient-avatar"

interface OnboardingFormProps {
  user: any
}

export function OnboardingForm({ user }: OnboardingFormProps) {
  const [selectedImage, setSelectedImage] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [uploadProgress, setUploadProgress] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isValid },
  } = useForm<OnboardingInput>({
    resolver: zodResolver(onboardingSchema),
    defaultValues: {
      role: "listener",
    },
    mode: "onChange",
  })

  const watchedRole = watch("role")

  const handleImageSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      // Validate file type
      if (!file.type.startsWith("image/")) {
        alert("Please select an image file")
        return
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert("File size must be less than 5MB")
        return
      }

      setSelectedImage(file)
      const url = URL.createObjectURL(file)
      setPreviewUrl(url)
    }
  }

  const handleRemoveImage = () => {
    setSelectedImage(null)
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl)
    }
    setPreviewUrl(null)
    // Reset file input
    const fileInput = document.getElementById("avatar-upload") as HTMLInputElement
    if (fileInput) {
      fileInput.value = ""
    }
  }

  const triggerFileSelect = () => {
    const fileInput = document.getElementById("avatar-upload") as HTMLInputElement
    fileInput?.click()
  }

  const onSubmit = async (data: OnboardingInput) => {
    setIsSubmitting(true)
    setSubmitError(null)
    setUploadProgress(null)

    try {
      let avatarUrl: string | null = null

      // Upload image first if selected
      if (selectedImage) {
        setUploadProgress("Uploading image...")
        const { url, error: uploadError } = await uploadProfileImageClient(selectedImage, user.id)

        if (uploadError) {
          throw new Error(`Image upload failed: ${uploadError}`)
        }

        avatarUrl = url || null
        setUploadProgress("Image uploaded successfully!")
      }

      // Update profile with form data and avatar URL
      setUploadProgress("Updating profile...")
      const formData = new FormData()
      formData.append("username", data.username)
      formData.append("bio", data.bio || "")
      formData.append("role", data.role)

      if (avatarUrl) {
        formData.append("avatar_url", avatarUrl)
      }

      await updateProfileWithAvatar(formData)
    } catch (error) {
      console.error("Error updating profile:", error)
      setSubmitError(error instanceof Error ? error.message : "An unexpected error occurred")
    } finally {
      setIsSubmitting(false)
      setUploadProgress(null)
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="flex flex-col gap-6">
          {/* Header */}
          <div className="flex flex-col items-center gap-2">
            <div className="flex size-10 items-center justify-center rounded-lg bg-primary">
              <SiVercel className="size-6 text-primary-foreground" />
            </div>
            <h1 className="text-xl font-bold">Welcome to VERN</h1>
            <div className="text-center text-sm text-muted-foreground">Complete your profile to continue</div>
          </div>

          {/* Form Fields */}
          <div className="flex flex-col gap-4">
            {/* Profile Picture Section */}
            <div className="flex flex-col items-center gap-3">
              <div className="relative">
                {/* Clickable Avatar Area */}
                <button
                  type="button"
                  onClick={triggerFileSelect}
                  className="w-20 h-20 rounded-full overflow-hidden border-2 border-border hover:border-primary/50 transition-colors group cursor-pointer"
                >
                  {previewUrl ? (
                    <img
                      src={previewUrl || "/placeholder.svg"}
                      alt="Profile preview"
                      className="w-full h-full object-cover group-hover:opacity-80 transition-opacity"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center group-hover:scale-105 transition-transform">
                      <GradientAvatar userId={user.id} size="lg" />
                    </div>
                  )}

                  {/* Hover overlay */}
                  <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <span className="text-white text-xs font-medium">Change</span>
                  </div>
                </button>

                {/* Remove button - only show if there's an image */}
                {previewUrl && (
                  <button
                    type="button"
                    onClick={handleRemoveImage}
                    className="absolute -top-1 -right-1 bg-muted hover:bg-muted/80 text-muted-foreground hover:text-foreground rounded-full p-1.5 transition-colors shadow-sm border border-border"
                  >
                    <X className="w-3 h-3" />
                  </button>
                )}

                <input
                  id="avatar-upload"
                  type="file"
                  accept="image/*"
                  onChange={handleImageSelect}
                  className="hidden"
                />
              </div>

              <div className="text-center">
                <p className="text-xs text-muted-foreground">
                  {previewUrl ? "Click to change or remove with X" : "Click to upload a profile picture"}
                </p>
                {!previewUrl && <p className="text-xs text-muted-foreground/70 mt-1">Or keep the generated avatar</p>}
              </div>
            </div>

            {/* Username Field - Required */}
            <div className="space-y-2">
              <Label htmlFor="username">
                Username <span className="text-destructive">*</span>
              </Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">
                  vern.app/
                </span>
                <Input
                  id="username"
                  {...register("username")}
                  placeholder="username"
                  className={cn("pl-20", errors.username && "border-destructive focus-visible:ring-destructive/20")}
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

            {/* Bio Field */}
            <div className="space-y-2">
              <Label htmlFor="bio">Bio (Optional)</Label>
              <Input
                id="bio"
                {...register("bio")}
                placeholder="Tell us about yourself"
                className={cn(errors.bio && "border-destructive focus-visible:ring-destructive/20")}
              />
              {errors.bio && (
                <div className="flex items-center gap-2 text-sm text-destructive">
                  <AlertCircle className="size-4" />
                  {errors.bio.message}
                </div>
              )}
            </div>

            {/* Role Selection */}
            <div className="space-y-3">
              <Label>I'm here as a...</Label>
              <div className="grid grid-cols-3 gap-2">
                {(["listener", "artist", "both"] as const).map((role) => (
                  <Button
                    key={role}
                    type="button"
                    variant={watchedRole === role ? "default" : "outline"}
                    size="sm"
                    onClick={() => setValue("role", role, { shouldValidate: true })}
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

            {/* Upload Progress */}
            {uploadProgress && (
              <div className="flex items-center gap-2 p-3 text-sm text-primary bg-primary/10 rounded-md">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current" />
                {uploadProgress}
              </div>
            )}

            {/* Submit Error */}
            {submitError && (
              <div className="flex items-center gap-2 p-3 text-sm text-destructive bg-destructive/10 rounded-md">
                <AlertCircle className="size-4 flex-shrink-0" />
                {submitError}
              </div>
            )}

            {/* Submit Button */}
            <Button type="submit" className="w-full" disabled={isSubmitting || !isValid}>
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2" />
                  Setting up...
                </>
              ) : (
                "Complete Setup"
              )}
            </Button>
          </div>
        </div>
      </form>

      {/* Footer */}
      <div className="text-center text-xs text-balance text-muted-foreground">
        By continuing, you agree to our{" "}
        <a href="#" className="underline underline-offset-4 hover:text-primary">
          Terms of Service
        </a>{" "}
        and{" "}
        <a href="#" className="underline underline-offset-4 hover:text-primary">
          Privacy Policy
        </a>
        .
      </div>
    </div>
  )
}
