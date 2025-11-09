"use client"

import { createContext, useContext, type ReactNode } from "react"
import { useCachedAuthUser } from "@/hooks/use-cached-auth-user"

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

export function AuthUserProvider({ children }: { children: ReactNode }) {
  const { user, isLoading, refetch } = useCachedAuthUser()

  const refresh = async () => {
    await refetch()
  }

  return (
    <AuthUserContext.Provider value={{ user: user ?? null, isLoading, refresh }}>{children}</AuthUserContext.Provider>
  )
}
