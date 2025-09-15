"use client"
import { Home, Search, Library, Radio, Plus } from "lucide-react"
import { useIsMobile } from "@/hooks/use-mobile"
import { useState, useEffect } from "react"
import { ReviewModal } from "@/components/modals/review-modal"
import { createClient } from "@/lib/supabase/client"
import { usePathname } from "next/navigation"
import Link from "next/link"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

export function BottomNavigation() {
  const isMobile = useIsMobile()
  const pathname = usePathname()
  const [showReviewModal, setShowReviewModal] = useState(false)
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    const getUser = async () => {
      const supabase = createClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (user) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("avatar_url, username")
          .eq("id", user.id)
          .single()

        setUser({
          id: user.id,
          avatar_url: profile?.avatar_url,
          username: profile?.username,
        })
      }
    }
    getUser()
  }, [])

  if (!isMobile) return null

  const handleReviewClick = () => {
    setShowReviewModal(true)
  }

  const isActive = (path: string) => {
    if (path === "/" && pathname === "/") return true
    if (path !== "/" && pathname.startsWith(path)) return true
    return false
  }

  const navItems = [
    {
      icon: Home,
      href: "/",
      active: isActive("/") && pathname === "/",
    },
    {
      icon: Search,
      href: "/search",
      active: isActive("/search"),
    },
    {
      icon: Radio,
      href: "/radio",
      active: isActive("/radio"),
    },
    {
      icon: Library,
      href: "/library",
      active: isActive("/library"),
    },
  ]

  return (
    <>
      <div className="fixed bottom-6 left-4 right-4 z-50 md:hidden">
        <div className="flex items-center justify-between gap-3">
          <div className="bg-black/90 backdrop-blur-xl rounded-full border border-gray-600/30 shadow-2xl ring-1 ring-white/10 flex-1">
            <div className="flex items-center justify-evenly px-4 py-2">
              {navItems.map((item, index) => {
                const Icon = item.icon

                return (
                  <Link key={index} href={item.href}>
                    <div className="flex items-center justify-center p-2 rounded-full hover:bg-white/10 transition-all duration-200 hover:scale-105">
                      <Icon className={`h-5 w-5 ${item.active ? "text-white" : "text-gray-400"}`} />
                    </div>
                  </Link>
                )
              })}
              <Link href="/profile" className="ml-1">
                <div className="relative p-1">
                  <Avatar className="h-7 w-7 ring-1 ring-white/20 hover:ring-white/40 transition-all duration-200 hover:scale-105">
                    <AvatarImage src={user?.avatar_url || "/placeholder.svg"} alt={user?.username || "Profile"} />
                    <AvatarFallback className="bg-gray-600 text-white text-xs">
                      {user?.username?.charAt(0)?.toUpperCase() || "U"}
                    </AvatarFallback>
                  </Avatar>
                  {isActive("/profile") && (
                    <div className="absolute -bottom-0.5 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-white rounded-full" />
                  )}
                </div>
              </Link>
            </div>
          </div>
          <button
            onClick={handleReviewClick}
            className="bg-white/95 backdrop-blur-xl hover:bg-white rounded-full p-3 shadow-2xl border border-gray-200/50 transition-all duration-300 hover:scale-105 hover:shadow-xl flex-shrink-0"
          >
            <Plus className="h-5 w-5 text-black" />
          </button>
        </div>
      </div>

      {user && (
        <ReviewModal
          open={showReviewModal}
          onOpenChange={setShowReviewModal}
          userId={user.id}
          userAvatar={user.avatar_url}
        />
      )}
    </>
  )
}
