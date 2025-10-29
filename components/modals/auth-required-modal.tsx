"use client"

import { useRouter } from "next/navigation"
import { LogIn, Music, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import {
  Credenza,
  CredenzaContent,
  CredenzaDescription,
  CredenzaHeader,
  CredenzaTitle,
  CredenzaBody,
  CredenzaFooter,
} from "@/components/ui/credenza"
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
    toast.info("Redirecting to sign in...")
    router.push("/login")
  }

  const handleSignUp = () => {
    onOpenChange(false)
    toast.info("Redirecting to create account...")
    router.push("/signup")
  }

  return (
    <Credenza open={open} onOpenChange={onOpenChange}>
      <CredenzaContent className="border-white/10 bg-black">
        <CredenzaHeader className="text-center border-b border-white/10 pb-6">
          {isMobile && (
            <button
              onClick={() => onOpenChange(false)}
              className="absolute right-4 top-4 p-1 hover:bg-white/10 rounded-lg transition-colors"
            >
              <X className="h-5 w-5 text-white" />
            </button>
          )}

          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 rounded-full bg-white flex items-center justify-center">
              <Music className="h-8 w-8 text-black" />
            </div>
          </div>

          <CredenzaTitle className="text-2xl font-bold text-white">Join VERN</CredenzaTitle>
          <CredenzaDescription className="text-base mt-3 text-white/70">Sign in to {action}</CredenzaDescription>
        </CredenzaHeader>

        <CredenzaBody className="py-8">
          <div className="space-y-4 text-center">
            <p className="text-sm text-white/60 leading-relaxed">
              Discover independent music, share thoughtful reviews, and connect with fellow music enthusiasts in our
              curated community.
            </p>
          </div>
        </CredenzaBody>

        <CredenzaFooter className="flex flex-col gap-3 sm:flex-row border-t border-white/10 pt-6">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="border-white/20 hover:bg-white/10 text-white hover:text-white"
          >
            Cancel
          </Button>
          <Button onClick={handleSignIn} className="bg-white text-black hover:bg-white/90 font-medium">
            <LogIn className="h-4 w-4 mr-2" />
            Sign In
          </Button>
          <Button
            onClick={handleSignUp}
            className="bg-white/10 text-white hover:bg-white/20 border border-white/20 font-medium"
          >
            Create Account
          </Button>
        </CredenzaFooter>
      </CredenzaContent>
    </Credenza>
  )
}
