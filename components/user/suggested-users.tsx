"use client"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { GradientAvatar } from "@/components/user/gradient-avatar"
import { FollowButton } from "@/components/user/follow-button"
import { getSuggestedUsers } from "@/app/actions/follows"
import { Users, Verified, Mic, Headphones, Sparkles } from "lucide-react"
import Link from "next/link"
import { useQuery } from "@tanstack/react-query"
import { CACHE_KEYS } from "@/lib/cache/cache-keys"

interface SuggestedUsersProps {
  currentUserId?: string | null
}

export function SuggestedUsers({ currentUserId }: SuggestedUsersProps) {
  const { data, isLoading } = useQuery({
    queryKey: CACHE_KEYS.SUGGESTED_USERS(3),
    queryFn: async () => {
      if (!currentUserId) return { users: [] }
      return await getSuggestedUsers(currentUserId, 3)
    },
    enabled: !!currentUserId,
    staleTime: 1000 * 60 * 10, // 10 minutes - increased from 5
    gcTime: 1000 * 60 * 30, // 30 minutes
  })

  const suggestedUsers = data?.users || []

  if (!currentUserId) {
    return (
      <div className="w-full bg-card/50 backdrop-blur-sm rounded-lg md:rounded-lg lg:rounded-xl p-4 md:p-5 lg:p-6">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mx-auto">
            <Sparkles className="h-6 w-6 text-muted-foreground" />
          </div>
          <div>
            <h3 className="font-semibold text-foreground text-sm md:text-sm lg:text-base mb-1">
              Discover Artists & Critics
            </h3>
            <p className="text-xs md:text-sm text-muted-foreground">
              Sign in to start following your favorite reviewers and artists
            </p>
          </div>
          <Button
            asChild
            className="w-full bg-white text-black hover:bg-zinc-100 border-0 rounded-lg md:rounded-lg lg:rounded-xl text-xs md:text-sm h-9 md:h-10 lg:h-11 font-medium"
          >
            <Link href="/login" className="gap-2 flex items-center justify-center">
              Sign In
            </Link>
          </Button>
        </div>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="w-full bg-card border border-border/50 rounded-lg md:rounded-lg lg:rounded-xl p-4 md:p-5 lg:p-6">
        <h3 className="font-semibold text-foreground mb-3 md:mb-3.5 lg:mb-4 text-sm md:text-sm lg:text-base">
          Suggested for You
        </h3>
        <div className="space-y-3 md:space-y-3.5 lg:space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-center gap-3 animate-pulse">
              <div className="w-8 h-8 md:w-9 md:h-9 lg:w-10 lg:h-10 rounded-full bg-muted" />
              <div className="flex-1 space-y-1">
                <div className="h-3 bg-muted rounded w-20" />
                <div className="h-2 bg-muted rounded w-16" />
              </div>
              <div className="h-7 w-12 bg-muted rounded-full" />
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (suggestedUsers.length === 0) {
    return (
      <div className="w-full bg-card border border-border/50 rounded-lg md:rounded-lg lg:rounded-xl p-4 md:p-5 lg:p-6">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mx-auto">
            <Users className="h-6 w-6 text-muted-foreground" />
          </div>
          <div>
            <h3 className="font-semibold text-foreground text-sm md:text-base mb-1">You're All Set!</h3>
            <p className="text-xs md:text-sm text-muted-foreground">
              You're following great curators. Check back soon for more suggestions
            </p>
          </div>
          <Button
            asChild
            className="w-full bg-muted text-foreground hover:bg-muted/80 border-0 rounded-lg md:rounded-lg lg:rounded-xl text-xs md:text-sm h-9 md:h-10 lg:h-11"
          >
            <Link href="/discover">
              <Sparkles className="h-4 w-4 mr-2" />
              Explore More
            </Link>
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full bg-card border border-border/50 rounded-lg md:rounded-lg lg:rounded-xl p-4 md:p-5 lg:p-6">
      <h3 className="font-semibold text-foreground mb-3 md:mb-3.5 lg:mb-4 text-sm md:text-sm lg:text-base">
        Suggested for You
      </h3>
      <div className="space-y-3 md:space-y-3.5 lg:space-y-4">
        {suggestedUsers.map((user) => (
          <div key={user.id} className="flex items-center gap-3">
            <Link href={`/user/${user.username}`} className="flex items-center gap-3 flex-1 min-w-0">
              <div className="w-8 h-8 md:w-9 md:h-9 lg:w-10 lg:h-10 rounded-full overflow-hidden bg-muted flex-shrink-0">
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
                  <p className="text-foreground text-xs md:text-sm font-medium truncate">
                    {user.display_name || user.username}
                  </p>
                  {user.is_verified && (
                    <div className="bg-blue-500 rounded-full p-0.5">
                      <Verified className="h-2.5 w-2.5 text-white fill-white" />
                    </div>
                  )}
                  {user.role === "artist" && (
                    <div className="bg-muted rounded-full p-0.5">
                      <Mic className="h-2 w-2 text-muted-foreground" />
                    </div>
                  )}
                  {user.role === "listener" && (
                    <div className="bg-muted rounded-full p-0.5">
                      <Headphones className="h-2 w-2 text-muted-foreground" />
                    </div>
                  )}
                </div>
                <p className="text-muted-foreground text-xs truncate">@{user.username}</p>
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
          className="w-full bg-muted text-foreground hover:bg-muted/80 border-0 justify-center rounded-lg md:rounded-lg lg:rounded-xl text-xs md:text-sm h-9 md:h-10 lg:h-11 mt-3"
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
