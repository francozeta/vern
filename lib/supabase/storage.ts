import { createClient } from "./client"

export async function uploadFile(
  bucket: string,
  path: string,
  file: File,
  options?: {
    cacheControl?: string
    upsert?: boolean
  },
) {
  const supabase = createClient()

  const { data, error } = await supabase.storage.from(bucket).upload(path, file, {
    cacheControl: options?.cacheControl || "3600",
    upsert: options?.upsert || true,
  })

  if (error) throw error
  return data
}

export async function getPublicUrl(bucket: string, path: string) {
  const supabase = createClient()

  const { data } = supabase.storage.from(bucket).getPublicUrl(path)

  return data.publicUrl
}

export async function deleteFile(bucket: string, path: string) {
  const supabase = createClient()

  const { error } = await supabase.storage.from(bucket).remove([path])

  if (error) throw error
}

export async function listFiles(bucket: string, path?: string) {
  const supabase = createClient()

  const { data, error } = await supabase.storage.from(bucket).list(path)

  if (error) throw error
  return data
}
