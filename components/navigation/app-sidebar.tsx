import type * as React from "react"

import { NavMain } from "@/components/navigation/nav-main"
import { NavProjects } from "@/components/navigation/nav-projects"
import { NavUser } from "@/components/navigation/nav-user"
import { AppBranding } from "@/components/layout/app-branding"
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarRail } from "@/components/ui/sidebar"
import { createServerSupabaseClient } from "@/lib/supabase/server"

export async function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const supabase = await createServerSupabaseClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  let userData = null
  let userRole: "listener" | "artist" | "both" = "listener"

  if (user) {
    const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single()

    userData = {
      name: profile?.display_name || "User",
      email: user.email || "",
      avatar: profile?.avatar_url || "",
      userId: user.id,
      username: profile?.username,
    }

    userRole = profile?.role || "listener"
  }

  const navMainData = [
    {
      title: "Home",
      url: "/",
      icon: "Home",
      isActive: true,
    },
    {
      title: "Discover",
      url: "#",
      icon: "SquareTerminal",
      items: [
        {
          title: "New Releases",
          url: "#",
        },
        {
          title: "Trending",
          url: "#",
        },
        {
          title: "Genres",
          url: "#",
        },
        {
          title: "Artists",
          url: "#",
        },
      ],
    },
    {
      title: "Reviews",
      url: "/reviews",
      icon: "BookOpen",
      items: [
        {
          title: "All Reviews",
          url: "/reviews",
        },
        {
          title: "Trending",
          url: "/reviews?filter=trending",
        },
        {
          title: "Top Rated",
          url: "/reviews?filter=top-rated",
        },
        {
          title: "Recent",
          url: "/reviews?filter=recent",
        },
      ],
    },
    {
      title: "Search",
      url: "/search",
      icon: "Search",
    },
    {
      title: "Library",
      url: "#",
      icon: "AudioWaveform",
      items: [
        {
          title: "Liked Songs",
          url: "#",
        },
        {
          title: "Playlists",
          url: "#",
        },
        {
          title: "Recently Played",
          url: "#",
        },
        {
          title: "My Reviews",
          url: userData ? `/user/${userData.username}` : "#",
        },
        {
          title: "Saved Reviews",
          url: "#",
        },
      ],
    },
    {
      title: "Settings",
      url: "/settings",
      icon: "Settings2",
    },
  ]

  const projectsData =
    userRole === "artist" || userRole === "both"
      ? [
          {
            name: "Upload Music",
            url: "/upload",
            icon: "Upload",
          },
          {
            name: "Artist Dashboard",
            url: "/artist/dashboard",
            icon: "PieChart",
          },
          {
            name: "My Uploads",
            url: "/artist/uploads",
            icon: "Music",
          },
        ]
      : []

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <AppBranding />
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={navMainData} />
        {projectsData.length > 0 && <NavProjects projects={projectsData} />}
      </SidebarContent>
      <SidebarFooter>{userData && <NavUser user={userData} />}</SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
