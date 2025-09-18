"use client"

import type React from "react"
import { useEffect } from "react"
import { useState } from "react"
import { Search, X, Filter, Clock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import Image from "next/image"
import useSWR from "swr"
import { useDebounce } from "@/hooks/use-debounce"
import { searchDeezer, searchDeezerArtists, type DeezerTrack, type DeezerArtist } from "@/lib/deezer"

const MUSIC_CATEGORIES = [
  {
    id: "electronic",
    name: "Electronic",
    imageUrl:
      "https://jaoprbjzvcsizlrarknt.supabase.co/storage/v1/object/public/music-category-covers/aphex-twin-cover.png",
    genre: "electronic",
  },
  {
    id: "rock-alternativo",
    name: "Rock y alternativa",
    imageUrl: "https://jaoprbjzvcsizlrarknt.supabase.co/storage/v1/object/public/music-category-covers/whirr-cover.png",
    genre: "rock",
  },
  {
    id: "hip-hop",
    name: "Hip Hop",
    imageUrl:
      "https://jaoprbjzvcsizlrarknt.supabase.co/storage/v1/object/public/music-category-covers/devon-hendryx-cover.png",
    genre: "hip-hop",
  },
  {
    id: "pop",
    name: "Pop",
    imageUrl: "https://jaoprbjzvcsizlrarknt.supabase.co/storage/v1/object/public/music-category-covers/air-exp.png",
    genre: "pop",
  },
  {
    id: "indie",
    name: "Indie",
    imageUrl:
      "https://jaoprbjzvcsizlrarknt.supabase.co/storage/v1/object/public/music-category-covers/elliot-smith-cover.png",
    genre: "indie",
  },
  {
    id: "latinoamerica",
    name: "Latinoamérica",
    imageUrl:
      "https://jaoprbjzvcsizlrarknt.supabase.co/storage/v1/object/public/music-category-covers/sweet-trip-experimental.png",
    genre: "latin",
  },
  {
    id: "jazz",
    name: "Jazz",
    imageUrl:
      "https://jaoprbjzvcsizlrarknt.supabase.co/storage/v1/object/public/music-category-covers/massive-attack-cover.png",
    genre: "jazz",
  },
  {
    id: "reggaeton",
    name: "Reggaeton",
    imageUrl:
      "https://jaoprbjzvcsizlrarknt.supabase.co/storage/v1/object/public/music-category-covers/classics-cover.png",
    genre: "reggaeton",
  },
]

interface RecentSearch {
  id: string
  query: string
  type: "text" | "user" | "song" | "artist"
  timestamp: Date
  metadata?: {
    name: string
    image?: string
  }
}

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

const fetchUsers = async (query: string): Promise<UserProfile[]> => {
  if (!query.trim()) return []

  const supabase = createClient()
  const { data, error } = await supabase
    .from("profiles")
    .select("id, username, display_name, avatar_url, is_verified, bio, role")
    .or(`username.ilike.%${query}%,display_name.ilike.%${query}%`)
    .eq("onboarding_completed", true)
    .limit(10)

  if (error) throw error
  return data || []
}

const fetchDeezerContent = async (query: string): Promise<{ songs: DeezerTrack[]; artists: DeezerArtist[] }> => {
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

const detectSearchType = (
  query: string,
  searchResults: { users: UserProfile[]; songs: DeezerTrack[] },
): "text" | "user" | "song" | "artist" => {
  const trimmedQuery = query.trim().toLowerCase()

  // Check if it matches a user exactly
  if (
    searchResults.users.some(
      (user) => user.username.toLowerCase() === trimmedQuery || user.display_name?.toLowerCase() === trimmedQuery,
    )
  ) {
    return "user"
  }

  // Check if it matches a song exactly
  if (searchResults.songs.some((song) => song.title.toLowerCase() === trimmedQuery)) {
    return "song"
  }

  // Check if it matches an artist name
  if (searchResults.songs.some((song) => song.artist.name.toLowerCase() === trimmedQuery)) {
    return "artist"
  }

  // Default to text for generic searches
  return "text"
}

const generateGradientAvatar = (username: string, displayName?: string | null) => {
  const colors = [
    "from-blue-500 to-purple-600",
    "from-green-500 to-teal-600",
    "from-orange-500 to-red-600",
    "from-pink-500 to-rose-600",
    "from-indigo-500 to-blue-600",
    "from-yellow-500 to-orange-600",
  ]

  // Use username for consistent hashing across the app
  const hash = username.split("").reduce((a, b) => {
    a = (a << 5) - a + b.charCodeAt(0)
    return a & a
  }, 0)

  const colorIndex = Math.abs(hash) % colors.length

  return (
    <div
      className={`w-full h-full bg-gradient-to-br ${colors[colorIndex]} flex items-center justify-center text-white font-semibold text-sm`}
    />
  )
}

export default function SearchPage() {
  const [query, setQuery] = useState("")
  const [recentSearches, setRecentSearches] = useState<RecentSearch[]>([])
  const [sortBy, setSortBy] = useState<"recent" | "popular">("recent")
  const router = useRouter()

  const debouncedQuery = useDebounce(query, 300)

  const { data: users = [], isLoading: isLoadingUsers } = useSWR(
    debouncedQuery ? `users-${debouncedQuery}` : null,
    () => fetchUsers(debouncedQuery),
    { revalidateOnFocus: false, dedupingInterval: 30000 },
  )

  const { data: deezerContent = { songs: [], artists: [] }, isLoading: isLoadingDeezer } = useSWR(
    debouncedQuery ? `deezer-${debouncedQuery}` : null,
    () => fetchDeezerContent(debouncedQuery),
    { revalidateOnFocus: false, dedupingInterval: 30000 },
  )

  const isSearching = isLoadingUsers || isLoadingDeezer

  useEffect(() => {
    const saved = localStorage.getItem("vern-recent-searches")
    if (saved) {
      try {
        const parsed = JSON.parse(saved).map((item: any) => ({
          ...item,
          timestamp: new Date(item.timestamp),
        }))
        setRecentSearches(parsed)
      } catch (error) {
        console.error("Error loading recent searches:", error)
      }
    }
  }, [])

  const handleSearch = (searchQuery: string, type?: "text" | "user" | "song" | "artist", metadata?: any) => {
    if (!searchQuery || !searchQuery.trim()) return

    const searchType = type || detectSearchType(searchQuery, { users, songs: deezerContent.songs })

    const newSearch: RecentSearch = {
      id: Date.now().toString(),
      query: searchQuery.trim(),
      type: searchType,
      timestamp: new Date(),
      metadata,
    }

    const updatedSearches = [newSearch, ...recentSearches.filter((s) => s.query !== searchQuery.trim())].slice(0, 10)
    setRecentSearches(updatedSearches)
    localStorage.setItem("vern-recent-searches", JSON.stringify(updatedSearches))
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch(query)
    }
  }

  const clearRecentSearches = () => {
    setRecentSearches([])
    localStorage.removeItem("vern-recent-searches")
  }

  const removeRecentSearch = (id: string) => {
    const updated = recentSearches.filter((s) => s.id !== id)
    setRecentSearches(updated)
    localStorage.setItem("vern-recent-searches", JSON.stringify(updated))
  }

  const handleCategoryClick = (category: (typeof MUSIC_CATEGORIES)[0]) => {
    router.push(`/search?genre=${category.genre}&q=${encodeURIComponent(category.name)}`)
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 xl:px-16 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Discover Music</h1>
          <p className="text-muted-foreground">Search for songs, artists, and connect with the community</p>
        </div>

        <div className="mb-8">
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Search reviews, songs, or artists..."
                className="pl-10 bg-card border-border"
                autoFocus
              />
            </div>
            <Select value={sortBy} onValueChange={(value: "recent" | "popular") => setSortBy(value)}>
              <SelectTrigger className="w-full sm:w-48 bg-card border-border">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="recent">Most Recent</SelectItem>
                <SelectItem value="popular">Most Popular</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" size="icon" className="bg-card border-border">
              <Filter className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {recentSearches.length > 0 && !query && (
          <div className="mb-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-foreground">Recent Searches</h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={clearRecentSearches}
                className="text-destructive hover:text-destructive hover:bg-destructive/10 text-sm font-medium"
              >
                Clear All
              </Button>
            </div>

            <div className="space-y-3">
              {recentSearches.map((search) => (
                <div
                  key={search.id}
                  className="flex items-center justify-between p-4 rounded-lg bg-card hover:bg-muted/50 cursor-pointer group transition-colors border border-border"
                  onClick={() => {
                    if (search.query) {
                      setQuery(search.query)
                      handleSearch(search.query, search.type, search.metadata)
                    }
                  }}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-lg overflow-hidden bg-muted flex items-center justify-center">
                      {search.type === "text" ? (
                        <Clock className="h-6 w-6 text-muted-foreground" />
                      ) : search.metadata?.image ? (
                        <Image
                          src={search.metadata.image || "/placeholder.svg"}
                          alt={search.metadata?.name || search.query}
                          width={48}
                          height={48}
                          className="w-full h-full object-cover"
                        />
                      ) : search.type === "user" ? (
                        generateGradientAvatar(search.query, search.metadata?.name)
                      ) : (
                        <div className="w-full h-full bg-muted flex items-center justify-center">
                          <Search className="h-6 w-6 text-muted-foreground" />
                        </div>
                      )}
                    </div>
                    <div>
                      <span className="text-foreground font-medium">{search.metadata?.name || search.query}</span>
                      <p className="text-sm text-muted-foreground capitalize">
                        {search.type === "text" ? "Search" : search.type}
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation()
                      removeRecentSearch(search.id)
                    }}
                    className="opacity-0 group-hover:opacity-100 transition-opacity p-2 hover:bg-muted rounded-lg"
                  >
                    <X className="h-4 w-4 text-muted-foreground" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}

        {!query && (
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-foreground mb-6">Browse by Genre</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 lg:gap-6">
              {MUSIC_CATEGORIES.map((category) => (
                <div
                  key={category.id}
                  onClick={() => handleCategoryClick(category)}
                  className="relative aspect-square rounded-xl cursor-pointer overflow-hidden bg-card"
                >
                  <Image
                    src={category.imageUrl || "/placeholder.svg?height=300&width=300&query=music genre cover"}
                    alt={category.name}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-4">
                    <h3 className="text-white font-bold text-lg leading-tight drop-shadow-lg">{category.name}</h3>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {query && (
          <div className="mb-8">
            {isSearching ? (
              <div className="text-center py-16">
                <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                  <Search className="h-8 w-8 text-muted-foreground animate-pulse" />
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-2">Searching...</h3>
                <p className="text-muted-foreground">Finding the best results for you</p>
              </div>
            ) : (
              <div className="space-y-6">
                {users.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold text-foreground mb-4">Users</h3>
                    <div className="space-y-3">
                      {users.slice(0, 3).map((user) => (
                        <div
                          key={user.id}
                          className="flex items-center justify-between p-4 rounded-lg bg-card hover:bg-muted/50 cursor-pointer transition-colors border border-border"
                          onClick={() => {
                            if (user.username) {
                              handleSearch(user.username, "user", {
                                name: user.display_name || user.username,
                                image: user.avatar_url,
                              })
                              router.push(`/user/${user.username}`)
                            }
                          }}
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-full overflow-hidden bg-muted">
                              {user.avatar_url ? (
                                <Image
                                  src={user.avatar_url || "/placeholder.svg"}
                                  alt={`${user.display_name || user.username} profile picture`}
                                  width={48}
                                  height={48}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                generateGradientAvatar(user.username, user.display_name)
                              )}
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-semibold text-foreground">
                                  {user.display_name || user.username}
                                </span>
                                {user.role === "artist" && (
                                  <span className="px-2 py-0.5 text-xs bg-muted text-muted-foreground rounded-full">
                                    Artist
                                  </span>
                                )}
                              </div>
                              <p className="text-sm text-muted-foreground">@{user.username}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {deezerContent.artists.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold text-foreground mb-4">Artists</h3>
                    <div className="space-y-3">
                      {deezerContent.artists.slice(0, 3).map((artist) => (
                        <div
                          key={artist.id}
                          className="flex items-center gap-3 p-4 rounded-lg bg-card hover:bg-muted/50 cursor-pointer transition-colors border border-border"
                          onClick={() => {
                            if (artist.name) {
                              handleSearch(artist.name, "artist", {
                                name: artist.name,
                                image: artist.picture_medium,
                              })
                              router.push(`/artist/${artist.id}`)
                            }
                          }}
                        >
                          <div className="w-12 h-12 rounded-full overflow-hidden bg-muted">
                            <Image
                              src={artist.picture_medium || "/placeholder.svg?height=48&width=48"}
                              alt={`${artist.name} artist photo`}
                              width={48}
                              height={48}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <span className="font-semibold text-foreground truncate block">{artist.name}</span>
                            <p className="text-sm text-muted-foreground">
                              Artist • {artist.nb_fan?.toLocaleString() || 0} fans
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {deezerContent.songs.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold text-foreground mb-4">Songs</h3>
                    <div className="space-y-3">
                      {deezerContent.songs.slice(0, 3).map((song) => (
                        <div
                          key={song.id}
                          className="flex items-center gap-3 p-4 rounded-lg bg-card hover:bg-muted/50 cursor-pointer transition-colors border border-border"
                          onClick={() => {
                            if (song.title) {
                              handleSearch(song.title, "song", {
                                name: `${song.title} - ${song.artist.name}`,
                                image: song.album.cover_medium,
                              })
                              router.push(`/song/${song.id}`)
                            }
                          }}
                        >
                          <div className="w-12 h-12 rounded-lg overflow-hidden bg-muted">
                            <Image
                              src={song.album.cover_medium || "/placeholder.svg?height=48&width=48"}
                              alt={`${song.title} by ${song.artist.name} album cover`}
                              width={48}
                              height={48}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <span className="font-semibold text-foreground truncate block">{song.title}</span>
                            <p className="text-sm text-muted-foreground truncate">{song.artist.name}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {users.length === 0 && deezerContent.songs.length === 0 && deezerContent.artists.length === 0 && (
                  <div className="text-center py-16">
                    <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                      <Search className="h-8 w-8 text-muted-foreground" />
                    </div>
                    <h3 className="text-xl font-semibold text-foreground mb-2">No results found</h3>
                    <p className="text-muted-foreground max-w-md mx-auto">
                      We couldn't find anything for "{query}". Try searching with different keywords.
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
