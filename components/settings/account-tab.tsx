"use client"

import { useState, useCallback } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useQueryClient } from "@tanstack/react-query"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { AlertCircle, Link, Instagram } from "lucide-react"
import { FaSpotify } from "react-icons/fa"
import { cn } from "@/lib/utils"
import { updateAccountSettings } from "@/app/actions/settings"
import { accountSettingsSchema, type AccountSettingsInput } from "@/lib/validations/settings"
import { SettingsCard } from "@/components/settings/settings-card"

interface AccountTabProps {
  profile: {
    id: string
    website_url: string | null
    spotify_url: string | null
    instagram_url: string | null
  }
}

export function AccountTab({ profile }: AccountTabProps) {
  const qc = useQueryClient()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [submitSuccess, setSubmitSuccess] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors, isValid, isDirty },
  } = useForm<AccountSettingsInput>({
    resolver: zodResolver(accountSettingsSchema),
    defaultValues: {
      website_url: profile.website_url || "",
      spotify_url: profile.spotify_url || "",
      instagram_url: profile.instagram_url || "",
    },
    mode: "onChange",
  })

  const onSubmit = useCallback(
    async (data: AccountSettingsInput) => {
      setIsSubmitting(true)
      setSubmitError(null)
      setSubmitSuccess(null)

      try {
        const formData = new FormData()
        if (data.website_url !== undefined) formData.append("website_url", data.website_url)
        if (data.spotify_url !== undefined) formData.append("spotify_url", data.spotify_url)
        if (data.instagram_url !== undefined) formData.append("instagram_url", data.instagram_url)

        const response = await updateAccountSettings(formData)
        setSubmitSuccess(response.message)

        qc.setQueryData(["auth-user"], (prev: any) => ({
          ...prev,
          website_url: data.website_url || null,
          spotify_url: data.spotify_url || null,
          instagram_url: data.instagram_url || null,
        }))

        // Invalidate related queries
        qc.invalidateQueries({ queryKey: ["user-profile"] })
      } catch (error) {
        console.error("Error updating account settings:", error)
        setSubmitError(error instanceof Error ? error.message : "An unexpected error occurred")
      } finally {
        setIsSubmitting(false)
      }
    },
    [qc],
  )

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <SettingsCard
        title="Social Links"
        description="Connect your social media profiles to your VERN account"
        footerText="Add your social media links to help others find you"
        onSave={handleSubmit(onSubmit)}
        isSaving={isSubmitting}
      >
        <div className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="website_url">Website</Label>
            <div className="relative">
              <Link className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="website_url"
                {...register("website_url")}
                placeholder="https://yourwebsite.com"
                className={cn("pl-10", errors.website_url && "border-destructive focus-visible:ring-destructive/20")}
              />
            </div>
            {errors.website_url && (
              <div className="flex items-center gap-2 text-sm text-destructive">
                <AlertCircle className="size-4" />
                {errors.website_url.message}
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="spotify_url">Spotify</Label>
            <div className="relative">
              <FaSpotify className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="spotify_url"
                {...register("spotify_url")}
                placeholder="https://open.spotify.com/user/username"
                className={cn("pl-10", errors.spotify_url && "border-destructive focus-visible:ring-destructive/20")}
              />
            </div>
            {errors.spotify_url && (
              <div className="flex items-center gap-2 text-sm text-destructive">
                <AlertCircle className="size-4" />
                {errors.spotify_url.message}
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="instagram_url">Instagram</Label>
            <div className="relative">
              <Instagram className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="instagram_url"
                {...register("instagram_url")}
                placeholder="https://instagram.com/username"
                className={cn("pl-10", errors.instagram_url && "border-destructive focus-visible:ring-destructive/20")}
              />
            </div>
            {errors.instagram_url && (
              <div className="flex items-center gap-2 text-sm text-destructive">
                <AlertCircle className="size-4" />
                {errors.instagram_url.message}
              </div>
            )}
          </div>
        </div>
      </SettingsCard>

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
