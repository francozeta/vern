"use client"

import { Button } from "@/components/ui/button"
import { Upload, Feather, Search } from "lucide-react"
import { useIsMobile } from "@/hooks/use-mobile"
import { useState, useEffect } from "react"
import { ReviewModal } from "@/components/modals/review-modal"
import { UploadModal } from "@/components/modals/upload-modal"
import { useAuthUser } from "@/components/providers/auth-user-provider"
import { useRouter } from "next/navigation"

export function HeaderAuthClient() {
const isMobile = useIsMobile()
  const [showReviewModal, setShowReviewModal] = useState(false)
  const [showUploadModal, setShowUploadModal] = useState(false)
  const [mounted, setMounted] = useState(false)
  const { user, isLoading } = useAuthUser()
  const router = useRouter()

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted || isLoading) return null
  if (isMobile) return null



  if (!mounted) {
    return (
      <div className="hidden md:flex items-center gap-3">
        <div className="h-9 w-9 bg-transparent" />
        <div className="h-9 w-20 bg-transparent" />
        <div className="h-9 w-20 bg-transparent" />
      </div>
    )
  }

  if (isMobile) {
    return null
  }

  const handleReviewClick = () => {
    if (!user) {
      router.push("/login")
      return
    }
    setShowReviewModal(true)
  }

  const handleUploadClick = () => {
    if (!user) {
      router.push("/login")
      return
    }
    if (user.role === "listener") {
      alert("Only artists can upload songs")
      return
    }
    setShowUploadModal(true)
  }

  const handleSearchClick = () => {
    router.push("/search")
  }

  return (
    <>
      <div className="hidden md:flex items-center gap-3">
        <Button
          variant="ghost"
          size="sm"
          onClick={handleSearchClick}
          className="h-9 w-9 p-0 hover:bg-white/10 transition-all duration-200 border border-white/20 hover:border-white/30 rounded-full"
        >
          <Search className="h-4 w-4" />
        </Button>

        <Button
          variant="ghost"
          size="sm"
          onClick={handleUploadClick}
          className="h-9 px-4 gap-2 hover:bg-white/10 transition-all duration-200 border border-white/20 hover:border-white/30 rounded-full"
        >
          <Upload className="h-4 w-4" />
          <span className="text-sm font-medium">Upload</span>
        </Button>

        <Button
          size="sm"
          onClick={handleReviewClick}
          className="h-9 px-4 gap-2 bg-white text-black hover:bg-white/90 transition-all duration-200 rounded-full font-medium"
        >
          <Feather className="h-4 w-4" />
          <span className="text-sm">Review</span>
        </Button>
      </div>

      {user && (
        <>
          <ReviewModal
            open={showReviewModal}
            onOpenChange={setShowReviewModal}
            userId={user.id}
            userAvatar={user.avatar_url}
          />
          <UploadModal open={showUploadModal} onOpenChange={setShowUploadModal} userId={user.id} />
        </>
      )}
    </>
  )
}
