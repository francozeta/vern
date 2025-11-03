"use client"

import { createContext, useContext, useEffect, type ReactNode } from "react"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import { createBrowserSupabaseClient } from "@/lib/supabase/client"

interface AuthUser {
  id: string
  email: string
  username: string
  display_name: string | null
  avatar_url: string | null
  banner_url: string | null
  bio: string | null
  role: "listener" | "artist" | "both"
  is_verified: boolean
  location: string | null
  website_url: string | null
  spotify_url: string | null
  instagram_url: string | null
  created_at: string
}

interface AuthUserContextType {
  user: AuthUser | null
  isLoading: boolean
  refresh: () => Promise<void>
}

const AuthUserContext = createContext<AuthUserContextType | null>(null)

export const useAuthUser = () => {
  const context = useContext(AuthUserContext)
  if (!context) {
    throw new Error("useAuthUser must be used within AuthUserProvider")
  }
  return context
}

async function fetchAuthUser(supabase: any): Promise<AuthUser | null> {
  const {
    data: { user: authUser },
  } = await supabase.auth.getUser()

  if (!authUser) return null

  const { data: profile } = await supabase.from("profiles").select("*").eq("id", authUser.id).single()

  if (!profile) return null

  return {
    ...profile,
    email: authUser.email,
  }
}

export function AuthUserProvider({ children }: { children: ReactNode }) {
  const supabase = createBrowserSupabaseClient()
  const qc = useQueryClient()

  const queryKey = ["auth-user"]

  const { data: user, isLoading } = useQuery({
    queryKey,
    queryFn: () => fetchAuthUser(supabase),
    staleTime: 1000 * 60 * 5, // 5 minutes stale time
    refetchOnWindowFocus: false, // Disable auto-refetch on window focus
    retry: 1,
    gcTime: 1000 * 60 * 15, // Cache for 15 minutes
  })

  useEffect(() => {
    if (!user?.id) return

    const channel = supabase
      .channel(`profile-changes-${user.id}`, {
        config: {
          broadcast: { self: true },
        },
      })
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "profiles",
          filter: `id=eq.${user.id}`,
        },
        (payload: any) => {
          const updated = payload.new ?? payload.old
          if (updated) {
            qc.setQueryData(queryKey, (prev: any) => ({
              ...prev,
              ...updated,
              email: prev?.email,
            }))
          }
        },
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [user?.id, qc, supabase])

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        qc.invalidateQueries({ queryKey })
      }
    }

    document.addEventListener("visibilitychange", handleVisibilityChange)
    return () => document.removeEventListener("visibilitychange", handleVisibilityChange)
  }, [qc])

  const refresh = async () => {
    await qc.invalidateQueries({ queryKey })
  }

  return (
    <AuthUserContext.Provider value={{ user: user ?? null, isLoading, refresh }}>{children}</AuthUserContext.Provider>
  )
}
