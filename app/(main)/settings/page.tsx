import { notFound, redirect } from "next/navigation"
import { createServerSupabaseClient } from "@/lib/supabase/server"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ProfileTab } from "@/components/settings/profile-tab"
import { AccountTab } from "@/components/settings/account-tab"
import { GeneralTab } from "@/components/settings/general-tab"
import { BillingTab } from "@/components/settings/billing-tab"
import { User, Link, Settings, CreditCard } from "lucide-react"

export default async function SettingsPage() {
  const supabase = await createServerSupabaseClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login")
  }

  const { data: profile, error } = await supabase.from("profiles").select("*").eq("id", user.id).single()

  if (error || !profile) {
    console.error("Error fetching profile:", error)
    notFound()
  }

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 pt-1">
      <div className="mx-auto w-full max-w-6xl">
        <div className="flex flex-col gap-6">
          {/* Tabs */}
          <Tabs defaultValue="profile" className="w-full">
            <TabsList className="grid w-full grid-cols-4 h-auto p-1 bg-muted">
              <TabsTrigger value="profile" className="flex items-center gap-2 py-3 px-2 text-xs sm:text-sm">
                <User className="h-4 w-4" />
                <span className="hidden sm:inline">Profile</span>
              </TabsTrigger>
              <TabsTrigger value="account" className="flex items-center gap-2 py-3 px-2 text-xs sm:text-sm">
                <Link className="h-4 w-4" />
                <span className="hidden sm:inline">Account</span>
              </TabsTrigger>
              <TabsTrigger value="general" className="flex items-center gap-2 py-3 px-2 text-xs sm:text-sm">
                <Settings className="h-4 w-4" />
                <span className="hidden sm:inline">General</span>
              </TabsTrigger>
              <TabsTrigger value="billing" className="flex items-center gap-2 py-3 px-2 text-xs sm:text-sm">
                <CreditCard className="h-4 w-4" />
                <span className="hidden sm:inline">Billing</span>
              </TabsTrigger>
            </TabsList>

            <div className="mt-6">
              <TabsContent value="profile" className="space-y-6">
                <ProfileTab profile={profile} />
              </TabsContent>

              <TabsContent value="account" className="space-y-6">
                <AccountTab profile={profile} />
              </TabsContent>

              <TabsContent value="general" className="space-y-6">
                <GeneralTab />
              </TabsContent>

              <TabsContent value="billing" className="space-y-6">
                <BillingTab />
              </TabsContent>
            </div>
          </Tabs>
        </div>
      </div>
    </div>
  )
}
