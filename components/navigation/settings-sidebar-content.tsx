"use client"

import type React from "react"

import { usePathname, useRouter } from "next/navigation"
import { ChevronLeft, User, Music, CreditCard, Bell, Lock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface SettingsSidebarContentProps {
  userRole: "listener" | "artist" | "both"
}

interface SettingsNavItem {
  label: string
  href: string
  icon: React.ReactNode
  section: string
}

export function SettingsSidebarContent({ userRole }: SettingsSidebarContentProps) {
  const pathname = usePathname()
  const router = useRouter()

  const SETTINGS_ITEMS: SettingsNavItem[] = [
    {
      label: "Profile",
      href: "/settings/profile",
      icon: <User className="h-4 w-4" />,
      section: "Account",
    },
    {
      label: "Preferences",
      href: "/settings/preferences",
      icon: <Bell className="h-4 w-4" />,
      section: "Account",
    },
    {
      label: "Account",
      href: "/settings/account",
      icon: <Lock className="h-4 w-4" />,
      section: "Account",
    },
    ...(userRole === "artist" || userRole === "both"
      ? [
          {
            label: "My Songs",
            href: "/settings/artist",
            icon: <Music className="h-4 w-4" />,
            section: "Workspace",
          },
        ]
      : []),
    {
      label: "Billing",
      href: "/settings/billing",
      icon: <CreditCard className="h-4 w-4" />,
      section: "Workspace",
    },
  ]

  // Group items by section
  const sections = SETTINGS_ITEMS.reduce(
    (acc, item) => {
      if (!acc[item.section]) {
        acc[item.section] = []
      }
      acc[item.section].push(item)
      return acc
    },
    {} as Record<string, SettingsNavItem[]>,
  )

  return (
    <>
      {/* Back to app button */}
      <div className="p-4 border-b border-border/40">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.push("/")}
          className="w-full justify-start text-muted-foreground hover:text-foreground"
        >
          <ChevronLeft className="h-4 w-4 mr-2" />
          Back to app
        </Button>
      </div>

      {/* Navigation items */}
      <nav className="flex-1 overflow-y-auto p-4 space-y-6">
        {Object.entries(sections).map(([section, items]) => (
          <div key={section} className="space-y-2">
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-2">{section}</h3>
            <div className="space-y-1">
              {items.map((item) => {
                const isActive = pathname === item.href
                return (
                  <Button
                    key={item.href}
                    variant="ghost"
                    size="sm"
                    onClick={() => router.push(item.href)}
                    className={cn(
                      "w-full justify-start text-sm transition-colors",
                      isActive
                        ? "bg-white/10 text-white font-medium"
                        : "text-muted-foreground hover:text-foreground hover:bg-white/5",
                    )}
                  >
                    {item.icon}
                    <span className="ml-2">{item.label}</span>
                  </Button>
                )
              })}
            </div>
          </div>
        ))}
      </nav>
    </>
  )
}
