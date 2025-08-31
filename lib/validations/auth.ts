import { z } from "zod"

export const signUpSchema = z.object({
  name: z
    .string()
    .min(2, "Name must be at least 2 characters")
    .max(50, "Name must be less than 50 characters")
    .regex(/^[a-zA-Z\s]+$/, "Name can only contain letters and spaces"),
  email: z.string().email("Please enter a valid email address").min(1, "Email is required"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      "Password must contain at least one uppercase letter, one lowercase letter, and one number",
    ),
})

export const signInSchema = z.object({
  email: z.string().email("Please enter a valid email address").min(1, "Email is required"),
  password: z.string().min(1, "Password is required"),
})

export const onboardingSchema = z.object({
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
    message: "Please select a role", // Custom error message for enum validation
    /* errorMap: () => ({ message: "Please select a role" }), */
  }),
})

// New schema for profile editing
export const editProfileSchema = z.object({
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
    })
    .optional()
    .or(z.literal("")),
  bio: z.string().max(160, "Bio must be less than 160 characters").optional().or(z.literal("")),
  role: z
    .enum(["listener", "artist", "both"], {
      message: "Please select a role",
    })
    .optional(),
  avatar_url: z.string().url("Invalid URL").optional().or(z.literal("")), // For existing URL or null
})

export type SignUpInput = z.infer<typeof signUpSchema>
export type SignInInput = z.infer<typeof signInSchema>
export type OnboardingInput = z.infer<typeof onboardingSchema>
export type EditProfileInput = z.infer<typeof editProfileSchema>
