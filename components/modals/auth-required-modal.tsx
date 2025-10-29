"use client"

import { useRouter } from "next/navigation"
import { LogIn, Music } from "lucide-react"
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
      <CredenzaContent className="border-border/50">
        <CredenzaHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-orange-500 to-pink-500 flex items-center justify-center">
              <Music className="h-8 w-8 text-white" />
            </div>
          </div>
          <CredenzaTitle className="text-2xl font-bold">Join the Community</CredenzaTitle>
          <CredenzaDescription className="text-base mt-2">Sign in to {action}</CredenzaDescription>
        </CredenzaHeader>

        <CredenzaBody className="py-6">
          <div className="space-y-4 text-center">
            <p className="text-sm text-muted-foreground leading-relaxed">
              Discover music, share reviews, and connect with other music lovers. Create an account or sign in to get
              started.
            </p>
          </div>
        </CredenzaBody>

        <CredenzaFooter className="flex flex-col gap-3 sm:flex-row">
          <Button variant="outline" onClick={() => onOpenChange(false)} className="border-border/50 hover:bg-muted">
            Cancel
          </Button>
          <Button
            onClick={handleSignIn}
            className="bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600 text-white border-0"
          >
            <LogIn className="h-4 w-4 mr-2" />
            Sign In
          </Button>
          <Button onClick={handleSignUp} className="bg-foreground text-background hover:bg-foreground/90">
            Create Account
          </Button>
        </CredenzaFooter>
      </CredenzaContent>
    </Credenza>
  )
}
