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
      reviews: {
        Row: {
          id: string
          user_id: string
          slug: string
          song_id: string
          song_title: string
          song_artist: string
          song_album: string
          song_cover_url: string | null
          song_duration: number | null
          song_preview_url: string | null
          song_deezer_url: string | null
          title: string
          content: string
          rating: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          slug?: string
          song_id: string
          song_title: string
          song_artist: string
          song_album: string
          song_cover_url?: string | null
          song_duration?: number | null
          song_preview_url?: string | null
          song_deezer_url?: string | null
          title: string
          content: string
          rating: number
        }
        Update: {
          title?: string
          content?: string
          rating?: number
          slug?: string
          updated_at?: string
        }
      }
      likes: {
        Row: {
          id: string
          user_id: string
          review_id: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          review_id: string
        }
        Update: {
          // No updates needed for likes
        }
      }
      review_comments: {
        Row: {
          id: string
          user_id: string
          review_id: string
          content: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          review_id: string
          content: string
        }
        Update: {
          content?: string
          updated_at?: string
        }
      }
    }
  }
}
