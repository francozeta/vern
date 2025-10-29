"use client"

import { BillingTab } from "@/components/settings/billing-tab"

export default function BillingPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Billing</h2>
        <p className="text-muted-foreground">Manage your subscription and billing</p>
      </div>
      <BillingTab />
    </div>
  )
}
