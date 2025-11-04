"use client"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { GradientAvatar } from "@/components/user/gradient-avatar"
import { FollowButton } from "@/components/user/follow-button"
import { getSuggestedUsers } from "@/app/actions/follows"
import { Users, Verified, Mic, Headphones } from "lucide-react"
import Link from "next/link"
import { useQuery } from "@tanstack/react-query"

interface SuggestedUsersProps {
  currentUserId?: string | null
}

export function SuggestedUsers({ currentUserId }: SuggestedUsersProps) {
  const { data, isLoading } = useQuery({
    queryKey: ["suggested-users", currentUserId],
    queryFn: async () => {
      if (!currentUserId) return { users: [] }
      return await getSuggestedUsers(currentUserId, 3)
    },
    enabled: !!currentUserId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  })

  const suggestedUsers = data?.users || []

  if (!currentUserId) {
    return null
  }

  if (isLoading) {
    return (
      <div className="w-full bg-zinc-900/50 backdrop-blur-sm border border-zinc-800/50 rounded-xl md:rounded-xl lg:rounded-2xl p-4 md:p-5 lg:p-6">
        <h3 className="font-semibold text-white mb-3 md:mb-3.5 lg:mb-4 text-sm md:text-sm lg:text-base">
          Suggested for You
        </h3>
        <div className="space-y-3 md:space-y-3.5 lg:space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-center gap-3 animate-pulse">
              <div className="w-8 h-8 md:w-9 md:h-9 lg:w-10 lg:h-10 rounded-full bg-zinc-800" />
              <div className="flex-1 space-y-1">
                <div className="h-3 bg-zinc-800 rounded w-20" />
                <div className="h-2 bg-zinc-800 rounded w-16" />
              </div>
              <div className="h-7 w-12 bg-zinc-800 rounded-full" />
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (suggestedUsers.length === 0) {
    return null
  }

  return (
    <div className="w-full bg-zinc-900/50 backdrop-blur-sm border border-zinc-800/50 rounded-xl md:rounded-xl lg:rounded-2xl p-4 md:p-5 lg:p-6">
      <h3 className="font-semibold text-white mb-3 md:mb-3.5 lg:mb-4 text-sm md:text-sm lg:text-base">
        Suggested for You
      </h3>
      <div className="space-y-3 md:space-y-3.5 lg:space-y-4">
        {suggestedUsers.map((user) => (
          <div key={user.id} className="flex items-center gap-3">
            <Link href={`/user/${user.username}`} className="flex items-center gap-3 flex-1 min-w-0">
              <div className="w-8 h-8 md:w-9 md:h-9 lg:w-10 lg:h-10 rounded-full overflow-hidden bg-zinc-800 flex-shrink-0">
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
                <div className="flex items-center gap-1">
                  <p className="text-white text-xs md:text-sm font-medium truncate">
                    {user.display_name || user.username}
                  </p>
                  {user.is_verified && (
                    <div className="bg-blue-500 rounded-full p-0.5">
                      <Verified className="h-2.5 w-2.5 text-white fill-white" />
                    </div>
                  )}
                  {user.role === "artist" && (
                    <div className="bg-white/10 rounded-full p-0.5">
                      <Mic className="h-2 w-2 text-white" />
                    </div>
                  )}
                  {user.role === "listener" && (
                    <div className="bg-white/10 rounded-full p-0.5">
                      <Headphones className="h-2 w-2 text-white" />
                    </div>
                  )}
                </div>
                <p className="text-zinc-400 text-xs truncate">@{user.username}</p>
              </div>
            </Link>
            <FollowButton
              targetUserId={user.id}
              initialIsFollowing={false}
              currentUserId={currentUserId}
              variant="compact"
            />
          </div>
        ))}

        <Button
          asChild
          className="w-full bg-zinc-800/80 hover:bg-zinc-700 text-white border-0 justify-center rounded-lg md:rounded-lg lg:rounded-xl text-xs md:text-sm lg:text-sm h-8 md:h-9 lg:h-10 mt-3"
        >
          <Link href="/discover">
            <Users className="h-3 w-3 md:h-3.5 md:w-3.5 lg:h-4 lg:w-4 mr-2" />
            Discover More
          </Link>
        </Button>
      </div>
    </div>
  )
}
