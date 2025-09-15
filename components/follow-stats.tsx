"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { GradientAvatar } from "@/components/gradient-avatar"
import { FollowButton } from "@/components/follow-button"
import { Verified, Mic, Headphones } from "lucide-react"
import Link from "next/link"

interface FollowStatsProps {
  userId: string
  followersCount: number
  followingCount: number
  currentUserId?: string | null
  followers?: any[]
  following?: any[]
}

export function FollowStats({
  userId,
  followersCount,
  followingCount,
  currentUserId,
  followers = [],
  following = [],
}: FollowStatsProps) {
  const [showFollowers, setShowFollowers] = useState(false)
  const [showFollowing, setShowFollowing] = useState(false)

  const UserListItem = ({ user, isFollowing = false }: { user: any; isFollowing?: boolean }) => (
    <div className="flex items-center gap-3 p-3 hover:bg-zinc-800/50 rounded-lg transition-colors">
      <Link href={`/user/${user.username}`} className="flex items-center gap-3 flex-1 min-w-0">
        <div className="w-10 h-10 rounded-full overflow-hidden bg-zinc-800 flex-shrink-0">
          {user.avatar_url ? (
            <Avatar className="w-full h-full">
              <AvatarImage src={user.avatar_url || "/placeholder.svg"} alt={user.display_name || user.username} />
              <AvatarFallback>
                <GradientAvatar userId={user.id} size="sm" />
              </AvatarFallback>
            </Avatar>
          ) : (
            <GradientAvatar userId={user.id} size="sm" className="w-full h-full" />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <p className="text-white text-sm font-medium truncate">{user.display_name || user.username}</p>
            {user.is_verified && (
              <div className="bg-blue-500 rounded-full p-0.5">
                <Verified className="h-3 w-3 text-white fill-white" />
              </div>
            )}
            {user.role === "artist" && (
              <div className="bg-white/10 rounded-full p-1">
                <Mic className="h-2.5 w-2.5 text-white" />
              </div>
            )}
            {user.role === "listener" && (
              <div className="bg-white/10 rounded-full p-1">
                <Headphones className="h-2.5 w-2.5 text-white" />
              </div>
            )}
          </div>
          <p className="text-zinc-400 text-xs truncate">@{user.username}</p>
        </div>
      </Link>
      <FollowButton
        targetUserId={user.id}
        initialIsFollowing={isFollowing}
        currentUserId={currentUserId}
        variant="compact"
      />
    </div>
  )

  return (
    <div className="flex items-center gap-4 md:gap-5 lg:gap-6 text-sm md:text-sm lg:text-base">
      <Dialog open={showFollowing} onOpenChange={setShowFollowing}>
        <DialogTrigger asChild>
          <button className="hover:text-white transition-colors cursor-pointer">
            <span className="text-white font-semibold">{followingCount}</span>
            <span className="text-zinc-400 ml-1">Following</span>
          </button>
        </DialogTrigger>
        <DialogContent className="bg-zinc-900 border-zinc-700 text-white max-w-md rounded-2xl max-h-[80vh] overflow-hidden">
          <DialogHeader>
            <DialogTitle className="text-white">Following</DialogTitle>
          </DialogHeader>
          <div className="max-h-96 overflow-y-auto">
            {following.length > 0 ? (
              <div className="space-y-1">
                {following.map((follow) => (
                  <UserListItem key={follow.following_id} user={follow.profiles} isFollowing={true} />
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-zinc-400">Not following anyone yet</p>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={showFollowers} onOpenChange={setShowFollowers}>
        <DialogTrigger asChild>
          <button className="hover:text-white transition-colors cursor-pointer">
            <span className="text-white font-semibold">{followersCount}</span>
            <span className="text-zinc-400 ml-1">Followers</span>
          </button>
        </DialogTrigger>
        <DialogContent className="bg-zinc-900 border-zinc-700 text-white max-w-md rounded-2xl max-h-[80vh] overflow-hidden">
          <DialogHeader>
            <DialogTitle className="text-white">Followers</DialogTitle>
          </DialogHeader>
          <div className="max-h-96 overflow-y-auto">
            {followers.length > 0 ? (
              <div className="space-y-1">
                {followers.map((follow) => (
                  <UserListItem key={follow.follower_id} user={follow.profiles} isFollowing={false} />
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-zinc-400">No followers yet</p>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
