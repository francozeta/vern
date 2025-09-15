import { createServerSupabaseClient } from "@/lib/supabase/server"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Music, Star, Users, TrendingUp, Play } from "lucide-react"
import { ActivityFeed } from "@/components/activity-feed"
import { SuggestedUsers } from "@/components/suggested-users"
import { getFollowCounts } from "@/app/actions/follows"
import Link from "next/link"

export default async function DashboardPage() {
  const supabase = await createServerSupabaseClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return null
  }

  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single()

  const { count: reviewCount } = await supabase
    .from("reviews")
    .select("*", { count: "exact", head: true })
    .eq("user_id", user.id)

  const followCounts = await getFollowCounts(user.id)

  const breadcrumbs = [{ label: "Dashboard", isLink: false }]

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="max-w-7xl mx-auto px-5 md:px-6 lg:px-8 py-6 md:py-7 lg:py-8">
        {/* Welcome Section */}
        <div className="space-y-2 mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-white">
            Welcome back, {profile?.display_name || profile?.username || "Music Lover"}
          </h1>
          <p className="text-zinc-400">
            Discover new music, share your thoughts, and connect with fellow music enthusiasts.
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 mb-8">
          <Card className="bg-zinc-900/50 border-zinc-800/50">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-zinc-400">Your Reviews</CardTitle>
              <Star className="h-4 w-4 text-zinc-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{reviewCount || 0}</div>
              <p className="text-xs text-zinc-500">Total reviews written</p>
            </CardContent>
          </Card>

          <Card className="bg-zinc-900/50 border-zinc-800/50">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-zinc-400">Following</CardTitle>
              <Users className="h-4 w-4 text-zinc-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{followCounts.followingCount}</div>
              <p className="text-xs text-zinc-500">Artists & reviewers</p>
            </CardContent>
          </Card>

          <Card className="bg-zinc-900/50 border-zinc-800/50">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-zinc-400">Followers</CardTitle>
              <TrendingUp className="h-4 w-4 text-zinc-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{followCounts.followersCount}</div>
              <p className="text-xs text-zinc-500">People following you</p>
            </CardContent>
          </Card>

          <Card className="bg-zinc-900/50 border-zinc-800/50">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-zinc-400">This Month</CardTitle>
              <Play className="h-4 w-4 text-zinc-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">8</div>
              <p className="text-xs text-zinc-500">New discoveries</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-6 md:gap-8">
          {/* Activity Feed */}
          <div className="min-w-0">
            <Tabs defaultValue="following" className="w-full">
              <TabsList className="grid w-full grid-cols-2 bg-zinc-900/50 border border-zinc-800/50 rounded-lg mb-6">
                <TabsTrigger
                  value="following"
                  className="data-[state=active]:bg-white data-[state=active]:text-black text-zinc-400"
                >
                  Following
                </TabsTrigger>
                <TabsTrigger
                  value="discover"
                  className="data-[state=active]:bg-white data-[state=active]:text-black text-zinc-400"
                >
                  Discover
                </TabsTrigger>
              </TabsList>

              <TabsContent value="following" className="mt-0">
                <ActivityFeed currentUserId={user.id} showFollowingOnly={true} />
              </TabsContent>

              <TabsContent value="discover" className="mt-0">
                <ActivityFeed currentUserId={user.id} showFollowingOnly={false} />
              </TabsContent>
            </Tabs>
          </div>

          {/* Sidebar */}
          <div className="w-full lg:w-[300px]">
            <div className="space-y-6 sticky top-6">
              {/* Suggested Users */}
              <SuggestedUsers currentUserId={user.id} />

              {/* Quick Actions */}
              <Card className="bg-zinc-900/50 border-zinc-800/50">
                <CardHeader>
                  <CardTitle className="text-lg text-white">Quick Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button asChild className="w-full justify-start bg-white text-black hover:bg-zinc-100">
                    <Link href="/search">
                      <Star className="h-4 w-4 mr-2" />
                      Write a Review
                    </Link>
                  </Button>
                  <Button asChild className="w-full justify-start bg-zinc-800/80 hover:bg-zinc-700 text-white border-0">
                    <Link href="/search">
                      <Music className="h-4 w-4 mr-2" />
                      Discover Music
                    </Link>
                  </Button>
                  <Button asChild className="w-full justify-start bg-zinc-800/80 hover:bg-zinc-700 text-white border-0">
                    <Link href="/discover">
                      <Users className="h-4 w-4 mr-2" />
                      Find People
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
