import type * as React from "react"

import { NavMain } from "@/components/nav-main"
import { NavProjects } from "@/components/nav-projects"
import { NavUser } from "@/components/nav-user"
import { AppBranding } from "@/components/app-branding"
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarRail } from "@/components/ui/sidebar"
import { createServerSupabaseClient } from "@/lib/supabase/server"

export async function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const supabase = await createServerSupabaseClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  let userData = null
  if (user) {
    // Get user profile data
    const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single()

    userData = {
      name: profile?.display_name || "User",
      email: user.email || "",
      avatar: profile?.avatar_url || "",
      userId: user.id,
    }
  }

  // Serialize navigation data to avoid passing functions to client components
  const navMainData = [
    {
      title: "Discover",
      url: "#",
      icon: "SquareTerminal",
      isActive: true,
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
      url: "#",
      icon: "BookOpen",
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
          title: "Saved Reviews",
          url: "#",
        },
      ],
    },
    {
      title: "Settings",
      url: "#",
      icon: "Settings2",
    },
  ]

  const projectsData = [
    {
      name: "Upload Music",
      url: "#",
      icon: "Frame",
    },
    {
      name: "Artist Dashboard",
      url: "#",
      icon: "PieChart",
    },
  ]

  return (
    <Sidebar collapsible="icon" {...props} className="bg-black">
      <SidebarHeader>
        <AppBranding />
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={navMainData} />
        <NavProjects projects={projectsData} />
      </SidebarContent>
      <SidebarFooter>{userData && <NavUser user={userData} />}</SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
