import type * as React from "react"
import { NavUser } from "@/components/navigation/nav-user"
import { AppBranding } from "@/components/layout/app-branding"
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarRail } from "@/components/ui/sidebar"
import { createServerSupabaseClient } from "@/lib/supabase/server"
import { AppSidebarContent } from "@/components/navigation/app-sidebar-content"

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
      url: "/discover",
      icon: "SquareTerminal",
    },
    {
      title: "Reviews",
      url: "/reviews",
      icon: "BookOpen",
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
        <AppSidebarContent navMainData={navMainData} projectsData={projectsData} userRole={userRole} />
      </SidebarContent>
      <SidebarFooter>{userData && <NavUser user={userData} />}</SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
