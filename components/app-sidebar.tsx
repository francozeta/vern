"use client"

import type * as React from "react"
import { AudioWaveform, BookOpen, Frame, PieChart, Settings2, SquareTerminal } from "lucide-react"

import { NavMain } from "@/components/nav-main"
import { NavProjects } from "@/components/nav-projects"
import { NavUser } from "@/components/nav-user"
import { AppBranding } from "@/components/app-branding"
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarRail } from "@/components/ui/sidebar"

// This is VERN data.
const data = {
  user: {
    name: "User Name",
    email: "user@vern.music",
    avatar: "https://avatars.githubusercontent.com/u/124936792?v=4",
  },
  navMain: [
    {
      title: "Discover",
      url: "#",
      icon: SquareTerminal,
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
      icon: BookOpen,
    },
    {
      title: "Library",
      url: "#",
      icon: AudioWaveform,
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
      icon: Settings2,
    },
  ],
  projects: [
    {
      name: "Upload Music",
      url: "#",
      icon: Frame,
    },
    {
      name: "Artist Dashboard",
      url: "#",
      icon: PieChart,
    },
  ],
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="icon" {...props} className="bg-black">
      <SidebarHeader>
        <AppBranding />
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
        <NavProjects projects={data.projects} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
