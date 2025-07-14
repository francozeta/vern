export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          username: string
          display_name: string | null
          bio: string | null
          avatar_url: string | null
          banner_url: string | null
          role: "listener" | "artist" | "both"
          profile_badges: string[]
          is_verified: boolean
          location: string | null
          website_url: string | null
          spotify_url: string | null
          instagram_url: string | null
          onboarding_completed: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          username: string
          display_name?: string | null
          bio?: string | null
          avatar_url?: string | null
          banner_url?: string | null
          role?: "listener" | "artist" | "both"
          profile_badges?: string[]
          is_verified?: boolean
          location?: string | null
          website_url?: string | null
          spotify_url?: string | null
          instagram_url?: string | null
          onboarding_completed?: boolean
        }
        Update: {
          username?: string
          display_name?: string | null
          bio?: string | null
          avatar_url?: string | null
          banner_url?: string | null
          role?: "listener" | "artist" | "both"
          profile_badges?: string[]
          is_verified?: boolean
          location?: string | null
          website_url?: string | null
          spotify_url?: string | null
          instagram_url?: string | null
          onboarding_completed?: boolean
        }
      }
    }
  }
}
