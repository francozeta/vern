import type React from "react"
import type { Metadata } from "next"
import { Geist } from "next/font/google"
import "../globals.css"

import { AppSidebar } from "@/components/navigation/app-sidebar"
import { Separator } from "@/components/ui/separator"
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { HeaderAuth } from "@/components/auth/header-auth"
import { BottomNavigation } from "@/components/navigation/bottom-navigation"
import { DynamicBreadcrumb } from "@/components/navigation/dynamic-breadcrumb"
import { Toaster } from "@/components/ui/sonner"
import { MusicPlayer } from "@/components/player/music-player"
import { MobilePlayer } from "@/components/player/mobile-player"

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
})

export const metadata: Metadata = {
  title: "VERN - Music Platform",
  description: "Social Network for Music, Reviews, and Independent Discovery",
  generator: "Next.js",
  applicationName: "VERN",
  keywords: ["Music", "Reviews", "Social Network", "Independent Artists", "Discover Music"],
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.className} antialiased dark`}>
        <SidebarProvider>
          <AppSidebar />
          <SidebarInset className="flex flex-col h-screen">
            <header className="sticky top-0 z-40 flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12 border-b border-border/40 bg-sidebar/80 backdrop-blur-md">
              <div className="flex items-center gap-2 px-4">
                <SidebarTrigger className="-ml-1" />
                <Separator orientation="vertical" className="mr-2 data-[orientation=vertical]:h-4" />
                <DynamicBreadcrumb />
              </div>
              <div className="ml-auto px-4">
                <HeaderAuth />
              </div>
            </header>
            <main className="flex-1 overflow-y-auto">{children}</main>
            <div className="sticky bottom-0 z-40 border-t border-border/40 bg-sidebar/80 backdrop-blur-md hidden md:block">
              <MusicPlayer />
            </div>
            <Toaster />
          </SidebarInset>
          <MobilePlayer />
          <BottomNavigation />
        </SidebarProvider>
      </body>
    </html>
  )
}
