"use client"

import { useState } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { GradientAvatar } from "@/components/user/gradient-avatar"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { FollowButton } from "@/components/user/follow-button"
import { SuggestedUsers } from "@/components/user/suggested-users"
import { ProfileReviewCard } from "@/components/user/profile-review-card"
import { FollowStats } from "@/components/user/follow-stats"
import { useProfileData } from "@/hooks/use-profile-data"
import Link from "next/link"
import Image from "next/image"
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
  LinkIcon,
  Shield,
  Flag,
  Mic,
  Headphones,
  Share,
  TrendingUp,
  Users,
  Grid3X3,
  List,
} from "lucide-react"
import { FaSpotify } from "react-icons/fa"
import React from "react"
import { ImageIcon } from "lucide-react"

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
  initialIsFollowing?: boolean
  followersCount?: number
  followingCount?: number
  followers?: any[]
  following?: any[]
}

function ProfileSkeleton() {
  return (
    <div className="min-h-screen bg-background">
      <div className="relative">
        <Skeleton className="h-64 w-full bg-muted" />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center space-y-4">
            <Skeleton className="w-32 h-32 rounded-full bg-card mx-auto" />
            <Skeleton className="h-8 w-48 bg-card mx-auto" />
            <Skeleton className="h-4 w-32 bg-card mx-auto" />
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
  initialIsFollowing = false,
  followersCount = 0,
  followingCount = 0,
  followers = [],
  following = [],
}: ProfilePageClientProps) {
  const { profile, stats, reviews, isLoading } = useProfileData(initialProfileData.username, {
    profile: initialProfileData,
    stats: {
      followersCount,
      followingCount,
      reviewsCount: initialReviews.length,
    },
    reviews: initialReviews,
  })

  const [showLinksModal, setShowLinksModal] = useState(false)
  const [reviewViewMode, setReviewViewMode] = useState<"grid" | "list">("grid")
  const [localFollowersCount, setLocalFollowersCount] = useState(followersCount)
  const [localIsFollowing, setLocalIsFollowing] = useState(initialIsFollowing)

  const handleFollowChange = (isFollowing: boolean) => {
    setLocalIsFollowing(isFollowing)
    setLocalFollowersCount((prev) => (isFollowing ? prev + 1 : prev - 1))
  }

  if (isLoading || !profile) {
    return <ProfileSkeleton />
  }

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
    window.location.href = "/settings"
  }

  const handlePrivacySettings = () => {
    alert("Privacy settings")
  }

  const handleNotificationSettings = () => {
    alert("Notification settings")
  }

  const handleExportData = () => {
    alert("Export data")
  }

  const tabs = [
    { id: "reviews", label: "Reviews", icon: Star, count: reviews.length },
    { id: "overview", label: "Overview", icon: Users },
    { id: "music", label: "Music", icon: Music },
    { id: "activity", label: "Activity", icon: TrendingUp },
  ]

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="relative">
        <div className="h-40 sm:h-48 md:h-64 lg:h-72 xl:h-80 relative overflow-hidden bg-gradient-to-b from-muted to-muted/50">
          {profile.banner_url ? (
            <div className="relative w-full h-full">
              <Image
                src={profile.banner_url || "/placeholder.svg"}
                alt="Profile banner"
                fill
                sizes="100vw"
                className="object-cover object-center"
                priority
              />
              <div className="absolute inset-0 bg-gradient-to-t from-background/85 via-background/50 sm:from-background/80 sm:via-background/40 lg:from-background/75 lg:via-background/35 to-transparent" />
            </div>
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-muted via-muted/80 to-background/50 flex items-center justify-center">
              <div className="text-center">
                <ImageIcon className="w-12 h-12 text-muted-foreground/30 mx-auto mb-2" />
                <p className="text-sm text-muted-foreground/40">No banner yet</p>
              </div>
            </div>
          )}
        </div>

        <div className="relative -mt-20 sm:-mt-24 md:-mt-32 lg:-mt-40 xl:-mt-44">
          <div className="max-w-6xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8">
            <div className="flex flex-col md:flex-row md:items-end gap-4 sm:gap-6">
              <div className="relative">
                <div className="w-28 sm:w-32 md:w-40 lg:w-44 h-28 sm:h-32 md:h-40 lg:h-44 rounded-full overflow-hidden border-4 border-background bg-card shadow-2xl">
                  {profile.avatar_url ? (
                    <Avatar className="w-full h-full">
                      <AvatarImage
                        src={profile.avatar_url || "/placeholder.svg"}
                        alt={displayName}
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

              <div className="flex-1 md:pb-4">
                <div className="space-y-2 sm:space-y-3">
                  <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
                    <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground tracking-tight">
                      {displayName}
                    </h1>
                    {profile.is_verified && (
                      <div className="bg-blue-500 rounded-full p-1">
                        <Verified className="h-4 sm:h-5 w-4 sm:w-5 text-white fill-white" />
                      </div>
                    )}
                    {profile.role === "artist" && (
                      <div className="bg-white/10 backdrop-blur-sm rounded-full p-2">
                        <Mic className="h-3 sm:h-4 w-3 sm:w-4 text-foreground" />
                      </div>
                    )}
                    {profile.role === "listener" && (
                      <div className="bg-white/10 backdrop-blur-sm rounded-full p-2">
                        <Headphones className="h-3 sm:h-4 w-3 sm:w-4 text-foreground" />
                      </div>
                    )}
                  </div>

                  {showUsername && <p className="text-muted-foreground text-base sm:text-lg">@{profile.username}</p>}

                  <div className="flex items-center gap-3 sm:gap-6 text-sm sm:text-base flex-wrap">
                    <FollowStats
                      userId={profile.id}
                      followersCount={localFollowersCount}
                      followingCount={stats?.followingCount || 0}
                      currentUserId={currentUserId}
                      followers={followers}
                      following={following}
                    />

                    <div className="flex items-center gap-1">
                      <span className="font-semibold text-foreground">{reviews.length}</span>
                      <span className="text-muted-foreground">reviews</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex gap-2 sm:gap-3 md:pb-4">
                {isOwnProfile ? (
                  <>
                    <Button
                      asChild
                      className="bg-background text-foreground hover:bg-muted font-medium px-4 sm:px-6 py-2 rounded-full transition-all text-sm sm:text-base"
                    >
                      <Link href="/settings">Edit Profile</Link>
                    </Button>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button className="bg-background hover:bg-muted text-foreground rounded-full w-10 h-10">
                          <MoreHorizontal className="h-4 sm:h-5 w-4 sm:w-5" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="bg-background border-muted/50 rounded-xl w-56">
                        <DropdownMenuItem
                          onClick={handleCopyProfileLink}
                          className="text-foreground hover:bg-muted cursor-pointer rounded-lg"
                        >
                          <Share className="h-4 w-4 mr-2" />
                          Share profile link
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={handleAccountSettings}
                          className="text-foreground hover:bg-muted cursor-pointer rounded-lg"
                        >
                          <Users className="h-4 w-4 mr-2" />
                          Account settings
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </>
                ) : (
                  <>
                    <FollowButton
                      targetUserId={profile.id}
                      initialIsFollowing={localIsFollowing}
                      currentUserId={currentUserId}
                      onFollowChange={handleFollowChange}
                    />
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button className="bg-background hover:bg-muted text-foreground rounded-full w-10 h-10">
                          <MoreHorizontal className="h-4 sm:h-5 w-4 sm:w-5" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="bg-background border-muted/50 rounded-xl w-56">
                        <DropdownMenuItem
                          onClick={handleCopyProfileLink}
                          className="text-foreground hover:bg-muted cursor-pointer rounded-lg"
                        >
                          <LinkIcon className="h-4 w-4 mr-2" />
                          Copy profile link
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={handleBlock}
                          className="text-foreground hover:bg-muted cursor-pointer rounded-lg"
                        >
                          <Shield className="h-4 w-4 mr-2" />
                          Block
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={handleReport}
                          className="text-foreground hover:bg-muted cursor-pointer rounded-lg"
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
      </div>

      <div className="max-w-6xl mx-auto px-4 md:px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-8">
          <div className="min-w-0">
            {(profile.bio || profile.location || socialLinks.length > 0) && (
              <div className="mb-8 p-6 bg-card/50 backdrop-blur-sm rounded-2xl border border-card/50">
                {profile.bio && <p className="text-foreground text-base leading-relaxed mb-4">{profile.bio}</p>}

                <div className="flex flex-wrap items-center gap-4 text-muted-foreground text-sm mb-4">
                  {profile.location && (
                    <div className="flex items-center gap-1.5">
                      <MapPin className="h-4 w-4" />
                      <span>{profile.location}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-1.5">
                    <Calendar className="h-4 w-4" />
                    <span>Joined {joinDate}</span>
                  </div>
                </div>

                {socialLinks.length > 0 && (
                  <div className="flex flex-wrap gap-3">
                    {socialLinks.map((link, index) => {
                      const IconComponent = link.icon
                      return (
                        <a
                          key={index}
                          href={link.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 px-3 py-2 bg-card/50 hover:bg-card/75 rounded-full transition-colors text-sm text-muted-foreground hover:text-foreground"
                        >
                          <IconComponent className="h-4 w-4" />
                          <span>{link.label}</span>
                        </a>
                      )
                    })}
                  </div>
                )}
              </div>
            )}

            <Tabs defaultValue="reviews" className="w-full">
              <TabsList className="grid w-full grid-cols-4 bg-card/80 backdrop-blur-sm border border-card/50 rounded-xl p-1 mb-8">
                {tabs.map((tab) => {
                  const Icon = tab.icon
                  return (
                    <TabsTrigger
                      key={tab.id}
                      value={tab.id}
                      className="flex items-center gap-2 px-4 py-3 text-sm font-medium transition-all rounded-lg data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm text-muted-foreground hover:text-foreground hover:bg-card/75"
                    >
                      <Icon className="h-4 w-4" />
                      <span className="hidden sm:inline">{tab.label}</span>
                      {tab.count && tab.count > 0 && (
                        <span className="hidden sm:inline text-xs bg-card/75 data-[state=active]:bg-background data-[state=active]:text-foreground text-muted-foreground px-2 py-1 rounded-full ml-1">
                          {tab.count}
                        </span>
                      )}
                    </TabsTrigger>
                  )
                })}
              </TabsList>

              <TabsContent value="reviews" className="mt-0">
                {reviews.length > 0 ? (
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <h2 className="text-lg font-semibold text-foreground">Reviews ({reviews.length})</h2>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setReviewViewMode("grid")}
                          className={`p-2 rounded-lg transition-colors ${reviewViewMode === "grid" ? "bg-background text-foreground" : "text-muted-foreground hover:text-foreground hover:bg-card/75"}`}
                        >
                          <Grid3X3 className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setReviewViewMode("list")}
                          className={`p-2 rounded-lg transition-colors ${reviewViewMode === "list" ? "bg-background text-foreground" : "text-muted-foreground hover:text-foreground hover:bg-card/75"}`}
                        >
                          <List className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    {reviewViewMode === "grid" ? (
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                        {reviews.map((review) => (
                          <Link key={review.id} href={`/reviews/${review.id}`} className="group cursor-pointer">
                            <div className="aspect-square bg-card rounded-xl overflow-hidden mb-3 relative">
                              {review.song_cover_url ? (
                                <Image
                                  src={review.song_cover_url || "/placeholder.svg"}
                                  alt={review.song_title}
                                  width={200}
                                  height={200}
                                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                />
                              ) : (
                                <div className="w-full h-full bg-card flex items-center justify-center">
                                  <Music className="h-8 w-8 text-muted-foreground" />
                                </div>
                              )}

                              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center">
                                <Play className="h-6 w-6 text-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                              </div>

                              <div className="absolute bottom-2 left-2">
                                <div className="flex items-center gap-0.5">
                                  {[1, 2, 3, 4, 5].map((star) => (
                                    <Star
                                      key={star}
                                      className={`w-3 h-3 ${
                                        star <= review.rating
                                          ? "fill-yellow-400 text-yellow-400"
                                          : "text-muted-foreground"
                                      }`}
                                    />
                                  ))}
                                </div>
                              </div>
                            </div>

                            <div className="space-y-1">
                              <h3 className="text-sm font-medium text-foreground truncate leading-tight">
                                {review.song_title}
                              </h3>
                              <p className="text-xs text-muted-foreground truncate">{review.song_artist}</p>
                            </div>
                          </Link>
                        ))}
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {reviews.map((review) => (
                          <ProfileReviewCard key={review.id} review={review} isOwnProfile={isOwnProfile} />
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-20">
                    <div className="w-16 h-16 bg-card rounded-full flex items-center justify-center mx-auto mb-4">
                      <Music className="h-8 w-8 text-muted-foreground" />
                    </div>
                    <h3 className="text-xl font-semibold text-foreground mb-2">No reviews yet</h3>
                    <p className="text-muted-foreground max-w-md mx-auto">
                      {isOwnProfile
                        ? "Start reviewing music to share your thoughts with the community"
                        : `${displayName} hasn't written any reviews yet`}
                    </p>
                  </div>
                )}
              </TabsContent>

              {tabs.slice(1).map((tab) => (
                <TabsContent key={tab.id} value={tab.id} className="mt-0">
                  <div className="text-center py-20">
                    <div className="w-16 h-16 bg-card rounded-full flex items-center justify-center mx-auto mb-4">
                      {React.createElement(tab.icon, {
                        className: "h-8 w-8 text-muted-foreground",
                      })}
                    </div>
                    <h3 className="text-xl font-semibold text-foreground mb-2">Coming Soon</h3>
                    <p className="text-muted-foreground">This section is under development</p>
                  </div>
                </TabsContent>
              ))}
            </Tabs>
          </div>

          <div className="hidden lg:block">
            <div className="sticky top-6 space-y-6">
              <SuggestedUsers currentUserId={currentUserId} />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
