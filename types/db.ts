export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      albums: {
        Row: {
          album_type: string | null
          artist_id: string | null
          created_at: string | null
          external_id: string | null
          id: string
          image_url: string | null
          name: string
          release_date: string | null
          source: string | null
          total_tracks: number | null
        }
        Insert: {
          album_type?: string | null
          artist_id?: string | null
          created_at?: string | null
          external_id?: string | null
          id?: string
          image_url?: string | null
          name: string
          release_date?: string | null
          source?: string | null
          total_tracks?: number | null
        }
        Update: {
          album_type?: string | null
          artist_id?: string | null
          created_at?: string | null
          external_id?: string | null
          id?: string
          image_url?: string | null
          name?: string
          release_date?: string | null
          source?: string | null
          total_tracks?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "albums_artist_id_fkey"
            columns: ["artist_id"]
            isOneToOne: false
            referencedRelation: "artists"
            referencedColumns: ["id"]
          },
        ]
      }
      artists: {
        Row: {
          bio: string | null
          created_at: string | null
          external_id: string | null
          followers_count: number | null
          genres: string[] | null
          id: string
          image_url: string | null
          name: string
          popularity: number | null
          provider: string | null
          updated_at: string | null
        }
        Insert: {
          bio?: string | null
          created_at?: string | null
          external_id?: string | null
          followers_count?: number | null
          genres?: string[] | null
          id?: string
          image_url?: string | null
          name: string
          popularity?: number | null
          provider?: string | null
          updated_at?: string | null
        }
        Update: {
          bio?: string | null
          created_at?: string | null
          external_id?: string | null
          followers_count?: number | null
          genres?: string[] | null
          id?: string
          image_url?: string | null
          name?: string
          popularity?: number | null
          provider?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      follows: {
        Row: {
          created_at: string | null
          follower_id: string
          following_id: string
          id: string
        }
        Insert: {
          created_at?: string | null
          follower_id: string
          following_id: string
          id?: string
        }
        Update: {
          created_at?: string | null
          follower_id?: string
          following_id?: string
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "follows_follower_id_fkey"
            columns: ["follower_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "follows_following_id_fkey"
            columns: ["following_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      genres: {
        Row: {
          color: string | null
          created_at: string | null
          description: string | null
          id: string
          name: string
          slug: string
        }
        Insert: {
          color?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          name: string
          slug: string
        }
        Update: {
          color?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          name?: string
          slug?: string
        }
        Relationships: []
      }
      likes: {
        Row: {
          created_at: string | null
          id: string
          review_id: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          review_id: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          review_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "likes_review_id_fkey"
            columns: ["review_id"]
            isOneToOne: false
            referencedRelation: "reviews"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "likes_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      listening_history: {
        Row: {
          completed: boolean | null
          created_at: string | null
          duration_played: number | null
          ended_at: string | null
          id: string
          song_id: string
          started_at: string
          user_id: string
        }
        Insert: {
          completed?: boolean | null
          created_at?: string | null
          duration_played?: number | null
          ended_at?: string | null
          id?: string
          song_id: string
          started_at?: string
          user_id: string
        }
        Update: {
          completed?: boolean | null
          created_at?: string | null
          duration_played?: number | null
          ended_at?: string | null
          id?: string
          song_id?: string
          started_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "listening_history_song_id_fkey"
            columns: ["song_id"]
            isOneToOne: false
            referencedRelation: "songs"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          actor_id: string
          created_at: string | null
          id: string
          message: string
          read: boolean | null
          target_id: string | null
          target_type: string | null
          type: string
          user_id: string
        }
        Insert: {
          actor_id: string
          created_at?: string | null
          id?: string
          message: string
          read?: boolean | null
          target_id?: string | null
          target_type?: string | null
          type: string
          user_id: string
        }
        Update: {
          actor_id?: string
          created_at?: string | null
          id?: string
          message?: string
          read?: boolean | null
          target_id?: string | null
          target_type?: string | null
          type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notifications_actor_id_fkey"
            columns: ["actor_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notifications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      play_sessions: {
        Row: {
          created_at: string | null
          ended_at: string | null
          id: string
          repeat_count: number | null
          seek_count: number | null
          skip_count: number | null
          song_id: string
          started_at: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          ended_at?: string | null
          id?: string
          repeat_count?: number | null
          seek_count?: number | null
          skip_count?: number | null
          song_id: string
          started_at?: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          ended_at?: string | null
          id?: string
          repeat_count?: number | null
          seek_count?: number | null
          skip_count?: number | null
          song_id?: string
          started_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "play_sessions_song_id_fkey"
            columns: ["song_id"]
            isOneToOne: false
            referencedRelation: "songs"
            referencedColumns: ["id"]
          },
        ]
      }
      playlist_songs: {
        Row: {
          added_at: string | null
          id: string
          playlist_id: string
          position: number
          song_id: string
        }
        Insert: {
          added_at?: string | null
          id?: string
          playlist_id: string
          position: number
          song_id: string
        }
        Update: {
          added_at?: string | null
          id?: string
          playlist_id?: string
          position?: number
          song_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "playlist_songs_playlist_id_fkey"
            columns: ["playlist_id"]
            isOneToOne: false
            referencedRelation: "playlists"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "playlist_songs_song_id_fkey"
            columns: ["song_id"]
            isOneToOne: false
            referencedRelation: "songs"
            referencedColumns: ["id"]
          },
        ]
      }
      playlists: {
        Row: {
          cover_url: string | null
          created_at: string | null
          description: string | null
          id: string
          is_public: boolean | null
          title: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          cover_url?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          is_public?: boolean | null
          title: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          cover_url?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          is_public?: boolean | null
          title?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "playlists_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          banner_url: string | null
          bio: string | null
          created_at: string | null
          display_name: string | null
          id: string
          instagram_url: string | null
          is_verified: boolean | null
          onboarding_completed: boolean | null
          onboarding_step: string | null
          profile_badges: string[] | null
          role: string | null
          spotify_url: string | null
          updated_at: string | null
          username: string
          website_url: string | null
        }
        Insert: {
          avatar_url?: string | null
          banner_url?: string | null
          bio?: string | null
          created_at?: string | null
          display_name?: string | null
          id?: string
          instagram_url?: string | null
          is_verified?: boolean | null
          onboarding_completed?: boolean | null
          onboarding_step?: string | null
          profile_badges?: string[] | null
          role?: string | null
          spotify_url?: string | null
          updated_at?: string | null
          username: string
          website_url?: string | null
        }
        Update: {
          avatar_url?: string | null
          banner_url?: string | null
          bio?: string | null
          created_at?: string | null
          display_name?: string | null
          id?: string
          instagram_url?: string | null
          is_verified?: boolean | null
          onboarding_completed?: boolean | null
          onboarding_step?: string | null
          profile_badges?: string[] | null
          role?: string | null
          spotify_url?: string | null
          updated_at?: string | null
          username?: string
          website_url?: string | null
        }
        Relationships: []
      }
      review_comments: {
        Row: {
          content: string
          created_at: string | null
          id: string
          review_id: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string | null
          id?: string
          review_id: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string | null
          id?: string
          review_id?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "review_comments_review_id_fkey"
            columns: ["review_id"]
            isOneToOne: false
            referencedRelation: "reviews"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "review_comments_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      reviews: {
        Row: {
          content: string
          created_at: string | null
          id: string
          rating: number | null
          slug: string | null
          song_id: string
          title: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string | null
          id?: string
          rating?: number | null
          slug?: string | null
          song_id: string
          title: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string | null
          id?: string
          rating?: number | null
          slug?: string | null
          song_id?: string
          title?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "reviews_song_id_fkey"
            columns: ["song_id"]
            isOneToOne: false
            referencedRelation: "songs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reviews_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      song_artists: {
        Row: {
          artist_id: string
          role: string | null
          song_id: string
        }
        Insert: {
          artist_id: string
          role?: string | null
          song_id: string
        }
        Update: {
          artist_id?: string
          role?: string | null
          song_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "song_artists_artist_id_fkey"
            columns: ["artist_id"]
            isOneToOne: false
            referencedRelation: "artists"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "song_artists_song_id_fkey"
            columns: ["song_id"]
            isOneToOne: false
            referencedRelation: "songs"
            referencedColumns: ["id"]
          },
        ]
      }
      songs: {
        Row: {
          album_id: string | null
          artist_id: string | null
          audio_url: string | null
          average_rating: number | null
          cover_url: string | null
          created_at: string | null
          description: string | null
          disc_number: number | null
          duration_ms: number | null
          external_id: string | null
          genre_id: string | null
          id: string
          is_published: boolean | null
          like_count: number | null
          lyrics: string | null
          play_count: number | null
          preview_url: string | null
          provider: string | null
          release_date: string | null
          review_count: number | null
          source: string | null
          title: string
          track_number: number | null
          updated_at: string | null
          uploader_id: string | null
        }
        Insert: {
          album_id?: string | null
          artist_id?: string | null
          audio_url?: string | null
          average_rating?: number | null
          cover_url?: string | null
          created_at?: string | null
          description?: string | null
          disc_number?: number | null
          duration_ms?: number | null
          external_id?: string | null
          genre_id?: string | null
          id?: string
          is_published?: boolean | null
          like_count?: number | null
          lyrics?: string | null
          play_count?: number | null
          preview_url?: string | null
          provider?: string | null
          release_date?: string | null
          review_count?: number | null
          source?: string | null
          title: string
          track_number?: number | null
          updated_at?: string | null
          uploader_id?: string | null
        }
        Update: {
          album_id?: string | null
          artist_id?: string | null
          audio_url?: string | null
          average_rating?: number | null
          cover_url?: string | null
          created_at?: string | null
          description?: string | null
          disc_number?: number | null
          duration_ms?: number | null
          external_id?: string | null
          genre_id?: string | null
          id?: string
          is_published?: boolean | null
          like_count?: number | null
          lyrics?: string | null
          play_count?: number | null
          preview_url?: string | null
          provider?: string | null
          release_date?: string | null
          review_count?: number | null
          source?: string | null
          title?: string
          track_number?: number | null
          updated_at?: string | null
          uploader_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "songs_album_id_fkey"
            columns: ["album_id"]
            isOneToOne: false
            referencedRelation: "albums"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "songs_artist_id_fkey"
            columns: ["artist_id"]
            isOneToOne: false
            referencedRelation: "artists"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "songs_genre_id_fkey"
            columns: ["genre_id"]
            isOneToOne: false
            referencedRelation: "genres"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "songs_uploader_id_fkey"
            columns: ["uploader_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_queues: {
        Row: {
          created_at: string | null
          id: string
          position: number
          song_id: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          position: number
          song_id: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          position?: number
          song_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_queues_song_id_fkey"
            columns: ["song_id"]
            isOneToOne: false
            referencedRelation: "songs"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      search_music: {
        Args: { limit_results?: number; search_term: string }
        Returns: {
          id: string
          image_url: string
          name: string
          relevance: number
          source: string
          type: string
        }[]
      }
      show_limit: { Args: never; Returns: number }
      show_trgm: { Args: { "": string }; Returns: string[] }
      simple_search_artists: {
        Args: { search_term: string }
        Returns: {
          bio: string | null
          created_at: string | null
          external_id: string | null
          followers_count: number | null
          genres: string[] | null
          id: string
          image_url: string | null
          name: string
          popularity: number | null
          provider: string | null
          updated_at: string | null
        }[]
        SetofOptions: {
          from: "*"
          to: "artists"
          isOneToOne: false
          isSetofReturn: true
        }
      }
      simple_search_songs: {
        Args: { search_term: string }
        Returns: {
          album_id: string | null
          artist_id: string | null
          audio_url: string | null
          average_rating: number | null
          cover_url: string | null
          created_at: string | null
          description: string | null
          disc_number: number | null
          duration_ms: number | null
          external_id: string | null
          genre_id: string | null
          id: string
          is_published: boolean | null
          like_count: number | null
          lyrics: string | null
          play_count: number | null
          preview_url: string | null
          provider: string | null
          release_date: string | null
          review_count: number | null
          source: string | null
          title: string
          track_number: number | null
          updated_at: string | null
          uploader_id: string | null
        }[]
        SetofOptions: {
          from: "*"
          to: "songs"
          isOneToOne: false
          isSetofReturn: true
        }
      }
      sync_spotify_artist: {
        Args: { p_spotify_data: Json; p_spotify_id: string }
        Returns: string
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
