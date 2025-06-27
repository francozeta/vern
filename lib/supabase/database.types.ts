export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export type Database = {
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
      genres: {
        Row: {
          id: string
          name: string
          slug: string
          description: string | null
          color: string
          created_at: string
        }
        Insert: {
          name: string
          slug: string
          description?: string | null
          color?: string
        }
        Update: {
          name?: string
          slug?: string
          description?: string | null
          color?: string
        }
      }
      songs: {
        Row: {
          id: string
          spotify_id: string | null
          spotify_data: Json | null
          title: string
          artist_name: string
          album_name: string | null
          genre_id: string | null
          cover_url: string | null
          preview_url: string | null
          duration_ms: number | null
          release_date: string | null
          uploader_id: string | null
          audio_url: string | null
          lyrics: string | null
          description: string | null
          is_published: boolean
          source: "spotify" | "native"
          play_count: number
          review_count: number
          average_rating: number | null
          created_at: string
          updated_at: string
        }
        Insert: {
          spotify_id?: string | null
          spotify_data?: Json | null
          title: string
          artist_name: string
          album_name?: string | null
          genre_id?: string | null
          cover_url?: string | null
          preview_url?: string | null
          duration_ms?: number | null
          release_date?: string | null
          uploader_id?: string | null
          audio_url?: string | null
          lyrics?: string | null
          description?: string | null
          is_published?: boolean
          source: "spotify" | "native"
        }
        Update: {
          title?: string
          artist_name?: string
          album_name?: string | null
          genre_id?: string | null
          cover_url?: string | null
          preview_url?: string | null
          duration_ms?: number | null
          release_date?: string | null
          lyrics?: string | null
          description?: string | null
          is_published?: boolean
          play_count?: number
          review_count?: number
          average_rating?: number | null
        }
      }
    }
  }
}

export type Profile = Database["public"]["Tables"]["profiles"]["Row"]
export type Song = Database["public"]["Tables"]["songs"]["Row"]
export type Genre = Database["public"]["Tables"]["genres"]["Row"]
