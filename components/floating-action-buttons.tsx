"use client"

import { Button } from "@/components/ui/button"
import { Upload, Feather } from "lucide-react"
import { useIsMobile } from "@/hooks/use-mobile"
import { useState, useEffect } from "react"
import { ReviewModal } from "@/components/review-modal"
import { createClient } from "@/lib/supabase/client"

export function FloatingActionButtons() {
  const isMobile = useIsMobile()
  const [showReviewModal, setShowReviewModal] = useState(false)
  const [user, setUser] = useState<any>(null)

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

  if (!isMobile) return null

  const handleReviewClick = () => {
    setShowReviewModal(true)
  }

  const handleUploadClick = () => {
    // TODO: Handle upload
    console.log("Upload clicked")
  }

  return (
    <>
      <div className="fixed bottom-6 right-4 z-50 flex flex-col gap-3">
        <Button
          size="icon"
          onClick={handleReviewClick}
          className="h-12 w-12 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 bg-primary hover:bg-primary/90"
          aria-label="Create Review"
        >
          <Feather className="h-5 w-5" />
        </Button>
        <Button
          size="icon"
          onClick={handleUploadClick}
          className="h-12 w-12 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 bg-secondary hover:bg-secondary/90"
          aria-label="Upload Music"
        >
          <Upload className="h-5 w-5" />
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
