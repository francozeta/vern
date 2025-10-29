"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CreditCard, Crown, Zap } from "lucide-react"
import { SettingsCard } from "@/components/settings/settings-card"

export function BillingTab() {
  return (
    <div className="space-y-6">
      <SettingsCard title="Current Plan" description="Your subscription details" footerText="Manage your subscription">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  Free Plan
                  <Badge variant="secondary">Current</Badge>
                </CardTitle>
                <CardDescription>Perfect for getting started</CardDescription>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold">$0</div>
                <div className="text-sm text-muted-foreground">per month</div>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm">
              <li className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-primary rounded-full" />
                Unlimited music reviews
              </li>
              <li className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-primary rounded-full" />
                Follow up to 100 users
              </li>
              <li className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-primary rounded-full" />
                Basic profile customization
              </li>
            </ul>
          </CardContent>
        </Card>
      </SettingsCard>

      <SettingsCard
        title="Upgrade Your Plan"
        description="Choose a plan that fits your needs"
        footerText="Unlock premium features"
      >
        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Crown className="h-5 w-5 text-yellow-500" />
                Pro Plan
              </CardTitle>
              <CardDescription>For serious music enthusiasts</CardDescription>
              <div className="text-2xl font-bold">
                $9.99<span className="text-sm font-normal text-muted-foreground">/month</span>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <ul className="space-y-2 text-sm">
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-primary rounded-full" />
                  Everything in Free
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-primary rounded-full" />
                  Unlimited follows
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-primary rounded-full" />
                  Advanced analytics
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-primary rounded-full" />
                  Custom profile themes
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-primary rounded-full" />
                  Priority support
                </li>
              </ul>
              <Button className="w-full">Upgrade to Pro</Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5 text-purple-500" />
                Artist Plan
              </CardTitle>
              <CardDescription>Perfect for musicians and creators</CardDescription>
              <div className="text-2xl font-bold">
                $19.99<span className="text-sm font-normal text-muted-foreground">/month</span>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <ul className="space-y-2 text-sm">
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-primary rounded-full" />
                  Everything in Pro
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-primary rounded-full" />
                  Upload unlimited tracks
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-primary rounded-full" />
                  Detailed listener insights
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-primary rounded-full" />
                  Verified artist badge
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-primary rounded-full" />
                  Revenue sharing
                </li>
              </ul>
              <Button className="w-full">Upgrade to Artist</Button>
            </CardContent>
          </Card>
        </div>
      </SettingsCard>

      <SettingsCard
        title="Payment Method"
        description="Manage your billing information"
        footerText="Add a payment method to upgrade"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <CreditCard className="h-8 w-8 text-muted-foreground" />
            <div>
              <div className="font-medium">No payment method</div>
              <div className="text-sm text-muted-foreground">Add a payment method to upgrade</div>
            </div>
          </div>
          <Button variant="outline">Add Payment Method</Button>
        </div>
      </SettingsCard>
    </div>
  )
}
