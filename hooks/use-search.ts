import { useQuery } from "@tanstack/react-query"
import { createBrowserSupabaseClient } from "@/lib/supabase/client"
import { searchDeezer, searchDeezerArtists, type DeezerTrack, type DeezerArtist } from "@/lib/deezer"

interface UserProfile {
  id: string
  username: string
  display_name: string | null
  avatar_url: string | null
  is_verified: boolean
  bio: string | null
  role: "listener" | "artist" | "both"
}

interface SearchResults {
  users: UserProfile[]
  songs: DeezerTrack[]
  artists: DeezerArtist[]
}

async function fetchUsers(query: string): Promise<UserProfile[]> {
  if (!query.trim()) return []

  const supabase = createBrowserSupabaseClient()
  const { data, error } = await supabase
    .from("profiles")
    .select("id, username, display_name, avatar_url, is_verified, bio, role")
    .or(`username.ilike.%${query}%,display_name.ilike.%${query}%`)
    .eq("onboarding_completed", true)
    .limit(10)

  if (error) throw error
  return data || []
}

async function fetchDeezerContent(query: string): Promise<{ songs: DeezerTrack[]; artists: DeezerArtist[] }> {
  if (!query.trim()) return { songs: [], artists: [] }

  try {
    const [tracksResult, artistsResult] = await Promise.all([searchDeezer(query, 20), searchDeezerArtists(query, 10)])

    const tracksData = tracksResult?.data || []
    const artistsData = artistsResult?.data || []

    return {
      songs: tracksData.slice(0, 10),
      artists: artistsData.slice(0, 8),
    }
  } catch (error) {
    console.error("Error fetching Deezer content:", error)
    return { songs: [], artists: [] }
  }
}

export function useSearchUsers(query: string) {
  return useQuery({
    queryKey: ["search-users", query],
    queryFn: () => fetchUsers(query),
    enabled: query.trim().length > 0,
    staleTime: 1000 * 60 * 5,
  })
}

export function useSearchDeezer(query: string) {
  return useQuery({
    queryKey: ["search-deezer", query],
    queryFn: () => fetchDeezerContent(query),
    enabled: query.trim().length > 0,
    staleTime: 1000 * 60 * 5,
  })
}
