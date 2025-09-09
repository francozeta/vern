"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Search, Clock, X, TrendingUp, Hash, User, CheckCircle, Music, Play, Disc } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import Image from "next/image"
import { searchDeezer, formatDuration, type DeezerTrack } from "@/lib/deezer"

interface RecentSearch {
  id: string
  query: string
  timestamp: Date
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
  artists: { id: number; name: string; picture_medium: string; nb_fan: number }[]
}

export default function SearchPage() {
  const [query, setQuery] = useState("")
  const [recentSearches, setRecentSearches] = useState<RecentSearch[]>([])
  const [suggestedUsers, setSuggestedUsers] = useState<UserProfile[]>([])
  const [searchResults, setSearchResults] = useState<SearchResults>({
    users: [],
    songs: [],
    artists: [],
  })
  const [isSearching, setIsSearching] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<"all" | "users" | "songs" | "artists">("all")
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    const loadData = async () => {
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

      try {
        const { data: users, error } = await supabase
          .from("profiles")
          .select("id, username, display_name, avatar_url, is_verified, bio, role")
          .eq("onboarding_completed", true)
          .order("created_at", { ascending: false })
          .limit(5)

        if (error) {
          console.error("Error fetching suggested users:", error)
        } else {
          setSuggestedUsers(users || [])
        }
      } catch (error) {
        console.error("Error fetching suggested users:", error)
      }

      setIsLoading(false)
    }

    loadData()
  }, [supabase])

  useEffect(() => {
    const searchContent = async () => {
      if (!query.trim()) {
        setSearchResults({ users: [], songs: [], artists: [] })
        return
      }

      setIsSearching(true)

      try {
        const [usersResult, deezerResult] = await Promise.all([
          supabase
            .from("profiles")
            .select("id, username, display_name, avatar_url, is_verified, bio, role")
            .or(`username.ilike.%${query}%,display_name.ilike.%${query}%`)
            .eq("onboarding_completed", true)
            .limit(10),
          searchDeezer(query, 20),
        ])

        const users = usersResult.error ? [] : usersResult.data || []
        const deezerData = deezerResult?.data || []

        const artistsMap = new Map()
        deezerData.forEach((track) => {
          if (!artistsMap.has(track.artist.id)) {
            artistsMap.set(track.artist.id, {
              id: track.artist.id,
              name: track.artist.name,
              picture_medium: track.artist.picture_medium,
              nb_fan: 0,
            })
          }
        })

        setSearchResults({
          users,
          songs: deezerData.slice(0, 10),
          artists: Array.from(artistsMap.values()).slice(0, 8),
        })
      } catch (error) {
        console.error("Error searching content:", error)
        setSearchResults({ users: [], songs: [], artists: [] })
      }

      setIsSearching(false)
    }

    const debounceTimer = setTimeout(searchContent, 300)
    return () => clearTimeout(debounceTimer)
  }, [query, supabase])

  const handleSearch = (searchQuery: string) => {
    if (!searchQuery.trim()) return

    const newSearch: RecentSearch = {
      id: Date.now().toString(),
      query: searchQuery.trim(),
      timestamp: new Date(),
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

  const UserCard = ({ user, showFollowButton = true }: { user: UserProfile; showFollowButton?: boolean }) => (
    <div
      className="flex items-center justify-between p-4 rounded-lg hover:bg-zinc-900 cursor-pointer transition-colors"
      onClick={() => router.push(`/user/${user.username}`)}
    >
      <div className="flex items-center gap-3">
        <div className="relative">
          {user.avatar_url ? (
            <div className="w-10 h-10 rounded-full overflow-hidden bg-zinc-700">
              <Image
                src={user.avatar_url || "/placeholder.svg"}
                alt={user.display_name || user.username}
                width={40}
                height={40}
                className="w-full h-full object-cover"
              />
            </div>
          ) : (
            <div className="w-10 h-10 bg-zinc-700 rounded-full flex items-center justify-center">
              <User className="h-5 w-5 text-zinc-400" />
            </div>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-white truncate">{user.display_name || user.username}</span>
            {user.is_verified && <CheckCircle className="h-4 w-4 text-blue-500 flex-shrink-0" />}
            {user.role === "artist" && (
              <span className="px-2 py-0.5 text-xs bg-zinc-800 text-zinc-300 rounded-full flex-shrink-0">Artist</span>
            )}
          </div>
          <p className="text-sm text-zinc-400 truncate">@{user.username}</p>
          {user.bio && <p className="text-sm text-zinc-500 truncate mt-1">{user.bio}</p>}
        </div>
      </div>
      {showFollowButton && (
        <Button
          size="sm"
          className="bg-white text-black hover:bg-gray-100 border border-white font-medium px-4 py-1.5 rounded-full transition-colors"
          onClick={(e) => {
            e.stopPropagation()
            console.log("Follow user:", user.username)
          }}
        >
          Follow
        </Button>
      )}
    </div>
  )

  const SongCard = ({ song }: { song: DeezerTrack }) => (
    <div
      className="flex items-center justify-between p-4 rounded-lg hover:bg-zinc-900 cursor-pointer transition-colors group"
      onClick={() => router.push(`/song/${song.id}`)}
    >
      <div className="flex items-center gap-3">
        <div className="relative w-12 h-12 rounded-lg overflow-hidden bg-zinc-700 flex-shrink-0">
          <Image
            src={song.album.cover_medium || "/placeholder.svg"}
            alt={`${song.title} cover`}
            width={48}
            height={48}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform"
          />
          <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
            <Play className="h-4 w-4 text-white" />
          </div>
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-white truncate">{song.title}</span>
            <Music className="h-3 w-3 text-zinc-500 flex-shrink-0" />
          </div>
          <p className="text-sm text-zinc-400 truncate">{song.artist.name}</p>
          <p className="text-xs text-zinc-500 truncate">{song.album.title}</p>
        </div>
        <div className="text-xs text-zinc-500 flex items-center gap-1">
          <Clock className="h-3 w-3" />
          {formatDuration(song.duration)}
        </div>
      </div>
    </div>
  )

  const ArtistCard = ({ artist }: { artist: { id: number; name: string; picture_medium: string; nb_fan: number } }) => (
    <div
      className="flex items-center justify-between p-4 rounded-lg hover:bg-zinc-900 cursor-pointer transition-colors"
      onClick={() => router.push(`/artist/${artist.id}`)}
    >
      <div className="flex items-center gap-3">
        <div className="relative">
          <div className="w-12 h-12 rounded-full overflow-hidden bg-zinc-700">
            <Image
              src={artist.picture_medium || "/placeholder.svg"}
              alt={artist.name}
              width={48}
              height={48}
              className="w-full h-full object-cover"
            />
          </div>
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-white truncate">{artist.name}</span>
            <Disc className="h-3 w-3 text-zinc-500 flex-shrink-0" />
          </div>
          <p className="text-sm text-zinc-400">Artist</p>
        </div>
      </div>
    </div>
  )

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black text-white">
        <div className="w-full px-4 py-8">
          <div className="animate-pulse">
            <div className="h-12 bg-zinc-800 rounded-xl mb-8"></div>
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="flex items-center gap-3 p-4">
                  <div className="w-10 h-10 bg-zinc-800 rounded-full"></div>
                  <div className="flex-1">
                    <div className="h-4 bg-zinc-800 rounded w-1/3 mb-2"></div>
                    <div className="h-3 bg-zinc-800 rounded w-1/4"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="w-full px-4 py-6 md:py-8">
        <div className="max-w-lg mx-auto md:max-w-2xl">
          <div className="relative mb-8">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-zinc-400" />
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Search users, songs, artists..."
                className="w-full h-12 pl-12 pr-4 bg-zinc-900 border-zinc-700 rounded-xl text-white placeholder:text-zinc-400 focus:border-zinc-500 focus:ring-1 focus:ring-zinc-500"
                autoFocus
              />
            </div>
          </div>

          {query && (
            <div className="mb-8">
              <div className="flex items-center gap-1 mb-6 p-1 bg-zinc-900 rounded-lg">
                {[
                  {
                    key: "all",
                    label: "All",
                    count: searchResults.users.length + searchResults.songs.length + searchResults.artists.length,
                  },
                  { key: "users", label: "Users", count: searchResults.users.length },
                  { key: "songs", label: "Songs", count: searchResults.songs.length },
                  { key: "artists", label: "Artists", count: searchResults.artists.length },
                ].map((tab) => (
                  <button
                    key={tab.key}
                    onClick={() => setActiveTab(tab.key as any)}
                    className={`flex-1 px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                      activeTab === tab.key ? "bg-white text-black" : "text-zinc-400 hover:text-white hover:bg-zinc-800"
                    }`}
                  >
                    {tab.label} {tab.count > 0 && `(${tab.count})`}
                  </button>
                ))}
              </div>

              {isSearching ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white mx-auto mb-2"></div>
                  <p className="text-zinc-400 text-sm">Searching...</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {(activeTab === "all" || activeTab === "users") && searchResults.users.length > 0 && (
                    <div>
                      <h3 className="text-lg font-semibold text-white mb-3">Users</h3>
                      <div className="space-y-2">
                        {searchResults.users.slice(0, activeTab === "users" ? 10 : 3).map((user) => (
                          <UserCard key={user.id} user={user} />
                        ))}
                      </div>
                    </div>
                  )}

                  {(activeTab === "all" || activeTab === "songs") && searchResults.songs.length > 0 && (
                    <div>
                      <h3 className="text-lg font-semibold text-white mb-3">Songs</h3>
                      <div className="space-y-2">
                        {searchResults.songs.slice(0, activeTab === "songs" ? 10 : 3).map((song) => (
                          <SongCard key={song.id} song={song} />
                        ))}
                      </div>
                    </div>
                  )}

                  {(activeTab === "all" || activeTab === "artists") && searchResults.artists.length > 0 && (
                    <div>
                      <h3 className="text-lg font-semibold text-white mb-3">Artists</h3>
                      <div className="space-y-2">
                        {searchResults.artists.slice(0, activeTab === "artists" ? 8 : 3).map((artist) => (
                          <ArtistCard key={artist.id} artist={artist} />
                        ))}
                      </div>
                    </div>
                  )}

                  {searchResults.users.length === 0 &&
                    searchResults.songs.length === 0 &&
                    searchResults.artists.length === 0 && (
                      <p className="text-zinc-400 text-center py-8">No results found for "{query}"</p>
                    )}
                </div>
              )}
            </div>
          )}

          {recentSearches.length > 0 && !query && (
            <div className="mb-8">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-white">Recent Searches</h2>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearRecentSearches}
                  className="text-zinc-400 hover:text-white hover:bg-zinc-800 p-1"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>

              <div className="space-y-2">
                {recentSearches.map((search) => (
                  <div
                    key={search.id}
                    className="flex items-center justify-between p-3 rounded-lg hover:bg-zinc-900 cursor-pointer group transition-colors"
                    onClick={() => {
                      setQuery(search.query)
                      handleSearch(search.query)
                    }}
                  >
                    <div className="flex items-center gap-3">
                      <Clock className="h-4 w-4 text-zinc-500" />
                      <span className="text-white">{search.query}</span>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation()
                        removeRecentSearch(search.id)
                      }}
                      className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-zinc-800"
                    >
                      <X className="h-3 w-3 text-zinc-500" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {!query && suggestedUsers.length > 0 && (
            <div className="mb-8">
              <h2 className="text-lg font-semibold text-white mb-4">Suggested Users</h2>
              <div className="space-y-2">
                {suggestedUsers.map((user) => (
                  <UserCard key={user.id} user={user} />
                ))}
              </div>
            </div>
          )}

          {!query && (
            <div>
              <div className="flex items-center gap-2 mb-4">
                <TrendingUp className="h-5 w-5 text-zinc-400" />
                <h2 className="text-lg font-semibold text-white">Trending in Music</h2>
              </div>

              <div className="space-y-2">
                {[
                  { tag: "indie rock", posts: "2.4k reviews" },
                  { tag: "bedroom pop", posts: "1.8k reviews" },
                  { tag: "lo-fi hip hop", posts: "3.2k reviews" },
                  { tag: "synthwave", posts: "1.1k reviews" },
                  { tag: "jazz fusion", posts: "892 reviews" },
                ].map((trend) => (
                  <div
                    key={trend.tag}
                    className="flex items-center justify-between p-3 rounded-lg hover:bg-zinc-900 cursor-pointer transition-colors"
                    onClick={() => {
                      setQuery(trend.tag)
                      handleSearch(trend.tag)
                    }}
                  >
                    <div className="flex items-center gap-3">
                      <Hash className="h-4 w-4 text-zinc-500" />
                      <div>
                        <span className="text-white font-medium">{trend.tag}</span>
                        <p className="text-xs text-zinc-500">{trend.posts}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
