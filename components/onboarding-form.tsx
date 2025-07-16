"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { AvatarUpload } from "@/components/avatar-upload"
import { updateProfileWithAvatar } from "@/app/actions/auth"
import { uploadProfileImageClient } from "@/lib/supabase/upload"
import { onboardingSchema, type OnboardingInput } from "@/lib/validations/auth"
import { SiVercel } from "react-icons/si"
import { AlertCircle } from "lucide-react"
import type { User } from "@supabase/supabase-js"
import { cn } from "@/lib/utils"

interface OnboardingFormProps {
  user: User
}

export function OnboardingForm({ user }: OnboardingFormProps) {
  const [selectedImage, setSelectedImage] = useState<File | null>(null)
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
    <div className="bg-background flex min-h-svh flex-col items-center justify-center gap-6 p-6 md:p-10">
      <div className="w-full max-w-sm">
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="flex flex-col gap-6">
            {/* Header */}
            <div className="flex flex-col items-center gap-2">
              <a href="#" className="flex flex-col items-center gap-2 font-medium">
                <div className="flex size-8 items-center justify-center rounded-md">
                  <SiVercel className="size-6" />
                </div>
                <span className="sr-only">VERN</span>
              </a>
              <h1 className="text-xl font-bold">Welcome to VERN</h1>
              <div className="text-center text-sm">Let's set up your profile</div>
            </div>

            {/* Form Fields */}
            <div className="flex flex-col gap-6">
              {/* Avatar Upload */}
              <div className="flex justify-center">
                <AvatarUpload userId={user.id} onImageSelect={setSelectedImage} size="lg" />
              </div>

              {/* Username Field */}
              <div className="grid gap-3">
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  {...register("username")}
                  placeholder="Choose a username"
                  className={cn(errors.username && "border-destructive")}
                />
                {errors.username && (
                  <div className="flex items-center gap-2 text-sm text-destructive">
                    <AlertCircle className="size-4" />
                    {errors.username.message}
                  </div>
                )}
              </div>

              {/* Bio Field */}
              <div className="grid gap-3">
                <Label htmlFor="bio">Bio (Optional)</Label>
                <Input
                  id="bio"
                  {...register("bio")}
                  placeholder="Tell us about yourself"
                  className={cn(errors.bio && "border-destructive")}
                />
                {errors.bio && (
                  <div className="flex items-center gap-2 text-sm text-destructive">
                    <AlertCircle className="size-4" />
                    {errors.bio.message}
                  </div>
                )}
              </div>

              {/* Role Selection */}
              <div className="grid gap-3">
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
                    <AlertCircle className="size-4" />
                    {errors.role.message}
                  </div>
                )}
              </div>

              {/* Upload Progress */}
              {uploadProgress && (
                <div className="flex items-center gap-2 text-sm text-primary">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current" />
                  {uploadProgress}
                </div>
              )}

              {/* Submit Error */}
              {submitError && (
                <div className="flex items-center gap-2 text-sm text-destructive">
                  <AlertCircle className="size-4" />
                  {submitError}
                </div>
              )}

              {/* Submit Button */}
              <Button type="submit" className="w-full" disabled={isSubmitting || !isValid}>
                {isSubmitting ? "Setting up..." : "Complete Setup"}
              </Button>
            </div>
          </div>
        </form>

        {/* Footer */}
        <div className="text-muted-foreground text-center text-xs text-balance mt-6">
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
    </div>
  )
}
