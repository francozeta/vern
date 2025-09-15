import { createServerSupabaseClient } from "@/lib/supabase/server"
import { Button } from "@/components/ui/button"
import { HeaderAuthClient } from "@/components/auth/header-auth-client"

export async function HeaderAuth() {
  const supabase = await createServerSupabaseClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
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

  return <HeaderAuthClient />
}
