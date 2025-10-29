"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { User, LinkIcon, Settings, CreditCard, Music, ChevronRight } from "lucide-react"

interface SettingsSidebarProps {
  userRole: "listener" | "artist" | "both"
}

export function SettingsSidebar({ userRole }: SettingsSidebarProps) {
  const pathname = usePathname()
  const isArtist = userRole === "artist" || userRole === "both"

  const sections = [
    {
      label: "Account",
      items: [
        { href: "/settings/profile", label: "Profile", icon: User },
        { href: "/settings/account", label: "Account", icon: LinkIcon },
      ],
    },
    {
      label: "Workspace",
      items: [
        { href: "/settings/preferences", label: "Preferences", icon: Settings },
        { href: "/settings/billing", label: "Billing", icon: CreditCard },
        ...(isArtist ? [{ href: "/settings/artist", label: "My Songs", icon: Music }] : []),
      ],
    },
  ]

  return (
    <nav className="space-y-8 sticky top-20">
      {sections.map((section) => (
        <div key={section.label}>
          <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">{section.label}</h3>
          <ul className="space-y-1">
            {section.items.map((item) => {
              const Icon = item.icon
              const isActive = pathname === item.href

              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={cn(
                      "flex items-center justify-between px-3 py-2 rounded-md text-sm transition-colors duration-200",
                      isActive
                        ? "bg-primary text-primary-foreground font-medium shadow-sm"
                        : "text-muted-foreground hover:text-foreground hover:bg-muted/50",
                    )}
                  >
                    <div className="flex items-center gap-2">
                      <Icon className="h-4 w-4 flex-shrink-0" />
                      <span>{item.label}</span>
                    </div>
                    {isActive && <ChevronRight className="h-4 w-4 flex-shrink-0" />}
                  </Link>
                </li>
              )
            })}
          </ul>
        </div>
      ))}
    </nav>
  )
}
