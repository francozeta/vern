import { createClient } from "@/lib/supabase/client"
import type { Provider } from "@supabase/supabase-js"

export async function signInWithEmail(email: string, password: string) {
  const supabase = createClient()

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) throw error
  return data
}

export async function signUpWithEmail(email: string, password: string, username: string, displayName: string) {
  const supabase = createClient()

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        username,
        full_name: displayName,
      },
    },
  })

  if (error) throw error
  return data
}

export async function signInWithProvider(provider: Provider) {
  const supabase = createClient()

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider,
    options: {
      redirectTo: `${window.location.origin}/auth/callback`,
    },
  })

  if (error) throw error
  return data
}

export async function signOut() {
  const supabase = createClient()

  const { error } = await supabase.auth.signOut()
  if (error) throw error
}

export async function getCurrentUser() {
  const supabase = createClient()

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()
  if (error) throw error

  return user
}

export async function getCurrentProfile() {
  const supabase = createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return null

  const { data: profile, error } = await supabase.from("profiles").select("*").eq("id", user.id).single()

  if (error) throw error
  return profile
}
