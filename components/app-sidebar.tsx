"use client"

import type * as React from "react"
import { AudioWaveform, BookOpen, Bot, Frame, Map, PieChart, Settings2, SquareTerminal } from "lucide-react"

import { NavMain } from "@/components/nav-main"
import { NavProjects } from "@/components/nav-projects"
import { NavUser } from "@/components/nav-user"
import { AppBranding } from "@/components/app-branding"
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarRail } from "@/components/ui/sidebar"

// This is VERN data.
const data = {
  user: {
    name: "Alex Rivera",
    email: "alex@vern.music",
    avatar: "/placeholder.svg?height=32&width=32",
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
      items: [
        {
          title: "Write Review",
          url: "#",
        },
        {
          title: "My Reviews",
          url: "#",
        },
        {
          title: "Following",
          url: "#",
        },
        {
          title: "Popular",
          url: "#",
        },
      ],
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
      title: "Social",
      url: "#",
      icon: Bot,
      items: [
        {
          title: "Activity Feed",
          url: "#",
        },
        {
          title: "Following",
          url: "#",
        },
        {
          title: "Followers",
          url: "#",
        },
        {
          title: "Messages",
          url: "#",
        },
      ],
    },
    {
      title: "Settings",
      url: "#",
      icon: Settings2,
      items: [
        {
          title: "Profile",
          url: "#",
        },
        {
          title: "Account",
          url: "#",
        },
        {
          title: "Privacy",
          url: "#",
        },
        {
          title: "Notifications",
          url: "#",
        },
      ],
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
    {
      name: "Analytics",
      url: "#",
      icon: Map,
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
