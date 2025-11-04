import { createServerSupabaseClient } from "@/lib/supabase/server"
import { Button } from "@/components/ui/button"
import { HeaderAuthClient } from "@/components/auth/header-auth-client"
import Link from "next/link"

export async function HeaderAuth() {
  const supabase = await createServerSupabaseClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return (
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/login">Sign In</Link>
        </Button>
        <Button size="sm" asChild className="bg-white text-black">
          <Link href="/signup">Sign Up</Link>
        </Button>
      </div>
    )
  }

  return <HeaderAuthClient />
}
