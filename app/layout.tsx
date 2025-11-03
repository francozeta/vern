import type React from "react"
import type { Metadata } from "next"
import { Geist } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import "./globals.css"
import { PlayerProvider } from "@/components/providers/player-provider"
import { QueryProvider } from "@/components/providers/query-provider"
import { AuthUserProvider } from "@/components/providers/auth-user-provider"

export const metadata: Metadata = {
  title: "VERN - Music Platform",
  description: "Social Network for Music, Reviews, and Independent Discovery",
  generator: "Next.js",
  applicationName: "VERN",
  keywords: ["Music", "Reviews", "Social Network", "Independent Artists", "Discover Music"],
}
const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
})

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.className} antialiased dark`}>
        <QueryProvider>
          <AuthUserProvider>
            <PlayerProvider>{children}</PlayerProvider>
          </AuthUserProvider>
        </QueryProvider>
        <Analytics />
      </body>
    </html>
  )
}
