"use client"

import { usePathname } from "next/navigation"
import { Breadcrumb, BreadcrumbItem, BreadcrumbList, BreadcrumbPage } from "@/components/ui/breadcrumb"

interface DynamicBreadcrumbProps {
  customBreadcrumbs?: {
    label: string
    href?: string
    isLink?: boolean
  }[]
}

export function DynamicBreadcrumb({ customBreadcrumbs }: DynamicBreadcrumbProps) {
  const pathname = usePathname()

  if (customBreadcrumbs && customBreadcrumbs.length > 0) {
    const lastCrumb = customBreadcrumbs[customBreadcrumbs.length - 1]
    return (
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbPage className="text-white font-medium">{lastCrumb.label}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
    )
  }

  // Default breadcrumb logic - show only last segment or "Home"
  const segments = pathname.split("/").filter(Boolean)

  if (segments.length === 0) {
    return (
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbPage className="text-white font-medium">Home</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
    )
  }

  // Show only the last segment
  const lastSegment = segments[segments.length - 1]
  const label = lastSegment.charAt(0).toUpperCase() + lastSegment.slice(1)

  return (
    <Breadcrumb>
      <BreadcrumbList>
        <BreadcrumbItem>
          <BreadcrumbPage className="text-white font-medium">{label}</BreadcrumbPage>
        </BreadcrumbItem>
      </BreadcrumbList>
    </Breadcrumb>
  )
}
