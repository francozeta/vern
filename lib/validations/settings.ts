import { z } from "zod"

export const profileSettingsSchema = z.object({
  display_name: z
    .string()
    .min(2, "Display name must be at least 2 characters")
    .max(50, "Display name must be less than 50 characters")
    .regex(/^[a-zA-Z\s]+$/, "Display name can only contain letters and spaces")
    .optional()
    .or(z.literal("")),
  username: z
    .string()
    .min(3, "Username must be at least 3 characters")
    .max(30, "Username must be less than 30 characters")
    .regex(/^[a-zA-Z0-9_]+$/, "Username can only contain letters, numbers, and underscores")
    .refine((val) => !val.startsWith("_") && !val.endsWith("_"), {
      message: "Username cannot start or end with underscore",
    }),
  bio: z.string().max(160, "Bio must be less than 160 characters").optional().or(z.literal("")),
  role: z.enum(["listener", "artist", "both"], {
    message: "Please select a role",
  }),
  location: z.string().max(100, "Location must be less than 100 characters").optional().or(z.literal("")),
  avatar_url: z.string().optional().or(z.literal("")),
  banner_url: z.string().optional().or(z.literal("")),
})

export const accountSettingsSchema = z.object({
  website_url: z.string().url("Invalid website URL").optional().or(z.literal("")),
  spotify_url: z.string().url("Invalid Spotify URL").optional().or(z.literal("")),
  instagram_url: z.string().url("Invalid Instagram URL").optional().or(z.literal("")),
})

export const generalSettingsSchema = z.object({
  email_notifications: z.boolean().optional(),
  push_notifications: z.boolean().optional(),
  privacy_profile: z.enum(["public", "private"]).optional(),
})

export type ProfileSettingsInput = z.infer<typeof profileSettingsSchema>
export type AccountSettingsInput = z.infer<typeof accountSettingsSchema>
export type GeneralSettingsInput = z.infer<typeof generalSettingsSchema>
