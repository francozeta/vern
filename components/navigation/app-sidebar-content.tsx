"use client"

import { usePathname } from "next/navigation"
import { NavMain } from "@/components/navigation/nav-main"
import { NavProjects } from "@/components/navigation/nav-projects"
import { SettingsSidebarContent } from "@/components/navigation/settings-sidebar-content"

interface AppSidebarContentProps {
  navMainData: any[]
  projectsData: any[]
  userRole: "listener" | "artist" | "both"
}

export function AppSidebarContent({ navMainData, projectsData, userRole }: AppSidebarContentProps) {
  const pathname = usePathname()
  const isSettingsRoute = pathname.startsWith("/settings")

  if (isSettingsRoute) {
    return <SettingsSidebarContent userRole={userRole} />
  }

  return (
    <>
      <NavMain items={navMainData} />
      {projectsData.length > 0 && <NavProjects projects={projectsData} />}
    </>
  )
}
