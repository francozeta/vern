"use client"

import { Button } from "@/components/ui/button"

export function HeaderAuth() {
  return (
    <div className="flex items-center gap-2">
      <Button variant="ghost" size="sm" asChild>
        <a href="/login">Sign In</a>
      </Button>
      <Button size="sm" asChild>
        <a href="/signup">Sign Up</a>
      </Button>
    </div>
  )
}
