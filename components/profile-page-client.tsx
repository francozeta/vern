"use client"

import { useState } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { GradientAvatar } from "@/components/gradient-avatar"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import {
  Instagram,
  Verified,
  Music,
  Star,
  Globe,
  Play,
  Edit,
  Calendar,
  Heart,
  List,
  Activity,
  MapPin,
  MoreHorizontal,
  Link,
  Shield,
  Flag,
} from "lucide-react"
import { FaSpotify } from "react-icons/fa"
import React from "react"

interface ProfilePageClientProps {
  initialProfileData: {
    id: string
    username: string
    display_name: string | null
    bio: string | null
    avatar_url: string | null
    banner_url: string | null
    role: "listener" | "artist" | "both"
    is_verified: boolean
    location: string | null
    website_url: string | null
    spotify_url: string | null
    instagram_url: string | null
    created_at: string
  }
  currentUserId: string | null
  breadcrumbs?: {
    label: string
    href?: string
    isLink?: boolean
  }[]
  initialReviews: any[]
}

function ProfileSkeleton() {
  return (
    <div className="min-h-screen bg-black">
      <div className="relative">
        {/* Cover Photo Skeleton */}
        <Skeleton className="h-64 md:h-80 w-full bg-zinc-800" />

        <div className="max-w-6xl mx-auto px-4 md:px-6">
          <div className="relative -mt-20">
            {/* Profile Picture Skeleton */}
            <div className="absolute left-6 top-0">
              <Skeleton className="w-32 h-32 md:w-40 md:h-40 rounded-full bg-zinc-800" />
            </div>

            {/* Content Skeleton */}
            <div className="pt-20 md:pt-24 pl-40 md:pl-48">
              <div className="flex justify-between items-start mb-6">
                <div className="space-y-3">
                  <Skeleton className="h-8 w-48 bg-zinc-800" />
                  <Skeleton className="h-4 w-32 bg-zinc-800" />
                  <Skeleton className="h-4 w-64 bg-zinc-800" />
                </div>
                <Skeleton className="h-10 w-24 bg-zinc-800" />
              </div>

              {/* Stats Skeleton */}
              <div className="flex gap-8 mb-8">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="text-center">
                    <Skeleton className="h-6 w-16 mb-1 bg-zinc-800" />
                    <Skeleton className="h-4 w-20 bg-zinc-800" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export function ProfilePageClient({
  initialProfileData,
  currentUserId,
  breadcrumbs,
  initialReviews,
}: ProfilePageClientProps) {
  const [profile, setProfile] = useState(initialProfileData)
  const [isFollowing, setIsFollowing] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [activeTab, setActiveTab] = useState("reviews")

  const isOwnProfile = currentUserId === profile.id
  const joinDate = new Date(profile.created_at).toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  })

  const handleFollow = () => {
    setIsFollowing(!isFollowing)
    // TODO: Implement follow/unfollow API call
  }

  const handleCopyProfileLink = () => {
    navigator.clipboard.writeText(window.location.href)
    // TODO: Show toast notification
  }

  const handleBlock = () => {
    // TODO: Implement block functionality
    console.log("Block user")
  }

  const handleReport = () => {
    // TODO: Implement report functionality
    console.log("Report account")
  }

  if (isLoading) {
    return <ProfileSkeleton />
  }

  const tabs = [
    { id: "reviews", label: "Reviews", icon: Star, count: initialReviews.length },
    { id: "music", label: "Music", icon: Music, count: 0 },
    { id: "lists", label: "Lists", icon: List, count: 0 },
    { id: "activity", label: "Activity", icon: Activity, count: 0 },
    { id: "liked", label: "Liked", icon: Heart, count: 0 },
  ]

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="relative">
        <div className="h-52 relative overflow-hidden">
          {profile.banner_url ? (
            <img src={profile.banner_url || "/placeholder.svg"} alt="Cover" className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-zinc-700 via-zinc-800 to-zinc-900" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

          {isOwnProfile && (
            <Button
              size="sm"
              variant="ghost"
              className="absolute top-4 right-4 bg-black/60 hover:bg-black/80 border border-zinc-700 text-white"
              asChild
            >
              <a href="/settings">
                <Edit className="h-4 w-4" />
              </a>
            </Button>
          )}
        </div>

        <div className="max-w-4xl mx-auto px-4 md:px-6">
          <div className="relative -mt-16">
            {/* Profile Picture */}
            <div className="flex items-end gap-4 mb-6">
              <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-black bg-zinc-900 shadow-2xl">
                {profile.avatar_url ? (
                  <Avatar className="w-full h-full">
                    <AvatarImage
                      src={profile.avatar_url || "/placeholder.svg"}
                      alt={profile.display_name || profile.username}
                      className="object-cover"
                    />
                    <AvatarFallback>
                      <GradientAvatar userId={profile.id} size="lg" />
                    </AvatarFallback>
                  </Avatar>
                ) : (
                  <GradientAvatar userId={profile.id} size="lg" className="w-full h-full" />
                )}
              </div>
            </div>

            <div className="space-y-4 mb-6">
              <div className="flex items-center gap-3 flex-wrap">
                <div className="flex items-center gap-2">
                  <h1 className="text-2xl font-bold text-white">{profile.display_name || profile.username}</h1>
                  {profile.is_verified && (
                    <div className="bg-blue-500 rounded-full p-0.5">
                      <Verified className="h-4 w-4 text-white fill-white" />
                    </div>
                  )}
                  {profile.role === "artist" && (
                    <span className="bg-white text-black text-xs px-2 py-1 rounded-full font-medium">Artist</span>
                  )}
                </div>

                {!isOwnProfile && (
                  <div className="flex items-center gap-2">
                    <Button
                      onClick={handleFollow}
                      variant={isFollowing ? "outline" : "default"}
                      size="sm"
                      className={`rounded-full px-6 ${
                        isFollowing
                          ? "bg-transparent border-zinc-600 text-white hover:bg-red-600/10 hover:border-red-600 hover:text-red-500"
                          : "bg-white text-black hover:bg-zinc-200 font-medium"
                      }`}
                    >
                      {isFollowing ? "Following" : "Follow"}
                    </Button>

                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          className="rounded-full border-zinc-600 hover:bg-zinc-800 bg-transparent px-2"
                        >
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="bg-zinc-900 border-zinc-700">
                        <DropdownMenuItem
                          onClick={handleCopyProfileLink}
                          className="text-white hover:bg-zinc-800 cursor-pointer"
                        >
                          <Link className="h-4 w-4 mr-2" />
                          Copy profile link
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={handleBlock} className="text-white hover:bg-zinc-800 cursor-pointer">
                          <Shield className="h-4 w-4 mr-2" />
                          Block
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={handleReport}
                          className="text-white hover:bg-zinc-800 cursor-pointer"
                        >
                          <Flag className="h-4 w-4 mr-2" />
                          Report account
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                )}
              </div>

              {/* Username */}
              <p className="text-zinc-400 text-base">@{profile.username}</p>

              {/* Bio */}
              {profile.bio && <p className="text-white text-base leading-relaxed max-w-2xl">{profile.bio}</p>}

              {/* Location and join date */}
              <div className="flex flex-wrap items-center gap-4 text-zinc-400 text-sm">
                {profile.location && (
                  <div className="flex items-center gap-1">
                    <MapPin className="h-4 w-4" />
                    <span>{profile.location}</span>
                  </div>
                )}
                <div className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  <span>Joined {joinDate}</span>
                </div>
              </div>

              {/* Social links */}
              {(profile.website_url || profile.spotify_url || profile.instagram_url) && (
                <div className="flex flex-wrap items-center gap-4">
                  {profile.website_url && (
                    <a
                      href={profile.website_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 text-blue-400 hover:text-blue-300 transition-colors text-sm hover:underline"
                    >
                      <Globe className="h-4 w-4" />
                      <span>Website</span>
                    </a>
                  )}
                  {profile.spotify_url && (
                    <a
                      href={profile.spotify_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 text-green-400 hover:text-green-300 transition-colors text-sm hover:underline"
                    >
                      <FaSpotify className="h-4 w-4" />
                      <span>Spotify</span>
                    </a>
                  )}
                  {profile.instagram_url && (
                    <a
                      href={profile.instagram_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 text-pink-400 hover:text-pink-300 transition-colors text-sm hover:underline"
                    >
                      <Instagram className="h-4 w-4" />
                      <span>Instagram</span>
                    </a>
                  )}
                </div>
              )}

              <div className="flex items-center gap-6 text-sm">
                <button className="hover:underline transition-colors">
                  <span className="text-white font-bold">156</span>
                  <span className="text-zinc-400 ml-1">Following</span>
                </button>
                <button className="hover:underline transition-colors">
                  <span className="text-white font-bold">89</span>
                  <span className="text-zinc-400 ml-1">Followers</span>
                </button>
              </div>
            </div>
          </div>

          <div className="border-b border-zinc-800 sticky top-0 bg-black/95 backdrop-blur-sm z-10 mt-4">
            <nav className="flex overflow-x-auto scrollbar-hide">
              {tabs.map((tab) => {
                const Icon = tab.icon
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-2 px-6 py-4 text-sm font-medium transition-all relative whitespace-nowrap border-b-2 ${
                      activeTab === tab.id
                        ? "text-white border-white"
                        : "text-zinc-400 hover:text-zinc-200 border-transparent hover:border-zinc-700"
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    <span>{tab.label}</span>
                    {tab.count > 0 && (
                      <span className="text-xs bg-zinc-800 text-zinc-300 px-1.5 py-0.5 rounded-full">{tab.count}</span>
                    )}
                  </button>
                )
              })}
            </nav>
          </div>

          <div className="py-6">
            {activeTab === "reviews" && (
              <>
                {initialReviews.length > 0 ? (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                    {initialReviews.slice(0, 18).map((review) => (
                      <div key={review.id} className="group cursor-pointer">
                        <div className="aspect-square bg-zinc-900 rounded-lg overflow-hidden mb-2 relative">
                          {review.song_cover_url ? (
                            <img
                              src={review.song_cover_url || "/placeholder.svg"}
                              alt={review.song_title}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                            />
                          ) : (
                            <div className="w-full h-full bg-zinc-800 flex items-center justify-center">
                              <Music className="h-8 w-8 text-zinc-600" />
                            </div>
                          )}

                          {/* Hover overlay */}
                          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center">
                            <Play className="h-6 w-6 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                          </div>

                          {/* Rating */}
                          <div className="absolute bottom-1 left-1">
                            <div className="flex items-center gap-0.5">
                              {[1, 2, 3, 4, 5].map((star) => (
                                <Star
                                  key={star}
                                  className={`w-2.5 h-2.5 ${
                                    star <= review.rating ? "fill-yellow-400 text-yellow-400" : "text-zinc-600"
                                  }`}
                                />
                              ))}
                            </div>
                          </div>
                        </div>

                        <div className="space-y-0.5">
                          <h3 className="text-sm font-medium text-white truncate leading-tight">{review.song_title}</h3>
                          <p className="text-xs text-zinc-400 truncate">{review.song_artist}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-20">
                    <div className="w-16 h-16 bg-zinc-900 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Music className="h-8 w-8 text-zinc-600" />
                    </div>
                    <h3 className="text-xl font-semibold text-white mb-2">No reviews yet</h3>
                    <p className="text-zinc-400 max-w-md mx-auto">
                      {isOwnProfile
                        ? "Start reviewing music to share your thoughts with the community"
                        : `${profile.display_name || profile.username} hasn't written any reviews yet`}
                    </p>
                  </div>
                )}
              </>
            )}

            {activeTab !== "reviews" && (
              <div className="text-center py-20">
                <div className="w-16 h-16 bg-zinc-900 rounded-full flex items-center justify-center mx-auto mb-4">
                  {tabs.find((t) => t.id === activeTab)?.icon &&
                    React.createElement(tabs.find((t) => t.id === activeTab)!.icon, {
                      className: "h-8 w-8 text-zinc-600",
                    })}
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">Coming Soon</h3>
                <p className="text-zinc-400">This section is under development</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
