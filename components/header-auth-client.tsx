"use client"

import { Button } from "@/components/ui/button"
import { Upload, Feather } from "lucide-react"
import { useIsMobile } from "@/hooks/use-mobile"
import { useState, useEffect } from "react"
import { ReviewModal } from "@/components/review-modal"
import { createClient } from "@/lib/supabase/client"

export function HeaderAuthClient() {
  const isMobile = useIsMobile()
  const [showReviewModal, setShowReviewModal] = useState(false)
  const [user, setUser] = useState<any>(null)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  // Get user data for modal
  useEffect(() => {
    const getUser = async () => {
      const supabase = createClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (user) {
        const { data: profile } = await supabase.from("profiles").select("avatar_url").eq("id", user.id).single()

        setUser({
          id: user.id,
          avatar_url: profile?.avatar_url,
        })
      }
    }
    getUser()
  }, [])

  if (!mounted) {
    return (
      <div className="hidden md:flex items-center gap-3">
        <div className="h-9 w-20 bg-transparent" />
        <div className="h-9 w-20 bg-transparent" />
      </div>
    )
  }

  // Hide on mobile - floating action buttons will handle this
  if (isMobile) {
    return null
  }

  const handleReviewClick = () => {
    setShowReviewModal(true)
  }

  const handleUploadClick = () => {
    // TODO: Handle upload
    console.log("Upload clicked")
  }

  return (
    <>
      <div className="hidden md:flex items-center gap-3">
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

      {/* Review Modal */}
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
