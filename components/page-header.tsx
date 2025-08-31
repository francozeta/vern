"use client"

import type React from "react"

import { DynamicBreadcrumb } from "@/components/dynamic-breadcrumb"

interface PageHeaderProps {
  breadcrumbs?: {
    label: string
    href?: string
  }[]
  children?: React.ReactNode
}

export function PageHeader({ breadcrumbs, children }: PageHeaderProps) {
  return (
    <div className="flex flex-col gap-4 p-4 pt-1">
      <DynamicBreadcrumb customBreadcrumbs={breadcrumbs} />
      {children}
    </div>
  )
}
