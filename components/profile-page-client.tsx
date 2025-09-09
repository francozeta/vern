"use client"

import { useState } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { GradientAvatar } from "@/components/gradient-avatar"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Instagram,
  Verified,
  Music,
  Star,
  Globe,
  Play,
  Calendar,
  MapPin,
  MoreHorizontal,
  Link,
  Shield,
  Flag,
  Mic,
  Headphones,
  Share,
  ExternalLink,
} from "lucide-react"
import { FaSpotify } from "react-icons/fa"
import React from "react"
import { Users, TrendingUp } from "lucide-react" // Import missing icons

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
    <div className="min-h-screen bg-background">
      <div className="relative">
        <Skeleton className="h-80 w-full bg-muted" />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center space-y-4">
            <Skeleton className="w-32 h-32 rounded-full bg-muted mx-auto" />
            <Skeleton className="h-8 w-48 bg-muted mx-auto" />
            <Skeleton className="h-4 w-32 bg-muted mx-auto" />
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
  const [showLinksModal, setShowLinksModal] = useState(false)

  const isOwnProfile = currentUserId === profile.id
  const joinDate = new Date(profile.created_at).toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  })

  const displayName = profile.display_name || profile.username
  const showUsername = profile.display_name && profile.display_name !== profile.username

  const socialLinks = [
    profile.website_url && { url: profile.website_url, label: "Website", icon: Globe },
    profile.spotify_url && { url: profile.spotify_url, label: "Spotify", icon: FaSpotify },
    profile.instagram_url && { url: profile.instagram_url, label: "Instagram", icon: Instagram },
  ].filter(Boolean) as Array<{ url: string; label: string; icon: any }>

  const handleFollow = () => {
    setIsFollowing(!isFollowing)
  }

  const handleCopyProfileLink = () => {
    navigator.clipboard.writeText(window.location.href)
  }

  const handleBlock = () => {
    alert("Block user")
  }

  const handleReport = () => {
    alert("Report user")
  }

  const handleAccountSettings = () => {
    // Navigate to account settings
    window.location.href = "/settings"
  }

  const handlePrivacySettings = () => {
    // Navigate to privacy settings
    alert("Privacy settings")
  }

  const handleNotificationSettings = () => {
    // Navigate to notification settings
    alert("Notification settings")
  }

  const handleExportData = () => {
    // Export user data
    alert("Export data")
  }

  if (isLoading) {
    return <ProfileSkeleton />
  }

  const tabs = [
    { id: "reviews", label: "Reviews", icon: Star, count: initialReviews.length },
    { id: "overview", label: "Overview", icon: Users },
    { id: "music", label: "Music", icon: Music },
    { id: "activity", label: "Activity", icon: TrendingUp },
  ]

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="relative">
        {/* Cover Photo */}
        <div className="h-52 md:h-56 lg:h-64 relative overflow-hidden">
          {profile.banner_url ? (
            <img src={profile.banner_url || "/placeholder.svg"} alt="Cover" className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-zinc-800 via-zinc-900 to-black" />
          )}

          {/* Gradient overlay for better text readability */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
        </div>

        {/* Profile Header */}
        <div className="relative -mt-14 md:-mt-16 lg:-mt-20">
          <div className="max-w-7xl mx-auto px-5 md:px-6 lg:px-8">
            <div className="flex flex-col md:flex-row md:items-end gap-4 md:gap-5 lg:gap-6">
              {/* Profile Picture with subtle border */}
              <div className="relative">
                <div className="w-29 h-29 md:w-32 md:h-32 lg:w-36 lg:h-36 rounded-full overflow-hidden border border-zinc-700/50 bg-zinc-900 shadow-2xl">
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

              {/* Profile Info */}
              <div className="flex-1 md:pb-3 lg:pb-4">
                <div className="space-y-2 md:space-y-2.5 lg:space-y-3">
                  {/* Name and verification */}
                  <div className="flex items-center gap-2 md:gap-2.5 lg:gap-3 flex-wrap">
                    <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-white tracking-tight">
                      {displayName}
                    </h1>
                    {profile.is_verified && (
                      <div className="bg-blue-500 rounded-full p-1">
                        <Verified className="h-4 w-4 md:h-4 md:w-4 lg:h-5 lg:w-5 text-white fill-white" />
                      </div>
                    )}
                    {profile.role === "artist" && (
                      <div className="bg-white/10 backdrop-blur-sm rounded-full p-1.5 md:p-1.5 lg:p-2">
                        <Mic className="h-3 w-3 md:h-3.5 md:w-3.5 lg:h-4 lg:w-4 text-white" />
                      </div>
                    )}
                    {profile.role === "listener" && (
                      <div className="bg-white/10 backdrop-blur-sm rounded-full p-1.5 md:p-1.5 lg:p-2">
                        <Headphones className="h-3 w-3 md:h-3.5 md:w-3.5 lg:h-4 lg:w-4 text-white" />
                      </div>
                    )}
                  </div>

                  {/* Username */}
                  {showUsername && <p className="text-zinc-300 text-base md:text-lg lg:text-xl">@{profile.username}</p>}

                  {/* Stats */}
                  <div className="flex items-center gap-4 md:gap-5 lg:gap-6 text-sm md:text-sm lg:text-base">
                    <button className="hover:text-white transition-colors cursor-pointer">
                      <span className="text-white font-semibold">156</span>
                      <span className="text-zinc-400 ml-1">Following</span>
                    </button>
                    <button className="hover:text-white transition-colors cursor-pointer">
                      <span className="text-white font-semibold">89</span>
                      <span className="text-zinc-400 ml-1">Followers</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2 md:gap-2.5 lg:gap-3 md:pb-3 lg:pb-4">
                {isOwnProfile ? (
                  <>
                    <Button
                      asChild
                      className="bg-zinc-800/80 backdrop-blur-sm hover:bg-zinc-700 text-white border-0 rounded-full h-10 md:h-11 lg:h-12 font-medium px-6 md:px-7 lg:px-8 transition-all text-sm md:text-sm lg:text-base"
                    >
                      <a href="/settings">Edit Profile</a>
                    </Button>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button className="bg-zinc-800/80 backdrop-blur-sm hover:bg-zinc-700 text-white border-0 rounded-full h-10 md:h-11 lg:h-12 w-10 md:w-11 lg:w-12">
                          <MoreHorizontal className="h-4 w-4 md:h-4.5 md:w-4.5 lg:h-5 lg:w-5" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="bg-zinc-900 border-zinc-700 rounded-xl w-56">
                        <DropdownMenuItem
                          onClick={handleCopyProfileLink}
                          className="text-white hover:bg-zinc-800 cursor-pointer rounded-lg"
                        >
                          <Share className="h-4 w-4 mr-2" />
                          Share profile link
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={handleAccountSettings}
                          className="text-white hover:bg-zinc-800 cursor-pointer rounded-lg"
                        >
                          <Users className="h-4 w-4 mr-2" />
                          Account settings
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={handlePrivacySettings}
                          className="text-white hover:bg-zinc-800 cursor-pointer rounded-lg"
                        >
                          <Shield className="h-4 w-4 mr-2" />
                          Privacy settings
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={handleNotificationSettings}
                          className="text-white hover:bg-zinc-800 cursor-pointer rounded-lg"
                        >
                          <Star className="h-4 w-4 mr-2" />
                          Notifications
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={handleExportData}
                          className="text-white hover:bg-zinc-800 cursor-pointer rounded-lg"
                        >
                          <ExternalLink className="h-4 w-4 mr-2" />
                          Export data
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </>
                ) : (
                  <>
                    <Button
                      onClick={handleFollow}
                      className={`rounded-full h-10 md:h-11 lg:h-12 font-semibold border-0 px-6 md:px-7 lg:px-8 transition-all text-sm md:text-sm lg:text-base ${
                        isFollowing
                          ? "bg-zinc-800/80 backdrop-blur-sm hover:bg-zinc-700 text-white"
                          : "bg-white text-black hover:bg-zinc-100"
                      }`}
                    >
                      {isFollowing ? "Following" : "Follow"}
                    </Button>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button className="bg-zinc-800/80 backdrop-blur-sm hover:bg-zinc-700 text-white border-0 rounded-full h-10 md:h-11 lg:h-12 w-10 md:w-11 lg:w-12">
                          <MoreHorizontal className="h-4 w-4 md:h-4.5 md:w-4.5 lg:h-5 lg:w-5" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="bg-zinc-900 border-zinc-700 rounded-xl w-56">
                        <DropdownMenuItem
                          onClick={handleCopyProfileLink}
                          className="text-white hover:bg-zinc-800 cursor-pointer rounded-lg"
                        >
                          <Link className="h-4 w-4 mr-2" />
                          Copy profile link
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={handleBlock}
                          className="text-white hover:bg-zinc-800 cursor-pointer rounded-lg"
                        >
                          <Shield className="h-4 w-4 mr-2" />
                          Block
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={handleReport}
                          className="text-white hover:bg-zinc-800 cursor-pointer rounded-lg"
                        >
                          <Flag className="h-4 w-4 mr-2" />
                          Report account
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Content Section */}
        <div className="max-w-7xl mx-auto px-5 md:px-6 lg:px-8 py-6 md:py-7 lg:py-8">
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-6 md:gap-7 lg:gap-8">
            {/* Main Content */}
            <div className="min-w-0 w-full">
              {/* Bio and Details */}
              {(profile.bio || profile.location || socialLinks.length > 0) && (
                <div className="space-y-3 md:space-y-3.5 lg:space-y-4 mb-6 md:mb-7 lg:mb-8 p-4 md:p-5 lg:p-6 bg-zinc-900/50 backdrop-blur-sm rounded-xl md:rounded-xl lg:rounded-2xl border border-zinc-800/50">
                  {profile.bio && (
                    <p className="text-white text-sm md:text-sm lg:text-base leading-relaxed">{profile.bio}</p>
                  )}

                  <div className="flex flex-wrap items-center gap-3 md:gap-4 text-zinc-400 text-xs md:text-sm">
                    {profile.location && (
                      <div className="flex items-center gap-1">
                        <MapPin className="h-3 w-3 md:h-4 md:w-4" />
                        <span>{profile.location}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3 w-3 md:h-4 md:w-4" />
                      <span>Joined {joinDate}</span>
                    </div>
                  </div>

                  {socialLinks.length > 0 && (
                    <div>
                      {socialLinks.length === 1 ? (
                        <a
                          href={socialLinks[0].url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-400 hover:text-blue-300 transition-colors text-xs md:text-sm lg:text-sm hover:underline"
                        >
                          {socialLinks[0].url.replace(/^https?:\/\//, "")}
                        </a>
                      ) : (
                        <Dialog open={showLinksModal} onOpenChange={setShowLinksModal}>
                          <DialogTrigger asChild>
                            <button className="text-blue-400 hover:text-blue-300 transition-colors text-xs md:text-sm lg:text-sm hover:underline">
                              {socialLinks[0].url.replace(/^https?:\/\//, "")} and {socialLinks.length - 1} more
                            </button>
                          </DialogTrigger>
                          <DialogContent className="bg-zinc-900 border-zinc-700 text-white max-w-md rounded-2xl">
                            <DialogHeader>
                              <DialogTitle className="text-white">Links</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-3">
                              {socialLinks.map((link, index) => {
                                const IconComponent = link.icon
                                return (
                                  <a
                                    key={index}
                                    href={link.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-3 p-3 rounded-xl hover:bg-zinc-800 transition-colors group"
                                  >
                                    <div className="w-8 h-8 bg-zinc-800 rounded-full flex items-center justify-center">
                                      <IconComponent className="h-4 w-4 text-zinc-400" />
                                    </div>
                                    <span className="text-blue-400 group-hover:text-blue-300 flex-1">
                                      {link.url.replace(/^https?:\/\//, "")}
                                    </span>
                                    <ExternalLink className="h-4 w-4 text-zinc-500" />
                                  </a>
                                )
                              })}
                            </div>
                          </DialogContent>
                        </Dialog>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* Navigation Tabs */}
              <Tabs defaultValue="reviews" className="w-full">
                <TabsList className="grid w-full grid-cols-4 bg-transparent border-b border-zinc-800/50 rounded-none h-auto p-0 mb-6 md:mb-7 lg:mb-8">
                  {tabs.map((tab) => {
                    const Icon = tab.icon
                    return (
                      <TabsTrigger
                        key={tab.id}
                        value={tab.id}
                        className="flex items-center justify-center lg:justify-start gap-2 px-3 md:px-5 lg:px-6 py-3 md:py-3.5 lg:py-4 text-xs md:text-sm lg:text-sm font-medium transition-all relative bg-transparent border-0 rounded-none data-[state=active]:bg-transparent data-[state=active]:text-white data-[state=active]:shadow-none text-zinc-500 hover:text-zinc-300 data-[state=active]:border-b-2 data-[state=active]:border-white"
                      >
                        <Icon className="h-3 w-3 md:h-3.5 md:w-3.5 lg:h-4 lg:w-4" />
                        <span className="hidden sm:inline">{tab.label}</span>
                        {tab.count && tab.count > 0 && (
                          <span className="hidden sm:inline text-xs bg-zinc-800 text-zinc-400 px-2 py-1 rounded-full">
                            {tab.count}
                          </span>
                        )}
                      </TabsTrigger>
                    )
                  })}
                </TabsList>

                <TabsContent value="reviews" className="mt-0">
                  {initialReviews.length > 0 ? (
                    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-7 gap-3 md:gap-3.5 lg:gap-4">
                      {initialReviews.slice(0, 28).map((review) => (
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
                                <Music className="h-6 w-6 md:h-8 md:w-8 text-zinc-600" />
                              </div>
                            )}

                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center">
                              <Play className="h-4 w-4 md:h-6 md:w-6 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                            </div>

                            <div className="absolute bottom-1 left-1">
                              <div className="flex items-center gap-0.5">
                                {[1, 2, 3, 4, 5].map((star) => (
                                  <Star
                                    key={star}
                                    className={`w-2 h-2 md:w-2.5 md:h-2.5 ${
                                      star <= review.rating ? "fill-yellow-400 text-yellow-400" : "text-zinc-600"
                                    }`}
                                  />
                                ))}
                              </div>
                            </div>
                          </div>

                          <div className="space-y-0.5">
                            <h3 className="text-xs md:text-sm font-medium text-white truncate leading-tight">
                              {review.song_title}
                            </h3>
                            <p className="text-xs text-zinc-400 truncate">{review.song_artist}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-16 md:py-20">
                      <div className="w-12 h-12 md:w-16 md:h-16 bg-zinc-900 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Music className="h-6 w-6 md:h-8 md:w-8 text-zinc-600" />
                      </div>
                      <h3 className="text-lg md:text-xl font-semibold text-white mb-2">No reviews yet</h3>
                      <p className="text-zinc-400 max-w-md mx-auto text-sm md:text-base">
                        {isOwnProfile
                          ? "Start reviewing music to share your thoughts with the community"
                          : `${profile.display_name || profile.username} hasn't written any reviews yet`}
                      </p>
                    </div>
                  )}
                </TabsContent>

                {tabs.slice(1).map((tab) => (
                  <TabsContent key={tab.id} value={tab.id} className="mt-0">
                    <div className="text-center py-16 md:py-20">
                      <div className="w-12 h-12 md:w-16 md:h-16 bg-zinc-900 rounded-full flex items-center justify-center mx-auto mb-4">
                        {React.createElement(tab.icon, {
                          className: "h-6 w-6 md:h-8 md:w-8 text-zinc-600",
                        })}
                      </div>
                      <h3 className="text-lg md:text-xl font-semibold text-white mb-2">Coming Soon</h3>
                      <p className="text-zinc-400 text-sm md:text-base">This section is under development</p>
                    </div>
                  </TabsContent>
                ))}
              </Tabs>
            </div>

            {/* Sidebar */}
            <div className="w-full lg:w-[300px] hidden lg:block">
              <div className="space-y-4 md:space-y-5 lg:space-y-6 sticky top-6">
                {/* Statistics Card */}
                <div className="w-full bg-zinc-900/50 backdrop-blur-sm border border-zinc-800/50 rounded-xl md:rounded-xl lg:rounded-2xl p-4 md:p-5 lg:p-6">
                  <h3 className="font-semibold text-white mb-3 md:mb-3.5 lg:mb-4 text-sm md:text-sm lg:text-base">
                    Statistics
                  </h3>
                  <div className="space-y-3 md:space-y-3.5 lg:space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-zinc-400 text-xs md:text-sm lg:text-sm">Reviews</span>
                      <span className="text-white font-semibold text-sm md:text-sm lg:text-base">
                        {initialReviews.length}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-zinc-400 text-xs md:text-sm lg:text-sm">This Year</span>
                      <span className="text-white font-semibold text-sm md:text-sm lg:text-base">12</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-zinc-400 text-xs md:text-sm lg:text-sm">Avg Rating</span>
                      <span className="text-white font-semibold text-sm md:text-sm lg:text-base">4.2</span>
                    </div>
                  </div>
                </div>

                {/* Suggested for You Section */}
                <div className="w-full bg-zinc-900/50 backdrop-blur-sm border border-zinc-800/50 rounded-xl md:rounded-xl lg:rounded-2xl p-4 md:p-5 lg:p-6">
                  <h3 className="font-semibold text-white mb-3 md:mb-3.5 lg:mb-4 text-sm md:text-sm lg:text-base">
                    Suggested for You
                  </h3>
                  <div className="space-y-3 md:space-y-3.5 lg:space-y-4">
                    {/* Suggested User 1 */}
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 md:w-9 md:h-9 lg:w-10 lg:h-10 rounded-full overflow-hidden bg-zinc-800 flex-shrink-0">
                        <GradientAvatar userId="user1" size="sm" className="w-full h-full" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-white text-xs md:text-sm font-medium truncate">Alex Rivera</p>
                        <p className="text-zinc-400 text-xs truncate">@alexmusic</p>
                      </div>
                      <Button className="bg-white text-black hover:bg-zinc-100 text-xs px-3 py-1 h-7 rounded-full font-medium">
                        Follow
                      </Button>
                    </div>

                    {/* Suggested User 2 */}
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 md:w-9 md:h-9 lg:w-10 lg:h-10 rounded-full overflow-hidden bg-zinc-800 flex-shrink-0">
                        <GradientAvatar userId="user2" size="sm" className="w-full h-full" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-white text-xs md:text-sm font-medium truncate">Maya Chen</p>
                        <p className="text-zinc-400 text-xs truncate">@mayabeats</p>
                      </div>
                      <Button className="bg-white text-black hover:bg-zinc-100 text-xs px-3 py-1 h-7 rounded-full font-medium">
                        Follow
                      </Button>
                    </div>

                    {/* Suggested User 3 */}
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 md:w-9 md:h-9 lg:w-10 lg:h-10 rounded-full overflow-hidden bg-zinc-800 flex-shrink-0">
                        <GradientAvatar userId="user3" size="sm" className="w-full h-full" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-white text-xs md:text-sm font-medium truncate">Jordan Smith</p>
                        <p className="text-zinc-400 text-xs truncate">@jordanvibes</p>
                      </div>
                      <Button className="bg-white text-black hover:bg-zinc-100 text-xs px-3 py-1 h-7 rounded-full font-medium">
                        Follow
                      </Button>
                    </div>

                    {/* View More Button */}
                    <Button className="w-full bg-zinc-800/80 hover:bg-zinc-700 text-white border-0 justify-center rounded-lg md:rounded-lg lg:rounded-xl text-xs md:text-sm lg:text-sm h-8 md:h-9 lg:h-10 mt-3">
                      <Users className="h-3 w-3 md:h-3.5 md:w-3.5 lg:h-4 lg:w-4 mr-2" />
                      Discover More
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
