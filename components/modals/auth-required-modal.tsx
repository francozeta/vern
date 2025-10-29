"use client"

import { useRouter } from "next/navigation"
import Link from "next/link"
import { SiVercel } from "react-icons/si"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Drawer, DrawerContent } from "@/components/ui/drawer"
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

  if (isMobile) {
    return (
      <Drawer open={open} onOpenChange={onOpenChange}>
        <DrawerContent className="bg-background border-border flex flex-col overflow-hidden">
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {/* Icon with bordered rectangle background */}
            <div className="flex justify-center">
              <div className="w-16 h-16 border border-border rounded-lg flex items-center justify-center bg-background">
                <SiVercel className="h-8 w-8 text-foreground" />
              </div>
            </div>

            {/* Title and description */}
            <div className="space-y-3 text-center">
              <h2 className="text-2xl font-bold">Join VERN</h2>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Discover independent music, share thoughtful reviews, and connect with fellow music enthusiasts in our
                curated community.
              </p>
            </div>

            {/* Call to action */}
            <div className="space-y-2 pt-2">
              <p className="text-xs text-muted-foreground text-center">Sign in to {action}</p>
            </div>
          </div>

          <div className="p-4 space-y-3 bg-background">
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
          </div>
        </DrawerContent>
      </Drawer>
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] p-0 gap-0 bg-background border-border flex flex-col overflow-hidden max-h-[90vh]">
        <DialogHeader className="sr-only">
          <DialogTitle>Join VERN</DialogTitle>
        </DialogHeader>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          <div className="flex justify-center">
            <div className="w-16 h-16 border border-border rounded-lg flex items-center justify-center bg-background">
              <SiVercel className="h-8 w-8 text-foreground" />
            </div>
          </div>

          {/* Title and description */}
          <div className="space-y-3 text-center">
            <h2 className="text-2xl font-bold">Join VERN</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Discover independent music, share thoughtful reviews, and connect with fellow music enthusiasts in our
              curated community.
            </p>
          </div>

          {/* Call to action */}
          <div className="space-y-2 pt-2">
            <p className="text-xs text-muted-foreground text-center">Sign in to {action}</p>
          </div>
        </div>

        <div className="p-6 space-y-3 bg-background">
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
        </div>
      </DialogContent>
    </Dialog>
  )
}
