import { z } from "zod"

export const songUploadSchema = z.object({
  title: z.string().min(1, "Title is required").max(200, "Title must be less than 200 characters"),
  artist: z.string().min(1, "Artist name is required").max(200, "Artist name must be less than 200 characters"),
  description: z.string().max(1000, "Description must be less than 1000 characters").optional(),
  genre: z.string().optional(),
})

export type SongUploadInput = z.infer<typeof songUploadSchema>

export const songSchema = z.object({
  id: z.string().uuid(),
  title: z.string(),
  artist_id: z.string().uuid().nullable(),
  uploader_id: z.string().uuid(),
  audio_url: z.string(),
  cover_url: z.string().nullable(),
  description: z.string().nullable(),
  genre_id: z.string().uuid().nullable(),
  duration_ms: z.number().nullable(),
  is_published: z.boolean(),
  source: z.enum(["spotify", "native"]),
  play_count: z.number().default(0),
  review_count: z.number().default(0),
  average_rating: z.number().nullable(),
  created_at: z.string(),
  updated_at: z.string(),
})

export type Song = z.infer<typeof songSchema>
