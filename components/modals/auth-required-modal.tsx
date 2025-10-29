"use client"

import { useRouter } from "next/navigation"
import Link from "next/link"
import { SiVercel } from "react-icons/si"
import { X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Credenza, CredenzaContent, CredenzaDescription, CredenzaHeader, CredenzaTitle } from "@/components/ui/credenza"
import { useIsMobile } from "@/hooks/use-mobile"

interface AuthRequiredModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  action?: string
}

export function AuthRequiredModal({
  open,
  onOpenChange,
  action = "interact with this content",
}: AuthRequiredModalProps) {
  const router = useRouter()
  const isMobile = useIsMobile()

  const handleSignIn = () => {
    onOpenChange(false)
    router.push("/login")
  }

  const handleSignUp = () => {
    onOpenChange(false)
    router.push("/signup")
  }

  return (
    <Credenza open={open} onOpenChange={onOpenChange}>
      <CredenzaContent className="sm:max-w-[500px] p-0 gap-0 bg-background border-border flex flex-col overflow-hidden">
        <CredenzaHeader className="sr-only">
          <CredenzaTitle>Join VERN</CredenzaTitle>
          <CredenzaDescription>Sign in to {action}</CredenzaDescription>
        </CredenzaHeader>

        {/* Header with close button */}
        <div className="flex items-center justify-between p-4 border-b border-border bg-background/80 backdrop-blur-sm">
          <div className="flex-1" />
          {isMobile && (
            <button onClick={() => onOpenChange(false)} className="p-1 hover:bg-muted rounded-lg transition-colors">
              <X className="h-5 w-5 text-foreground" />
            </button>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Icon */}
          <div className="flex justify-center">
            <div className="w-16 h-16 rounded-full bg-foreground flex items-center justify-center">
              <SiVercel className="h-8 w-8 text-background" />
            </div>
          </div>

          {/* Title and description */}
          <div className="space-y-2 text-center">
            <h2 className="text-2xl font-bold">Join VERN</h2>
            <p className="text-sm text-muted-foreground">
              Discover independent music, share thoughtful reviews, and connect with fellow music enthusiasts in our
              curated community.
            </p>
          </div>

          {/* Call to action */}
          <div className="space-y-3 pt-4">
            <p className="text-xs text-muted-foreground text-center">Sign in to {action}</p>
          </div>
        </div>

        {/* Footer with buttons */}
        <div className="border-t border-border p-4 space-y-3 bg-background/50 backdrop-blur-sm">
          <Button
            onClick={handleSignIn}
            className="w-full bg-foreground text-background hover:bg-foreground/90 font-medium"
          >
            Sign In
          </Button>
          <Link href="/signup" className="block">
            <Button variant="outline" className="w-full border-border hover:bg-muted text-foreground bg-transparent">
              Create Account
            </Button>
          </Link>
          <Button
            variant="ghost"
            onClick={() => onOpenChange(false)}
            className="w-full text-muted-foreground hover:text-foreground hover:bg-muted/50"
          >
            Cancel
          </Button>
        </div>
      </CredenzaContent>
    </Credenza>
  )
}
